import { type NextRequest, NextResponse } from "next/server";
import {
  createSignedBridgeHeaders,
  extractSanitizedAdminCookieHeader,
  isValidAdminMutationOrigin,
  resolveAllowedBridgeRoute,
  resolveBridgeSecret,
  resolveSafeUpstreamOrigin,
  sanitizeAllowedQueryParams,
} from "@/lib/ponte-api-seguranca";

export const dynamic = "force-dynamic";

const MAX_BRIDGE_BODY_BYTES = 16 * 1024; // 16 KB
const UPSTREAM_TIMEOUT_MS = 8_000; // 8 segundos

const FORWARDED_RESPONSE_HEADERS = [
  "content-type",
  "cache-control",
  "content-disposition",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
] as const;

const SECURITY_JSON_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
} as const;

async function proxyToMonitoringService(
  request: NextRequest,
  context: { params: Promise<{ slug: string[] }> },
): Promise<NextResponse> {
  const { slug } = await context.params;
  const method = request.method.toUpperCase();

  // 1. Allowlist estrita de rotas e métodos permitidos
  const routeResolution = resolveAllowedBridgeRoute(method, slug);
  if (!routeResolution.ok) {
    return NextResponse.json(
      { ok: false, error: routeResolution.error },
      {
        status: routeResolution.status,
        headers: SECURITY_JSON_HEADERS,
      },
    );
  }

  // 2. Validação anti-SSRF da origem interna e do segredo criptográfico da ponte
  let upstreamOrigin: string;
  let bridgeSecret: string | null;
  try {
    upstreamOrigin = resolveSafeUpstreamOrigin(
      process.env.MONITORING_API_INTERNAL_URL,
    );
    bridgeSecret = resolveBridgeSecret(
      process.env.MONITORING_BRIDGE_SECRET,
      process.env.NODE_ENV,
      process.env.SITE_PREVIEW_BUILD === "1",
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "invalid_upstream_configuration",
        message: "Configuração interna do serviço de monitoramento inválida.",
      },
      { status: 500, headers: SECURITY_JSON_HEADERS },
    );
  }

  // 3. Proteção CSRF na ponte para mutações administrativas (POST, PUT, DELETE)
  if (routeResolution.isAdminRoute && routeResolution.isMutation) {
    const validOrigin = isValidAdminMutationOrigin({
      originHeader: request.headers.get("origin"),
      hostHeader: request.headers.get("host"),
      xForwardedHost: request.headers.get("x-forwarded-host"),
      nextUrlOrigin: request.nextUrl.origin,
      configuredAllowedOrigin: process.env.ALLOWED_ORIGIN,
    });
    if (!validOrigin) {
      return NextResponse.json(
        {
          ok: false,
          error: "csrf_origin_mismatch",
          message: "Origem não autorizada para operação administrativa.",
        },
        { status: 403, headers: SECURITY_JSON_HEADERS },
      );
    }
  }

  // 4. Higienização estrita de cookies e verificação prévia de autenticação em rotas admin
  const cookieCheck = extractSanitizedAdminCookieHeader(
    request.headers.get("cookie"),
  );
  if (!cookieCheck.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "invalid_session_cookie",
        message: "Sessão inválida ou corrompida.",
      },
      { status: 401, headers: SECURITY_JSON_HEADERS },
    );
  }

  const rawAuthHeader = request.headers.get("authorization")?.trim() ?? null;
  if (routeResolution.requiresAdminAuth) {
    const hasBearer =
      rawAuthHeader !== null &&
      /^Bearer\s+[A-Za-z0-9_-]{32,256}$/.test(rawAuthHeader);
    if (!cookieCheck.token && !hasBearer) {
      return NextResponse.json(
        {
          ok: false,
          error: "unauthorized",
          message: "Autenticação administrativa obrigatória.",
        },
        { status: 401, headers: SECURITY_JSON_HEADERS },
      );
    }
  }

  // 5. Construção determinística da URL de destino (imune a SSRF/Open Redirect)
  const sanitizedSearch = sanitizeAllowedQueryParams(
    routeResolution.routeKey,
    request.nextUrl.searchParams,
  );
  const targetUrl = new URL(
    `${routeResolution.canonicalPath}${sanitizedSearch}`,
    upstreamOrigin,
  );
  if (targetUrl.origin !== upstreamOrigin) {
    return NextResponse.json(
      { ok: false, error: "invalid_route" },
      { status: 400, headers: SECURITY_JSON_HEADERS },
    );
  }

  // 6. Construção controlada de cabeçalhos encaminhados ao container interno
  const upstreamHeaders = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) upstreamHeaders.set("content-type", contentType);

  const userAgent = request.headers.get("user-agent");
  if (userAgent) upstreamHeaders.set("user-agent", userAgent);

  const xff = request.headers.get("x-forwarded-for");
  if (xff) upstreamHeaders.set("x-forwarded-for", xff);

  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) upstreamHeaders.set("x-real-ip", xRealIp);

  // Encaminha cabeçalhos de detecção de prefetch apenas para /api/v1/collect
  if (routeResolution.routeKey === "collect") {
    for (const h of [
      "purpose",
      "sec-purpose",
      "next-router-prefetch",
      "x-middleware-prefetch",
    ] as const) {
      const val = request.headers.get(h);
      if (val) upstreamHeaders.set(h, val);
    }
  }

  // Cookies e Authorization são encaminhados EXCLUSIVAMENTE em rotas administrativas
  if (routeResolution.isAdminRoute) {
    if (cookieCheck.cookieHeader) {
      upstreamHeaders.set("cookie", cookieCheck.cookieHeader);
    }
    if (rawAuthHeader) {
      upstreamHeaders.set("authorization", rawAuthHeader);
    }
  }

  // 7. Leitura limitada do corpo da requisição (proteção contra exaustão de memória)
  const hasBody = method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
  let bodyBuffer: ArrayBuffer | undefined;
  if (hasBody) {
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > MAX_BRIDGE_BODY_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          error: "payload_too_large",
          message: "Tamanho da requisição excede o limite permitido.",
        },
        { status: 413, headers: SECURITY_JSON_HEADERS },
      );
    }
    bodyBuffer = await request.arrayBuffer();
    if (bodyBuffer.byteLength > MAX_BRIDGE_BODY_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          error: "payload_too_large",
          message: "Tamanho da requisição excede o limite permitido.",
        },
        { status: 413, headers: SECURITY_JSON_HEADERS },
      );
    }
  }

  // 8. Assinatura criptográfica HMAC-SHA256 com proteção anti-replay entre Next.js e Monitoring API
  if (bridgeSecret) {
    const signedHeaders = createSignedBridgeHeaders({
      secret: bridgeSecret,
      method,
      pathWithQuery: `${routeResolution.canonicalPath}${sanitizedSearch}`,
      forwardedFor: xff,
      realIp: xRealIp,
      rawBody:
        hasBody && bodyBuffer && bodyBuffer.byteLength > 0 ? bodyBuffer : null,
    });
    for (const [k, v] of Object.entries(signedHeaders)) {
      upstreamHeaders.set(k, v);
    }
  }

  try {
    const upstreamResponse = await fetch(targetUrl.toString(), {
      method,
      headers: upstreamHeaders,
      body:
        hasBody && bodyBuffer && bodyBuffer.byteLength > 0
          ? bodyBuffer
          : undefined,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    const responseHeaders = new Headers();
    for (const headerName of FORWARDED_RESPONSE_HEADERS) {
      const val = upstreamResponse.headers.get(headerName);
      if (val) {
        responseHeaders.set(headerName, val);
      }
    }

    if (!responseHeaders.has("cache-control")) {
      responseHeaders.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, private",
      );
    }
    if (!responseHeaders.has("x-content-type-options")) {
      responseHeaders.set("X-Content-Type-Options", "nosniff");
    }

    // Encaminha Set-Cookie exclusivamente nas rotas de login e logout administrativos
    if (
      routeResolution.routeKey === "admin_login" ||
      routeResolution.routeKey === "admin_logout"
    ) {
      const getSetCookie = (
        upstreamResponse.headers as unknown as {
          getSetCookie?: () => string[];
        }
      ).getSetCookie;

      if (typeof getSetCookie === "function") {
        const cookies = getSetCookie.call(upstreamResponse.headers);
        for (const cookie of cookies) {
          if (cookie.startsWith("meg_admin_session=")) {
            responseHeaders.append("Set-Cookie", cookie);
          }
        }
      } else {
        const singleCookie = upstreamResponse.headers.get("set-cookie");
        if (singleCookie && singleCookie.startsWith("meg_admin_session=")) {
          responseHeaders.set("Set-Cookie", singleCookie);
        }
      }
    }

    if (upstreamResponse.status === 204) {
      return new NextResponse(null, {
        status: 204,
        headers: responseHeaders,
      });
    }

    const payload = await upstreamResponse.arrayBuffer();
    return new NextResponse(payload, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (err) {
    const isTimeout =
      err instanceof Error &&
      (err.name === "TimeoutError" || err.name === "AbortError");

    if (isTimeout) {
      return NextResponse.json(
        {
          ok: false,
          error: "monitoring_service_timeout",
          message:
            "Tempo limite excedido ao aguardar resposta do serviço de monitoramento.",
        },
        { status: 504, headers: SECURITY_JSON_HEADERS },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: "monitoring_service_unavailable",
        message:
          "Serviço de monitoramento indisponível no momento. Verifique se a API de monitoramento está ativa.",
      },
      { status: 503, headers: SECURITY_JSON_HEADERS },
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string[] }> },
) {
  return proxyToMonitoringService(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string[] }> },
) {
  return proxyToMonitoringService(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string[] }> },
) {
  return proxyToMonitoringService(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string[] }> },
) {
  return proxyToMonitoringService(request, context);
}

export async function OPTIONS(
  request: NextRequest,
  context: { params: Promise<{ slug: string[] }> },
) {
  return proxyToMonitoringService(request, context);
}
