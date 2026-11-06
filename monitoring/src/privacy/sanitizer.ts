import type {
  DeviceType,
  EventType,
  IncomingCollectPayload,
  SanitizedTelemetryInput,
} from "../types.ts";

const ALLOWED_EVENT_TYPES = new Set<EventType>([
  "page_view",
  "whatsapp_click",
  "phone_click",
]);

/**
 * Decodifica percent-encoding em até 3 passagens para evitar ataques de double-encoding (%2540 -> %40 -> @).
 */
export function safeDecodeUriComponent(raw: string): string {
  let current = raw;
  for (let i = 0; i < 3; i++) {
    try {
      const decoded = decodeURIComponent(current);
      if (decoded === current) break;
      current = decoded;
    } catch {
      break;
    }
  }
  return current;
}

/**
 * Conta dígitos numéricos (0-9) de forma determinística por código ASCII (sem regex).
 */
export function countNumericDigits(value: string): number {
  let count = 0;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code >= 48 && code <= 57) {
      count++;
    }
  }
  return count;
}

/**
 * Valida se uma string é um UUID v4 válido por inspeção posicional e hexadecimal.
 */
export function isValidUuid(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim().toLowerCase();
  if (trimmed.length !== 36) return false;

  for (let i = 0; i < 36; i++) {
    const ch = trimmed.charCodeAt(i);
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      if (ch !== 45) return false; // '-'
      continue;
    }
    const isDigit = ch >= 48 && ch <= 57;
    const isHexLower = ch >= 97 && ch <= 102;
    if (!isDigit && !isHexLower) return false;
  }
  return true;
}

/**
 * Valida estruturalmente um Click ID do Google Ads (gclid, wbraid, gbraid)
 * aceitando somente caracteres alfanuméricos, '_' e '-', entre 4 e 128 caracteres.
 */
export function sanitizeClickId(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const decoded = safeDecodeUriComponent(raw).trim();
  if (decoded.length < 4 || decoded.length > 128) return null;

  for (let i = 0; i < decoded.length; i++) {
    const code = decoded.charCodeAt(i);
    const isUpper = code >= 65 && code <= 90;
    const isLower = code >= 97 && code <= 122;
    const isDigit = code >= 48 && code <= 57;
    const isAllowedSymbol = code === 45 || code === 95; // '-' ou '_'
    if (!isUpper && !isLower && !isDigit && !isAllowedSymbol) {
      return null;
    }
  }
  return decoded;
}

/**
 * Remove prefixos técnicos legítimos do Google Ads / ValueTrack e datas de campanha
 * antes de avaliar sequências numéricas contíguas de PII (telefone, CPF, CNPJ, CEP).
 */
function stripTechnicalUtmTokens(value: string): string {
  return value
    // IDs técnicos de mídia paga (ex.: kwd-123456789, dsa-987654321, cid-21849085989, loc-1001773)
    .replace(
      /(?<![a-zA-Z0-9])(?:kwd|dsa|pla|loc|cid|agid|adid|crid|trg|target|camp|campaign|adgroup|creative|id|ver|versao)[-_:]\d{1,24}(?![a-zA-Z0-9])/gi,
      " ",
    )
    // Datas ISO / calendário em nomes de campanha (ex.: 2026-11-06, 20261106, 06-11-2026)
    .replace(
      /(?<![a-zA-Z0-9])20\d{2}[-_/.]?(?:0[1-9]|1[0-2])[-_/.]?(?:0[1-9]|[12]\d|3[01])(?![a-zA-Z0-9])/g,
      " ",
    )
    .replace(
      /(?<![a-zA-Z0-9])(?:0[1-9]|[12]\d|3[01])[-_/.]?(?:0[1-9]|1[0-2])[-_/.]?20\d{2}(?![a-zA-Z0-9])/g,
      " ",
    )
    // Menções operacionais comuns (ex.: 24h, 24/7, 24horas)
    .replace(/(?<![a-zA-Z0-9])24\s*(?:h|hs|hrs|horas|\/7)(?![a-zA-Z0-9])/gi, " ");
}

/**
 * Detecta se existe um agrupamento numérico contíguo com >= 8 dígitos (padrão de
 * telefone, CPF, CNPJ ou CEP, mesmo quando formatado com pontos, traços, barras,
 * parênteses ou espaços), sem rejeitar números curtos espalhados em palavras distintas.
 */
function hasContiguousNumericPiiCluster(value: string): boolean {
  const cleaned = stripTechnicalUtmTokens(value);
  let clusterDigits = 0;

  for (let i = 0; i < cleaned.length; i++) {
    const code = cleaned.charCodeAt(i);
    const isDigit = code >= 48 && code <= 57;

    if (isDigit) {
      clusterDigits++;
      if (clusterDigits >= 8) {
        return true;
      }
      continue;
    }

    // Separadores típicos de formatação de telefone/CPF/CNPJ: espaço, '.', '-', '/', '(', ')', '+'
    const isFormattingSeparator =
      code === 32 ||
      code === 46 ||
      code === 45 ||
      code === 47 ||
      code === 40 ||
      code === 41 ||
      code === 43;

    if (!isFormattingSeparator) {
      clusterDigits = 0;
    }
  }

  return false;
}

/**
 * Sanitiza um valor UTM estruturalmente preservando UTMs legítimas de campanhas
 * (incluindo ValueTrack `kwd-...:loc-...`, `cid-...`, datas `2026-11-06`, `24/7`,
 * correspondência de palavra-chave `[guincho 24 horas zona oeste sp]`):
 * - Decodifica percent-encoding recursivamente (até 3 passagens).
 * - Limita o tamanho entre 1 e 128 caracteres.
 * - Rejeita strings com caracteres de e-mail, HTML, aspas ou quebra de linha.
 * - Rejeita esquemas de URL/URI (`http://`, `https://`, `mailto:`, `tel:`, `javascript:`, `data:`).
 * - Rejeita agrupamentos numéricos contíguos >= 8 dígitos (telefone, CPF, CNPJ, CEP),
 *   preservando IDs técnicos prefixados e números curtos distribuídos no nome da campanha.
 * - Permite até 12 palavras para termos de busca de cauda longa em `utm_term`.
 */
export function sanitizeUtmValue(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const decoded = safeDecodeUriComponent(raw).trim();
  if (decoded.length < 1 || decoded.length > 128) return null;

  const forbiddenChars = ["@", "<", ">", '"', "'", "`", "\r", "\n", "\0", "\\"];
  for (const ch of forbiddenChars) {
    if (decoded.includes(ch)) return null;
  }

  const lower = decoded.toLowerCase();
  const forbiddenSchemes = [
    "http://",
    "https://",
    "mailto:",
    "tel:",
    "javascript:",
    "data:",
    "vbscript:",
  ];
  for (const scheme of forbiddenSchemes) {
    if (lower.includes(scheme)) return null;
  }

  if (
    /\b(?:cpf|cnpj|telefone|celular|whatsapp|ligue|email|e-mail)\b/i.test(decoded) &&
    countNumericDigits(decoded) >= 6
  ) {
    return null;
  }

  if (hasContiguousNumericPiiCluster(decoded)) {
    return null;
  }

  const words = decoded.split(/\s+/);
  if (words.length > 12) {
    return null;
  }

  return decoded;
}

/**
 * Sanitiza um identificador de localização de botão (`button_location`),
 * permitindo apenas caracteres [a-zA-Z0-9_-] até 64 caracteres.
 */
export function sanitizeButtonLocation(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 64) return null;

  for (let i = 0; i < trimmed.length; i++) {
    const code = trimmed.charCodeAt(i);
    const isUpper = code >= 65 && code <= 90;
    const isLower = code >= 97 && code <= 122;
    const isDigit = code >= 48 && code <= 57;
    const isAllowedSymbol = code === 45 || code === 95;
    if (!isUpper && !isLower && !isDigit && !isAllowedSymbol) {
      return "conteudo_geral";
    }
  }
  return trimmed;
}

/**
 * Sanitiza o alvo de contato (`wa.me` ou `tel:`) removendo integralmente `?text=`
 * e qualquer query string ou fragmento que possa conter dados digitados pelo usuário.
 */
export function sanitizeContactTarget(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const trimmed = safeDecodeUriComponent(raw.trim());

  if (trimmed.startsWith("tel:")) {
    const base = trimmed.split("?")[0]?.split("#")[0] ?? "tel:";
    return base.slice(0, 64);
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    if (
      host === "wa.me" ||
      host === "whatsapp.com" ||
      host.endsWith(".whatsapp.com")
    ) {
      const phone = parsed.searchParams.get("phone");
      parsed.search = "";
      parsed.hash = "";
      if (phone) {
        const cleanPhone = phone.trim();
        let onlyDigitsAndPlus = true;
        for (let i = 0; i < cleanPhone.length; i++) {
          const code = cleanPhone.charCodeAt(i);
          if (i === 0 && code === 43) continue;
          if (code < 48 || code > 57) {
            onlyDigitsAndPlus = false;
            break;
          }
        }
        if (onlyDigitsAndPlus && countNumericDigits(cleanPhone) >= 8 && cleanPhone.length <= 16) {
          parsed.searchParams.set("phone", cleanPhone);
        }
      }
      return parsed.toString().slice(0, 128);
    }

    parsed.search = "";
    parsed.hash = "";
    return parsed.toString().slice(0, 128);
  } catch {
    return (trimmed.split("?")[0]?.split("#")[0] ?? "").slice(0, 128) || null;
  }
}

/**
 * Minimiza o Referrer para manter apenas a origem (`https://www.google.com`),
 * descartando caminho e query string por privacidade (LGPD).
 */
export function minimizeReferrer(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    const parsed = new URL(raw.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.origin.toLowerCase().slice(0, 255);
  } catch {
    return null;
  }
}

/**
 * Minimiza o User-Agent bruto em categorias não-identificáveis (LGPD).
 */
export function minimizeUserAgent(rawUa: string | undefined | null): {
  browserFamily: string;
  osFamily: string;
  deviceType: DeviceType;
} {
  if (!rawUa || !rawUa.trim()) {
    return { browserFamily: "Unknown", osFamily: "Unknown", deviceType: "unknown" };
  }

  const ua = rawUa.toLowerCase();

  if (
    ua.includes("bot") ||
    ua.includes("spider") ||
    ua.includes("crawler") ||
    ua.includes("headlesschrome") ||
    ua.includes("lighthouse") ||
    ua.includes("adsbot-google")
  ) {
    return { browserFamily: "Bot/Crawler", osFamily: "Bot", deviceType: "bot" };
  }

  let osFamily = "Other";
  if (ua.includes("android")) osFamily = "Android";
  else if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) osFamily = "iOS";
  else if (ua.includes("windows")) osFamily = "Windows";
  else if (ua.includes("mac os x") || ua.includes("macintosh")) osFamily = "macOS";
  else if (ua.includes("linux")) osFamily = "Linux";

  let browserFamily = "Other";
  if (ua.includes("edg/")) browserFamily = "Edge";
  else if (ua.includes("opr/") || ua.includes("opera")) browserFamily = "Opera";
  else if (ua.includes("samsungbrowser")) browserFamily = "Samsung Internet";
  else if (ua.includes("chrome/") || ua.includes("crios/")) browserFamily = "Chrome";
  else if (ua.includes("firefox/") || ua.includes("fxios/")) browserFamily = "Firefox";
  else if (ua.includes("safari/")) browserFamily = "Safari";

  let deviceType: DeviceType = "desktop";
  if (ua.includes("ipad") || ua.includes("tablet")) {
    deviceType = "tablet";
  } else if (
    ua.includes("mobile") ||
    ua.includes("android") ||
    ua.includes("iphone")
  ) {
    deviceType = "mobile";
  }

  return { browserFamily, osFamily, deviceType };
}

/**
 * Sanitiza o caminho da página (`page_path`), removendo query string, fragmentos e PII.
 */
export function sanitizePagePath(rawPath: unknown, rawPageUrl: unknown): string {
  let candidate = "";
  if (typeof rawPath === "string" && rawPath.trim()) {
    candidate = rawPath.trim();
  } else if (typeof rawPageUrl === "string" && rawPageUrl.trim()) {
    try {
      candidate = new URL(rawPageUrl.trim()).pathname;
    } catch {
      candidate = rawPageUrl.trim();
    }
  }

  const clean = safeDecodeUriComponent(candidate).split("?")[0]?.split("#")[0]?.trim() || "/";
  const normalized = clean.startsWith("/") ? clean : `/${clean}`;

  // Se alguém colocar e-mail ou sequência longa de dígitos no próprio pathname, mascara o caminho
  if (normalized.includes("@") || countNumericDigits(normalized) >= 8) {
    return "/[REDACTED_PATH]";
  }

  return normalized.slice(0, 255);
}

/**
 * Valida e sanitiza o payload completo recebido pelo endpoint de coleta.
 */
export function validateAndSanitizeCollectPayload(
  payload: IncomingCollectPayload,
  userAgentHeader: string | undefined,
): { ok: true; data: SanitizedTelemetryInput } | { ok: false; error: string } {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Payload inválido" };
  }

  if (!isValidUuid(payload.sessionId)) {
    return { ok: false, error: "sessionId deve ser um UUID válido" };
  }

  let eventId: string | null = null;
  if (payload.eventId !== undefined && payload.eventId !== null) {
    if (!isValidUuid(payload.eventId)) {
      return { ok: false, error: "eventId deve ser um UUID válido quando informado" };
    }
    eventId = payload.eventId.trim().toLowerCase();
  }

  if (
    typeof payload.eventType !== "string" ||
    !ALLOWED_EVENT_TYPES.has(payload.eventType as EventType)
  ) {
    return { ok: false, error: "eventType inválido" };
  }

  const eventType = payload.eventType as EventType;
  const pagePath = sanitizePagePath(payload.pagePath, payload.pageUrl);

  let gclid: string | null = null;
  let wbraid: string | null = null;
  let gbraid: string | null = null;
  let utmSource: string | null = null;
  let utmMedium: string | null = null;
  let utmCampaign: string | null = null;
  let utmTerm: string | null = null;
  let utmContent: string | null = null;

  if (typeof payload.pageUrl === "string" && payload.pageUrl.trim()) {
    try {
      const parsedUrl = new URL(payload.pageUrl.trim());
      gclid = sanitizeClickId(parsedUrl.searchParams.get("gclid"));
      wbraid = sanitizeClickId(parsedUrl.searchParams.get("wbraid"));
      gbraid = sanitizeClickId(parsedUrl.searchParams.get("gbraid"));
      utmSource = sanitizeUtmValue(parsedUrl.searchParams.get("utm_source"));
      utmMedium = sanitizeUtmValue(parsedUrl.searchParams.get("utm_medium"));
      utmCampaign = sanitizeUtmValue(parsedUrl.searchParams.get("utm_campaign"));
      utmTerm = sanitizeUtmValue(parsedUrl.searchParams.get("utm_term"));
      utmContent = sanitizeUtmValue(parsedUrl.searchParams.get("utm_content"));
    } catch {
      // Ignora pageUrl malformada mantendo parâmetros nulos
    }
  }

  const { browserFamily, osFamily, deviceType } = minimizeUserAgent(userAgentHeader);

  return {
    ok: true,
    data: {
      sessionId: payload.sessionId.trim().toLowerCase(),
      eventId,
      eventType,
      pagePath,
      buttonLocation: sanitizeButtonLocation(payload.buttonLocation),
      contactTarget: sanitizeContactTarget(payload.contactTarget),
      gclid,
      wbraid,
      gbraid,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      referrerOrigin: minimizeReferrer(payload.referrer),
      browserFamily,
      osFamily,
      deviceType,
    },
  };
}
