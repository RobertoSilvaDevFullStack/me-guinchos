/**
 * Regras de segurança, allowlist de rotas/métodos, prevenção a SSRF,
 * autenticação criptográfica HMAC-SHA256 entre serviços e higienização de
 * cookies/query-string para a ponte HTTP same-origin (`app/api/v1/[...slug]/route.ts`).
 */

import { createHash, createHmac, randomBytes } from "node:crypto";

export const BRIDGE_HEADER_TIMESTAMP = "x-monitoring-bridge-ts";
export const BRIDGE_HEADER_NONCE = "x-monitoring-bridge-nonce";
export const BRIDGE_HEADER_SIGNATURE = "x-monitoring-bridge-sig";
export const MIN_BRIDGE_SECRET_LENGTH = 32;

const EMPTY_BODY_SHA256 =
  "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

export type AllowedBridgeRouteKey =
  | "health"
  | "collect"
  | "admin_login"
  | "admin_logout"
  | "admin_session"
  | "admin_summary"
  | "admin_ips"
  | "admin_ip_history_param"
  | "admin_ip_history_query"
  | "admin_ip_investigation"
  | "admin_investigated_ips"
  | "admin_investigated_ip_delete"
  | "admin_export";

export interface ResolvedBridgeRoute {
  ok: true;
  routeKey: AllowedBridgeRouteKey;
  canonicalPath: string;
  isAdminRoute: boolean;
  requiresAdminAuth: boolean;
  isMutation: boolean;
}

export interface RejectedBridgeRoute {
  ok: false;
  status: 400 | 404 | 405;
  error: "invalid_route" | "route_not_allowed" | "method_not_allowed";
}

const STRICT_IP_SEGMENT_REGEX = /^[0-9a-fA-F:.]{2,45}$/;
const WELL_FORMED_SESSION_TOKEN_REGEX = /^[A-Za-z0-9_-]{32,256}$/;

const ALLOWED_QUERY_KEYS_BY_ROUTE: Record<
  AllowedBridgeRouteKey,
  ReadonlySet<string>
> = {
  health: new Set([]),
  collect: new Set([]),
  admin_login: new Set([]),
  admin_logout: new Set([]),
  admin_session: new Set([]),
  admin_summary: new Set([
    "hours",
    "from",
    "to",
    "trafficCategory",
    "eventType",
  ]),
  admin_ips: new Set([
    "hours",
    "from",
    "to",
    "ip",
    "searchIp",
    "status",
    "trafficCategory",
    "onlyPaidEntries",
    "minVisits",
    "minRequests",
    "sortBy",
    "sortOrder",
    "page",
    "limit",
    "pageSize",
  ]),
  admin_ip_history_param: new Set([
    "hours",
    "from",
    "to",
    "eventType",
    "trafficCategory",
    "page",
    "limit",
    "pageSize",
  ]),
  admin_ip_history_query: new Set([
    "ip",
    "hours",
    "from",
    "to",
    "eventType",
    "trafficCategory",
    "page",
    "limit",
    "pageSize",
  ]),
  admin_ip_investigation: new Set([]),
  admin_investigated_ips: new Set(["ip", "status", "page", "limit", "pageSize"]),
  admin_investigated_ip_delete: new Set([]),
  admin_export: new Set([
    "type",
    "format",
    "hours",
    "from",
    "to",
    "ip",
    "searchIp",
    "status",
    "trafficCategory",
    "eventType",
    "limit",
  ]),
};

/**
 * Valida os segmentos da rota e o método HTTP contra uma allowlist estrita.
 * Qualquer tentativa de path traversal, rota desconhecida ou método não previsto é negada.
 */
export function resolveAllowedBridgeRoute(
  method: string,
  slug: string[] | undefined,
): ResolvedBridgeRoute | RejectedBridgeRoute {
  if (!Array.isArray(slug) || slug.length === 0 || slug.length > 4) {
    return { ok: false, status: 400, error: "invalid_route" };
  }

  for (const segment of slug) {
    if (
      !segment ||
      segment === "." ||
      segment === ".." ||
      segment.includes("/") ||
      segment.includes("\\") ||
      segment.includes("\0")
    ) {
      return { ok: false, status: 400, error: "invalid_route" };
    }
  }

  const upperMethod = method.toUpperCase();
  const [s0, s1, s2, s3] = slug;

  // 1. /api/v1/health
  if (slug.length === 1 && s0 === "health") {
    if (upperMethod !== "GET") {
      return { ok: false, status: 405, error: "method_not_allowed" };
    }
    return {
      ok: true,
      routeKey: "health",
      canonicalPath: "/api/v1/health",
      isAdminRoute: false,
      requiresAdminAuth: false,
      isMutation: false,
    };
  }

  // 2. /api/v1/collect
  if (slug.length === 1 && s0 === "collect") {
    if (upperMethod !== "POST" && upperMethod !== "OPTIONS") {
      return { ok: false, status: 405, error: "method_not_allowed" };
    }
    return {
      ok: true,
      routeKey: "collect",
      canonicalPath: "/api/v1/collect",
      isAdminRoute: false,
      requiresAdminAuth: false,
      isMutation: upperMethod === "POST",
    };
  }

  // Demais rotas devem obrigatoriamente iniciar com "admin"
  if (s0 !== "admin") {
    return { ok: false, status: 404, error: "route_not_allowed" };
  }

  // 3. /api/v1/admin/login
  if (slug.length === 2 && s1 === "login") {
    if (upperMethod !== "POST") {
      return { ok: false, status: 405, error: "method_not_allowed" };
    }
    return {
      ok: true,
      routeKey: "admin_login",
      canonicalPath: "/api/v1/admin/login",
      isAdminRoute: true,
      requiresAdminAuth: false,
      isMutation: true,
    };
  }

  // 4. /api/v1/admin/logout
  if (slug.length === 2 && s1 === "logout") {
    if (upperMethod !== "POST") {
      return { ok: false, status: 405, error: "method_not_allowed" };
    }
    return {
      ok: true,
      routeKey: "admin_logout",
      canonicalPath: "/api/v1/admin/logout",
      isAdminRoute: true,
      requiresAdminAuth: true,
      isMutation: true,
    };
  }

  // 5. /api/v1/admin/session
  if (slug.length === 2 && s1 === "session") {
    if (upperMethod !== "GET") {
      return { ok: false, status: 405, error: "method_not_allowed" };
    }
    return {
      ok: true,
      routeKey: "admin_session",
      canonicalPath: "/api/v1/admin/session",
      isAdminRoute: true,
      requiresAdminAuth: true,
      isMutation: false,
    };
  }

  // 6. /api/v1/admin/summary
  if (slug.length === 2 && s1 === "summary") {
    if (upperMethod !== "GET") {
      return { ok: false, status: 405, error: "method_not_allowed" };
    }
    return {
      ok: true,
      routeKey: "admin_summary",
      canonicalPath: "/api/v1/admin/summary",
      isAdminRoute: true,
      requiresAdminAuth: true,
      isMutation: false,
    };
  }

  // 7. /api/v1/admin/ips
  if (slug.length === 2 && s1 === "ips") {
    if (upperMethod !== "GET") {
      return { ok: false, status: 405, error: "method_not_allowed" };
    }
    return {
      ok: true,
      routeKey: "admin_ips",
      canonicalPath: "/api/v1/admin/ips",
      isAdminRoute: true,
      requiresAdminAuth: true,
      isMutation: false,
    };
  }

  // 8. /api/v1/admin/ip-history
  if (slug.length === 2 && s1 === "ip-history") {
    if (upperMethod !== "GET") {
      return { ok: false, status: 405, error: "method_not_allowed" };
    }
    return {
      ok: true,
      routeKey: "admin_ip_history_query",
      canonicalPath: "/api/v1/admin/ip-history",
      isAdminRoute: true,
      requiresAdminAuth: true,
      isMutation: false,
    };
  }

  // 9. /api/v1/admin/investigated-ips
  if (slug.length === 2 && s1 === "investigated-ips") {
    if (
      upperMethod !== "GET" &&
      upperMethod !== "POST" &&
      upperMethod !== "PUT" &&
      upperMethod !== "DELETE"
    ) {
      return { ok: false, status: 405, error: "method_not_allowed" };
    }
    return {
      ok: true,
      routeKey: "admin_investigated_ips",
      canonicalPath: "/api/v1/admin/investigated-ips",
      isAdminRoute: true,
      requiresAdminAuth: true,
      isMutation: upperMethod !== "GET",
    };
  }

  // 10. /api/v1/admin/investigated-ips/:ip
  if (slug.length === 3 && s1 === "investigated-ips" && s2) {
    if (!STRICT_IP_SEGMENT_REGEX.test(s2)) {
      return { ok: false, status: 400, error: "invalid_route" };
    }
    if (upperMethod !== "DELETE") {
      return { ok: false, status: 405, error: "method_not_allowed" };
    }
    return {
      ok: true,
      routeKey: "admin_investigated_ip_delete",
      canonicalPath: `/api/v1/admin/investigated-ips/${encodeURIComponent(s2)}`,
      isAdminRoute: true,
      requiresAdminAuth: true,
      isMutation: true,
    };
  }

  // 11. /api/v1/admin/ips/:ip/history e /api/v1/admin/ips/:ip/investigation
  if (slug.length === 4 && s1 === "ips" && s2 && s3) {
    if (!STRICT_IP_SEGMENT_REGEX.test(s2)) {
      return { ok: false, status: 400, error: "invalid_route" };
    }
    if (s3 === "history") {
      if (upperMethod !== "GET") {
        return { ok: false, status: 405, error: "method_not_allowed" };
      }
      return {
        ok: true,
        routeKey: "admin_ip_history_param",
        canonicalPath: `/api/v1/admin/ips/${encodeURIComponent(s2)}/history`,
        isAdminRoute: true,
        requiresAdminAuth: true,
        isMutation: false,
      };
    }
    if (s3 === "investigation") {
      if (upperMethod !== "PUT") {
        return { ok: false, status: 405, error: "method_not_allowed" };
      }
      return {
        ok: true,
        routeKey: "admin_ip_investigation",
        canonicalPath: `/api/v1/admin/ips/${encodeURIComponent(s2)}/investigation`,
        isAdminRoute: true,
        requiresAdminAuth: true,
        isMutation: true,
      };
    }
    return { ok: false, status: 404, error: "route_not_allowed" };
  }

  // 12. /api/v1/admin/export
  if (slug.length === 2 && s1 === "export") {
    if (upperMethod !== "GET") {
      return { ok: false, status: 405, error: "method_not_allowed" };
    }
    return {
      ok: true,
      routeKey: "admin_export",
      canonicalPath: "/api/v1/admin/export",
      isAdminRoute: true,
      requiresAdminAuth: true,
      isMutation: false,
    };
  }

  return { ok: false, status: 404, error: "route_not_allowed" };
}

/**
 * Valida a URL base do serviço interno de monitoramento para impedir SSRF.
 * Aceita apenas loopback (`127.0.0.1`, `localhost`, `[::1]`) ou hostname de
 * container Docker interno de rótulo único (ex.: `monitoring-api`), sem credenciais,
 * sem caminho e sem query/hash.
 */
export function resolveSafeUpstreamOrigin(rawEnv?: string): string {
  const candidate = rawEnv?.trim() || "http://127.0.0.1:4000";

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error("MONITORING_API_INTERNAL_URL malformada.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Protocolo não permitido em MONITORING_API_INTERNAL_URL.");
  }

  if (parsed.username || parsed.password) {
    throw new Error(
      "Credenciais embutidas não são permitidas em MONITORING_API_INTERNAL_URL.",
    );
  }

  if (
    (parsed.pathname && parsed.pathname !== "/") ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error(
      "MONITORING_API_INTERNAL_URL deve conter apenas protocolo, host e porta.",
    );
  }

  const host = parsed.hostname.toLowerCase();
  const isLoopback =
    host === "127.0.0.1" || host === "localhost" || host === "[::1]" || host === "::1";
  const isDockerServiceLabel = /^[a-z0-9][a-z0-9_-]{0,62}$/i.test(host);

  if (!isLoopback && !isDockerServiceLabel) {
    throw new Error(
      "Host não autorizado em MONITORING_API_INTERNAL_URL (prevenção SSRF).",
    );
  }

  return parsed.origin;
}

/**
 * Filtra parâmetros de query string mantendo apenas chaves explicitamente permitidas
 * para a rota validada e descartando valores excessivamente longos (> 256 chars).
 */
export function sanitizeAllowedQueryParams(
  routeKey: AllowedBridgeRouteKey,
  searchParams: URLSearchParams,
): string {
  const allowedKeys = ALLOWED_QUERY_KEYS_BY_ROUTE[routeKey];
  if (!allowedKeys || allowedKeys.size === 0) return "";

  const clean = new URLSearchParams();
  for (const [key, value] of searchParams.entries()) {
    if (allowedKeys.has(key) && value.length <= 256) {
      clean.set(key, value);
    }
  }
  const str = clean.toString();
  return str ? `?${str}` : "";
}

/**
 * Extrai e higieniza exclusivamente o cookie `meg_admin_session`, descartando
 * cookies de terceiros (ex.: `_ga`, `_gcl_au`) e rejeitando Cookie Tossing
 * (múltiplos cookies `meg_admin_session`).
 */
export function extractSanitizedAdminCookieHeader(
  rawCookieHeader: string | null,
): { ok: true; cookieHeader: string | null; token: string | null } | { ok: false } {
  if (!rawCookieHeader) {
    return { ok: true, cookieHeader: null, token: null };
  }

  const parts = rawCookieHeader.split(";");
  const matchedTokens: string[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx <= 0) continue;
    const name = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (name === "meg_admin_session") {
      matchedTokens.push(val);
    }
  }

  if (matchedTokens.length === 0) {
    return { ok: true, cookieHeader: null, token: null };
  }

  // Cookie Tossing: mais de um cookie meg_admin_session na mesma requisição
  if (matchedTokens.length > 1) {
    return { ok: false };
  }

  const token = matchedTokens[0]!;
  if (!WELL_FORMED_SESSION_TOKEN_REGEX.test(token)) {
    return { ok: false };
  }

  return {
    ok: true,
    cookieHeader: `meg_admin_session=${token}`,
    token,
  };
}

/**
 * Valida o cabeçalho `Origin` em mutações administrativas (POST, PUT, DELETE)
 * considerando o `Host` / `X-Forwarded-Host` real da requisição (compatível com
 * containers Docker independentes, Traefik reverso e loopback 127.0.0.1/localhost).
 */
export function isValidAdminMutationOrigin(params: {
  originHeader: string | null;
  hostHeader: string | null;
  xForwardedHost?: string | null;
  nextUrlOrigin?: string | null;
  configuredAllowedOrigin?: string | null;
}): boolean {
  const rawOrigin = params.originHeader?.trim();
  if (!rawOrigin) {
    // Requisições same-origin sem cabeçalho Origin explícito
    return true;
  }

  let parsedOrigin: URL;
  try {
    parsedOrigin = new URL(rawOrigin);
  } catch {
    return false;
  }

  if (parsedOrigin.protocol !== "http:" && parsedOrigin.protocol !== "https:") {
    return false;
  }

  const originHost = parsedOrigin.host.toLowerCase();
  const candidates = [
    params.xForwardedHost?.split(",")[0]?.trim().toLowerCase(),
    params.hostHeader?.trim().toLowerCase(),
  ].filter((v): v is string => Boolean(v));

  if (candidates.includes(originHost)) {
    return true;
  }

  if (
    params.nextUrlOrigin &&
    params.nextUrlOrigin.trim().toLowerCase() === parsedOrigin.origin.toLowerCase()
  ) {
    return true;
  }

  if (
    params.configuredAllowedOrigin &&
    params.configuredAllowedOrigin.trim().toLowerCase() ===
      parsedOrigin.origin.toLowerCase()
  ) {
    return true;
  }

  return false;
}

/**
 * Resolve e valida o segredo exclusivo da ponte (`MONITORING_BRIDGE_SECRET`).
 * - Em produção (`NODE_ENV === "production"` sem `SITE_PREVIEW_BUILD === "1"`),
 *   exige obrigatoriamente um segredo configurado com pelo menos 32 caracteres.
 * - Se configurado em qualquer ambiente, valida o comprimento mínimo (>= 32 chars).
 */
export function resolveBridgeSecret(
  rawSecret?: string,
  nodeEnv: string = process.env.NODE_ENV ?? "development",
  isPreviewBuild: boolean = process.env.SITE_PREVIEW_BUILD === "1",
): string | null {
  const trimmed = rawSecret?.trim() ?? "";

  if (!trimmed) {
    if (nodeEnv === "production" && !isPreviewBuild) {
      throw new Error(
        "MONITORING_BRIDGE_SECRET é obrigatório em produção para autenticar a ponte.",
      );
    }
    return null;
  }

  if (trimmed.length < MIN_BRIDGE_SECRET_LENGTH) {
    throw new Error(
      `MONITORING_BRIDGE_SECRET deve possuir no mínimo ${MIN_BRIDGE_SECRET_LENGTH} caracteres.`,
    );
  }

  return trimmed;
}

/**
 * Calcula o hash SHA-256 hexadecimal do corpo da requisição encaminhada.
 */
export function computeBridgeBodySha256(
  rawBody?: ArrayBuffer | Uint8Array | Buffer | string | null,
): string {
  if (!rawBody) {
    return EMPTY_BODY_SHA256;
  }
  if (typeof rawBody === "string") {
    if (rawBody.length === 0) return EMPTY_BODY_SHA256;
    return createHash("sha256").update(rawBody, "utf8").digest("hex");
  }
  const view =
    rawBody instanceof ArrayBuffer ? new Uint8Array(rawBody) : rawBody;
  if (view.byteLength === 0) {
    return EMPTY_BODY_SHA256;
  }
  return createHash("sha256").update(view).digest("hex");
}

/**
 * Constrói a string canônica determinística assinada com HMAC-SHA256 entre Next.js e Monitoring API.
 * Inclui versão, timestamp, nonce único, método HTTP, caminho+query, X-Forwarded-For, X-Real-IP e SHA-256 do corpo.
 */
export function buildBridgeCanonicalPayload(params: {
  timestamp: string;
  nonce: string;
  method: string;
  pathWithQuery: string;
  forwardedFor?: string | null;
  realIp?: string | null;
  bodySha256: string;
}): string {
  return [
    "v1",
    params.timestamp.trim(),
    params.nonce.trim().toLowerCase(),
    params.method.trim().toUpperCase(),
    params.pathWithQuery.trim(),
    (params.forwardedFor ?? "").trim(),
    (params.realIp ?? "").trim(),
    params.bodySha256.trim().toLowerCase(),
  ].join("\n");
}

/**
 * Gera os cabeçalhos criptográficos HMAC-SHA256 (`x-monitoring-bridge-ts`,
 * `x-monitoring-bridge-nonce`, `x-monitoring-bridge-sig`) para autenticar a
 * requisição entre o container Next.js e a Monitoring API.
 */
export function createSignedBridgeHeaders(params: {
  secret: string;
  method: string;
  pathWithQuery: string;
  forwardedFor?: string | null;
  realIp?: string | null;
  rawBody?: ArrayBuffer | Uint8Array | Buffer | string | null;
  timestampMs?: number;
  nonce?: string;
}): {
  [BRIDGE_HEADER_TIMESTAMP]: string;
  [BRIDGE_HEADER_NONCE]: string;
  [BRIDGE_HEADER_SIGNATURE]: string;
} {
  const cleanSecret = params.secret.trim();
  if (cleanSecret.length < MIN_BRIDGE_SECRET_LENGTH) {
    throw new Error(
      `MONITORING_BRIDGE_SECRET deve possuir no mínimo ${MIN_BRIDGE_SECRET_LENGTH} caracteres.`,
    );
  }

  const timestamp = String(params.timestampMs ?? Date.now());
  const nonce = (params.nonce ?? randomBytes(16).toString("hex")).toLowerCase();
  const bodySha256 = computeBridgeBodySha256(params.rawBody);
  const canonical = buildBridgeCanonicalPayload({
    timestamp,
    nonce,
    method: params.method,
    pathWithQuery: params.pathWithQuery,
    forwardedFor: params.forwardedFor,
    realIp: params.realIp,
    bodySha256,
  });

  const signature = createHmac("sha256", cleanSecret)
    .update(canonical, "utf8")
    .digest("hex");

  return {
    [BRIDGE_HEADER_TIMESTAMP]: timestamp,
    [BRIDGE_HEADER_NONCE]: nonce,
    [BRIDGE_HEADER_SIGNATURE]: signature,
  };
}


