import { normalizeIp } from "../ip/extractClientIp.ts";
import type {
  EventType,
  ExportFormat,
  ExportQueryOptions,
  ExportTargetType,
  InvestigatedIpListQueryOptions,
  InvestigatedIpStatus,
  IpHistoryQueryOptions,
  IpListQueryOptions,
  IpSortField,
  PaginationMeta,
  SummaryQueryFilter,
  TimeRangeFilter,
  TrafficCategory,
} from "../types.ts";

export const MAX_WINDOW_HOURS = 720; // 30 dias (limite de retenção LGPD)
export const MAX_PAGE_NUMBER = 10_000;
export const MAX_PAGE_LIMIT = 100;
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_EXPORT_LIMIT = 5_000;
export const DEFAULT_EXPORT_LIMIT = 500;

const ALLOWED_EVENT_TYPES = new Set<EventType>([
  "page_view",
  "whatsapp_click",
  "phone_click",
]);

const ALLOWED_TRAFFIC_CATEGORIES = new Set<TrafficCategory>([
  "paid_google",
  "paid_other",
  "organic",
  "direct",
  "referral",
]);

const ALLOWED_INVESTIGATED_STATUSES = new Set<InvestigatedIpStatus>([
  "em_observacao",
  "suspeito_ads",
  "legitimo_recorrente",
  "ignorado",
]);

const ALLOWED_IP_SORT_FIELDS = new Set<IpSortField>([
  "identifiedPaidEntries",
  "totalVisits",
  "totalRequests",
  "lastSeenAt",
]);

const ALLOWED_EXPORT_TYPES = new Set<ExportTargetType>([
  "events",
  "ips",
  "investigated_ips",
]);

const ALLOWED_EXPORT_FORMATS = new Set<ExportFormat>(["json", "csv"]);

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function parseStrictPositiveInt(
  raw: string | null,
  min: number,
  max: number,
): number | null {
  if (raw === null) return null;
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const num = Number(trimmed);
  if (!Number.isSafeInteger(num) || num < min || num > max) return null;
  return num;
}

function parseIsoTimestamp(raw: string): Date | null {
  const trimmed = raw.trim();
  if (trimmed.length < 10 || trimmed.length > 40) return null;
  // Formato ISO-8601 estrito (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss...)
  if (!/^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,6})?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/.test(trimmed)) {
    return null;
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

/**
 * Valida filtros temporais (`hours` ou `from`/`to`) garantindo janela máxima de 720h (30 dias).
 */
export function validateTimeRangeParams(
  params: URLSearchParams,
  defaultHours: number = 24,
  now: Date = new Date(),
): ValidationResult<TimeRangeFilter> {
  const rawFrom = params.get("from");
  const rawTo = params.get("to");
  const rawHours = params.get("hours");

  if (rawFrom !== null || rawTo !== null) {
    if (!rawFrom || !rawTo) {
      return {
        ok: false,
        error: "Os parâmetros 'from' e 'to' devem ser informados juntos em formato ISO-8601.",
      };
    }

    const fromDate = parseIsoTimestamp(rawFrom);
    const toDate = parseIsoTimestamp(rawTo);
    if (!fromDate || !toDate) {
      return {
        ok: false,
        error: "Datas 'from' ou 'to' inválidas. Use formato ISO-8601 válido.",
      };
    }

    if (fromDate.getTime() > toDate.getTime()) {
      return {
        ok: false,
        error: "O parâmetro 'from' não pode ser posterior a 'to'.",
      };
    }

    const diffHours = (toDate.getTime() - fromDate.getTime()) / (60 * 60 * 1000);
    if (diffHours > MAX_WINDOW_HOURS) {
      return {
        ok: false,
        error: `O intervalo máximo permitido para consulta é de ${MAX_WINDOW_HOURS} horas (30 dias).`,
      };
    }

    return {
      ok: true,
      data: {
        from: fromDate,
        to: toDate,
        windowHours: Math.max(1, Math.ceil(diffHours)),
      },
    };
  }

  if (rawHours !== null) {
    const hours = parseStrictPositiveInt(rawHours, 1, MAX_WINDOW_HOURS);
    if (hours === null) {
      return {
        ok: false,
        error: `Parâmetro 'hours' inválido. Informe um inteiro entre 1 e ${MAX_WINDOW_HOURS}.`,
      };
    }
    const from = new Date(now.getTime() - hours * 60 * 60 * 1000);
    return {
      ok: true,
      data: {
        from,
        to: now,
        windowHours: hours,
      },
    };
  }

  const from = new Date(now.getTime() - defaultHours * 60 * 60 * 1000);
  return {
    ok: true,
    data: {
      from,
      to: now,
      windowHours: defaultHours,
    },
  };
}

/**
 * Valida parâmetros de paginação (`page` e `limit`).
 */
export function validatePaginationParams(
  params: URLSearchParams,
  defaultLimit: number = DEFAULT_PAGE_LIMIT,
  maxLimit: number = MAX_PAGE_LIMIT,
): ValidationResult<{ page: number; limit: number }> {
  const rawPage = params.get("page");
  const rawLimit = params.get("limit") ?? params.get("pageSize");

  let page = 1;
  if (rawPage !== null) {
    const parsedPage = parseStrictPositiveInt(rawPage, 1, MAX_PAGE_NUMBER);
    if (parsedPage === null) {
      return {
        ok: false,
        error: `Parâmetro 'page' inválido. Informe um inteiro entre 1 e ${MAX_PAGE_NUMBER}.`,
      };
    }
    page = parsedPage;
  }

  let limit = defaultLimit;
  if (rawLimit !== null) {
    const parsedLimit = parseStrictPositiveInt(rawLimit, 1, maxLimit);
    if (parsedLimit === null) {
      return {
        ok: false,
        error: `Parâmetro 'limit' inválido. Informe um inteiro entre 1 e ${maxLimit}.`,
      };
    }
    limit = parsedLimit;
  }

  return { ok: true, data: { page, limit } };
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  totalItems: number,
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export function validateSummaryQuery(
  params: URLSearchParams,
  now: Date = new Date(),
): ValidationResult<SummaryQueryFilter> {
  const timeRes = validateTimeRangeParams(params, 24, now);
  if (!timeRes.ok) return timeRes;

  const rawTraffic = params.get("trafficCategory");
  let trafficCategory: TrafficCategory | undefined;
  if (rawTraffic !== null) {
    if (!ALLOWED_TRAFFIC_CATEGORIES.has(rawTraffic as TrafficCategory)) {
      return { ok: false, error: "Parâmetro 'trafficCategory' inválido." };
    }
    trafficCategory = rawTraffic as TrafficCategory;
  }

  const rawEventType = params.get("eventType");
  let eventType: EventType | undefined;
  if (rawEventType !== null) {
    if (!ALLOWED_EVENT_TYPES.has(rawEventType as EventType)) {
      return { ok: false, error: "Parâmetro 'eventType' inválido." };
    }
    eventType = rawEventType as EventType;
  }

  return {
    ok: true,
    data: {
      ...timeRes.data,
      trafficCategory,
      eventType,
    },
  };
}

export function validateIpListQuery(
  params: URLSearchParams,
  now: Date = new Date(),
): ValidationResult<IpListQueryOptions> {
  const timeRes = validateTimeRangeParams(params, 24, now);
  if (!timeRes.ok) return timeRes;

  const pageRes = validatePaginationParams(params, DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT);
  if (!pageRes.ok) return pageRes;

  const rawStatus = params.get("status");
  let status: InvestigatedIpStatus | "unclassified" | undefined;
  if (rawStatus !== null) {
    if (
      rawStatus !== "unclassified" &&
      !ALLOWED_INVESTIGATED_STATUSES.has(rawStatus as InvestigatedIpStatus)
    ) {
      return { ok: false, error: "Parâmetro 'status' inválido." };
    }
    status = rawStatus as InvestigatedIpStatus | "unclassified";
  }

  const rawTraffic = params.get("trafficCategory");
  let trafficCategory: TrafficCategory | undefined;
  if (rawTraffic !== null) {
    if (!ALLOWED_TRAFFIC_CATEGORIES.has(rawTraffic as TrafficCategory)) {
      return { ok: false, error: "Parâmetro 'trafficCategory' inválido." };
    }
    trafficCategory = rawTraffic as TrafficCategory;
  }

  const rawOnlyPaid = params.get("onlyPaidEntries");
  let onlyPaidEntries: boolean | undefined;
  if (rawOnlyPaid !== null) {
    if (rawOnlyPaid !== "true" && rawOnlyPaid !== "false") {
      return {
        ok: false,
        error: "Parâmetro 'onlyPaidEntries' deve ser 'true' ou 'false'.",
      };
    }
    onlyPaidEntries = rawOnlyPaid === "true";
  }

  const rawMinVisits = params.get("minVisits");
  let minVisits: number | undefined;
  if (rawMinVisits !== null) {
    const parsed = parseStrictPositiveInt(rawMinVisits, 1, 1_000_000);
    if (parsed === null) {
      return { ok: false, error: "Parâmetro 'minVisits' inválido." };
    }
    minVisits = parsed;
  }

  const rawMinRequests = params.get("minRequests");
  let minRequests: number | undefined;
  if (rawMinRequests !== null) {
    const parsed = parseStrictPositiveInt(rawMinRequests, 1, 1_000_000);
    if (parsed === null) {
      return { ok: false, error: "Parâmetro 'minRequests' inválido." };
    }
    minRequests = parsed;
  }

  const rawIp = params.get("ip");
  let ipAddress: string | undefined;
  if (rawIp !== null) {
    const norm = normalizeIp(rawIp);
    if (!norm) {
      return { ok: false, error: "Parâmetro 'ip' não é um endereço IPv4/IPv6 válido." };
    }
    ipAddress = norm;
  }

  const rawSearchIp = params.get("searchIp");
  let searchIp: string | undefined;
  if (rawSearchIp !== null && rawSearchIp.trim() !== "") {
    const trimmedSearch = rawSearchIp.trim();
    if (!/^[0-9a-fA-F:.]{1,45}$/.test(trimmedSearch)) {
      return {
        ok: false,
        error: "Parâmetro 'searchIp' contém caracteres inválidos para busca de IP.",
      };
    }
    searchIp = trimmedSearch.toLowerCase();
  }

  const rawSortBy = params.get("sortBy") ?? "identifiedPaidEntries";
  if (!ALLOWED_IP_SORT_FIELDS.has(rawSortBy as IpSortField)) {
    return { ok: false, error: "Parâmetro 'sortBy' inválido." };
  }

  const rawSortOrder = (params.get("sortOrder") ?? "desc").toLowerCase();
  if (rawSortOrder !== "asc" && rawSortOrder !== "desc") {
    return { ok: false, error: "Parâmetro 'sortOrder' deve ser 'asc' ou 'desc'." };
  }

  return {
    ok: true,
    data: {
      ...timeRes.data,
      ...pageRes.data,
      status,
      trafficCategory,
      onlyPaidEntries,
      minVisits,
      minRequests,
      ipAddress,
      searchIp,
      sortBy: rawSortBy as IpSortField,
      sortOrder: rawSortOrder,
    },
  };
}

export function validateIpHistoryQuery(
  rawIpCandidate: string | null | undefined,
  params: URLSearchParams,
  now: Date = new Date(),
): ValidationResult<IpHistoryQueryOptions> {
  const ipCandidate = rawIpCandidate ?? params.get("ip");
  const normalizedIp = normalizeIp(ipCandidate);
  if (!normalizedIp) {
    return {
      ok: false,
      error: "Endereço IP ausente ou inválido para consulta de histórico.",
    };
  }

  const timeRes = validateTimeRangeParams(params, MAX_WINDOW_HOURS, now);
  if (!timeRes.ok) return timeRes;

  const pageRes = validatePaginationParams(params, 50, MAX_PAGE_LIMIT);
  if (!pageRes.ok) return pageRes;

  const rawEventType = params.get("eventType");
  let eventType: EventType | undefined;
  if (rawEventType !== null) {
    if (!ALLOWED_EVENT_TYPES.has(rawEventType as EventType)) {
      return { ok: false, error: "Parâmetro 'eventType' inválido." };
    }
    eventType = rawEventType as EventType;
  }

  const rawTraffic = params.get("trafficCategory");
  let trafficCategory: TrafficCategory | undefined;
  if (rawTraffic !== null) {
    if (!ALLOWED_TRAFFIC_CATEGORIES.has(rawTraffic as TrafficCategory)) {
      return { ok: false, error: "Parâmetro 'trafficCategory' inválido." };
    }
    trafficCategory = rawTraffic as TrafficCategory;
  }

  return {
    ok: true,
    data: {
      ipAddress: normalizedIp,
      ...timeRes.data,
      ...pageRes.data,
      eventType,
      trafficCategory,
    },
  };
}

export function validateInvestigatedIpListQuery(
  params: URLSearchParams,
): ValidationResult<InvestigatedIpListQueryOptions> {
  const pageRes = validatePaginationParams(params, 50, MAX_PAGE_LIMIT);
  if (!pageRes.ok) return pageRes;

  const rawStatus = params.get("status");
  let status: InvestigatedIpStatus | undefined;
  if (rawStatus !== null) {
    if (!ALLOWED_INVESTIGATED_STATUSES.has(rawStatus as InvestigatedIpStatus)) {
      return { ok: false, error: "Parâmetro 'status' inválido." };
    }
    status = rawStatus as InvestigatedIpStatus;
  }

  return {
    ok: true,
    data: {
      ...pageRes.data,
      status,
    },
  };
}

/**
 * Sanitiza notas administrativas removendo caracteres de controle ASCII invisíveis
 * e limitando a 2000 caracteres.
 */
export function sanitizeAdminNotes(rawNotes: unknown): ValidationResult<string> {
  if (rawNotes === undefined || rawNotes === null) {
    return { ok: true, data: "" };
  }
  if (typeof rawNotes !== "string") {
    return { ok: false, error: "O campo 'notes' deve ser uma string." };
  }
  if (rawNotes.length > 2000) {
    return {
      ok: false,
      error: "O campo 'notes' não pode exceder 2000 caracteres.",
    };
  }

  let cleaned = "";
  for (let i = 0; i < rawNotes.length; i++) {
    const code = rawNotes.charCodeAt(i);
    if (code === 9 || code === 10 || code === 13 || code >= 32) {
      cleaned += rawNotes[i];
    }
  }
  return { ok: true, data: cleaned.trim() };
}

export function validateInvestigatedIpUpsertPayload(
  body: unknown,
  routeIpCandidate?: string,
): ValidationResult<{
  ipAddress: string;
  status: InvestigatedIpStatus;
  notes: string;
}> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Payload inválido." };
  }

  const payload = body as {
    ipAddress?: unknown;
    ip?: unknown;
    status?: unknown;
    notes?: unknown;
  };

  const rawIp =
    routeIpCandidate ??
    (typeof payload.ipAddress === "string"
      ? payload.ipAddress
      : typeof payload.ip === "string"
        ? payload.ip
        : null);

  const normalizedIp = normalizeIp(rawIp);
  if (!normalizedIp) {
    return { ok: false, error: "Endereço IP inválido ou ausente." };
  }

  if (
    typeof payload.status !== "string" ||
    !ALLOWED_INVESTIGATED_STATUSES.has(payload.status as InvestigatedIpStatus)
  ) {
    return {
      ok: false,
      error:
        "Status inválido. Valores permitidos: em_observacao, suspeito_ads, legitimo_recorrente, ignorado.",
    };
  }

  const notesRes = sanitizeAdminNotes(payload.notes);
  if (!notesRes.ok) return notesRes;

  return {
    ok: true,
    data: {
      ipAddress: normalizedIp,
      status: payload.status as InvestigatedIpStatus,
      notes: notesRes.data,
    },
  };
}

export function validateExportQuery(
  params: URLSearchParams,
  now: Date = new Date(),
): ValidationResult<ExportQueryOptions> {
  const timeRes = validateTimeRangeParams(params, 24, now);
  if (!timeRes.ok) return timeRes;

  const rawType = params.get("type") ?? "events";
  if (!ALLOWED_EXPORT_TYPES.has(rawType as ExportTargetType)) {
    return {
      ok: false,
      error: "Parâmetro 'type' inválido. Use: events, ips ou investigated_ips.",
    };
  }

  const rawFormat = (params.get("format") ?? "json").toLowerCase();
  if (!ALLOWED_EXPORT_FORMATS.has(rawFormat as ExportFormat)) {
    return {
      ok: false,
      error: "Parâmetro 'format' inválido. Use: json ou csv.",
    };
  }

  const rawLimit = params.get("limit");
  let limit = DEFAULT_EXPORT_LIMIT;
  if (rawLimit !== null) {
    const parsed = parseStrictPositiveInt(rawLimit, 1, MAX_EXPORT_LIMIT);
    if (parsed === null) {
      return {
        ok: false,
        error: `Parâmetro 'limit' de exportação deve ser um inteiro entre 1 e ${MAX_EXPORT_LIMIT}.`,
      };
    }
    limit = parsed;
  }

  const rawIp = params.get("ip");
  let ipAddress: string | undefined;
  if (rawIp !== null) {
    const norm = normalizeIp(rawIp);
    if (!norm) {
      return { ok: false, error: "Parâmetro 'ip' inválido." };
    }
    ipAddress = norm;
  }

  const rawStatus = params.get("status");
  let status: InvestigatedIpStatus | undefined;
  if (rawStatus !== null) {
    if (!ALLOWED_INVESTIGATED_STATUSES.has(rawStatus as InvestigatedIpStatus)) {
      return { ok: false, error: "Parâmetro 'status' inválido." };
    }
    status = rawStatus as InvestigatedIpStatus;
  }

  const rawTraffic = params.get("trafficCategory");
  let trafficCategory: TrafficCategory | undefined;
  if (rawTraffic !== null) {
    if (!ALLOWED_TRAFFIC_CATEGORIES.has(rawTraffic as TrafficCategory)) {
      return { ok: false, error: "Parâmetro 'trafficCategory' inválido." };
    }
    trafficCategory = rawTraffic as TrafficCategory;
  }

  const rawEventType = params.get("eventType");
  let eventType: EventType | undefined;
  if (rawEventType !== null) {
    if (!ALLOWED_EVENT_TYPES.has(rawEventType as EventType)) {
      return { ok: false, error: "Parâmetro 'eventType' inválido." };
    }
    eventType = rawEventType as EventType;
  }

  return {
    ok: true,
    data: {
      ...timeRes.data,
      type: rawType as ExportTargetType,
      format: rawFormat as ExportFormat,
      limit,
      ipAddress,
      status,
      trafficCategory,
      eventType,
    },
  };
}

/**
 * Escapa uma célula CSV segundo a RFC 4180 e neutraliza ataques de CSV/Formula Injection
 * (prefixando valores iniciados por '=', '+', '-', '@', '\t' ou '\r' com apóstrofo).
 */
export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let str = value instanceof Date ? value.toISOString() : String(value);

  if (str.length > 0) {
    const firstChar = str[0];
    if (
      firstChar === "=" ||
      firstChar === "+" ||
      firstChar === "-" ||
      firstChar === "@" ||
      firstChar === "\t" ||
      firstChar === "\r"
    ) {
      str = `'${str}`;
    }
  }

  const needsQuotes =
    str.includes(",") ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r");

  if (needsQuotes) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function serializeToCsv(headers: string[], rows: unknown[][]): string {
  const headerLine = headers.map((h) => escapeCsvCell(h)).join(",");
  const dataLines = rows.map((row) =>
    row.map((cell) => escapeCsvCell(cell)).join(","),
  );
  return [headerLine, ...dataLines].join("\r\n") + "\r\n";
}
