import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const BRIDGE_HEADER_TIMESTAMP = "x-monitoring-bridge-ts";
export const BRIDGE_HEADER_NONCE = "x-monitoring-bridge-nonce";
export const BRIDGE_HEADER_SIGNATURE = "x-monitoring-bridge-sig";

export const DEFAULT_BRIDGE_MAX_SKEW_MS = 30_000; // 30 segundos
export const MIN_BRIDGE_SECRET_LENGTH = 32;

const EMPTY_BODY_SHA256 =
  "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

const TIMESTAMP_REGEX = /^\d{10,16}$/;
const NONCE_REGEX = /^[0-9a-fA-F]{32,64}$/;
const SIGNATURE_HEX_REGEX = /^[0-9a-fA-F]{64}$/;

export interface BridgeCanonicalParams {
  timestamp: string;
  nonce: string;
  method: string;
  pathWithQuery: string;
  forwardedFor?: string | null;
  realIp?: string | null;
  bodySha256: string;
}

export interface SignBridgeRequestParams {
  secret: string;
  method: string;
  pathWithQuery: string;
  forwardedFor?: string | null;
  realIp?: string | null;
  rawBody?: Buffer | Uint8Array | ArrayBuffer | string | null;
  timestampMs?: number;
  nonce?: string;
}

export interface BridgeSignedHeaders {
  [BRIDGE_HEADER_TIMESTAMP]: string;
  [BRIDGE_HEADER_NONCE]: string;
  [BRIDGE_HEADER_SIGNATURE]: string;
}

export type BridgeVerificationFailureCode =
  | "missing_bridge_headers"
  | "malformed_bridge_headers"
  | "bridge_signature_expired"
  | "bridge_replay_detected"
  | "invalid_bridge_signature";

export type BridgeVerificationResult =
  | {
      ok: true;
      timestampMs: number;
      nonce: string;
    }
  | {
      ok: false;
      status: 403;
      code: BridgeVerificationFailureCode;
      error: string;
    };

export function isValidBridgeSecret(
  secret: string | undefined | null,
): secret is string {
  return (
    typeof secret === "string" &&
    secret.trim().length >= MIN_BRIDGE_SECRET_LENGTH
  );
}

export function computeBridgeBodySha256(
  rawBody?: Buffer | Uint8Array | ArrayBuffer | string | null,
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

export function buildBridgeCanonicalPayload(
  params: BridgeCanonicalParams,
): string {
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

export function computeBridgeSignature(
  secret: string,
  canonicalPayload: string,
): string {
  return createHmac("sha256", secret.trim())
    .update(canonicalPayload, "utf8")
    .digest("hex");
}

export function createSignedBridgeHeaders(
  params: SignBridgeRequestParams,
): BridgeSignedHeaders {
  if (!isValidBridgeSecret(params.secret)) {
    throw new Error(
      `MONITORING_BRIDGE_SECRET inválido: mínimo de ${MIN_BRIDGE_SECRET_LENGTH} caracteres.`,
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
  const signature = computeBridgeSignature(params.secret, canonical);

  return {
    [BRIDGE_HEADER_TIMESTAMP]: timestamp,
    [BRIDGE_HEADER_NONCE]: nonce,
    [BRIDGE_HEADER_SIGNATURE]: signature,
  };
}

function getSingleHeaderValue(
  val: string | string[] | undefined,
): string | null {
  if (typeof val === "string") return val.trim();
  if (Array.isArray(val) && val.length === 1 && typeof val[0] === "string") {
    return val[0].trim();
  }
  return null;
}

/**
 * Guard criptográfico HMAC-SHA256 com proteção anti-replay baseada em janela temporal
 * estrita e cache em memória de nonces de uso único.
 *
 * - Nonces só são inseridos no cache APÓS a validação criptográfica do HMAC em tempo
 *   constante (`timingSafeEqual`), impedindo que atacantes sem o segredo poluam ou
 *   esgotem o cache de replay.
 */
export class BridgeReplayGuard {
  private readonly secret: string;
  private readonly maxSkewMs: number;
  private readonly maxCacheSize: number;
  private readonly usedNonces = new Map<string, number>();

  constructor(options: {
    secret: string;
    maxSkewMs?: number;
    maxCacheSize?: number;
  }) {
    if (!isValidBridgeSecret(options.secret)) {
      throw new Error(
        `BridgeReplayGuard requer um segredo com no mínimo ${MIN_BRIDGE_SECRET_LENGTH} caracteres.`,
      );
    }
    this.secret = options.secret.trim();
    this.maxSkewMs = options.maxSkewMs ?? DEFAULT_BRIDGE_MAX_SKEW_MS;
    this.maxCacheSize = options.maxCacheSize ?? 20_000;
  }

  private pruneExpired(nowMs: number): void {
    for (const [nonce, expiresAt] of this.usedNonces.entries()) {
      if (expiresAt <= nowMs) {
        this.usedNonces.delete(nonce);
      }
    }
  }

  /**
   * Fase 1: Valida presença, formato, janela temporal e ausência de replay ANTES de
   * ler o corpo da requisição, protegendo o servidor contra flood não autenticado.
   */
  public verifyHeadersPreBody(
    headers: {
      [key: string]: string | string[] | undefined;
    },
    nowMs: number = Date.now(),
  ):
    | {
        ok: true;
        timestamp: string;
        timestampMs: number;
        nonce: string;
        signatureHex: string;
      }
    | {
        ok: false;
        status: 403;
        code: BridgeVerificationFailureCode;
        error: string;
      } {
    const rawTs = getSingleHeaderValue(headers[BRIDGE_HEADER_TIMESTAMP]);
    const rawNonce = getSingleHeaderValue(headers[BRIDGE_HEADER_NONCE]);
    const rawSig = getSingleHeaderValue(headers[BRIDGE_HEADER_SIGNATURE]);

    if (!rawTs || !rawNonce || !rawSig) {
      return {
        ok: false,
        status: 403,
        code: "missing_bridge_headers",
        error: "Acesso direto bloqueado: cabeçalhos HMAC da ponte ausentes.",
      };
    }

    if (
      !TIMESTAMP_REGEX.test(rawTs) ||
      !NONCE_REGEX.test(rawNonce) ||
      !SIGNATURE_HEX_REGEX.test(rawSig)
    ) {
      return {
        ok: false,
        status: 403,
        code: "malformed_bridge_headers",
        error: "Cabeçalhos de autenticação da ponte malformados.",
      };
    }

    const timestampMs = Number(rawTs);
    if (!Number.isSafeInteger(timestampMs)) {
      return {
        ok: false,
        status: 403,
        code: "malformed_bridge_headers",
        error: "Timestamp da ponte inválido.",
      };
    }

    if (Math.abs(nowMs - timestampMs) > this.maxSkewMs) {
      return {
        ok: false,
        status: 403,
        code: "bridge_signature_expired",
        error: "Assinatura HMAC expirada ou fora da janela temporal permitida.",
      };
    }

    const normalizedNonce = rawNonce.toLowerCase();
    this.pruneExpired(nowMs);

    const existingExpiry = this.usedNonces.get(normalizedNonce);
    if (existingExpiry !== undefined && existingExpiry > nowMs) {
      return {
        ok: false,
        status: 403,
        code: "bridge_replay_detected",
        error: "Requisição duplicada bloqueada (proteção anti-replay).",
      };
    }

    return {
      ok: true,
      timestamp: rawTs,
      timestampMs,
      nonce: normalizedNonce,
      signatureHex: rawSig.toLowerCase(),
    };
  }

  /**
   * Fase 2: Verifica a assinatura HMAC-SHA256 completa (incluindo método, caminho+query,
   * X-Forwarded-For, X-Real-IP e SHA-256 do corpo) e registra o nonce contra replay.
   */
  public verifyRequestAndCommitNonce(
    params: {
      headers: { [key: string]: string | string[] | undefined };
      method: string;
      pathWithQuery: string;
      rawBody?: Buffer | Uint8Array | string | null;
    },
    nowMs: number = Date.now(),
  ): BridgeVerificationResult {
    const preCheck = this.verifyHeadersPreBody(params.headers, nowMs);
    if (!preCheck.ok) {
      return preCheck;
    }

    const rawXff = Array.isArray(params.headers["x-forwarded-for"])
      ? params.headers["x-forwarded-for"].join(", ")
      : params.headers["x-forwarded-for"];
    const rawRealIp = Array.isArray(params.headers["x-real-ip"])
      ? params.headers["x-real-ip"][0]
      : params.headers["x-real-ip"];

    const bodySha256 = computeBridgeBodySha256(params.rawBody);
    const canonical = buildBridgeCanonicalPayload({
      timestamp: preCheck.timestamp,
      nonce: preCheck.nonce,
      method: params.method,
      pathWithQuery: params.pathWithQuery,
      forwardedFor: rawXff ?? "",
      realIp: rawRealIp ?? "",
      bodySha256,
    });

    const expectedHex = computeBridgeSignature(this.secret, canonical);

    try {
      const expectedBuf = Buffer.from(expectedHex, "hex");
      const receivedBuf = Buffer.from(preCheck.signatureHex, "hex");
      if (
        expectedBuf.length !== receivedBuf.length ||
        !timingSafeEqual(expectedBuf, receivedBuf)
      ) {
        return {
          ok: false,
          status: 403,
          code: "invalid_bridge_signature",
          error: "Assinatura HMAC-SHA256 da ponte inválida.",
        };
      }
    } catch {
      return {
        ok: false,
        status: 403,
        code: "invalid_bridge_signature",
        error: "Assinatura HMAC-SHA256 da ponte inválida.",
      };
    }

    // Revalida o cache imediatamente antes de gravar para evitar corrida
    const existingExpiry = this.usedNonces.get(preCheck.nonce);
    if (existingExpiry !== undefined && existingExpiry > nowMs) {
      return {
        ok: false,
        status: 403,
        code: "bridge_replay_detected",
        error: "Requisição duplicada bloqueada (proteção anti-replay).",
      };
    }

    if (this.usedNonces.size >= this.maxCacheSize) {
      this.pruneExpired(nowMs);
      if (this.usedNonces.size >= this.maxCacheSize) {
        const oldestKey = this.usedNonces.keys().next().value;
        if (oldestKey !== undefined) {
          this.usedNonces.delete(oldestKey);
        }
      }
    }

    // Retém o nonce por pelo menos 2x a janela máxima de skew
    this.usedNonces.set(preCheck.nonce, nowMs + this.maxSkewMs * 2);

    return {
      ok: true,
      timestampMs: preCheck.timestampMs,
      nonce: preCheck.nonce,
    };
  }
}
