import type { MonitoringRepository } from "../db/repository.ts";
import type {
  AccessEventRecord,
  IpExtractionResult,
  PaidClickType,
  SanitizedTelemetryInput,
  TrafficCategory,
} from "../types.ts";

const SESSION_WINDOW_MINUTES = 30;

const PAID_UTM_MEDIUMS = new Set([
  "cpc",
  "ppc",
  "paid",
  "paidsearch",
  "cpv",
  "cpm",
  "display",
]);

const SEARCH_ENGINES = [
  "google.",
  "bing.com",
  "yahoo.com",
  "duckduckgo.com",
  "ecosia.org",
];

/**
 * Determina a classificação de tráfego e o identificador de entrada paga
 * para o evento atual antes da herança de sessão.
 */
export function classifyTrafficFromInput(input: SanitizedTelemetryInput): {
  trafficCategory: TrafficCategory;
  paidClickType: PaidClickType;
  paidClickId: string | null;
  hasExplicitPaidSignal: boolean;
} {
  if (input.gclid) {
    return {
      trafficCategory: "paid_google",
      paidClickType: "gclid",
      paidClickId: input.gclid,
      hasExplicitPaidSignal: true,
    };
  }
  if (input.wbraid) {
    return {
      trafficCategory: "paid_google",
      paidClickType: "wbraid",
      paidClickId: input.wbraid,
      hasExplicitPaidSignal: true,
    };
  }
  if (input.gbraid) {
    return {
      trafficCategory: "paid_google",
      paidClickType: "gbraid",
      paidClickId: input.gbraid,
      hasExplicitPaidSignal: true,
    };
  }

  const mediumLower = input.utmMedium?.toLowerCase() ?? "";
  const sourceLower = input.utmSource?.toLowerCase() ?? "";

  if (mediumLower && PAID_UTM_MEDIUMS.has(mediumLower)) {
    const isGoogle =
      sourceLower.includes("google") || sourceLower.includes("adwords");
    const syntheticId = `utm:${sourceLower || "unknown"}:${mediumLower}:${input.utmCampaign?.toLowerCase() || "default"}`;
    return {
      trafficCategory: isGoogle ? "paid_google" : "paid_other",
      paidClickType: "utm_paid",
      paidClickId: syntheticId.slice(0, 128),
      hasExplicitPaidSignal: true,
    };
  }

  if (input.referrerOrigin) {
    const refLower = input.referrerOrigin.toLowerCase();
    if (refLower.includes("memorettiguinchos.com.br") || refLower.includes("meguinchos.com.br")) {
      return {
        trafficCategory: "direct",
        paidClickType: null,
        paidClickId: null,
        hasExplicitPaidSignal: false,
      };
    }

    if (SEARCH_ENGINES.some((engine) => refLower.includes(engine))) {
      return {
        trafficCategory: "organic",
        paidClickType: null,
        paidClickId: null,
        hasExplicitPaidSignal: false,
      };
    }

    return {
      trafficCategory: "referral",
      paidClickType: null,
      paidClickId: null,
      hasExplicitPaidSignal: false,
    };
  }

  return {
    trafficCategory: "direct",
    paidClickType: null,
    paidClickId: null,
    hasExplicitPaidSignal: false,
  };
}

/**
 * Serviço central de coleta e atribuição que separa de forma determinística:
 * 1. Requisições (`access_events` inserido)
 * 2. Visitas (`isNewVisit = true` apenas no primeiro evento não-bot da sessão de 30 min)
 * 3. Entradas Pagas Identificadas (`isPaidEntry = true` apenas na primeira entrada paga
 *    daquele Click ID / campanha na sessão — impedindo que F5 ou troca de página infle a métrica,
 *    e mantendo distinção clara em relação aos cliques faturados pelo Google Ads)
 * 4. Eventos de Contato (`whatsapp_click` e `phone_click`, herdando a atribuição da sessão
 *    mesmo quando ocorrem em páginas internas onde a URL não contém mais `?gclid=...`)
 */
export class CollectorService {
  private readonly repo: MonitoringRepository;
  /**
   * Fila de serialização assíncrona por `sessionId` para eliminar condições de corrida
   * (race conditions) quando múltiplas requisições da mesma sessão chegam em paralelo
   * no mesmo milissegundo.
   */
  private readonly sessionLocks = new Map<string, Promise<unknown>>();
  private static readonly CONTACT_CLICK_DEDUP_WINDOW_MS = 1000;

  constructor(repo: MonitoringRepository) {
    this.repo = repo;
  }

  public async recordEvent(
    input: SanitizedTelemetryInput,
    ipResult: IpExtractionResult,
    now: Date = new Date(),
  ): Promise<AccessEventRecord> {
    return this.runWithSessionLock(input.sessionId, () =>
      this.repo.withSessionTransaction(input.sessionId, (txRepo) =>
        this.recordEventInternal(txRepo, input, ipResult, now),
      ),
    );
  }

  private async runWithSessionLock<T>(
    sessionId: string,
    task: () => Promise<T>,
  ): Promise<T> {
    const previous = this.sessionLocks.get(sessionId) ?? Promise.resolve();
    const currentPromise = previous
      .catch(() => undefined)
      .then(() => task());

    this.sessionLocks.set(sessionId, currentPromise);

    try {
      return await currentPromise;
    } finally {
      if (this.sessionLocks.get(sessionId) === currentPromise) {
        this.sessionLocks.delete(sessionId);
      }
    }
  }

  private async recordEventInternal(
    txRepo: MonitoringRepository,
    input: SanitizedTelemetryInput,
    ipResult: IpExtractionResult,
    now: Date,
  ): Promise<AccessEventRecord> {
    // 1. Deduplicação por chave de idempotência explícita (`eventId`)
    if (input.eventId) {
      const existingById = await txRepo.findEventByEventId(input.eventId);
      if (existingById) {
        return existingById;
      }
    }

    // 2. Deduplicação de rajada (micro-burst <= 1000ms) para eventos de contato idênticos na sessão
    if (
      input.eventType === "whatsapp_click" ||
      input.eventType === "phone_click"
    ) {
      const dedupSince = new Date(
        now.getTime() - CollectorService.CONTACT_CLICK_DEDUP_WINDOW_MS,
      );
      const duplicateContact = await txRepo.findRecentDuplicateContactEvent({
        sessionId: input.sessionId,
        eventType: input.eventType,
        pagePath: input.pagePath,
        buttonLocation: input.buttonLocation,
        contactTarget: input.contactTarget,
        since: dedupSince,
      });
      if (duplicateContact) {
        return duplicateContact;
      }
    }

    const sessionWindowSince = new Date(
      now.getTime() - SESSION_WINDOW_MINUTES * 60 * 1000,
    );

    const directClassification = classifyTrafficFromInput(input);
    const sessionCtx = await txRepo.getSessionContext(
      input.sessionId,
      directClassification.paidClickId,
      sessionWindowSince,
    );

    const isBot = input.deviceType === "bot";
    const isNewVisit = !isBot && !sessionCtx.hasPreviousEventInSession;

    let trafficCategory = directClassification.trafficCategory;
    let paidClickType = directClassification.paidClickType;
    let paidClickId = directClassification.paidClickId;
    let utmSource = input.utmSource;
    let utmMedium = input.utmMedium;
    let utmCampaign = input.utmCampaign;
    let utmTerm = input.utmTerm;
    let utmContent = input.utmContent;
    let referrerOrigin = input.referrerOrigin;

    // Se o evento atual não trouxe gclid/utm na URL (ex.: navegou para /guincho-osasco ou clicou no WhatsApp),
    // herda a atribuição de entrada da sessão ativa.
    if (
      !directClassification.hasExplicitPaidSignal &&
      sessionCtx.inheritedTraffic
    ) {
      trafficCategory = sessionCtx.inheritedTraffic.trafficCategory;
      paidClickType = sessionCtx.inheritedTraffic.paidClickType;
      paidClickId = sessionCtx.inheritedTraffic.paidClickId;
      utmSource = utmSource ?? sessionCtx.inheritedTraffic.utmSource;
      utmMedium = utmMedium ?? sessionCtx.inheritedTraffic.utmMedium;
      utmCampaign = utmCampaign ?? sessionCtx.inheritedTraffic.utmCampaign;
      utmTerm = utmTerm ?? sessionCtx.inheritedTraffic.utmTerm;
      utmContent = utmContent ?? sessionCtx.inheritedTraffic.utmContent;
      referrerOrigin =
        referrerOrigin ?? sessionCtx.inheritedTraffic.referrerOrigin;
    } else if (
      directClassification.paidClickType === "utm_paid" &&
      sessionCtx.inheritedTraffic
    ) {
      // Se a sessão já iniciou com Click ID forte (gclid/wbraid/gbraid) e uma página seguinte
      // manteve apenas UTMs (sem o gclid na query string), preserva o Click ID original da sessão
      // e jamais contabiliza uma nova entrada paga duplicada.
      if (
        sessionCtx.inheritedTraffic.paidClickType === "gclid" ||
        sessionCtx.inheritedTraffic.paidClickType === "wbraid" ||
        sessionCtx.inheritedTraffic.paidClickType === "gbraid"
      ) {
        trafficCategory = sessionCtx.inheritedTraffic.trafficCategory;
        paidClickType = sessionCtx.inheritedTraffic.paidClickType;
        paidClickId = sessionCtx.inheritedTraffic.paidClickId;
      } else if (
        sessionCtx.inheritedTraffic.paidClickType === "utm_paid" &&
        !input.utmCampaign &&
        sessionCtx.inheritedTraffic.utmCampaign
      ) {
        paidClickId = sessionCtx.inheritedTraffic.paidClickId;
      }
      utmSource = utmSource ?? sessionCtx.inheritedTraffic.utmSource;
      utmMedium = utmMedium ?? sessionCtx.inheritedTraffic.utmMedium;
      utmCampaign = utmCampaign ?? sessionCtx.inheritedTraffic.utmCampaign;
      utmTerm = utmTerm ?? sessionCtx.inheritedTraffic.utmTerm;
      utmContent = utmContent ?? sessionCtx.inheritedTraffic.utmContent;
      referrerOrigin =
        referrerOrigin ?? sessionCtx.inheritedTraffic.referrerOrigin;
    }

    // "Entrada paga identificada" (isPaidEntry):
    // Marcada como TRUE somente quando:
    // - Não é bot
    // - Há sinal explícito de tráfego pago no evento
    // - Para Click ID explícito (gclid/wbraid/gbraid): este Click ID ainda não gerou entrada paga na sessão
    // - Para tráfego pago baseado exclusivamente em UTM (sem GCLID): a sessão ativa ainda não possui
    //   nenhuma entrada paga registrada (evitando inflar métricas quando utm_campaign/utm_content
    //   variam ou são omitidos em navegações internas da mesma sessão).
    const isUtmOnlyPaidSignal =
      directClassification.paidClickType === "utm_paid";
    const alreadyCountedPaidEntry = isUtmOnlyPaidSignal
      ? sessionCtx.hasAnyPaidEntryInSession
      : sessionCtx.hasPaidEntryForClickId;

    const isPaidEntry =
      !isBot &&
      directClassification.hasExplicitPaidSignal &&
      !alreadyCountedPaidEntry;

    return txRepo.insertAccessEvent({
      createdAt: now,
      ipAddress: ipResult.clientIp,
      ipSource: ipResult.ipSource,
      ipHeaderMismatch: ipResult.ipHeaderMismatch,
      spoofAttemptDetected: ipResult.spoofAttemptDetected,
      sessionId: input.sessionId,
      eventId: input.eventId ?? null,
      isNewVisit,
      eventType: input.eventType,
      pagePath: input.pagePath,
      buttonLocation: input.buttonLocation,
      contactTarget: input.contactTarget,
      trafficCategory,
      isPaidEntry,
      paidClickType,
      paidClickId,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      referrerOrigin,
      browserFamily: input.browserFamily,
      osFamily: input.osFamily,
      deviceType: input.deviceType,
    });
  }
}
