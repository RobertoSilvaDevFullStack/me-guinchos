import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import type { IncomingMessage, Server, ServerResponse } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PostgresMonitoringRepository,
  type MonitoringRepository,
  type SqlPoolLike,
} from "./db/repository.ts";
import {
  extractClientIp,
  normalizeIp,
  validateIpExtractionConfig,
} from "./ip/extractClientIp.ts";
import { validateAndSanitizeCollectPayload } from "./privacy/sanitizer.ts";
import {
  DEFAULT_RETENTION_DAYS,
  RetentionScheduler,
} from "./retention/retentionJob.ts";
import {
  buildPaginationMeta,
  serializeToCsv,
  validateExportQuery,
  validateInvestigatedIpListQuery,
  validateInvestigatedIpUpsertPayload,
  validateIpHistoryQuery,
  validateIpListQuery,
  validateSummaryQuery,
} from "./security/adminValidator.ts";
import {
  createSessionToken,
  extractAuthTokenFromHeaders,
  hashPassword,
  hashSessionToken,
  verifyPasswordConstantTime,
} from "./security/auth.ts";
import {
  BridgeReplayGuard,
  isValidBridgeSecret,
  MIN_BRIDGE_SECRET_LENGTH,
} from "./security/bridgeAuth.ts";
import { SlidingWindowRateLimiter } from "./security/rateLimiter.ts";
import { CollectorService } from "./services/collectorService.ts";
import type { IncomingCollectPayload, IpExtractionOptions } from "./types.ts";

const MAX_BODY_BYTES = 4096;

export interface MonitoringServerConfig {
  repo: MonitoringRepository;
  ipOptions: IpExtractionOptions;
  allowedOrigin: string;
  bridgeSecret?: string;
  bridgeMaxSkewMs?: number;
  rateLimitWindowMs?: number;
  rateLimitMaxEvents?: number;
  loginRateLimitMaxAttempts?: number;
  nowProvider?: () => Date;
}

function applySecurityHeaders(
  res: ServerResponse,
  allowedOrigin: string,
): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; frame-ancestors 'none'",
  );
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Vary", "Origin");
}

function applyNoStoreHeaders(res: ServerResponse): void {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private",
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
}

function isPrefetchRequest(req: IncomingMessage): boolean {
  const purpose = String(
    req.headers["purpose"] ?? req.headers["sec-purpose"] ?? "",
  ).toLowerCase();
  const nextPrefetch = req.headers["next-router-prefetch"];
  return purpose.includes("prefetch") || Boolean(nextPrefetch);
}

async function readBoundedRawBody(
  req: IncomingMessage,
  maxBytes: number,
): Promise<
  | { ok: true; buffer: Buffer }
  | { ok: false; status: number; message: string }
> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    let settled = false;

    req.on("data", (chunk: Buffer) => {
      if (settled) return;
      totalBytes += chunk.length;
      if (totalBytes > maxBytes) {
        settled = true;
        resolve({
          ok: false,
          status: 413,
          message: "Payload excede o limite máximo permitido",
        });
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      if (settled) return;
      settled = true;
      resolve({ ok: true, buffer: Buffer.concat(chunks) });
    });

    req.on("error", () => {
      if (settled) return;
      settled = true;
      resolve({ ok: false, status: 400, message: "Erro na leitura do corpo" });
    });
  });
}

async function readBoundedJsonBody(
  req: IncomingMessage,
  maxBytes: number,
  preReadBuffer?: Buffer,
): Promise<
  | { ok: true; data: unknown }
  | { ok: false; status: number; message: string }
> {
  let rawBuffer: Buffer;
  if (preReadBuffer !== undefined) {
    if (preReadBuffer.byteLength > maxBytes) {
      return {
        ok: false,
        status: 413,
        message: "Payload excede o limite máximo permitido",
      };
    }
    rawBuffer = preReadBuffer;
  } else {
    const rawResult = await readBoundedRawBody(req, maxBytes);
    if (!rawResult.ok) {
      return rawResult;
    }
    rawBuffer = rawResult.buffer;
  }

  try {
    const raw = rawBuffer.toString("utf8");
    if (!raw.trim()) {
      return { ok: false, status: 400, message: "Corpo vazio" };
    }
    return { ok: true, data: JSON.parse(raw) };
  } catch {
    return { ok: false, status: 400, message: "JSON malformado" };
  }
}

function sendJson(
  res: ServerResponse,
  statusCode: number,
  body: Record<string, unknown>,
): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function sendCsv(
  res: ServerResponse,
  filename: string,
  csvContent: string,
): void {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}"`,
  );
  res.end(csvContent);
}

function safeDecodeRouteSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/**
 * Cria a instância HTTP do Serviço Isolado de Monitoramento.
 */
export function createMonitoringServer(
  config: MonitoringServerConfig,
): Server {
  const collector = new CollectorService(config.repo);
  const getNow = config.nowProvider ?? (() => new Date());

  const collectLimiter = new SlidingWindowRateLimiter({
    windowMs: config.rateLimitWindowMs ?? 60_000,
    maxRequests: config.rateLimitMaxEvents ?? 60,
  });

  const maxLoginAttempts = config.loginRateLimitMaxAttempts ?? 5;
  const loginIpLimiter = new SlidingWindowRateLimiter({
    windowMs: 15 * 60_000,
    maxRequests: maxLoginAttempts,
  });

  const loginUsernameLimiter = new SlidingWindowRateLimiter({
    windowMs: 15 * 60_000,
    maxRequests: maxLoginAttempts * 2,
  });

  const bridgeGuard = config.bridgeSecret
    ? new BridgeReplayGuard({
        secret: config.bridgeSecret,
        maxSkewMs: config.bridgeMaxSkewMs,
      })
    : null;

  return createServer(async (req, res) => {
    applySecurityHeaders(res, config.allowedOrigin);

    const method = req.method ?? "GET";
    const rawUrl = req.url ?? "/";
    const qIdx = rawUrl.indexOf("?");
    const urlPath = qIdx === -1 ? rawUrl : rawUrl.slice(0, qIdx);
    const queryStr = qIdx === -1 ? "" : rawUrl.slice(qIdx + 1);
    const params = new URLSearchParams(queryStr);
    const now = getNow();

    if (method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (method === "GET" && urlPath === "/healthz") {
      sendJson(res, 200, { status: "ok" });
      return;
    }

    // Autenticação criptográfica HMAC-SHA256 e proteção anti-replay entre Next.js e Monitoring API
    let preReadBodyBuffer: Buffer | undefined;
    if (bridgeGuard) {
      const preCheck = bridgeGuard.verifyHeadersPreBody(
        req.headers,
        now.getTime(),
      );
      if (!preCheck.ok) {
        sendJson(res, preCheck.status, {
          error: preCheck.error,
          code: preCheck.code,
        });
        return;
      }

      const hasBody =
        method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
      if (hasBody) {
        const rawBodyRes = await readBoundedRawBody(req, MAX_BODY_BYTES);
        if (!rawBodyRes.ok) {
          sendJson(res, rawBodyRes.status, { error: rawBodyRes.message });
          return;
        }
        preReadBodyBuffer = rawBodyRes.buffer;
      }

      const fullVerify = bridgeGuard.verifyRequestAndCommitNonce(
        {
          headers: req.headers,
          method,
          pathWithQuery: rawUrl,
          rawBody: preReadBodyBuffer ?? null,
        },
        now.getTime(),
      );
      if (!fullVerify.ok) {
        sendJson(res, fullVerify.status, {
          error: fullVerify.error,
          code: fullVerify.code,
        });
        return;
      }
    }

    if (method === "GET" && urlPath === "/api/v1/health") {
      sendJson(res, 200, { status: "ok", bridgeAuthenticated: Boolean(bridgeGuard) });
      return;
    }

    const ipResult = extractClientIp(
      req.socket.remoteAddress,
      {
        "x-forwarded-for": req.headers["x-forwarded-for"],
        "x-real-ip": req.headers["x-real-ip"],
      },
      config.ipOptions,
    );

    // =========================================================================
    // 1. Endpoint público de coleta assíncrona (sendBeacon / fetch keepalive)
    // =========================================================================
    if (method === "POST" && urlPath === "/api/v1/collect") {
      if (isPrefetchRequest(req)) {
        res.statusCode = 204;
        res.end();
        return;
      }

      const rateCheck = collectLimiter.consume(ipResult.clientIp, now.getTime());
      if (!rateCheck.allowed) {
        res.setHeader("Retry-After", String(rateCheck.retryAfterSeconds));
        sendJson(res, 429, { error: "Limite de requisições excedido" });
        return;
      }

      const bodyResult = await readBoundedJsonBody(
        req,
        MAX_BODY_BYTES,
        preReadBodyBuffer,
      );
      if (!bodyResult.ok) {
        sendJson(res, bodyResult.status, { error: bodyResult.message });
        return;
      }

      const userAgent =
        typeof req.headers["user-agent"] === "string"
          ? req.headers["user-agent"]
          : undefined;

      const sanitized = validateAndSanitizeCollectPayload(
        bodyResult.data as IncomingCollectPayload,
        userAgent,
      );

      if (!sanitized.ok) {
        sendJson(res, 400, { error: sanitized.error });
        return;
      }

      try {
        await collector.recordEvent(sanitized.data, ipResult, now);
        sendJson(res, 202, { accepted: true });
      } catch {
        // Resiliência: nunca expor erro interno de banco ao visitante
        sendJson(res, 202, { accepted: false });
      }
      return;
    }

    // =========================================================================
    // 2. Endpoint de autenticação administrativa (/api/v1/admin/login)
    // =========================================================================
    if (method === "POST" && urlPath === "/api/v1/admin/login") {
      applyNoStoreHeaders(res);

      const loginRate = loginIpLimiter.consume(ipResult.clientIp, now.getTime());
      if (!loginRate.allowed) {
        res.setHeader("Retry-After", String(loginRate.retryAfterSeconds));
        sendJson(res, 429, {
          error: "Muitas tentativas de login. Aguarde antes de tentar novamente.",
        });
        return;
      }

      const bodyResult = await readBoundedJsonBody(
        req,
        1024,
        preReadBodyBuffer,
      );
      if (
        !bodyResult.ok ||
        typeof bodyResult.data !== "object" ||
        !bodyResult.data ||
        Array.isArray(bodyResult.data)
      ) {
        sendJson(res, 400, { error: "Credenciais inválidas" });
        return;
      }

      const { username, password } = bodyResult.data as {
        username?: unknown;
        password?: unknown;
      };

      if (
        typeof username !== "string" ||
        typeof password !== "string" ||
        !username.trim() ||
        username.trim().length > 64 ||
        password.length < 1 ||
        password.length > 256
      ) {
        sendJson(res, 400, { error: "Credenciais inválidas" });
        return;
      }

      const normalizedUsername = username.trim();
      const userRate = loginUsernameLimiter.consume(
        normalizedUsername.toLowerCase(),
        now.getTime(),
      );
      if (!userRate.allowed) {
        res.setHeader("Retry-After", String(userRate.retryAfterSeconds));
        sendJson(res, 429, {
          error: "Muitas tentativas de login para esta conta. Aguarde antes de tentar novamente.",
        });
        return;
      }

      const adminUser = await config.repo.findAdminByUsername(normalizedUsername);
      const isPasswordValid = verifyPasswordConstantTime(
        password,
        adminUser?.passwordHash ?? null,
      );

      if (!adminUser || !isPasswordValid) {
        sendJson(res, 401, { error: "Usuário ou senha inválidos" });
        return;
      }

      const sessionToken = createSessionToken(now);
      await config.repo.createAdminSession(
        sessionToken.tokenHash,
        adminUser.id,
        ipResult.clientIp,
        sessionToken.expiresAt,
      );

      res.setHeader(
        "Set-Cookie",
        `meg_admin_session=${sessionToken.rawToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=43200`,
      );
      sendJson(res, 200, {
        authenticated: true,
        username: adminUser.username,
        expiresAt: sessionToken.expiresAt.toISOString(),
      });
      return;
    }

    // =========================================================================
    // 3. Guard de Autorização Centralizado para TODOS os endpoints /api/v1/admin/*
    // =========================================================================
    if (urlPath === "/api/v1/admin" || urlPath.startsWith("/api/v1/admin/")) {
      applyNoStoreHeaders(res);

      const rawToken = extractAuthTokenFromHeaders({
        cookie:
          typeof req.headers.cookie === "string"
            ? req.headers.cookie
            : undefined,
        authorization:
          typeof req.headers.authorization === "string"
            ? req.headers.authorization
            : undefined,
      });

      if (!rawToken) {
        sendJson(res, 401, { error: "Não autenticado" });
        return;
      }

      const tokenHash = hashSessionToken(rawToken);
      const validSession = await config.repo.findValidAdminSession(
        tokenHash,
        now,
      );
      if (!validSession) {
        sendJson(res, 401, { error: "Sessão inválida ou expirada" });
        return;
      }

      // Proteção CSRF em operações de mutação administrativa (POST, PUT, DELETE)
      if (method === "POST" || method === "PUT" || method === "DELETE") {
        const originHeader = req.headers.origin;
        if (
          typeof originHeader === "string" &&
          originHeader.trim() !== "" &&
          originHeader.trim() !== config.allowedOrigin
        ) {
          sendJson(res, 403, {
            error: "Origem não autorizada para operação administrativa",
          });
          return;
        }
      }

      // 3.1. Logout Administrativo (POST /api/v1/admin/logout)
      if (method === "POST" && urlPath === "/api/v1/admin/logout") {
        await config.repo.deleteAdminSession(validSession.tokenHash);
        res.setHeader(
          "Set-Cookie",
          "meg_admin_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0",
        );
        sendJson(res, 200, { loggedOut: true });
        return;
      }

      // 3.2. Verificação da Sessão Atual (GET /api/v1/admin/session)
      if (method === "GET" && urlPath === "/api/v1/admin/session") {
        sendJson(res, 200, {
          authenticated: true,
          user: {
            id: validSession.userId,
            username: validSession.username,
          },
          expiresAt: validSession.expiresAt.toISOString(),
        });
        return;
      }

      // 3.3. Resumo de Métricas com Filtros Temporais (GET /api/v1/admin/summary)
      if (method === "GET" && urlPath === "/api/v1/admin/summary") {
        const validation = validateSummaryQuery(params, now);
        if (!validation.ok) {
          sendJson(res, 400, { error: validation.error });
          return;
        }

        const summary = await config.repo.getMetricsSummary(
          validation.data,
          now,
        );
        sendJson(res, 200, { summary });
        return;
      }

      // 3.4. Listagem Agregada de IPs com Paginação e Filtros (GET /api/v1/admin/ips)
      if (method === "GET" && urlPath === "/api/v1/admin/ips") {
        const validation = validateIpListQuery(params, now);
        if (!validation.ok) {
          sendJson(res, 400, { error: validation.error });
          return;
        }

        const { items, totalItems } = await config.repo.listIpAggregates(
          validation.data,
        );
        const pagination = buildPaginationMeta(
          validation.data.page,
          validation.data.limit,
          totalItems,
        );

        sendJson(res, 200, {
          period: {
            from: validation.data.from.toISOString(),
            to: validation.data.to.toISOString(),
            windowHours: validation.data.windowHours,
          },
          items,
          pagination,
        });
        return;
      }

      // 3.5. Histórico Detalhado por IP:
      // Suporta GET /api/v1/admin/ips/:ip/history e GET /api/v1/admin/ip-history?ip=...
      const ipHistoryMatch = /^\/api\/v1\/admin\/ips\/([^/]+)\/history$/.exec(
        urlPath,
      );
      if (
        method === "GET" &&
        (urlPath === "/api/v1/admin/ip-history" || ipHistoryMatch !== null)
      ) {
        const routeIp = ipHistoryMatch?.[1]
          ? safeDecodeRouteSegment(ipHistoryMatch[1])
          : undefined;
        const validation = validateIpHistoryQuery(routeIp, params, now);
        if (!validation.ok) {
          sendJson(res, 400, { error: validation.error });
          return;
        }

        const history = await config.repo.getIpHistory(validation.data);
        sendJson(res, 200, {
          ipAddress: history.ipAddress,
          period: history.period,
          investigation: history.investigation,
          summary: history.summary,
          events: history.events,
          pagination: history.pagination,
        });
        return;
      }

      // 3.6. Gestão de IPs Investigados (Listagem, Criação/Atualização e Exclusão)
      if (
        method === "GET" &&
        urlPath === "/api/v1/admin/investigated-ips"
      ) {
        const validation = validateInvestigatedIpListQuery(params);
        if (!validation.ok) {
          sendJson(res, 400, { error: validation.error });
          return;
        }

        const { items, totalItems } = await config.repo.listInvestigatedIps(
          validation.data,
        );
        const pagination = buildPaginationMeta(
          validation.data.page,
          validation.data.limit,
          totalItems,
        );
        sendJson(res, 200, { items, pagination });
        return;
      }

      const ipInvestigationRouteMatch =
        /^\/api\/v1\/admin\/ips\/([^/]+)\/investigation$/.exec(urlPath);
      if (
        ((method === "POST" || method === "PUT") &&
          urlPath === "/api/v1/admin/investigated-ips") ||
        (method === "PUT" && ipInvestigationRouteMatch !== null)
      ) {
        const bodyResult = await readBoundedJsonBody(
          req,
          MAX_BODY_BYTES,
          preReadBodyBuffer,
        );
        if (!bodyResult.ok) {
          sendJson(res, bodyResult.status, { error: bodyResult.message });
          return;
        }

        const routeIp = ipInvestigationRouteMatch?.[1]
          ? safeDecodeRouteSegment(ipInvestigationRouteMatch[1])
          : undefined;
        const validation = validateInvestigatedIpUpsertPayload(
          bodyResult.data,
          routeIp,
        );
        if (!validation.ok) {
          sendJson(res, 400, { error: validation.error });
          return;
        }

        const item = await config.repo.upsertInvestigatedIp(
          validation.data.ipAddress,
          validation.data.status,
          validation.data.notes,
          validSession.username,
          now,
        );
        sendJson(res, 200, { item });
        return;
      }

      const deleteInvestigatedMatch =
        /^\/api\/v1\/admin\/investigated-ips\/([^/]+)$/.exec(urlPath);
      if (
        method === "DELETE" &&
        (urlPath === "/api/v1/admin/investigated-ips" ||
          deleteInvestigatedMatch !== null)
      ) {
        const candidateIp = deleteInvestigatedMatch?.[1]
          ? safeDecodeRouteSegment(deleteInvestigatedMatch[1])
          : params.get("ip");
        const normalizedIp = normalizeIp(candidateIp);
        if (!normalizedIp) {
          sendJson(res, 400, { error: "Endereço IP inválido para exclusão." });
          return;
        }

        const deleted = await config.repo.deleteInvestigatedIp(normalizedIp);
        sendJson(res, 200, { deleted, ipAddress: normalizedIp });
        return;
      }

      // 3.7. Exportação Autenticada (GET /api/v1/admin/export)
      if (method === "GET" && urlPath === "/api/v1/admin/export") {
        const validation = validateExportQuery(params, now);
        if (!validation.ok) {
          sendJson(res, 400, { error: validation.error });
          return;
        }

        const opts = validation.data;

        if (opts.type === "investigated_ips") {
          const { items } = await config.repo.listInvestigatedIps({
            page: 1,
            limit: opts.limit,
            status: opts.status,
          });

          if (opts.format === "csv") {
            const csv = serializeToCsv(
              [
                "ip_address",
                "status",
                "notes",
                "first_flagged_at",
                "updated_at",
                "updated_by",
              ],
              items.map((item) => [
                item.ipAddress,
                item.status,
                item.notes,
                item.firstFlaggedAt.toISOString(),
                item.updatedAt.toISOString(),
                item.updatedBy,
              ]),
            );
            sendCsv(res, "monitoring-investigated-ips.csv", csv);
            return;
          }

          sendJson(res, 200, {
            exportType: "investigated_ips",
            generatedAt: now.toISOString(),
            count: items.length,
            items,
          });
          return;
        }

        if (opts.type === "ips") {
          const { items } = await config.repo.listIpAggregates({
            from: opts.from,
            to: opts.to,
            windowHours: opts.windowHours,
            page: 1,
            limit: opts.limit,
            status: opts.status,
            trafficCategory: opts.trafficCategory,
            ipAddress: opts.ipAddress,
            sortBy: "identifiedPaidEntries",
            sortOrder: "desc",
          });

          if (opts.format === "csv") {
            const csv = serializeToCsv(
              [
                "ip_address",
                "total_requests",
                "total_visits",
                "identified_paid_entries",
                "whatsapp_clicks",
                "phone_clicks",
                "distinct_sessions",
                "spoof_attempts",
                "header_mismatches",
                "first_seen_at",
                "last_seen_at",
                "investigation_status",
                "investigation_notes",
              ],
              items.map((item) => [
                item.ipAddress,
                item.totalRequests,
                item.totalVisits,
                item.identifiedPaidEntries,
                item.whatsappClicks,
                item.phoneClicks,
                item.distinctSessions,
                item.spoofAttempts,
                item.headerMismatches,
                item.firstSeenAt.toISOString(),
                item.lastSeenAt.toISOString(),
                item.investigation?.status ?? "",
                item.investigation?.notes ?? "",
              ]),
            );
            sendCsv(res, "monitoring-ip-summary.csv", csv);
            return;
          }

          sendJson(res, 200, {
            exportType: "ips",
            generatedAt: now.toISOString(),
            period: {
              from: opts.from.toISOString(),
              to: opts.to.toISOString(),
              windowHours: opts.windowHours,
            },
            count: items.length,
            items,
          });
          return;
        }

        // Exportação padrão: eventos detalhados (`type === "events"`)
        const events = await config.repo.exportAccessEvents(opts);
        if (opts.format === "csv") {
          const csv = serializeToCsv(
            [
              "id",
              "created_at",
              "ip_address",
              "ip_source",
              "ip_header_mismatch",
              "spoof_attempt_detected",
              "session_id",
              "is_new_visit",
              "event_type",
              "page_path",
              "button_location",
              "contact_target",
              "traffic_category",
              "is_paid_entry",
              "paid_click_type",
              "paid_click_id",
              "utm_source",
              "utm_medium",
              "utm_campaign",
              "utm_term",
              "utm_content",
              "referrer_origin",
              "browser_family",
              "os_family",
              "device_type",
            ],
            events.map((ev) => [
              ev.id,
              ev.createdAt.toISOString(),
              ev.ipAddress,
              ev.ipSource,
              ev.ipHeaderMismatch,
              ev.spoofAttemptDetected,
              ev.sessionId,
              ev.isNewVisit,
              ev.eventType,
              ev.pagePath,
              ev.buttonLocation ?? "",
              ev.contactTarget ?? "",
              ev.trafficCategory,
              ev.isPaidEntry,
              ev.paidClickType ?? "",
              ev.paidClickId ?? "",
              ev.utmSource ?? "",
              ev.utmMedium ?? "",
              ev.utmCampaign ?? "",
              ev.utmTerm ?? "",
              ev.utmContent ?? "",
              ev.referrerOrigin ?? "",
              ev.browserFamily,
              ev.osFamily,
              ev.deviceType,
            ]),
          );
          sendCsv(res, "monitoring-events.csv", csv);
          return;
        }

        sendJson(res, 200, {
          exportType: "events",
          generatedAt: now.toISOString(),
          period: {
            from: opts.from.toISOString(),
            to: opts.to.toISOString(),
            windowHours: opts.windowHours,
          },
          count: events.length,
          items: events,
        });
        return;
      }

      sendJson(res, 404, { error: "Endpoint administrativo não encontrado" });
      return;
    }

    sendJson(res, 404, { error: "Rota não encontrada" });
  });
}

// Inicialização quando executado diretamente como processo principal
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error(
      "DATABASE_URL é obrigatória para iniciar o serviço de monitoramento.",
    );
    process.exit(1);
  }

  const rawTrustedCidrs = process.env.TRUSTED_PROXY_CIDRS;
  if (!rawTrustedCidrs && process.env.NODE_ENV === "production") {
    console.error(
      "TRUSTED_PROXY_CIDRS é obrigatória em produção (informe o IP/CIDR real do container Traefik inspecionado na rede Docker).",
    );
    process.exit(1);
  }

  const trustedProxyCidrs = (rawTrustedCidrs ?? "127.0.0.1/32")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  const ipOptions: IpExtractionOptions = {
    trustedProxyCidrs,
    maxTrustedProxyHops: Number(process.env.MAX_TRUSTED_PROXY_HOPS ?? "1"),
    rejectPrivateClientIps:
      (process.env.REJECT_PRIVATE_CLIENT_IPS ?? "true") === "true",
  };

  const ipConfigValidation = validateIpExtractionConfig(ipOptions);
  for (const warning of ipConfigValidation.warnings) {
    console.warn(`[AVISO IP/TRAEFIK] ${warning}`);
  }
  if (!ipConfigValidation.valid) {
    for (const err of ipConfigValidation.errors) {
      console.error(`[ERRO IP/TRAEFIK] ${err}`);
    }
    process.exit(1);
  }

  const rawBridgeSecret = process.env.MONITORING_BRIDGE_SECRET?.trim();
  if (process.env.NODE_ENV === "production" && !isValidBridgeSecret(rawBridgeSecret)) {
    console.error(
      `MONITORING_BRIDGE_SECRET é obrigatório em produção (mínimo de ${MIN_BRIDGE_SECRET_LENGTH} caracteres).`,
    );
    process.exit(1);
  }
  if (rawBridgeSecret && !isValidBridgeSecret(rawBridgeSecret)) {
    console.error(
      `MONITORING_BRIDGE_SECRET inválido: mínimo de ${MIN_BRIDGE_SECRET_LENGTH} caracteres.`,
    );
    process.exit(1);
  }

  const pgModuleName = "pg";
  const pgModule = (await import(pgModuleName)) as {
    Pool: new (config: {
      connectionString: string;
      max: number;
      idleTimeoutMillis: number;
      connectionTimeoutMillis: number;
    }) => SqlPoolLike;
  };

  const pool = new pgModule.Pool({
    connectionString: databaseUrl,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  // Garante aplicação idempotente do schema 001_init.sql no startup
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const migrationPath = join(currentDir, "..", "migrations", "001_init.sql");
  const migrationSql = readFileSync(migrationPath, "utf8");
  await pool.query(migrationSql);

  const repo = new PostgresMonitoringRepository(pool);

  // Bootstrap idempotente do usuário administrativo inicial se configurado no ambiente
  const adminUsername = process.env.ADMIN_USERNAME?.trim();
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const adminInitialPassword = process.env.ADMIN_INITIAL_PASSWORD?.trim();
  if (adminUsername && (adminPasswordHash || adminInitialPassword)) {
    const resolvedHash =
      adminPasswordHash && adminPasswordHash.startsWith("scrypt$")
        ? adminPasswordHash
        : hashPassword(adminInitialPassword!);
    await repo.createAdminUser(adminUsername, resolvedHash);
  }

  const retentionDays = Number(
    process.env.RETENTION_DAYS ?? DEFAULT_RETENTION_DAYS,
  );
  const retention = new RetentionScheduler(repo, retentionDays);
  retention.start();

  const server = createMonitoringServer({
    repo,
    ipOptions,
    allowedOrigin:
      process.env.ALLOWED_ORIGIN ?? "https://memorettiguinchos.com.br",
    bridgeSecret: rawBridgeSecret || undefined,
    bridgeMaxSkewMs: Number(process.env.BRIDGE_MAX_SKEW_MS ?? "30000"),
    rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? "60000"),
    rateLimitMaxEvents: Number(process.env.RATE_LIMIT_MAX_EVENTS ?? "60"),
  });

  const port = Number(process.env.PORT ?? "4000");
  const host = process.env.HOSTNAME ?? "0.0.0.0";

  server.listen(port, host, () => {
    console.log(`Serviço de Monitoramento ativo em http://${host}:${port}`);
  });
}
