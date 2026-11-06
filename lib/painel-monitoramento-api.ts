/**
 * Cliente de API autenticada, tipagens e regras de domínio de apresentação
 * para o Painel Privado de Monitoramento de IPs da Memoretti (Etapa 4).
 *
 * Regras de segurança aplicadas:
 * - Zero armazenamento de tokens em `localStorage` ou `sessionStorage`.
 * - Autenticação baseada exclusivamente em cookie `HttpOnly; SameSite=Strict` via `credentials: "include"`.
 * - Nenhuma credencial, token ou identificador sensível é registrado em `console.*`.
 */

export type TrafficCategory =
  | "paid_google"
  | "paid_other"
  | "organic"
  | "direct"
  | "referral";

export type InvestigatedIpStatus =
  | "em_observacao"
  | "suspeito_ads"
  | "legitimo_recorrente"
  | "ignorado";

export type PaidClickType = "gclid" | "wbraid" | "gbraid" | "utm_paid" | null;

export type IpSortField =
  | "identifiedPaidEntries"
  | "totalVisits"
  | "totalRequests"
  | "lastSeenAt";

export type SortOrder = "asc" | "desc";

export type TemporalWindowHours = 24 | 72 | 168 | 720;

export interface AdminSessionUser {
  id: number;
  username: string;
}

export interface MetricsSummary {
  windowHours: number;
  totalRequests: number;
  totalVisits: number;
  uniqueIps: number;
  recurringIps: number;
  identifiedPaidEntries: number;
  whatsappClicks: number;
  phoneClicks: number;
  spoofAttempts: number;
  headerMismatches: number;
}

export interface IpAggregateSummary {
  ipAddress: string;
  totalRequests: number;
  totalVisits: number;
  identifiedPaidEntries: number;
  whatsappClicks: number;
  phoneClicks: number;
  firstSeenAt: string;
  lastSeenAt: string;
  investigationStatus: InvestigatedIpStatus | null;
  investigationNotes: string | null;
  paidClickIds: string[];
  primaryTrafficCategory?: TrafficCategory;
  trafficCategories?: TrafficCategory[];
  investigation?: {
    ipAddress?: string;
    status: InvestigatedIpStatus;
    notes: string | null;
    firstFlaggedAt?: string;
    updatedAt?: string;
    updatedBy?: string;
  } | null;
}

export interface AccessEventItem {
  id: number;
  createdAt: string;
  ipAddress: string;
  ipSource:
    | "x_forwarded_for"
    | "x_real_ip"
    | "socket_remote_address"
    | "untrusted_fallback";
  ipHeaderMismatch: boolean;
  spoofAttemptDetected: boolean;
  sessionId: string;
  eventId?: string | null;
  isNewVisit: boolean;
  eventType: "page_view" | "whatsapp_click" | "phone_click";
  pagePath: string;
  buttonLocation: string | null;
  contactTarget: string | null;
  trafficCategory: TrafficCategory;
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
  deviceType: "mobile" | "desktop" | "tablet" | "bot" | "unknown";
}

export interface InvestigatedIpItem {
  id?: number;
  ipAddress: string;
  status: InvestigatedIpStatus;
  notes: string | null;
  firstFlaggedAt?: string;
  createdAt?: string;
  updatedAt: string;
  updatedBy?: string | null;
}

export interface IpListQueryOptions {
  hours?: number;
  from?: string;
  to?: string;
  searchIp?: string;
  trafficCategory?: TrafficCategory | "";
  investigationStatus?: InvestigatedIpStatus | "";
  onlyPaid?: boolean;
  onlyRecurring?: boolean;
  sortBy?: IpSortField;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export interface IpListResponse {
  ok: true;
  total: number;
  page: number;
  limit: number;
  items: IpAggregateSummary[];
}

export interface IpHistoryResponse {
  ok: true;
  ip: string;
  summary: IpAggregateSummary | null;
  total: number;
  page: number;
  limit: number;
  events: AccessEventItem[];
}

export interface InvestigatedIpsResponse {
  ok: true;
  total: number;
  page: number;
  limit: number;
  items: InvestigatedIpItem[];
}

export interface InvestigativeAlert {
  id: string;
  severity: "alta" | "media" | "baixa";
  confidence: "alta" | "media" | "baixa";
  confidenceLabel: string;
  title: string;
  description: string;
  disclaimer: string;
  ipAddress?: string;
  category:
    | "recorrencia_paga_sem_contato"
    | "repeticao_visitas"
    | "spoofing_proxy"
    | "divergencia_headers"
    | "ip_suspeito_ads";
}

export interface SessionTimelineGroup {
  sessionId: string;
  startedAt: string;
  endedAt: string;
  totalEvents: number;
  hasNewVisit: boolean;
  hasPaidEntry: boolean;
  whatsappClicks: number;
  phoneClicks: number;
  primaryTrafficCategory: TrafficCategory;
  paidClickIds: string[];
  utmCampaigns: string[];
  events: AccessEventItem[];
}

export const OPCOES_JANELA_TEMPORAL: ReadonlyArray<{
  hours: TemporalWindowHours;
  label: string;
  shortLabel: string;
}> = [
  { hours: 24, label: "Últimas 24 horas", shortLabel: "24h" },
  { hours: 72, label: "Últimas 72 horas", shortLabel: "72h" },
  { hours: 168, label: "Últimos 7 dias", shortLabel: "7 dias" },
  { hours: 720, label: "Últimos 30 dias", shortLabel: "30 dias" },
];

export const ROTULOS_ORIGEM_TRAFEGO: Record<
  TrafficCategory,
  { label: string; badgeClass: string }
> = {
  paid_google: {
    label: "Pago • Google Ads",
    badgeClass: "bg-amber-100 text-amber-950 border-amber-300",
  },
  paid_other: {
    label: "Pago • Outras Mídias",
    badgeClass: "bg-orange-100 text-orange-950 border-orange-300",
  },
  organic: {
    label: "Busca Orgânica",
    badgeClass: "bg-emerald-100 text-emerald-950 border-emerald-300",
  },
  direct: {
    label: "Acesso Direto",
    badgeClass: "bg-slate-100 text-slate-900 border-slate-300",
  },
  referral: {
    label: "Referência Externa",
    badgeClass: "bg-sky-100 text-sky-950 border-sky-300",
  },
};

export const ROTULOS_STATUS_INVESTIGACAO: Record<
  InvestigatedIpStatus,
  { label: string; description: string; badgeClass: string }
> = {
  suspeito_ads: {
    label: "Suspeito em Ads",
    description:
      "IP com padrão repetitivo de entradas pagas sem conversão ou indício de clique concorrente.",
    badgeClass: "bg-red-100 text-red-950 border-red-300",
  },
  em_observacao: {
    label: "Em Observação",
    description:
      "IP em acompanhamento manual para confirmar se há recorrência anômala.",
    badgeClass: "bg-amber-100 text-amber-950 border-amber-300",
  },
  legitimo_recorrente: {
    label: "Legítimo Recorrente",
    description:
      "IP reconhecido como cliente recorrente, parceiro ou equipe operacional.",
    badgeClass: "bg-emerald-100 text-emerald-950 border-emerald-300",
  },
  ignorado: {
    label: "Ignorado",
    description: "IP analisado e descartado para fins de auditoria de campanha.",
    badgeClass: "bg-slate-200 text-slate-800 border-slate-400",
  },
};

export const ROTULOS_TIPO_EVENTO: Record<
  AccessEventItem["eventType"],
  { label: string; badgeClass: string }
> = {
  page_view: {
    label: "Visualização de Página",
    badgeClass: "bg-slate-100 text-slate-900 border-slate-300",
  },
  whatsapp_click: {
    label: "Clique no WhatsApp",
    badgeClass: "bg-emerald-100 text-emerald-950 border-emerald-300",
  },
  phone_click: {
    label: "Clique em Telefone",
    badgeClass: "bg-sky-100 text-sky-950 border-sky-300",
  },
};

/**
 * Texto pedagógico obrigatório que explica claramente a diferença entre
 * Entradas Pagas Identificadas no site e Cliques Contabilizados pelo Google Ads.
 */
export const EXPLICACAO_ENTRADAS_PAGAS_VS_GOOGLE_ADS = {
  titulo:
    "Diferença entre Entradas Pagas Identificadas no Site e Cliques Contabilizados pelo Google Ads",
  resumoCurto:
    "Entradas Pagas Identificadas medem sessões reais carregadas no site com sinal de campanha (gclid, wbraid, gbraid ou UTM paga), deduplicadas por sessão ativa de 30 minutos. Elas não equivalem ao total bruto de cliques faturados pelo Google Ads.",
  pontos: [
    "No Google Ads: o clique é contabilizado no momento em que o anúncio é acionado na busca, incluindo cliques em extensão de ligação direta, desistências antes do carregamento da página e filtros internos de cliques inválidos do próprio Google.",
    "Neste Painel (Entradas Pagas Identificadas): contabilizamos apenas quando o navegador do visitante efetivamente abre o site com identificador pago (GCLID/WBRAID/GBRAID ou UTM de mídia paga) e deduplicamos recarregamentos (F5), trocas de página interna e variações de UTM dentro da mesma sessão.",
    "Governança Operacional: nenhum bloqueio automático é aplicado pelo painel. A classificação de IPs é exclusivamente analítica e probatória para subsidiar ajustes manuais ou exclusões conscientes no Google Ads.",
  ],
} as const;

/**
 * Gera alertas investigativos determinísticos a partir do resumo da janela e da lista de IPs.
 *
 * Regra de Governança (Etapa 4):
 * - Alertas baseados apenas em repetição de visitas ou entradas pagas são classificados
 *   obrigatoriamente como BAIXA CONFIANÇA (`confidence: "baixa"`).
 * - Nenhuma classificação ou alerta representa conclusão automática de fraude.
 */
export function gerarAlertasInvestigativos(
  summary: MetricsSummary | null,
  ips: IpAggregateSummary[],
): InvestigativeAlert[] {
  const alerts: InvestigativeAlert[] = [];

  if (summary && summary.spoofAttempts > 0) {
    alerts.push({
      id: "alert-spoof-attempts",
      severity: "alta",
      confidence: "alta",
      confidenceLabel: "Confiança Técnica Alta (Anomalia de Cabeçalho)",
      title: `${summary.spoofAttempts} tentativa(s) de forjamento de IP (X-Forwarded-For Spoofing) detectada(s)`,
      description:
        "O parser posicional de proxy ignorou os saltos não confiáveis à esquerda e preservou o IP real entregue pelo proxy confiável.",
      disclaimer:
        "Sinal técnico de manipulação de cabeçalho HTTP; nenhuma ação de bloqueio automático é executada.",
      category: "spoofing_proxy",
    });
  }

  if (summary && summary.headerMismatches > 0) {
    alerts.push({
      id: "alert-header-mismatches",
      severity: "media",
      confidence: "media",
      confidenceLabel: "Confiança Média (Configuração de Proxy)",
      title: `${summary.headerMismatches} divergência(s) entre cabeçalhos X-Forwarded-For e X-Real-IP`,
      description:
        "Foram detectadas requisições com cabeçalhos de proxy inconsistentes ou originadas de saltos fora da lista estrita de proxies confiáveis.",
      disclaimer:
        "Requer verificação técnica da cadeia de proxy; não representa conclusão automática de fraude.",
      category: "divergencia_headers",
    });
  }

  for (const item of ips) {
    const totalContacts = item.whatsappClicks + item.phoneClicks;
    const effectiveStatus =
      item.investigationStatus ?? item.investigation?.status ?? null;
    const effectiveNotes =
      item.investigationNotes ?? item.investigation?.notes ?? null;

    if (
      item.identifiedPaidEntries >= 2 &&
      totalContacts === 0 &&
      effectiveStatus !== "legitimo_recorrente" &&
      effectiveStatus !== "ignorado"
    ) {
      alerts.push({
        id: `alert-paid-no-contact-${item.ipAddress}`,
        severity: "baixa",
        confidence: "baixa",
        confidenceLabel: "Baixa Confiança (Apenas Repetição de Visitas)",
        title: `IP ${item.ipAddress} com ${item.identifiedPaidEntries} entradas pagas identificadas e 0 cliques de contato`,
        description: `Acumulou ${item.totalVisits} visita(s) e ${item.totalRequests} requisição(ões) na janela selecionada sem acionar WhatsApp ou Telefone.`,
        disclaimer:
          "Indicador de baixa confiança baseado apenas em repetição: não representa conclusão automática de fraude (pode ocorrer por CGNAT de operadora móvel ou cliente real comparando orçamentos).",
        ipAddress: item.ipAddress,
        category: "recorrencia_paga_sem_contato",
      });
    } else if (
      item.totalVisits >= 3 &&
      totalContacts === 0 &&
      effectiveStatus !== "legitimo_recorrente" &&
      effectiveStatus !== "ignorado"
    ) {
      alerts.push({
        id: `alert-repeat-visits-${item.ipAddress}`,
        severity: "baixa",
        confidence: "baixa",
        confidenceLabel: "Baixa Confiança (Apenas Repetição de Visitas)",
        title: `IP ${item.ipAddress} com ${item.totalVisits} visitas repetidas sem clique de contato`,
        description: `Registrou ${item.totalVisits} sessões distintas (${item.totalRequests} requisições) no período sem acionar canais de atendimento.`,
        disclaimer:
          "Indicador de baixa confiança baseado apenas em repetição de visitas: não representa conclusão automática de fraude.",
        ipAddress: item.ipAddress,
        category: "repeticao_visitas",
      });
    } else if (effectiveStatus === "suspeito_ads") {
      alerts.push({
        id: `alert-marked-suspeito-${item.ipAddress}`,
        severity: "media",
        confidence: "baixa",
        confidenceLabel: "Triagem Manual (Não Conclusivo)",
        title: `IP ${item.ipAddress} em acompanhamento manual (Suspeito em Ads)`,
        description:
          effectiveNotes ||
          `Registrou ${item.totalVisits} visita(s) e ${item.identifiedPaidEntries} entrada(s) paga(s) identificada(s).`,
        disclaimer:
          "Anotação manual para auditoria interna — nenhuma classificação representa conclusão automática de fraude ou bloqueio automático.",
        ipAddress: item.ipAddress,
        category: "ip_suspeito_ads",
      });
    }
  }

  return alerts;
}

/**
 * Agrupa a linha do tempo de eventos de um IP por sessão (`sessionId`),
 * preservando a ordem cronológica mais recente primeiro.
 */
export function agruparEventosPorSessao(
  events: AccessEventItem[],
): SessionTimelineGroup[] {
  const map = new Map<string, AccessEventItem[]>();
  for (const ev of events) {
    const list = map.get(ev.sessionId) ?? [];
    list.push(ev);
    map.set(ev.sessionId, list);
  }

  const groups: SessionTimelineGroup[] = [];
  for (const [sessionId, sessionEvents] of map.entries()) {
    const sortedAsc = [...sessionEvents].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    const first = sortedAsc[0]!;
    const last = sortedAsc[sortedAsc.length - 1]!;

    const paidClickIds = Array.from(
      new Set(
        sortedAsc
          .map((e) => e.paidClickId)
          .filter((id): id is string => Boolean(id)),
      ),
    );
    const utmCampaigns = Array.from(
      new Set(
        sortedAsc
          .map((e) => e.utmCampaign)
          .filter((c): c is string => Boolean(c)),
      ),
    );

    groups.push({
      sessionId,
      startedAt: first.createdAt,
      endedAt: last.createdAt,
      totalEvents: sortedAsc.length,
      hasNewVisit: sortedAsc.some((e) => e.isNewVisit),
      hasPaidEntry: sortedAsc.some((e) => e.isPaidEntry),
      whatsappClicks: sortedAsc.filter((e) => e.eventType === "whatsapp_click")
        .length,
      phoneClicks: sortedAsc.filter((e) => e.eventType === "phone_click")
        .length,
      primaryTrafficCategory: first.trafficCategory,
      paidClickIds,
      utmCampaigns,
      events: [...sortedAsc].reverse(),
    });
  }

  return groups.sort(
    (a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime(),
  );
}

export function formatarDataHoraPtBr(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "medium",
      timeZone: "America/Sao_Paulo",
    }).format(date);
  } catch {
    return isoString;
  }
}

export class ApiAuthError extends Error {
  public readonly status: number;
  public readonly code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "ApiAuthError";
    this.status = status;
    this.code = code;
  }
}

export interface MonitoringApiClientOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  extraHeaders?: Record<string, string>;
}

export class MonitoringDashboardApiClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly extraHeaders: Record<string, string>;

  constructor(options: MonitoringApiClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "").replace(/\/+$/, "");
    this.fetchImpl =
      options.fetchImpl ?? ((input, init) => globalThis.fetch(input, init));
    this.extraHeaders = options.extraHeaders ?? {};
  }

  private async requestJson<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...this.extraHeaders,
      ...((init.headers as Record<string, string> | undefined) ?? {}),
    };

    const fetchFn = this.fetchImpl;
    const response = await fetchFn(`${this.baseUrl}${path}`, {
      ...init,
      headers,
      credentials: "include",
      cache: "no-store",
    });

    let body: Record<string, unknown> | null = null;
    try {
      body = (await response.json()) as Record<string, unknown>;
    } catch {
      body = null;
    }

    if (!response.ok) {
      const code =
        typeof body?.error === "string" ? body.error : `http_${response.status}`;
      const message =
        typeof body?.message === "string"
          ? body.message
          : response.status === 401
            ? "Sessão expirada ou não autenticada."
            : response.status === 429
              ? "Muitas tentativas em curto intervalo. Aguarde antes de tentar novamente."
              : "Não foi possível concluir a operação na API de monitoramento.";
      throw new ApiAuthError(message, response.status, code);
    }

    return body as unknown as T;
  }

  public async getSession(): Promise<{
    authenticated: true;
    user: AdminSessionUser;
  }> {
    return this.requestJson("/api/v1/admin/session", { method: "GET" });
  }

  public async login(
    username: string,
    password: string,
  ): Promise<{ ok: true; expiresAt: string; user: AdminSessionUser }> {
    const raw = await this.requestJson<{
      authenticated?: boolean;
      username?: string;
      expiresAt: string;
      user?: AdminSessionUser;
    }>("/api/v1/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return {
      ok: true,
      expiresAt: raw.expiresAt,
      user: raw.user ?? { id: 1, username: raw.username ?? username },
    };
  }

  public async logout(): Promise<{ ok: true }> {
    await this.requestJson("/api/v1/admin/logout", {
      method: "POST",
    });
    return { ok: true };
  }

  public async getSummary(hours: number): Promise<MetricsSummary> {
    const params = new URLSearchParams({ hours: String(hours) });
    const raw = await this.requestJson<
      { summary?: MetricsSummary } & Partial<MetricsSummary>
    >(`/api/v1/admin/summary?${params.toString()}`, {
      method: "GET",
    });
    return (raw.summary ?? raw) as MetricsSummary;
  }

  private static normalizeIpItem(raw: IpAggregateSummary): IpAggregateSummary {
    return {
      ...raw,
      investigationStatus:
        raw.investigationStatus ?? raw.investigation?.status ?? null,
      investigationNotes:
        raw.investigationNotes ?? raw.investigation?.notes ?? null,
      paidClickIds: Array.isArray(raw.paidClickIds) ? raw.paidClickIds : [],
    };
  }

  public async listIps(query: IpListQueryOptions = {}): Promise<IpListResponse> {
    const params = new URLSearchParams();
    if (query.hours !== undefined) params.set("hours", String(query.hours));
    if (query.from) params.set("from", query.from);
    if (query.to) params.set("to", query.to);

    const trimmedSearch = query.searchIp?.trim() ?? "";
    if (trimmedSearch) {
      params.set("searchIp", trimmedSearch);
    }

    if (query.trafficCategory)
      params.set("trafficCategory", query.trafficCategory);
    if (query.investigationStatus)
      params.set("status", query.investigationStatus);
    if (query.onlyPaid) params.set("onlyPaidEntries", "true");
    if (query.onlyRecurring) params.set("minVisits", "2");
    if (query.sortBy) params.set("sortBy", query.sortBy);
    if (query.sortOrder) params.set("sortOrder", query.sortOrder);
    if (query.page !== undefined) params.set("page", String(query.page));
    if (query.limit !== undefined) params.set("limit", String(query.limit));

    const raw = await this.requestJson<{
      items: IpAggregateSummary[];
      pagination?: {
        page: number;
        limit: number;
        totalItems: number;
      };
      total?: number;
      page?: number;
      limit?: number;
    }>(`/api/v1/admin/ips?${params.toString()}`, {
      method: "GET",
    });

    const items = (raw.items ?? []).map((item) =>
      MonitoringDashboardApiClient.normalizeIpItem(item),
    );
    const total = raw.pagination?.totalItems ?? raw.total ?? items.length;

    return {
      ok: true,
      total,
      page: raw.pagination?.page ?? raw.page ?? query.page ?? 1,
      limit: raw.pagination?.limit ?? raw.limit ?? query.limit ?? 15,
      items,
    };
  }

  public async getIpHistory(
    ipAddress: string,
    options: { hours?: number; page?: number; limit?: number } = {},
  ): Promise<IpHistoryResponse> {
    const params = new URLSearchParams();
    if (options.hours !== undefined) params.set("hours", String(options.hours));
    if (options.page !== undefined) params.set("page", String(options.page));
    if (options.limit !== undefined) params.set("limit", String(options.limit));

    const encodedIp = encodeURIComponent(ipAddress.trim());
    const raw = await this.requestJson<{
      ipAddress?: string;
      ip?: string;
      summary: IpAggregateSummary | null;
      events: AccessEventItem[];
      pagination?: {
        page: number;
        limit: number;
        totalItems: number;
      };
      total?: number;
      page?: number;
      limit?: number;
    }>(`/api/v1/admin/ips/${encodedIp}/history?${params.toString()}`, {
      method: "GET",
    });

    return {
      ok: true,
      ip: raw.ipAddress ?? raw.ip ?? ipAddress.trim(),
      summary: raw.summary
        ? MonitoringDashboardApiClient.normalizeIpItem(raw.summary)
        : null,
      total: raw.pagination?.totalItems ?? raw.total ?? raw.events.length,
      page: raw.pagination?.page ?? raw.page ?? options.page ?? 1,
      limit: raw.pagination?.limit ?? raw.limit ?? options.limit ?? 50,
      events: raw.events ?? [],
    };
  }

  public async listInvestigatedIps(
    options: {
      status?: InvestigatedIpStatus | "";
      page?: number;
      limit?: number;
    } = {},
  ): Promise<InvestigatedIpsResponse> {
    const params = new URLSearchParams();
    if (options.status) params.set("status", options.status);
    if (options.page !== undefined) params.set("page", String(options.page));
    if (options.limit !== undefined) params.set("limit", String(options.limit));

    const raw = await this.requestJson<{
      items: InvestigatedIpItem[];
      pagination?: {
        page: number;
        limit: number;
        totalItems: number;
      };
      total?: number;
      page?: number;
      limit?: number;
    }>(`/api/v1/admin/investigated-ips?${params.toString()}`, {
      method: "GET",
    });

    return {
      ok: true,
      total: raw.pagination?.totalItems ?? raw.total ?? raw.items.length,
      page: raw.pagination?.page ?? raw.page ?? options.page ?? 1,
      limit: raw.pagination?.limit ?? raw.limit ?? options.limit ?? 50,
      items: raw.items ?? [],
    };
  }

  public async upsertInvestigation(
    ipAddress: string,
    status: InvestigatedIpStatus,
    notes: string | null,
  ): Promise<{ ok: true; record: InvestigatedIpItem }> {
    const encodedIp = encodeURIComponent(ipAddress.trim());
    const raw = await this.requestJson<{
      item?: InvestigatedIpItem;
      record?: InvestigatedIpItem;
    }>(`/api/v1/admin/ips/${encodedIp}/investigation`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });

    return {
      ok: true,
      record: (raw.item ?? raw.record)!,
    };
  }

  public async deleteInvestigation(
    ipAddress: string,
  ): Promise<{ ok: true; deleted: boolean }> {
    const encodedIp = encodeURIComponent(ipAddress.trim());
    const raw = await this.requestJson<{ deleted: boolean }>(
      `/api/v1/admin/investigated-ips/${encodedIp}`,
      {
        method: "DELETE",
      },
    );
    return {
      ok: true,
      deleted: Boolean(raw.deleted),
    };
  }

  public buildExportUrl(options: {
    type: "events" | "ips" | "investigated_ips";
    format: "csv" | "json";
    hours?: number;
    searchIp?: string;
    trafficCategory?: TrafficCategory | "";
    investigationStatus?: InvestigatedIpStatus | "";
    onlyPaid?: boolean;
    onlyRecurring?: boolean;
  }): string {
    const params = new URLSearchParams({
      type: options.type,
      format: options.format,
    });
    if (options.hours !== undefined) params.set("hours", String(options.hours));
    const trimmedIp = options.searchIp?.trim() ?? "";
    if (
      /^(?:\d{1,3}\.){3}\d{1,3}$/.test(trimmedIp) ||
      (trimmedIp.includes(":") && trimmedIp.length >= 3)
    ) {
      params.set("ip", trimmedIp);
    }
    if (options.trafficCategory)
      params.set("trafficCategory", options.trafficCategory);
    if (options.investigationStatus)
      params.set("status", options.investigationStatus);

    return `${this.baseUrl}/api/v1/admin/export?${params.toString()}`;
  }
}
