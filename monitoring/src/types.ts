export type EventType = "page_view" | "whatsapp_click" | "phone_click";

export type TrafficCategory =
  | "paid_google"
  | "paid_other"
  | "organic"
  | "direct"
  | "referral";

export type PaidClickType = "gclid" | "wbraid" | "gbraid" | "utm_paid" | null;

export type DeviceType = "mobile" | "desktop" | "tablet" | "bot" | "unknown";

export type InvestigatedIpStatus =
  | "em_observacao"
  | "suspeito_ads"
  | "legitimo_recorrente"
  | "ignorado";

export interface IncomingCollectPayload {
  sessionId?: unknown;
  eventId?: unknown;
  eventType?: unknown;
  pageUrl?: unknown;
  pagePath?: unknown;
  referrer?: unknown;
  buttonLocation?: unknown;
  contactTarget?: unknown;
}

export interface SanitizedTelemetryInput {
  sessionId: string;
  eventId?: string | null;
  eventType: EventType;
  pagePath: string;
  buttonLocation: string | null;
  contactTarget: string | null;
  gclid: string | null;
  wbraid: string | null;
  gbraid: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  referrerOrigin: string | null;
  browserFamily: string;
  osFamily: string;
  deviceType: DeviceType;
}

export interface IpExtractionOptions {
  /** Lista de CIDRs ou IPs estritamente confiáveis do proxy reverso (ex.: container Traefik do Coolify/Dokploy). */
  trustedProxyCidrs: string[];
  /** Número exato de saltos de proxies confiáveis na borda (padrão: 1 para Traefik). */
  maxTrustedProxyHops: number;
  /** Em produção, rejeita IPs privados/loopback forjados no lado esquerdo de X-Forwarded-For. */
  rejectPrivateClientIps: boolean;
}

export interface IpExtractionResult {
  clientIp: string;
  ipSource: "socket_direct" | "x_forwarded_for" | "x_real_ip";
  ipHeaderMismatch: boolean;
  spoofAttemptDetected: boolean;
}

export interface AccessEventRecord {
  id: number;
  createdAt: Date;
  ipAddress: string;
  ipSource: string;
  ipHeaderMismatch: boolean;
  spoofAttemptDetected: boolean;
  sessionId: string;
  eventId?: string | null;
  isNewVisit: boolean;
  eventType: EventType;
  pagePath: string;
  buttonLocation: string | null;
  contactTarget: string | null;
  trafficCategory: TrafficCategory;
  /**
   * Indica uma "Entrada paga identificada" única na sessão para um clique/campanha paga.
   * Nunca deve ser confundida com cliques faturados pelo Google Ads.
   */
  isPaidEntry: boolean;
  paidClickType: PaidClickType;
  paidClickId: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  referrerOrigin: string | null;
  browserFamily: string;
  osFamily: string;
  deviceType: DeviceType;
}

export interface MetricsSummary {
  windowHours: number;
  from?: string;
  to?: string;
  /** 1. Total de requisições válidas de eventos aceitas pelo coletor */
  totalRequests: number;
  /** 2. Total de visitas únicas (sessões iniciadas, is_new_visit = true) */
  totalVisits: number;
  /** 3. Total de Entradas Pagas Identificadas (is_paid_entry = true, deduplicadas de F5/navegação) */
  identifiedPaidEntries: number;
  /** 4. Total de Eventos de Contato separados por canal */
  whatsappClicks: number;
  phoneClicks: number;
  paidWhatsappClicks?: number;
  paidPhoneClicks?: number;
  uniqueIps: number;
  recurringIps: number;
  spoofAttempts?: number;
  headerMismatches?: number;
}

export interface TimeRangeFilter {
  from: Date;
  to: Date;
  windowHours: number;
}

export interface SummaryQueryFilter extends TimeRangeFilter {
  trafficCategory?: TrafficCategory;
  eventType?: EventType;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface InvestigatedIpRecord {
  ipAddress: string;
  status: InvestigatedIpStatus;
  notes: string;
  firstFlaggedAt: Date;
  updatedAt: Date;
  updatedBy: string;
}

export type IpSortField =
  | "identifiedPaidEntries"
  | "totalVisits"
  | "totalRequests"
  | "lastSeenAt";

export interface IpAggregateSummary {
  ipAddress: string;
  totalRequests: number;
  totalVisits: number;
  identifiedPaidEntries: number;
  whatsappClicks: number;
  phoneClicks: number;
  firstSeenAt: Date;
  lastSeenAt: Date;
  distinctSessions: number;
  spoofAttempts: number;
  headerMismatches: number;
  primaryTrafficCategory?: TrafficCategory;
  trafficCategories?: TrafficCategory[];
  paidClickIds?: string[];
  investigation: InvestigatedIpRecord | null;
}

export interface IpListQueryOptions extends TimeRangeFilter {
  page: number;
  limit: number;
  status?: InvestigatedIpStatus | "unclassified";
  trafficCategory?: TrafficCategory;
  onlyPaidEntries?: boolean;
  minVisits?: number;
  minRequests?: number;
  ipAddress?: string;
  searchIp?: string;
  sortBy: IpSortField;
  sortOrder: "asc" | "desc";
}

export interface IpHistoryQueryOptions extends TimeRangeFilter {
  ipAddress: string;
  page: number;
  limit: number;
  eventType?: EventType;
  trafficCategory?: TrafficCategory;
}

export interface IpHistoryResult {
  ipAddress: string;
  period: {
    from: string;
    to: string;
    windowHours: number;
  };
  investigation: InvestigatedIpRecord | null;
  summary: IpAggregateSummary & {
    paidClickIds: string[];
  };
  events: AccessEventRecord[];
  pagination: PaginationMeta;
}

export interface InvestigatedIpListQueryOptions {
  page: number;
  limit: number;
  status?: InvestigatedIpStatus;
}

export type ExportTargetType = "events" | "ips" | "investigated_ips";
export type ExportFormat = "json" | "csv";

export interface ExportQueryOptions extends TimeRangeFilter {
  type: ExportTargetType;
  format: ExportFormat;
  limit: number;
  ipAddress?: string;
  status?: InvestigatedIpStatus;
  trafficCategory?: TrafficCategory;
  eventType?: EventType;
}
