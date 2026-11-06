import { buildPaginationMeta } from "../security/adminValidator.ts";
import type {
  AccessEventRecord,
  DeviceType,
  EventType,
  ExportQueryOptions,
  InvestigatedIpListQueryOptions,
  InvestigatedIpRecord,
  InvestigatedIpStatus,
  IpAggregateSummary,
  IpHistoryQueryOptions,
  IpHistoryResult,
  IpListQueryOptions,
  IpSortField,
  MetricsSummary,
  PaidClickType,
  SummaryQueryFilter,
  TrafficCategory,
} from "../types.ts";

export interface SqlClientLike {
  query<R = Record<string, unknown>>(
    text: string,
    values?: unknown[],
  ): Promise<{ rows: R[]; rowCount: number | null }>;
  release: () => void;
}

/**
 * Contrato estrutural compatível com `pg.Pool` e `pg.Client` do pacote `pg`.
 * Permite injeção de dependência, checkout transacional (`connect`) e testes de SQL parametrizado.
 */
export interface SqlPoolLike {
  query<R = Record<string, unknown>>(
    text: string,
    values?: unknown[],
  ): Promise<{ rows: R[]; rowCount: number | null }>;
  connect?: () => Promise<SqlClientLike>;
}

export interface SessionHistoryContext {
  hasPreviousEventInSession: boolean;
  hasPaidEntryForClickId: boolean;
  hasAnyPaidEntryInSession: boolean;
  inheritedTraffic: {
    trafficCategory: AccessEventRecord["trafficCategory"];
    paidClickType: AccessEventRecord["paidClickType"];
    paidClickId: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    utmTerm: string | null;
    utmContent: string | null;
    referrerOrigin: string | null;
  } | null;
}

export interface AdminUserRecord {
  id: number;
  username: string;
  passwordHash: string;
}

export interface AdminSessionRecord {
  tokenHash: string;
  userId: number;
  username: string;
  ipAddress: string;
  expiresAt: Date;
}

export interface MonitoringRepository {
  /**
   * Executa uma operação crítica de sessão dentro de uma transação isolada com
   * advisory lock transacional no PostgreSQL (`pg_advisory_xact_lock`), garantindo
   * serialização determinística mesmo com múltiplas instâncias/containers do backend.
   */
  withSessionTransaction<T>(
    sessionId: string,
    fn: (txRepo: MonitoringRepository) => Promise<T>,
  ): Promise<T>;
  findEventByEventId(eventId: string): Promise<AccessEventRecord | null>;
  findRecentDuplicateContactEvent(params: {
    sessionId: string;
    eventType: EventType;
    pagePath: string;
    buttonLocation: string | null;
    contactTarget: string | null;
    since: Date;
  }): Promise<AccessEventRecord | null>;
  getSessionContext(
    sessionId: string,
    paidClickId: string | null,
    sessionWindowSince: Date,
  ): Promise<SessionHistoryContext>;
  insertAccessEvent(
    event: Omit<AccessEventRecord, "id">,
  ): Promise<AccessEventRecord>;
  getMetricsSummary(
    windowHoursOrFilter: number | SummaryQueryFilter,
    now?: Date,
  ): Promise<MetricsSummary>;
  listIpAggregates(
    options: IpListQueryOptions,
  ): Promise<{ items: IpAggregateSummary[]; totalItems: number }>;
  getIpHistory(options: IpHistoryQueryOptions): Promise<IpHistoryResult>;
  getInvestigatedIp(ipAddress: string): Promise<InvestigatedIpRecord | null>;
  listInvestigatedIps(
    options: InvestigatedIpListQueryOptions,
  ): Promise<{ items: InvestigatedIpRecord[]; totalItems: number }>;
  upsertInvestigatedIp(
    ipAddress: string,
    status: InvestigatedIpStatus,
    notes: string,
    updatedBy: string,
    now?: Date,
  ): Promise<InvestigatedIpRecord>;
  deleteInvestigatedIp(ipAddress: string): Promise<boolean>;
  exportAccessEvents(options: ExportQueryOptions): Promise<AccessEventRecord[]>;
  purgeExpiredData(retentionDays: number, now?: Date): Promise<number>;
  findAdminByUsername(username: string): Promise<AdminUserRecord | null>;
  createAdminUser(
    username: string,
    passwordHash: string,
  ): Promise<AdminUserRecord>;
  createAdminSession(
    tokenHash: string,
    userId: number,
    ipAddress: string,
    expiresAt: Date,
  ): Promise<void>;
  findValidAdminSession(
    tokenHash: string,
    now?: Date,
  ): Promise<AdminSessionRecord | null>;
  deleteAdminSession(tokenHash: string): Promise<boolean>;
}

interface DbAccessEventRow {
  id: string | number;
  created_at: Date | string;
  ip_address: string;
  ip_source: string;
  ip_header_mismatch: boolean;
  spoof_attempt_detected: boolean;
  session_id: string;
  event_id?: string | null;
  is_new_visit: boolean;
  event_type: EventType;
  page_path: string;
  button_location: string | null;
  contact_target: string | null;
  traffic_category: TrafficCategory;
  is_paid_entry: boolean;
  paid_click_type: PaidClickType;
  paid_click_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer_origin: string | null;
  browser_family: string;
  os_family: string;
  device_type: DeviceType;
}

function mapRowToAccessEvent(row: DbAccessEventRow): AccessEventRecord {
  return {
    id: Number(row.id),
    createdAt: new Date(row.created_at),
    ipAddress: String(row.ip_address),
    ipSource: row.ip_source,
    ipHeaderMismatch: Boolean(row.ip_header_mismatch),
    spoofAttemptDetected: Boolean(row.spoof_attempt_detected),
    sessionId: row.session_id,
    eventId: row.event_id ?? null,
    isNewVisit: Boolean(row.is_new_visit),
    eventType: row.event_type,
    pagePath: row.page_path,
    buttonLocation: row.button_location,
    contactTarget: row.contact_target,
    trafficCategory: row.traffic_category,
    isPaidEntry: Boolean(row.is_paid_entry),
    paidClickType: row.paid_click_type,
    paidClickId: row.paid_click_id,
    utmSource: row.utm_source,
    utmMedium: row.utm_medium,
    utmCampaign: row.utm_campaign,
    utmTerm: row.utm_term,
    utmContent: row.utm_content,
    referrerOrigin: row.referrer_origin,
    browserFamily: row.browser_family,
    osFamily: row.os_family,
    deviceType: row.device_type,
  };
}

const ORDER_BY_SQL_MAP: Record<IpSortField, string> = {
  identifiedPaidEntries: "agg.identified_paid_entries",
  totalVisits: "agg.total_visits",
  totalRequests: "agg.total_requests",
  lastSeenAt: "agg.last_seen_at",
};

/**
 * Implementação PostgreSQL com queries 100% parametrizadas (imune a SQL Injection).
 */
export class PostgresMonitoringRepository implements MonitoringRepository {
  private readonly pool: SqlPoolLike;

  constructor(pool: SqlPoolLike) {
    this.pool = pool;
  }

  public async withSessionTransaction<T>(
    sessionId: string,
    fn: (txRepo: MonitoringRepository) => Promise<T>,
  ): Promise<T> {
    if (typeof this.pool.connect === "function") {
      const client = await this.pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          `SELECT pg_advisory_xact_lock(hashtext('meg_session_lock'), hashtext($1))`,
          [sessionId],
        );
        const txRepo = new PostgresMonitoringRepository(client);
        const result = await fn(txRepo);
        await client.query("COMMIT");
        return result;
      } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        throw err;
      } finally {
        client.release();
      }
    }

    // Fallback quando operando sobre um client já em transação ou mock simples sem .connect()
    await this.pool.query(
      `SELECT pg_advisory_xact_lock(hashtext('meg_session_lock'), hashtext($1))`,
      [sessionId],
    );
    return fn(this);
  }

  public async findEventByEventId(
    eventId: string,
  ): Promise<AccessEventRecord | null> {
    const res = await this.pool.query<DbAccessEventRow>(
      `SELECT id, created_at, host(ip_address) AS ip_address, ip_source,
              ip_header_mismatch, spoof_attempt_detected, session_id, event_id,
              is_new_visit, event_type, page_path, button_location, contact_target,
              traffic_category, is_paid_entry, paid_click_type, paid_click_id,
              utm_source, utm_medium, utm_campaign, utm_term, utm_content,
              referrer_origin, browser_family, os_family, device_type
       FROM access_events
       WHERE event_id = $1
       LIMIT 1`,
      [eventId],
    );
    const row = res.rows[0];
    return row ? mapRowToAccessEvent(row) : null;
  }

  public async findRecentDuplicateContactEvent(params: {
    sessionId: string;
    eventType: EventType;
    pagePath: string;
    buttonLocation: string | null;
    contactTarget: string | null;
    since: Date;
  }): Promise<AccessEventRecord | null> {
    const res = await this.pool.query<DbAccessEventRow>(
      `SELECT id, created_at, host(ip_address) AS ip_address, ip_source,
              ip_header_mismatch, spoof_attempt_detected, session_id, event_id,
              is_new_visit, event_type, page_path, button_location, contact_target,
              traffic_category, is_paid_entry, paid_click_type, paid_click_id,
              utm_source, utm_medium, utm_campaign, utm_term, utm_content,
              referrer_origin, browser_family, os_family, device_type
       FROM access_events
       WHERE session_id = $1
         AND event_type = $2
         AND page_path = $3
         AND COALESCE(button_location, '') = COALESCE($4, '')
         AND COALESCE(contact_target, '') = COALESCE($5, '')
         AND created_at >= $6
       ORDER BY created_at DESC
       LIMIT 1`,
      [
        params.sessionId,
        params.eventType,
        params.pagePath,
        params.buttonLocation,
        params.contactTarget,
        params.since,
      ],
    );
    const row = res.rows[0];
    return row ? mapRowToAccessEvent(row) : null;
  }

  public async getSessionContext(
    sessionId: string,
    paidClickId: string | null,
    sessionWindowSince: Date,
  ): Promise<SessionHistoryContext> {
    const firstEventRes = await this.pool.query<{
      traffic_category: AccessEventRecord["trafficCategory"];
      paid_click_type: AccessEventRecord["paidClickType"];
      paid_click_id: string | null;
      utm_source: string | null;
      utm_medium: string | null;
      utm_campaign: string | null;
      utm_term: string | null;
      utm_content: string | null;
      referrer_origin: string | null;
    }>(
      `SELECT traffic_category, paid_click_type, paid_click_id,
              utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer_origin
       FROM access_events
       WHERE session_id = $1 AND created_at >= $2
       ORDER BY created_at ASC
       LIMIT 1`,
      [sessionId, sessionWindowSince],
    );

    const hasPreviousEventInSession = (firstEventRes.rowCount ?? 0) > 0;
    const firstRow = firstEventRes.rows[0];

    const paidSessionCheck = await this.pool.query(
      `SELECT 1 FROM access_events
       WHERE session_id = $1 AND created_at >= $2 AND is_paid_entry = TRUE
       LIMIT 1`,
      [sessionId, sessionWindowSince],
    );
    const hasAnyPaidEntryInSession = (paidSessionCheck.rowCount ?? 0) > 0;

    let hasPaidEntryForClickId = false;
    if (paidClickId && !paidClickId.startsWith("utm:")) {
      const paidCheck = await this.pool.query(
        `SELECT 1 FROM access_events
         WHERE session_id = $1 AND paid_click_id = $2 AND is_paid_entry = TRUE
         LIMIT 1`,
        [sessionId, paidClickId],
      );
      hasPaidEntryForClickId = (paidCheck.rowCount ?? 0) > 0;
    } else {
      hasPaidEntryForClickId = hasAnyPaidEntryInSession;
    }

    return {
      hasPreviousEventInSession,
      hasPaidEntryForClickId,
      hasAnyPaidEntryInSession,
      inheritedTraffic: firstRow
        ? {
            trafficCategory: firstRow.traffic_category,
            paidClickType: firstRow.paid_click_type,
            paidClickId: firstRow.paid_click_id,
            utmSource: firstRow.utm_source,
            utmMedium: firstRow.utm_medium,
            utmCampaign: firstRow.utm_campaign,
            utmTerm: firstRow.utm_term,
            utmContent: firstRow.utm_content,
            referrerOrigin: firstRow.referrer_origin,
          }
        : null,
    };
  }

  public async insertAccessEvent(
    event: Omit<AccessEventRecord, "id">,
  ): Promise<AccessEventRecord> {
    if (event.eventId) {
      const res = await this.pool.query<{ id: string }>(
        `INSERT INTO access_events (
          created_at, ip_address, ip_source, ip_header_mismatch, spoof_attempt_detected,
          session_id, event_id, is_new_visit, event_type, page_path, button_location, contact_target,
          traffic_category, is_paid_entry, paid_click_type, paid_click_id,
          utm_source, utm_medium, utm_campaign, utm_term, utm_content,
          referrer_origin, browser_family, os_family, device_type
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10, $11, $12,
          $13, $14, $15, $16,
          $17, $18, $19, $20, $21,
          $22, $23, $24, $25
        )
        ON CONFLICT (event_id) WHERE event_id IS NOT NULL DO NOTHING
        RETURNING id`,
        [
          event.createdAt,
          event.ipAddress,
          event.ipSource,
          event.ipHeaderMismatch,
          event.spoofAttemptDetected,
          event.sessionId,
          event.eventId,
          event.isNewVisit,
          event.eventType,
          event.pagePath,
          event.buttonLocation,
          event.contactTarget,
          event.trafficCategory,
          event.isPaidEntry,
          event.paidClickType,
          event.paidClickId,
          event.utmSource,
          event.utmMedium,
          event.utmCampaign,
          event.utmTerm,
          event.utmContent,
          event.referrerOrigin,
          event.browserFamily,
          event.osFamily,
          event.deviceType,
        ],
      );

      if ((res.rowCount ?? 0) === 0 || !res.rows[0]) {
        const existing = await this.findEventByEventId(event.eventId);
        if (existing) return existing;
      }

      return {
        ...event,
        id: Number(res.rows[0]?.id ?? 0),
      };
    }

    const res = await this.pool.query<{ id: string }>(
      `INSERT INTO access_events (
        created_at, ip_address, ip_source, ip_header_mismatch, spoof_attempt_detected,
        session_id, event_id, is_new_visit, event_type, page_path, button_location, contact_target,
        traffic_category, is_paid_entry, paid_click_type, paid_click_id,
        utm_source, utm_medium, utm_campaign, utm_term, utm_content,
        referrer_origin, browser_family, os_family, device_type
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16,
        $17, $18, $19, $20, $21,
        $22, $23, $24, $25
      ) RETURNING id`,
      [
        event.createdAt,
        event.ipAddress,
        event.ipSource,
        event.ipHeaderMismatch,
        event.spoofAttemptDetected,
        event.sessionId,
        null,
        event.isNewVisit,
        event.eventType,
        event.pagePath,
        event.buttonLocation,
        event.contactTarget,
        event.trafficCategory,
        event.isPaidEntry,
        event.paidClickType,
        event.paidClickId,
        event.utmSource,
        event.utmMedium,
        event.utmCampaign,
        event.utmTerm,
        event.utmContent,
        event.referrerOrigin,
        event.browserFamily,
        event.osFamily,
        event.deviceType,
      ],
    );

    return {
      ...event,
      id: Number(res.rows[0]?.id ?? 0),
    };
  }

  public async getMetricsSummary(
    windowHoursOrFilter: number | SummaryQueryFilter,
    now: Date = new Date(),
  ): Promise<MetricsSummary> {
    const filter: SummaryQueryFilter =
      typeof windowHoursOrFilter === "number"
        ? {
            windowHours: windowHoursOrFilter,
            from: new Date(
              now.getTime() - windowHoursOrFilter * 60 * 60 * 1000,
            ),
            to: now,
          }
        : windowHoursOrFilter;

    const conditions: string[] = ["created_at >= $1", "created_at <= $2"];
    const values: unknown[] = [filter.from, filter.to];

    if (filter.trafficCategory) {
      values.push(filter.trafficCategory);
      conditions.push(`traffic_category = $${values.length}`);
    }
    if (filter.eventType) {
      values.push(filter.eventType);
      conditions.push(`event_type = $${values.length}`);
    }

    const whereClause = conditions.join(" AND ");

    const res = await this.pool.query<{
      total_requests: string;
      total_visits: string;
      identified_paid_entries: string;
      whatsapp_clicks: string;
      phone_clicks: string;
      paid_whatsapp_clicks: string;
      paid_phone_clicks: string;
      unique_ips: string;
      spoof_attempts: string;
      header_mismatches: string;
    }>(
      `SELECT
        COUNT(*) AS total_requests,
        COUNT(*) FILTER (WHERE is_new_visit = TRUE) AS total_visits,
        COUNT(*) FILTER (WHERE is_paid_entry = TRUE) AS identified_paid_entries,
        COUNT(*) FILTER (WHERE event_type = 'whatsapp_click') AS whatsapp_clicks,
        COUNT(*) FILTER (WHERE event_type = 'phone_click') AS phone_clicks,
        COUNT(*) FILTER (WHERE event_type = 'whatsapp_click' AND traffic_category IN ('paid_google', 'paid_other')) AS paid_whatsapp_clicks,
        COUNT(*) FILTER (WHERE event_type = 'phone_click' AND traffic_category IN ('paid_google', 'paid_other')) AS paid_phone_clicks,
        COUNT(DISTINCT ip_address) AS unique_ips,
        COUNT(*) FILTER (WHERE spoof_attempt_detected = TRUE) AS spoof_attempts,
        COUNT(*) FILTER (WHERE ip_header_mismatch = TRUE) AS header_mismatches
       FROM access_events
       WHERE ${whereClause}`,
      values,
    );

    const recurringRes = await this.pool.query<{ recurring_ips: string }>(
      `SELECT COUNT(*) AS recurring_ips FROM (
         SELECT ip_address
         FROM access_events
         WHERE ${whereClause} AND is_new_visit = TRUE
         GROUP BY ip_address
         HAVING COUNT(*) >= 2
       ) sub`,
      values,
    );

    const row = res.rows[0];
    return {
      windowHours: filter.windowHours,
      from: filter.from.toISOString(),
      to: filter.to.toISOString(),
      totalRequests: Number(row?.total_requests ?? 0),
      totalVisits: Number(row?.total_visits ?? 0),
      identifiedPaidEntries: Number(row?.identified_paid_entries ?? 0),
      whatsappClicks: Number(row?.whatsapp_clicks ?? 0),
      phoneClicks: Number(row?.phone_clicks ?? 0),
      paidWhatsappClicks: Number(row?.paid_whatsapp_clicks ?? 0),
      paidPhoneClicks: Number(row?.paid_phone_clicks ?? 0),
      uniqueIps: Number(row?.unique_ips ?? 0),
      recurringIps: Number(recurringRes.rows[0]?.recurring_ips ?? 0),
      spoofAttempts: Number(row?.spoof_attempts ?? 0),
      headerMismatches: Number(row?.header_mismatches ?? 0),
    };
  }

  public async listIpAggregates(
    options: IpListQueryOptions,
  ): Promise<{ items: IpAggregateSummary[]; totalItems: number }> {
    const whereClauses: string[] = ["e.created_at >= $1", "e.created_at <= $2"];
    const values: unknown[] = [options.from, options.to];

    if (options.ipAddress) {
      values.push(options.ipAddress);
      whereClauses.push(`e.ip_address = $${values.length}::inet`);
    }
    if (options.searchIp) {
      values.push(`%${options.searchIp}%`);
      whereClauses.push(`LOWER(host(e.ip_address)) LIKE $${values.length}`);
    }
    if (options.trafficCategory) {
      values.push(options.trafficCategory);
      whereClauses.push(`e.traffic_category = $${values.length}`);
    }

    const postFilterClauses: string[] = ["1=1"];
    if (options.onlyPaidEntries) {
      postFilterClauses.push("agg.identified_paid_entries > 0");
    }
    if (options.minVisits !== undefined) {
      values.push(options.minVisits);
      postFilterClauses.push(`agg.total_visits >= $${values.length}`);
    }
    if (options.minRequests !== undefined) {
      values.push(options.minRequests);
      postFilterClauses.push(`agg.total_requests >= $${values.length}`);
    }
    if (options.status === "unclassified") {
      postFilterClauses.push("inv.status IS NULL");
    } else if (options.status) {
      values.push(options.status);
      postFilterClauses.push(`inv.status = $${values.length}`);
    }

    const orderColumn =
      ORDER_BY_SQL_MAP[options.sortBy] ?? "agg.identified_paid_entries";
    const orderDirection = options.sortOrder === "asc" ? "ASC" : "DESC";

    const baseCte = `
      WITH agg AS (
        SELECT
          e.ip_address,
          COUNT(*) AS total_requests,
          COUNT(*) FILTER (WHERE e.is_new_visit = TRUE) AS total_visits,
          COUNT(*) FILTER (WHERE e.is_paid_entry = TRUE) AS identified_paid_entries,
          COUNT(*) FILTER (WHERE e.event_type = 'whatsapp_click') AS whatsapp_clicks,
          COUNT(*) FILTER (WHERE e.event_type = 'phone_click') AS phone_clicks,
          MIN(e.created_at) AS first_seen_at,
          MAX(e.created_at) AS last_seen_at,
          COUNT(DISTINCT e.session_id) AS distinct_sessions,
          COUNT(*) FILTER (WHERE e.spoof_attempt_detected = TRUE) AS spoof_attempts,
          COUNT(*) FILTER (WHERE e.ip_header_mismatch = TRUE) AS header_mismatches,
          ARRAY_REMOVE(ARRAY_AGG(DISTINCT e.traffic_category), NULL) AS traffic_categories,
          ARRAY_REMOVE(ARRAY_AGG(DISTINCT e.paid_click_id), NULL) AS paid_click_ids
        FROM access_events e
        WHERE ${whereClauses.join(" AND ")}
        GROUP BY e.ip_address
      )
    `;

    const countRes = await this.pool.query<{ total_items: string }>(
      `${baseCte}
       SELECT COUNT(*) AS total_items
       FROM agg
       LEFT JOIN investigated_ips inv ON inv.ip_address = agg.ip_address
       WHERE ${postFilterClauses.join(" AND ")}`,
      values,
    );

    const totalItems = Number(countRes.rows[0]?.total_items ?? 0);
    const offset = (options.page - 1) * options.limit;

    const pageValues = [...values, options.limit, offset];
    const limitParam = `$${values.length + 1}`;
    const offsetParam = `$${values.length + 2}`;

    const rowsRes = await this.pool.query<{
      ip_address: string;
      total_requests: string;
      total_visits: string;
      identified_paid_entries: string;
      whatsapp_clicks: string;
      phone_clicks: string;
      first_seen_at: Date | string;
      last_seen_at: Date | string;
      distinct_sessions: string;
      spoof_attempts: string;
      header_mismatches: string;
      traffic_categories: TrafficCategory[] | null;
      paid_click_ids: string[] | null;
      inv_status: InvestigatedIpStatus | null;
      inv_notes: string | null;
      inv_first_flagged_at: Date | string | null;
      inv_updated_at: Date | string | null;
      inv_updated_by: string | null;
    }>(
      `${baseCte}
       SELECT
         host(agg.ip_address) AS ip_address,
         agg.total_requests,
         agg.total_visits,
         agg.identified_paid_entries,
         agg.whatsapp_clicks,
         agg.phone_clicks,
         agg.first_seen_at,
         agg.last_seen_at,
         agg.distinct_sessions,
         agg.spoof_attempts,
         agg.header_mismatches,
         agg.traffic_categories,
         agg.paid_click_ids,
         inv.status AS inv_status,
         inv.notes AS inv_notes,
         inv.first_flagged_at AS inv_first_flagged_at,
         inv.updated_at AS inv_updated_at,
         inv.updated_by AS inv_updated_by
       FROM agg
       LEFT JOIN investigated_ips inv ON inv.ip_address = agg.ip_address
       WHERE ${postFilterClauses.join(" AND ")}
       ORDER BY ${orderColumn} ${orderDirection}, agg.last_seen_at DESC
       LIMIT ${limitParam} OFFSET ${offsetParam}`,
      pageValues,
    );

    const priorityOrder: TrafficCategory[] = [
      "paid_google",
      "paid_other",
      "organic",
      "referral",
      "direct",
    ];

    const items: IpAggregateSummary[] = rowsRes.rows.map((r) => {
      const cats = Array.isArray(r.traffic_categories)
        ? r.traffic_categories
        : [];
      const paidClickIds = Array.isArray(r.paid_click_ids)
        ? r.paid_click_ids
        : [];
      const primaryTrafficCategory =
        priorityOrder.find((p) => cats.includes(p)) ?? cats[0] ?? "direct";

      return {
        ipAddress: r.ip_address,
        totalRequests: Number(r.total_requests),
        totalVisits: Number(r.total_visits),
        identifiedPaidEntries: Number(r.identified_paid_entries),
        whatsappClicks: Number(r.whatsapp_clicks),
        phoneClicks: Number(r.phone_clicks),
        firstSeenAt: new Date(r.first_seen_at),
        lastSeenAt: new Date(r.last_seen_at),
        distinctSessions: Number(r.distinct_sessions),
        spoofAttempts: Number(r.spoof_attempts),
        headerMismatches: Number(r.header_mismatches),
        primaryTrafficCategory,
        trafficCategories: cats,
        paidClickIds,
        investigation: r.inv_status
          ? {
              ipAddress: r.ip_address,
              status: r.inv_status,
              notes: r.inv_notes ?? "",
              firstFlaggedAt: new Date(r.inv_first_flagged_at!),
              updatedAt: new Date(r.inv_updated_at!),
              updatedBy: r.inv_updated_by ?? "admin",
            }
          : null,
      };
    });

    return { items, totalItems };
  }

  public async getIpHistory(
    options: IpHistoryQueryOptions,
  ): Promise<IpHistoryResult> {
    const investigation = await this.getInvestigatedIp(options.ipAddress);

    const conditions: string[] = [
      "ip_address = $1::inet",
      "created_at >= $2",
      "created_at <= $3",
    ];
    const values: unknown[] = [options.ipAddress, options.from, options.to];

    if (options.eventType) {
      values.push(options.eventType);
      conditions.push(`event_type = $${values.length}`);
    }
    if (options.trafficCategory) {
      values.push(options.trafficCategory);
      conditions.push(`traffic_category = $${values.length}`);
    }

    const whereClause = conditions.join(" AND ");

    const aggRes = await this.pool.query<{
      total_requests: string;
      total_visits: string;
      identified_paid_entries: string;
      whatsapp_clicks: string;
      phone_clicks: string;
      first_seen_at: Date | string | null;
      last_seen_at: Date | string | null;
      distinct_sessions: string;
      spoof_attempts: string;
      header_mismatches: string;
      paid_click_ids: string[] | null;
    }>(
      `SELECT
        COUNT(*) AS total_requests,
        COUNT(*) FILTER (WHERE is_new_visit = TRUE) AS total_visits,
        COUNT(*) FILTER (WHERE is_paid_entry = TRUE) AS identified_paid_entries,
        COUNT(*) FILTER (WHERE event_type = 'whatsapp_click') AS whatsapp_clicks,
        COUNT(*) FILTER (WHERE event_type = 'phone_click') AS phone_clicks,
        MIN(created_at) AS first_seen_at,
        MAX(created_at) AS last_seen_at,
        COUNT(DISTINCT session_id) AS distinct_sessions,
        COUNT(*) FILTER (WHERE spoof_attempt_detected = TRUE) AS spoof_attempts,
        COUNT(*) FILTER (WHERE ip_header_mismatch = TRUE) AS header_mismatches,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT paid_click_id), NULL) AS paid_click_ids
       FROM access_events
       WHERE ${whereClause}`,
      values,
    );

    const aggRow = aggRes.rows[0];
    const totalItems = Number(aggRow?.total_requests ?? 0);
    const offset = (options.page - 1) * options.limit;

    const eventsRes = await this.pool.query<DbAccessEventRow>(
      `SELECT id, created_at, host(ip_address) AS ip_address, ip_source,
              ip_header_mismatch, spoof_attempt_detected, session_id, event_id,
              is_new_visit, event_type, page_path, button_location, contact_target,
              traffic_category, is_paid_entry, paid_click_type, paid_click_id,
              utm_source, utm_medium, utm_campaign, utm_term, utm_content,
              referrer_origin, browser_family, os_family, device_type
       FROM access_events
       WHERE ${whereClause}
       ORDER BY created_at DESC, id DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, options.limit, offset],
    );

    const events = eventsRes.rows.map(mapRowToAccessEvent);

    return {
      ipAddress: options.ipAddress,
      period: {
        from: options.from.toISOString(),
        to: options.to.toISOString(),
        windowHours: options.windowHours,
      },
      investigation,
      summary: {
        ipAddress: options.ipAddress,
        totalRequests: totalItems,
        totalVisits: Number(aggRow?.total_visits ?? 0),
        identifiedPaidEntries: Number(aggRow?.identified_paid_entries ?? 0),
        whatsappClicks: Number(aggRow?.whatsapp_clicks ?? 0),
        phoneClicks: Number(aggRow?.phone_clicks ?? 0),
        firstSeenAt: aggRow?.first_seen_at
          ? new Date(aggRow.first_seen_at)
          : options.from,
        lastSeenAt: aggRow?.last_seen_at
          ? new Date(aggRow.last_seen_at)
          : options.to,
        distinctSessions: Number(aggRow?.distinct_sessions ?? 0),
        spoofAttempts: Number(aggRow?.spoof_attempts ?? 0),
        headerMismatches: Number(aggRow?.header_mismatches ?? 0),
        investigation,
        paidClickIds: aggRow?.paid_click_ids ?? [],
      },
      events,
      pagination: buildPaginationMeta(options.page, options.limit, totalItems),
    };
  }

  public async getInvestigatedIp(
    ipAddress: string,
  ): Promise<InvestigatedIpRecord | null> {
    const res = await this.pool.query<{
      ip_address: string;
      status: InvestigatedIpStatus;
      notes: string;
      first_flagged_at: Date | string;
      updated_at: Date | string;
      updated_by: string;
    }>(
      `SELECT host(ip_address) AS ip_address, status, notes,
              first_flagged_at, updated_at, updated_by
       FROM investigated_ips
       WHERE ip_address = $1::inet
       LIMIT 1`,
      [ipAddress],
    );
    const row = res.rows[0];
    if (!row) return null;
    return {
      ipAddress: row.ip_address,
      status: row.status,
      notes: row.notes,
      firstFlaggedAt: new Date(row.first_flagged_at),
      updatedAt: new Date(row.updated_at),
      updatedBy: row.updated_by,
    };
  }

  public async listInvestigatedIps(
    options: InvestigatedIpListQueryOptions,
  ): Promise<{ items: InvestigatedIpRecord[]; totalItems: number }> {
    const conditions: string[] = ["1=1"];
    const values: unknown[] = [];

    if (options.status) {
      values.push(options.status);
      conditions.push(`status = $${values.length}`);
    }

    const whereClause = conditions.join(" AND ");
    const countRes = await this.pool.query<{ total_items: string }>(
      `SELECT COUNT(*) AS total_items FROM investigated_ips WHERE ${whereClause}`,
      values,
    );
    const totalItems = Number(countRes.rows[0]?.total_items ?? 0);

    const offset = (options.page - 1) * options.limit;
    const rowsRes = await this.pool.query<{
      ip_address: string;
      status: InvestigatedIpStatus;
      notes: string;
      first_flagged_at: Date | string;
      updated_at: Date | string;
      updated_by: string;
    }>(
      `SELECT host(ip_address) AS ip_address, status, notes,
              first_flagged_at, updated_at, updated_by
       FROM investigated_ips
       WHERE ${whereClause}
       ORDER BY updated_at DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, options.limit, offset],
    );

    const items: InvestigatedIpRecord[] = rowsRes.rows.map((row) => ({
      ipAddress: row.ip_address,
      status: row.status,
      notes: row.notes,
      firstFlaggedAt: new Date(row.first_flagged_at),
      updatedAt: new Date(row.updated_at),
      updatedBy: row.updated_by,
    }));

    return { items, totalItems };
  }

  public async upsertInvestigatedIp(
    ipAddress: string,
    status: InvestigatedIpStatus,
    notes: string,
    updatedBy: string,
    now: Date = new Date(),
  ): Promise<InvestigatedIpRecord> {
    const cleanNotes = notes.slice(0, 2000);
    const cleanUpdatedBy = updatedBy.slice(0, 64);

    const res = await this.pool.query<{
      ip_address: string;
      status: InvestigatedIpStatus;
      notes: string;
      first_flagged_at: Date | string;
      updated_at: Date | string;
      updated_by: string;
    }>(
      `INSERT INTO investigated_ips (ip_address, status, notes, first_flagged_at, updated_at, updated_by)
       VALUES ($1::inet, $2, $3, $4, $4, $5)
       ON CONFLICT (ip_address)
       DO UPDATE SET status = EXCLUDED.status,
                     notes = EXCLUDED.notes,
                     updated_at = EXCLUDED.updated_at,
                     updated_by = EXCLUDED.updated_by
       RETURNING host(ip_address) AS ip_address, status, notes, first_flagged_at, updated_at, updated_by`,
      [ipAddress, status, cleanNotes, now, cleanUpdatedBy],
    );

    const row = res.rows[0];
    return {
      ipAddress: row?.ip_address ?? ipAddress,
      status: row?.status ?? status,
      notes: row?.notes ?? cleanNotes,
      firstFlaggedAt: row?.first_flagged_at
        ? new Date(row.first_flagged_at)
        : now,
      updatedAt: row?.updated_at ? new Date(row.updated_at) : now,
      updatedBy: row?.updated_by ?? cleanUpdatedBy,
    };
  }

  public async deleteInvestigatedIp(ipAddress: string): Promise<boolean> {
    const res = await this.pool.query(
      `DELETE FROM investigated_ips WHERE ip_address = $1::inet`,
      [ipAddress],
    );
    return (res.rowCount ?? 0) > 0;
  }

  public async exportAccessEvents(
    options: ExportQueryOptions,
  ): Promise<AccessEventRecord[]> {
    const conditions: string[] = ["created_at >= $1", "created_at <= $2"];
    const values: unknown[] = [options.from, options.to];

    if (options.ipAddress) {
      values.push(options.ipAddress);
      conditions.push(`ip_address = $${values.length}::inet`);
    }
    if (options.trafficCategory) {
      values.push(options.trafficCategory);
      conditions.push(`traffic_category = $${values.length}`);
    }
    if (options.eventType) {
      values.push(options.eventType);
      conditions.push(`event_type = $${values.length}`);
    }

    values.push(options.limit);
    const limitParam = `$${values.length}`;

    const res = await this.pool.query<DbAccessEventRow>(
      `SELECT id, created_at, host(ip_address) AS ip_address, ip_source,
              ip_header_mismatch, spoof_attempt_detected, session_id, event_id,
              is_new_visit, event_type, page_path, button_location, contact_target,
              traffic_category, is_paid_entry, paid_click_type, paid_click_id,
              utm_source, utm_medium, utm_campaign, utm_term, utm_content,
              referrer_origin, browser_family, os_family, device_type
       FROM access_events
       WHERE ${conditions.join(" AND ")}
       ORDER BY created_at DESC, id DESC
       LIMIT ${limitParam}`,
      values,
    );

    return res.rows.map(mapRowToAccessEvent);
  }

  public async purgeExpiredData(
    retentionDays: number,
    now: Date = new Date(),
  ): Promise<number> {
    const safeDays = Math.max(1, Math.floor(retentionDays));
    const cutoff = new Date(now.getTime() - safeDays * 24 * 60 * 60 * 1000);

    const res = await this.pool.query(
      `DELETE FROM access_events WHERE created_at < $1`,
      [cutoff],
    );
    await this.pool.query(`DELETE FROM admin_sessions WHERE expires_at < $1`, [
      now,
    ]);
    return res.rowCount ?? 0;
  }

  public async findAdminByUsername(
    username: string,
  ): Promise<AdminUserRecord | null> {
    const res = await this.pool.query<{
      id: number;
      username: string;
      password_hash: string;
    }>(
      `SELECT id, username, password_hash FROM admin_users WHERE username = $1 LIMIT 1`,
      [username],
    );
    const row = res.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
    };
  }

  public async createAdminUser(
    username: string,
    passwordHash: string,
  ): Promise<AdminUserRecord> {
    const res = await this.pool.query<{ id: number }>(
      `INSERT INTO admin_users (username, password_hash) VALUES ($1, $2) RETURNING id`,
      [username, passwordHash],
    );
    return {
      id: res.rows[0]!.id,
      username,
      passwordHash,
    };
  }

  public async createAdminSession(
    tokenHash: string,
    userId: number,
    ipAddress: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.pool.query(
      `INSERT INTO admin_sessions (token_hash, user_id, ip_address, expires_at)
       VALUES ($1, $2, $3::inet, $4)`,
      [tokenHash, userId, ipAddress, expiresAt],
    );
    await this.pool.query(
      `UPDATE admin_users SET last_login_at = NOW() WHERE id = $1`,
      [userId],
    );
  }

  public async findValidAdminSession(
    tokenHash: string,
    now: Date = new Date(),
  ): Promise<AdminSessionRecord | null> {
    const res = await this.pool.query<{
      token_hash: string;
      user_id: number;
      username: string;
      ip_address: string;
      expires_at: Date | string;
    }>(
      `SELECT s.token_hash, s.user_id, u.username, host(s.ip_address) AS ip_address, s.expires_at
       FROM admin_sessions s
       JOIN admin_users u ON u.id = s.user_id
       WHERE s.token_hash = $1 AND s.expires_at > $2
       LIMIT 1`,
      [tokenHash, now],
    );
    const row = res.rows[0];
    if (!row) return null;
    return {
      tokenHash: row.token_hash,
      userId: row.user_id,
      username: row.username,
      ipAddress: row.ip_address,
      expiresAt: new Date(row.expires_at),
    };
  }

  public async deleteAdminSession(tokenHash: string): Promise<boolean> {
    const res = await this.pool.query(
      `DELETE FROM admin_sessions WHERE token_hash = $1`,
      [tokenHash],
    );
    return (res.rowCount ?? 0) > 0;
  }
}

/**
 * Repositório em memória com semântica idêntica ao PostgreSQL para execução
 * de testes de integração, segurança, concorrência e retenção sem dependências externas.
 */
export class InMemoryMonitoringRepository implements MonitoringRepository {
  public readonly events: AccessEventRecord[] = [];
  public readonly investigatedIps = new Map<string, InvestigatedIpRecord>();
  public readonly admins: AdminUserRecord[] = [];
  public readonly sessions = new Map<string, AdminSessionRecord>();
  private readonly sessionLocks = new Map<string, Promise<unknown>>();
  private nextEventId = 1;
  private nextAdminId = 1;

  public async withSessionTransaction<T>(
    sessionId: string,
    fn: (txRepo: MonitoringRepository) => Promise<T>,
  ): Promise<T> {
    const previous = this.sessionLocks.get(sessionId) ?? Promise.resolve();
    const currentPromise = previous.catch(() => undefined).then(() => fn(this));
    this.sessionLocks.set(sessionId, currentPromise);
    try {
      return await currentPromise;
    } finally {
      if (this.sessionLocks.get(sessionId) === currentPromise) {
        this.sessionLocks.delete(sessionId);
      }
    }
  }

  public async findEventByEventId(
    eventId: string,
  ): Promise<AccessEventRecord | null> {
    return this.events.find((e) => e.eventId === eventId) ?? null;
  }

  public async findRecentDuplicateContactEvent(params: {
    sessionId: string;
    eventType: EventType;
    pagePath: string;
    buttonLocation: string | null;
    contactTarget: string | null;
    since: Date;
  }): Promise<AccessEventRecord | null> {
    const sinceMs = params.since.getTime();
    for (let i = this.events.length - 1; i >= 0; i--) {
      const ev = this.events[i]!;
      if (ev.createdAt.getTime() < sinceMs) continue;
      if (
        ev.sessionId === params.sessionId &&
        ev.eventType === params.eventType &&
        ev.pagePath === params.pagePath &&
        (ev.buttonLocation ?? "") === (params.buttonLocation ?? "") &&
        (ev.contactTarget ?? "") === (params.contactTarget ?? "")
      ) {
        return ev;
      }
    }
    return null;
  }

  public async getSessionContext(
    sessionId: string,
    paidClickId: string | null,
    sessionWindowSince: Date,
  ): Promise<SessionHistoryContext> {
    const sessionEvents = this.events.filter(
      (e) =>
        e.sessionId === sessionId &&
        e.createdAt.getTime() >= sessionWindowSince.getTime(),
    );

    const firstEvent = sessionEvents[0] ?? null;
    const hasAnyPaidEntryInSession = sessionEvents.some((e) => e.isPaidEntry);

    let hasPaidEntryForClickId = false;
    if (paidClickId && !paidClickId.startsWith("utm:")) {
      hasPaidEntryForClickId = this.events.some(
        (e) =>
          e.sessionId === sessionId &&
          e.paidClickId === paidClickId &&
          e.isPaidEntry,
      );
    } else {
      hasPaidEntryForClickId = hasAnyPaidEntryInSession;
    }

    return {
      hasPreviousEventInSession: sessionEvents.length > 0,
      hasPaidEntryForClickId,
      hasAnyPaidEntryInSession,
      inheritedTraffic: firstEvent
        ? {
            trafficCategory: firstEvent.trafficCategory,
            paidClickType: firstEvent.paidClickType,
            paidClickId: firstEvent.paidClickId,
            utmSource: firstEvent.utmSource,
            utmMedium: firstEvent.utmMedium,
            utmCampaign: firstEvent.utmCampaign,
            utmTerm: firstEvent.utmTerm,
            utmContent: firstEvent.utmContent,
            referrerOrigin: firstEvent.referrerOrigin,
          }
        : null,
    };
  }

  public async insertAccessEvent(
    event: Omit<AccessEventRecord, "id">,
  ): Promise<AccessEventRecord> {
    const record: AccessEventRecord = {
      ...event,
      id: this.nextEventId++,
    };
    this.events.push(record);
    return record;
  }

  public async getMetricsSummary(
    windowHoursOrFilter: number | SummaryQueryFilter,
    now: Date = new Date(),
  ): Promise<MetricsSummary> {
    const filter: SummaryQueryFilter =
      typeof windowHoursOrFilter === "number"
        ? {
            windowHours: windowHoursOrFilter,
            from: new Date(
              now.getTime() - windowHoursOrFilter * 60 * 60 * 1000,
            ),
            to: now,
          }
        : windowHoursOrFilter;

    const fromMs = filter.from.getTime();
    const toMs = filter.to.getTime();

    const filtered = this.events.filter((e) => {
      const t = e.createdAt.getTime();
      if (t < fromMs || t > toMs) return false;
      if (
        filter.trafficCategory &&
        e.trafficCategory !== filter.trafficCategory
      ) {
        return false;
      }
      if (filter.eventType && e.eventType !== filter.eventType) {
        return false;
      }
      return true;
    });

    const uniqueIpSet = new Set<string>();
    const visitsByIp = new Map<string, number>();

    let totalVisits = 0;
    let identifiedPaidEntries = 0;
    let whatsappClicks = 0;
    let phoneClicks = 0;
    let paidWhatsappClicks = 0;
    let paidPhoneClicks = 0;
    let spoofAttempts = 0;
    let headerMismatches = 0;

    for (const ev of filtered) {
      uniqueIpSet.add(ev.ipAddress);
      if (ev.isNewVisit) {
        totalVisits++;
        visitsByIp.set(ev.ipAddress, (visitsByIp.get(ev.ipAddress) ?? 0) + 1);
      }
      if (ev.isPaidEntry) {
        identifiedPaidEntries++;
      }
      const isPaidSession =
        ev.trafficCategory === "paid_google" ||
        ev.trafficCategory === "paid_other";
      if (ev.eventType === "whatsapp_click") {
        whatsappClicks++;
        if (isPaidSession) paidWhatsappClicks++;
      } else if (ev.eventType === "phone_click") {
        phoneClicks++;
        if (isPaidSession) paidPhoneClicks++;
      }
      if (ev.spoofAttemptDetected) spoofAttempts++;
      if (ev.ipHeaderMismatch) headerMismatches++;
    }

    let recurringIps = 0;
    for (const count of visitsByIp.values()) {
      if (count >= 2) recurringIps++;
    }

    return {
      windowHours: filter.windowHours,
      from: filter.from.toISOString(),
      to: filter.to.toISOString(),
      totalRequests: filtered.length,
      totalVisits,
      identifiedPaidEntries,
      whatsappClicks,
      phoneClicks,
      paidWhatsappClicks,
      paidPhoneClicks,
      uniqueIps: uniqueIpSet.size,
      recurringIps,
      spoofAttempts,
      headerMismatches,
    };
  }

  public async listIpAggregates(
    options: IpListQueryOptions,
  ): Promise<{ items: IpAggregateSummary[]; totalItems: number }> {
    const fromMs = options.from.getTime();
    const toMs = options.to.getTime();

    const grouped = new Map<string, AccessEventRecord[]>();
    for (const ev of this.events) {
      const t = ev.createdAt.getTime();
      if (t < fromMs || t > toMs) continue;
      if (options.ipAddress && ev.ipAddress !== options.ipAddress) continue;
      if (
        options.searchIp &&
        !ev.ipAddress.toLowerCase().includes(options.searchIp.toLowerCase())
      ) {
        continue;
      }
      if (
        options.trafficCategory &&
        ev.trafficCategory !== options.trafficCategory
      ) {
        continue;
      }
      const list = grouped.get(ev.ipAddress) ?? [];
      list.push(ev);
      grouped.set(ev.ipAddress, list);
    }

    let summaries: IpAggregateSummary[] = [];
    for (const [ipAddress, evList] of grouped.entries()) {
      let totalVisits = 0;
      let identifiedPaidEntries = 0;
      let whatsappClicks = 0;
      let phoneClicks = 0;
      let spoofAttempts = 0;
      let headerMismatches = 0;
      let firstSeenAt = evList[0]!.createdAt;
      let lastSeenAt = evList[0]!.createdAt;
      const sessions = new Set<string>();
      const trafficCatSet = new Set<TrafficCategory>();
      const paidClickIdSet = new Set<string>();

      for (const ev of evList) {
        sessions.add(ev.sessionId);
        trafficCatSet.add(ev.trafficCategory);
        if (ev.paidClickId) paidClickIdSet.add(ev.paidClickId);
        if (ev.isNewVisit) totalVisits++;
        if (ev.isPaidEntry) identifiedPaidEntries++;
        if (ev.eventType === "whatsapp_click") whatsappClicks++;
        if (ev.eventType === "phone_click") phoneClicks++;
        if (ev.spoofAttemptDetected) spoofAttempts++;
        if (ev.ipHeaderMismatch) headerMismatches++;
        if (ev.createdAt.getTime() < firstSeenAt.getTime()) {
          firstSeenAt = ev.createdAt;
        }
        if (ev.createdAt.getTime() > lastSeenAt.getTime()) {
          lastSeenAt = ev.createdAt;
        }
      }

      const priorityOrder: TrafficCategory[] = [
        "paid_google",
        "paid_other",
        "organic",
        "referral",
        "direct",
      ];
      const trafficCategories = Array.from(trafficCatSet);
      const primaryTrafficCategory =
        priorityOrder.find((p) => trafficCatSet.has(p)) ??
        trafficCategories[0] ??
        "direct";

      const investigation = this.investigatedIps.get(ipAddress) ?? null;

      summaries.push({
        ipAddress,
        totalRequests: evList.length,
        totalVisits,
        identifiedPaidEntries,
        whatsappClicks,
        phoneClicks,
        firstSeenAt,
        lastSeenAt,
        distinctSessions: sessions.size,
        spoofAttempts,
        headerMismatches,
        primaryTrafficCategory,
        trafficCategories,
        paidClickIds: Array.from(paidClickIdSet),
        investigation,
      });
    }

    summaries = summaries.filter((item) => {
      if (options.onlyPaidEntries && item.identifiedPaidEntries <= 0) {
        return false;
      }
      if (
        options.minVisits !== undefined &&
        item.totalVisits < options.minVisits
      ) {
        return false;
      }
      if (
        options.minRequests !== undefined &&
        item.totalRequests < options.minRequests
      ) {
        return false;
      }
      if (options.status === "unclassified") {
        return item.investigation === null;
      }
      if (options.status) {
        return item.investigation?.status === options.status;
      }
      return true;
    });

    const dir = options.sortOrder === "asc" ? 1 : -1;
    summaries.sort((a, b) => {
      let diff = 0;
      if (options.sortBy === "identifiedPaidEntries") {
        diff = a.identifiedPaidEntries - b.identifiedPaidEntries;
      } else if (options.sortBy === "totalVisits") {
        diff = a.totalVisits - b.totalVisits;
      } else if (options.sortBy === "totalRequests") {
        diff = a.totalRequests - b.totalRequests;
      } else {
        diff = a.lastSeenAt.getTime() - b.lastSeenAt.getTime();
      }
      if (diff !== 0) return diff * dir;
      return b.lastSeenAt.getTime() - a.lastSeenAt.getTime();
    });

    const totalItems = summaries.length;
    const offset = (options.page - 1) * options.limit;
    const items = summaries.slice(offset, offset + options.limit);

    return { items, totalItems };
  }

  public async getIpHistory(
    options: IpHistoryQueryOptions,
  ): Promise<IpHistoryResult> {
    const fromMs = options.from.getTime();
    const toMs = options.to.getTime();
    const investigation =
      this.investigatedIps.get(options.ipAddress) ?? null;

    const matching = this.events
      .filter((ev) => {
        if (ev.ipAddress !== options.ipAddress) return false;
        const t = ev.createdAt.getTime();
        if (t < fromMs || t > toMs) return false;
        if (options.eventType && ev.eventType !== options.eventType) {
          return false;
        }
        if (
          options.trafficCategory &&
          ev.trafficCategory !== options.trafficCategory
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const timeDiff = b.createdAt.getTime() - a.createdAt.getTime();
        return timeDiff !== 0 ? timeDiff : b.id - a.id;
      });

    let totalVisits = 0;
    let identifiedPaidEntries = 0;
    let whatsappClicks = 0;
    let phoneClicks = 0;
    let spoofAttempts = 0;
    let headerMismatches = 0;
    let firstSeenAt = matching[matching.length - 1]?.createdAt ?? options.from;
    let lastSeenAt = matching[0]?.createdAt ?? options.to;
    const sessions = new Set<string>();
    const paidClickIds = new Set<string>();

    for (const ev of matching) {
      sessions.add(ev.sessionId);
      if (ev.isNewVisit) totalVisits++;
      if (ev.isPaidEntry) identifiedPaidEntries++;
      if (ev.eventType === "whatsapp_click") whatsappClicks++;
      if (ev.eventType === "phone_click") phoneClicks++;
      if (ev.spoofAttemptDetected) spoofAttempts++;
      if (ev.ipHeaderMismatch) headerMismatches++;
      if (ev.paidClickId) paidClickIds.add(ev.paidClickId);
      if (ev.createdAt.getTime() < firstSeenAt.getTime()) {
        firstSeenAt = ev.createdAt;
      }
      if (ev.createdAt.getTime() > lastSeenAt.getTime()) {
        lastSeenAt = ev.createdAt;
      }
    }

    const totalItems = matching.length;
    const offset = (options.page - 1) * options.limit;
    const pageEvents = matching.slice(offset, offset + options.limit);

    return {
      ipAddress: options.ipAddress,
      period: {
        from: options.from.toISOString(),
        to: options.to.toISOString(),
        windowHours: options.windowHours,
      },
      investigation,
      summary: {
        ipAddress: options.ipAddress,
        totalRequests: totalItems,
        totalVisits,
        identifiedPaidEntries,
        whatsappClicks,
        phoneClicks,
        firstSeenAt,
        lastSeenAt,
        distinctSessions: sessions.size,
        spoofAttempts,
        headerMismatches,
        investigation,
        paidClickIds: Array.from(paidClickIds),
      },
      events: pageEvents,
      pagination: buildPaginationMeta(options.page, options.limit, totalItems),
    };
  }

  public async getInvestigatedIp(
    ipAddress: string,
  ): Promise<InvestigatedIpRecord | null> {
    return this.investigatedIps.get(ipAddress) ?? null;
  }

  public async listInvestigatedIps(
    options: InvestigatedIpListQueryOptions,
  ): Promise<{ items: InvestigatedIpRecord[]; totalItems: number }> {
    let all = Array.from(this.investigatedIps.values());
    if (options.status) {
      all = all.filter((item) => item.status === options.status);
    }
    all.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    const totalItems = all.length;
    const offset = (options.page - 1) * options.limit;
    const items = all.slice(offset, offset + options.limit);
    return { items, totalItems };
  }

  public async upsertInvestigatedIp(
    ipAddress: string,
    status: InvestigatedIpStatus,
    notes: string,
    updatedBy: string,
    now: Date = new Date(),
  ): Promise<InvestigatedIpRecord> {
    const existing = this.investigatedIps.get(ipAddress);
    const record: InvestigatedIpRecord = {
      ipAddress,
      status,
      notes: notes.slice(0, 2000),
      firstFlaggedAt: existing?.firstFlaggedAt ?? now,
      updatedAt: now,
      updatedBy: updatedBy.slice(0, 64),
    };
    this.investigatedIps.set(ipAddress, record);
    return record;
  }

  public async deleteInvestigatedIp(ipAddress: string): Promise<boolean> {
    return this.investigatedIps.delete(ipAddress);
  }

  public async exportAccessEvents(
    options: ExportQueryOptions,
  ): Promise<AccessEventRecord[]> {
    const fromMs = options.from.getTime();
    const toMs = options.to.getTime();

    return this.events
      .filter((ev) => {
        const t = ev.createdAt.getTime();
        if (t < fromMs || t > toMs) return false;
        if (options.ipAddress && ev.ipAddress !== options.ipAddress) {
          return false;
        }
        if (
          options.trafficCategory &&
          ev.trafficCategory !== options.trafficCategory
        ) {
          return false;
        }
        if (options.eventType && ev.eventType !== options.eventType) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const timeDiff = b.createdAt.getTime() - a.createdAt.getTime();
        return timeDiff !== 0 ? timeDiff : b.id - a.id;
      })
      .slice(0, options.limit);
  }

  public async purgeExpiredData(
    retentionDays: number,
    now: Date = new Date(),
  ): Promise<number> {
    const safeDays = Math.max(1, Math.floor(retentionDays));
    const cutoffMs = now.getTime() - safeDays * 24 * 60 * 60 * 1000;

    const beforeCount = this.events.length;
    for (let i = this.events.length - 1; i >= 0; i--) {
      if (this.events[i]!.createdAt.getTime() < cutoffMs) {
        this.events.splice(i, 1);
      }
    }

    for (const [hash, session] of this.sessions.entries()) {
      if (session.expiresAt.getTime() < now.getTime()) {
        this.sessions.delete(hash);
      }
    }

    return beforeCount - this.events.length;
  }

  public async findAdminByUsername(
    username: string,
  ): Promise<AdminUserRecord | null> {
    return this.admins.find((a) => a.username === username) ?? null;
  }

  public async createAdminUser(
    username: string,
    passwordHash: string,
  ): Promise<AdminUserRecord> {
    const record: AdminUserRecord = {
      id: this.nextAdminId++,
      username,
      passwordHash,
    };
    this.admins.push(record);
    return record;
  }

  public async createAdminSession(
    tokenHash: string,
    userId: number,
    ipAddress: string,
    expiresAt: Date,
  ): Promise<void> {
    const admin = this.admins.find((a) => a.id === userId);
    if (!admin) throw new Error("Usuário administrativo não encontrado");
    this.sessions.set(tokenHash, {
      tokenHash,
      userId,
      username: admin.username,
      ipAddress,
      expiresAt,
    });
  }

  public async findValidAdminSession(
    tokenHash: string,
    now: Date = new Date(),
  ): Promise<AdminSessionRecord | null> {
    const session = this.sessions.get(tokenHash);
    if (!session) return null;
    if (session.expiresAt.getTime() <= now.getTime()) {
      this.sessions.delete(tokenHash);
      return null;
    }
    return session;
  }

  public async deleteAdminSession(tokenHash: string): Promise<boolean> {
    return this.sessions.delete(tokenHash);
  }
}
