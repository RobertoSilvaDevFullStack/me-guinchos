import { randomBytes, scryptSync, createHash, timingSafeEqual } from "node:crypto";

const SCRYPT_KEYLEN = 64;
const SESSION_TTL_HOURS = 12;

/**
 * Hash dummy gerado uma única vez na inicialização do módulo para garantir que
 * tentativas de login com usuários inexistentes executem exatamente o mesmo custo
 * computacional de derivação `scrypt` (prevenção contra enumeração por timing attack).
 */
const DUMMY_PASSWORD_HASH = (() => {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync("dummy_password_constant_time_guard", salt, SCRYPT_KEYLEN).toString("hex");
  return `scrypt$${salt}$${key}`;
})();

/**
 * Valida se um token bruto possui formato estrito base64url ([A-Za-z0-9_-]) e comprimento entre 32 e 128.
 */
export function isWellFormedSessionToken(token: string): boolean {
  if (!token || token.length < 32 || token.length > 128) return false;
  for (let i = 0; i < token.length; i++) {
    const code = token.charCodeAt(i);
    const isUpper = code >= 65 && code <= 90;
    const isLower = code >= 97 && code <= 122;
    const isDigit = code >= 48 && code <= 57;
    const isAllowedSymbol = code === 45 || code === 95; // '-' ou '_'
    if (!isUpper && !isLower && !isDigit && !isAllowedSymbol) {
      return false;
    }
  }
  return true;
}

/**
 * Gera um hash de senha resistente a força bruta utilizando `node:crypto` scrypt.
 * Formato: `scrypt$<salt_hex>$<hash_hex>`
 */
export function hashPassword(plainPassword: string): string {
  if (!plainPassword || plainPassword.length < 8) {
    throw new Error("A senha administrativa deve ter pelo menos 8 caracteres.");
  }
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(plainPassword, salt, SCRYPT_KEYLEN).toString("hex");
  return `scrypt$${salt}$${derivedKey}`;
}

/**
 * Verifica uma senha contra o hash armazenado usando comparação em tempo constante
 * (`timingSafeEqual`) para evitar ataques de timing.
 */
export function verifyPassword(plainPassword: string, storedHash: string): boolean {
  if (!plainPassword || !storedHash || plainPassword.length > 256) return false;
  const parts = storedHash.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;

  const [, salt, expectedHex] = parts;
  if (!salt || !expectedHex) return false;

  try {
    const derivedBuffer = scryptSync(plainPassword, salt, SCRYPT_KEYLEN);
    const expectedBuffer = Buffer.from(expectedHex, "hex");
    if (derivedBuffer.length !== expectedBuffer.length) return false;
    return timingSafeEqual(derivedBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Verifica senha mesmo quando o usuário não existe no banco, executando `scrypt`
 * contra um hash dummy para impedir enumeração de usuários por diferença de tempo.
 */
export function verifyPasswordConstantTime(
  plainPassword: string,
  storedHashOrNull: string | null | undefined,
): boolean {
  if (!storedHashOrNull) {
    verifyPassword(plainPassword || "invalid", DUMMY_PASSWORD_HASH);
    return false;
  }
  return verifyPassword(plainPassword, storedHashOrNull);
}

/**
 * Gera um token de sessão criptograficamente seguro e o respectivo hash SHA-256
 * que será persistido no banco (o token bruto nunca é salvo em texto puro no banco).
 */
export function createSessionToken(now: Date = new Date()): {
  rawToken: string;
  tokenHash: string;
  expiresAt: Date;
} {
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(now.getTime() + SESSION_TTL_HOURS * 60 * 60 * 1000);
  return { rawToken, tokenHash, expiresAt };
}

/**
 * Calcula o hash SHA-256 de um token de sessão recebido via cookie/cabeçalho.
 */
export function hashSessionToken(rawToken: string): string {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

/**
 * Extrai o token do cookie `meg_admin_session` ou do cabeçalho `Authorization: Bearer`.
 * Protege contra manipulação de sessão:
 * - Rejeita tokens fora do alfabeto base64url ([A-Za-z0-9_-]{32,128}).
 * - Rejeita requisições com múltiplos cookies `meg_admin_session` (ataque de Cookie Tossing / Fixation).
 * - Rejeita requisições onde Cookie e Authorization enviam tokens divergentes.
 */
export function extractAuthTokenFromHeaders(headers: {
  cookie?: string | undefined;
  authorization?: string | undefined;
}): string | null {
  let cookieToken: string | null = null;
  let cookieCount = 0;

  if (headers.cookie) {
    const pairs = headers.cookie.split(";");
    for (const pair of pairs) {
      const eqIdx = pair.indexOf("=");
      if (eqIdx === -1) continue;
      const key = pair.slice(0, eqIdx).trim();
      const val = pair.slice(eqIdx + 1).trim();
      if (key === "meg_admin_session") {
        cookieCount++;
        if (!isWellFormedSessionToken(val)) {
          return null;
        }
        cookieToken = val;
      }
    }
    if (cookieCount > 1) {
      return null;
    }
  }

  let bearerToken: string | null = null;
  if (headers.authorization !== undefined) {
    if (!headers.authorization.startsWith("Bearer ")) {
      return null;
    }
    const token = headers.authorization.slice(7).trim();
    if (!isWellFormedSessionToken(token)) {
      return null;
    }
    bearerToken = token;
  }

  if (cookieToken && bearerToken && cookieToken !== bearerToken) {
    return null;
  }

  return cookieToken ?? bearerToken;
}
