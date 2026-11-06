import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import type { AddressInfo } from "node:net";
import { join } from "node:path";
import { describe, it } from "node:test";
import pg from "pg";
import { PostgresMonitoringRepository } from "../src/db/repository.ts";
import { validateAndSanitizeCollectPayload } from "../src/privacy/sanitizer.ts";
import { hashPassword } from "../src/security/auth.ts";
import { createMonitoringServer } from "../src/server.ts";
import { CollectorService } from "../src/services/collectorService.ts";

const { Pool } = pg;

const DEFAULT_ISOLATED_TEST_DB_URL =
  "postgresql://meg_test_runner:TempTestOnly_2026_Restricted!@127.0.0.1:55439/meg_monitoring_test_only_db";

const ALLOWED_LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);
const FORBIDDEN_DB_NAMES = new Set([
  "monitoring_db",
  "postgres",
  "production",
  "prod",
  "defaultdb",
  "template0",
  "template1",
]);

/**
 * Trava de segurança obrigatória (Prioridade 1, Item 6):
 * Impede de forma determinística que a suíte de integração execute contra
 * bancos de produção, hosts remotos (VPS/Coolify/Hostinger) ou bancos locais sem sufixo de teste.
 */
export function assertSafeTestDatabaseUrl(rawUrl: string): URL {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "BLOQUEIO DE SEGURANÇA: A suíte de testes de banco nunca pode ser executada com NODE_ENV=production.",
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("BLOQUEIO DE SEGURANÇA: URL de banco de testes malformada.");
  }

  if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
    throw new Error(
      `BLOQUEIO DE SEGURANÇA: Protocolo inválido (${parsed.protocol}).`,
    );
  }

  const host = parsed.hostname.toLowerCase();
  if (!ALLOWED_LOCAL_HOSTS.has(host)) {
    throw new Error(
      `BLOQUEIO DE SEGURANÇA: Host "${host}" recusado. Testes só podem apontar para loopback local (127.0.0.1 / localhost).`,
    );
  }

  const dbName = parsed.pathname.replace(/^\/+/, "").toLowerCase();
  if (!dbName || FORBIDDEN_DB_NAMES.has(dbName) || !dbName.includes("test")) {
    throw new Error(
      `BLOQUEIO DE SEGURANÇA: Nome do banco "${dbName}" recusado. O banco deve ser exclusivo de testes e conter "test" no nome.`,
    );
  }

  return parsed;
}

describe("Etapa 3 — Validação em PostgreSQL Real (Prioridades 1, 2 e 3)", () => {
  it("bloqueia qualquer tentativa de apontar a suíte de testes para bancos de produção ou hosts remotos", () => {
    assert.throws(
      () =>
        assertSafeTestDatabaseUrl(
          "postgresql://monitoring_user:secret@monitoring-db:5432/monitoring_db",
        ),
      /BLOQUEIO DE SEGURANÇA: Host "monitoring-db" recusado/,
    );

    assert.throws(
      () =>
        assertSafeTestDatabaseUrl(
          "postgresql://monitoring_user:secret@72.61.52.78:5432/monitoring_test_db",
        ),
      /BLOQUEIO DE SEGURANÇA: Host "72\.61\.52\.78" recusado/,
    );

    assert.throws(
      () =>
        assertSafeTestDatabaseUrl(
          "postgresql://postgres:postgres@127.0.0.1:5432/monitoring_db",
        ),
      /BLOQUEIO DE SEGURANÇA: Nome do banco "monitoring_db" recusado/,
    );

    assert.throws(
      () =>
        assertSafeTestDatabaseUrl(
          "postgresql://postgres:postgres@127.0.0.1:5432/postgres",
        ),
      /BLOQUEIO DE SEGURANÇA: Nome do banco "postgres" recusado/,
    );

    const safe = assertSafeTestDatabaseUrl(DEFAULT_ISOLATED_TEST_DB_URL);
    assert.equal(safe.hostname, "127.0.0.1");
    assert.equal(safe.port, "55439");
  });

  it("valida migração, índices, role restrita (NOSUPERUSER), transações, concorrência multi-instância, idempotência, endpoints HTTP e expurgo no PostgreSQL real", async (t) => {
    const connectionString =
      process.env.TEST_DATABASE_URL ?? DEFAULT_ISOLATED_TEST_DB_URL;
    const requireRealPg = process.env.REQUIRE_REAL_POSTGRES === "1";

    // Valida a trava anti-produção antes de qualquer conexão TCP
    const validatedUrl = assertSafeTestDatabaseUrl(connectionString);

    const adminSetupPool = new Pool({
      connectionString,
      max: 3,
      connectionTimeoutMillis: 3000,
      idleTimeoutMillis: 5000,
    });

    let setupClient: pg.PoolClient | null = null;
    try {
      setupClient = await adminSetupPool.connect();
    } catch (err) {
      await adminSetupPool.end().catch(() => {});
      const reason = err instanceof Error ? err.message : String(err);
      const msg =
        `[PENDÊNCIA BLOQUEANTE PARA HOMOLOGAÇÃO] Container PostgreSQL de testes indisponível (${reason}). ` +
        `Execute o container isolado na porta 55439 antes de rodar npm run test:pg:strict.`;

      if (requireRealPg) {
        assert.fail(msg);
      } else {
        t.skip(msg);
        return;
      }
    }

    const suffix = randomBytes(6).toString("hex");
    const schemaName = `monitoring_it_${suffix}`;
    const restrictedRole = `meg_app_role_${suffix}`;
    const restrictedPassword = `Restricted_${randomBytes(12).toString("hex")}!`;

    try {
      // 1. Cria schema isolado e aplica migração 001_init.sql dentro dele
      await setupClient!.query(`CREATE SCHEMA ${schemaName}`);
      await setupClient!.query(`SET search_path TO ${schemaName}, public`);

      const migrationPath = join(
        import.meta.dirname,
        "..",
        "migrations",
        "001_init.sql",
      );
      const sqlContent = readFileSync(migrationPath, "utf8");
      await setupClient!.query(sqlContent);

      // 2. Cria credencial temporária e restrita (NOSUPERUSER, NOCREATEDB, NOCREATEROLE) exclusiva para a aplicação no teste
      await setupClient!.query(
        `CREATE ROLE ${restrictedRole} WITH LOGIN PASSWORD '${restrictedPassword}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT`,
      );
      await setupClient!.query(
        `GRANT CONNECT ON DATABASE ${validatedUrl.pathname.replace(/^\/+/, "")} TO ${restrictedRole}`,
      );
      await setupClient!.query(
        `GRANT USAGE ON SCHEMA ${schemaName} TO ${restrictedRole}`,
      );
      await setupClient!.query(
        `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA ${schemaName} TO ${restrictedRole}`,
      );
      await setupClient!.query(
        `GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA ${schemaName} TO ${restrictedRole}`,
      );
      await setupClient!.query(
        `GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA ${schemaName} TO ${restrictedRole}`,
      );

      setupClient!.release();
      setupClient = null;

      // Monta URL restrita para os pools das múltiplas instâncias do backend
      const appUrl = new URL(connectionString);
      appUrl.username = restrictedRole;
      appUrl.password = restrictedPassword;

      const appPool = new Pool({
        connectionString: appUrl.toString(),
        max: 10,
        options: `-c search_path=${schemaName},public`,
      });

      try {
        // 3. Confirma que a conexão da aplicação roda sem privilégio de superuser e no schema isolado
        const roleCheck = await appPool.query<{
          current_user: string;
          is_super: boolean;
          current_schema: string;
        }>(
          `SELECT current_user,
                  (SELECT usesuper FROM pg_user WHERE usename = current_user) AS is_super,
                  current_schema()`,
        );
        assert.equal(roleCheck.rows[0]?.current_user, restrictedRole);
        assert.equal(
          roleCheck.rows[0]?.is_super,
          false,
          "A role da aplicação de testes não deve ser superuser",
        );
        assert.equal(roleCheck.rows[0]?.current_schema, schemaName);

        // 4. Confirma integridade dos índices criados no PostgreSQL
        const indexesRes = await appPool.query<{ indexname: string }>(
          `SELECT indexname FROM pg_indexes WHERE schemaname = $1`,
          [schemaName],
        );
        const indexNames = new Set(indexesRes.rows.map((r) => r.indexname));
        const expectedIndexes = [
          "idx_access_events_created_at",
          "idx_access_events_ip_created",
          "idx_access_events_session",
          "idx_access_events_event_id",
          "idx_access_events_unique_paid_entry",
          "idx_access_events_paid_entry",
          "idx_access_events_event_type",
          "idx_admin_sessions_expires",
        ];
        for (const expectedIdx of expectedIndexes) {
          assert.equal(
            indexNames.has(expectedIdx),
            true,
            `Índice obrigatório "${expectedIdx}" deve existir no PostgreSQL`,
          );
        }

        // 5. Prioridade 2 — Concorrência Multi-Instância Real (5 instâncias independentes do backend sem compartilhar memória)
        const backendInstances = Array.from({ length: 5 }, () => {
          const instanceRepo = new PostgresMonitoringRepository(appPool);
          return new CollectorService(instanceRepo);
        });

        const sharedSessionId = "99999999-9999-4999-8999-999999999999";
        const ipResult = {
          clientIp: "177.200.100.50",
          ipSource: "x_forwarded_for" as const,
          ipHeaderMismatch: false,
          spoofAttemptDetected: false,
        };
        const now = new Date("2026-11-06T12:00:00Z");
        const ua = "Mozilla/5.0 (Linux; Android 14) Chrome/131.0 Mobile";

        // 25 requisições paralelas distribuídas entre as 5 instâncias independentes do backend para a mesma sessão e GCLID
        const multiInstanceTasks = Array.from({ length: 25 }, (_, i) => {
          const instance = backendInstances[i % backendInstances.length]!;
          const sanitized = validateAndSanitizeCollectPayload(
            {
              sessionId: sharedSessionId,
              eventType: "page_view",
              pageUrl:
                "https://memorettiguinchos.com.br/?gclid=EAIaIQobChMI_MULTI_INST_01&utm_source=google&utm_medium=cpc&utm_campaign=cid-21849085989",
              pagePath: i === 0 ? "/" : "/guincho-zona-oeste-sp",
            },
            ua,
          );
          assert(sanitized.ok);
          return instance.recordEvent(
            sanitized.data,
            ipResult,
            new Date(now.getTime() + i * 10),
          );
        });

        const multiInstanceResults = await Promise.all(multiInstanceTasks);
        assert.equal(multiInstanceResults.length, 25);

        const newVisitsCount = multiInstanceResults.filter(
          (r) => r.isNewVisit,
        ).length;
        const paidEntriesCount = multiInstanceResults.filter(
          (r) => r.isPaidEntry,
        ).length;

        assert.equal(
          newVisitsCount,
          1,
          "Múltiplas instâncias concorrentes devem produzir exatamente 1 is_new_visit = TRUE graças ao pg_advisory_xact_lock",
        );
        assert.equal(
          paidEntriesCount,
          1,
          "Múltiplas instâncias concorrentes devem produzir exatamente 1 is_paid_entry = TRUE",
        );

        // 6. Idempotência de eventId entre 5 instâncias independentes simultâneas
        const sharedEventId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
        const idempotentPayload = validateAndSanitizeCollectPayload(
          {
            sessionId: sharedSessionId,
            eventId: sharedEventId,
            eventType: "page_view",
            pageUrl: "https://memorettiguinchos.com.br/guincho-osasco",
          },
          ua,
        );
        assert(idempotentPayload.ok);

        const idempotentResults = await Promise.all(
          backendInstances.map((instance) =>
            instance.recordEvent(
              idempotentPayload.data,
              ipResult,
              new Date(now.getTime() + 500),
            ),
          ),
        );
        const uniqueEventDbIds = new Set(idempotentResults.map((r) => r.id));
        assert.equal(
          uniqueEventDbIds.size,
          1,
          "O mesmo eventId enviado simultaneamente para 5 instâncias diferentes do backend deve gerar apenas 1 linha no PostgreSQL",
        );

        // 7. Deduplicação de rajada de cliques no WhatsApp (< 1000ms) entre 5 instâncias independentes
        const burstClickPayload = validateAndSanitizeCollectPayload(
          {
            sessionId: sharedSessionId,
            eventType: "whatsapp_click",
            pageUrl: "https://memorettiguinchos.com.br/guincho-osasco",
            buttonLocation: "hero_principal",
            contactTarget: "https://wa.me/5511930299233",
          },
          ua,
        );
        assert(burstClickPayload.ok);

        await Promise.all(
          backendInstances.map((instance, idx) =>
            instance.recordEvent(
              burstClickPayload.data,
              ipResult,
              new Date(now.getTime() + 1000 + idx * 50),
            ),
          ),
        );

        // 8. Verificação via Repositório e Servidor HTTP conectado ao PostgreSQL real
        const primaryRepo = new PostgresMonitoringRepository(appPool);
        await primaryRepo.createAdminUser(
          "admin_pg_real",
          hashPassword("SenhaPostgres#2026"),
        );

        const summary = await primaryRepo.getMetricsSummary(
          24,
          new Date(now.getTime() + 5000),
        );
        assert.equal(
          summary.totalRequests,
          27,
          "25 page_views + 1 page_view idempotente + 1 whatsapp_click deduplicado = 27 registros",
        );
        assert.equal(summary.totalVisits, 1);
        assert.equal(summary.identifiedPaidEntries, 1);
        assert.equal(summary.whatsappClicks, 1);
        assert.equal(summary.paidWhatsappClicks, 1);
        assert.equal(summary.uniqueIps, 1);

        // Testa servidor HTTP real sobre o PostgreSQL (Login, CSRF, Summary, IP List, IP History, Investigated IPs, Export CSV/JSON, Logout)
        const server = createMonitoringServer({
          repo: primaryRepo,
          ipOptions: {
            trustedProxyCidrs: ["127.0.0.1/32"],
            maxTrustedProxyHops: 1,
            rejectPrivateClientIps: false,
          },
          allowedOrigin: "https://memorettiguinchos.com.br",
          nowProvider: () => new Date(now.getTime() + 5000),
        });

        await new Promise<void>((resolve) =>
          server.listen(0, "127.0.0.1", resolve),
        );
        const port = (server.address() as AddressInfo).port;
        const baseUrl = `http://127.0.0.1:${port}`;

        try {
          const loginRes = await fetch(`${baseUrl}/api/v1/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: "admin_pg_real",
              password: "SenhaPostgres#2026",
            }),
          });
          assert.equal(loginRes.status, 200);
          const cookie =
            (loginRes.headers.get("set-cookie") ?? "").split(";")[0] ?? "";
          const authHeaders = {
            Cookie: cookie,
            Origin: "https://memorettiguinchos.com.br",
          };

          // Marca IP investigado no PostgreSQL (tipo nativo INET + ON CONFLICT DO UPDATE)
          const invRes = await fetch(
            `${baseUrl}/api/v1/admin/investigated-ips`,
            {
              method: "POST",
              headers: {
                ...authHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ipAddress: "177.200.100.50",
                status: "suspeito_ads",
                notes: "Validado no PostgreSQL 17 real",
              }),
            },
          );
          assert.equal(invRes.status, 200);

          // Consulta listagem agregada de IPs no PostgreSQL
          const ipsRes = await fetch(
            `${baseUrl}/api/v1/admin/ips?hours=24&status=suspeito_ads&onlyPaidEntries=true&page=1&limit=10`,
            { headers: authHeaders },
          );
          assert.equal(ipsRes.status, 200);
          const ipsBody = (await ipsRes.json()) as {
            items: {
              ipAddress: string;
              totalRequests: number;
              totalVisits: number;
              identifiedPaidEntries: number;
              whatsappClicks: number;
              investigation: { status: string; notes: string } | null;
            }[];
            pagination: { totalItems: number };
          };
          assert.equal(ipsBody.pagination.totalItems, 1);
          assert.equal(ipsBody.items[0]?.ipAddress, "177.200.100.50");
          assert.equal(ipsBody.items[0]?.totalRequests, 27);
          assert.equal(ipsBody.items[0]?.totalVisits, 1);
          assert.equal(ipsBody.items[0]?.identifiedPaidEntries, 1);
          assert.equal(ipsBody.items[0]?.whatsappClicks, 1);
          assert.equal(
            ipsBody.items[0]?.investigation?.status,
            "suspeito_ads",
          );

          // Consulta histórico detalhado do IP no PostgreSQL
          const histRes = await fetch(
            `${baseUrl}/api/v1/admin/ips/177.200.100.50/history?hours=24&page=1&limit=5`,
            { headers: authHeaders },
          );
          assert.equal(histRes.status, 200);
          const histBody = (await histRes.json()) as {
            summary: { paidClickIds: string[] };
            events: unknown[];
            pagination: { totalItems: number; totalPages: number };
          };
          assert.deepEqual(histBody.summary.paidClickIds, [
            "EAIaIQobChMI_MULTI_INST_01",
          ]);
          assert.equal(histBody.events.length, 5);
          assert.equal(histBody.pagination.totalItems, 27);
          assert.equal(histBody.pagination.totalPages, 6);

          // Exportação CSV real a partir do PostgreSQL
          const exportRes = await fetch(
            `${baseUrl}/api/v1/admin/export?type=events&format=csv&limit=10`,
            { headers: authHeaders },
          );
          assert.equal(exportRes.status, 200);
          const csvContent = await exportRes.text();
          assert.equal(csvContent.includes("177.200.100.50"), true);
        } finally {
          await new Promise<void>((resolve) => server.close(() => resolve()));
        }

        // 9. Expurgo de registros expirados (retenção de 30 dias + função PL/pgSQL nativa)
        const oldDate = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000);
        const oldSanitized = validateAndSanitizeCollectPayload(
          {
            sessionId: "12121212-1212-4212-8212-121212121212",
            eventType: "page_view",
            pageUrl: "https://memorettiguinchos.com.br/",
          },
          ua,
        );
        assert(oldSanitized.ok);
        await backendInstances[0]!.recordEvent(
          oldSanitized.data,
          ipResult,
          oldDate,
        );

        const purgedByFunc = await appPool.query<{
          purge_expired_monitoring_data: string;
        }>(`SELECT purge_expired_monitoring_data(30)`);
        assert.equal(
          Number(purgedByFunc.rows[0]?.purge_expired_monitoring_data ?? 0),
          1,
          "A função nativa PL/pgSQL purge_expired_monitoring_data(30) deve remover o evento de 35 dias atrás preservando os recentes",
        );
      } finally {
        await appPool.end().catch(() => {});
      }
    } finally {
      if (setupClient) setupClient.release();
      await adminSetupPool
        .query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`)
        .catch(() => {});
      await adminSetupPool
        .query(`DROP OWNED BY ${restrictedRole} CASCADE`)
        .catch(() => {});
      await adminSetupPool
        .query(`DROP ROLE IF EXISTS ${restrictedRole}`)
        .catch(() => {});
      await adminSetupPool.end().catch(() => {});
    }
  });
});
