import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { AddressInfo } from "node:net";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  InMemoryMonitoringRepository,
  PostgresMonitoringRepository,
  type SqlPoolLike,
} from "../src/db/repository.ts";
import {
  extractClientIp,
  ipMatchesCidr,
  normalizeIp,
  validateIpExtractionConfig,
} from "../src/ip/extractClientIp.ts";
import {
  countNumericDigits,
  minimizeReferrer,
  minimizeUserAgent,
  sanitizeClickId,
  sanitizeContactTarget,
  sanitizeUtmValue,
  validateAndSanitizeCollectPayload,
} from "../src/privacy/sanitizer.ts";
import { RetentionScheduler } from "../src/retention/retentionJob.ts";
import {
  extractAuthTokenFromHeaders,
  hashPassword,
  verifyPassword,
  verifyPasswordConstantTime,
} from "../src/security/auth.ts";
import { createSignedBridgeHeaders } from "../src/security/bridgeAuth.ts";
import { createMonitoringServer } from "../src/server.ts";
import { CollectorService } from "../src/services/collectorService.ts";

describe("Etapa 2 — Serviço Isolado de Monitoramento (Segurança, IP Real, Atribuição e LGPD)", () => {
  describe("1. Extração Segura do IP Real e Cadeia de Proxies", () => {
    const strictTraefikOptions = {
      trustedProxyCidrs: ["172.18.0.2/32"],
      maxTrustedProxyHops: 1,
      rejectPrivateClientIps: true,
    };

    it("não confia automaticamente em outros containers da mesma sub-rede Docker (ex.: 172.18.0.99)", () => {
      const res = extractClientIp(
        "172.18.0.99",
        {
          "x-forwarded-for": "189.40.50.60",
          "x-real-ip": "189.40.50.60",
        },
        strictTraefikOptions,
      );

      assert.equal(res.clientIp, "172.18.0.99");
      assert.equal(res.ipSource, "socket_direct");
      assert.equal(res.spoofAttemptDetected, true);
    });

    it("rejeita spoofing de X-Forwarded-For à esquerda quando a requisição passa pelo Traefik confiável", () => {
      // Visitante malicioso envia "X-Forwarded-For: 1.1.1.1, 8.8.8.8"
      // Traefik (172.18.0.2) anexa o IP real do visitante (177.100.200.50) ao final
      const res = extractClientIp(
        "::ffff:172.18.0.2",
        {
          "x-forwarded-for": "1.1.1.1, 8.8.8.8, 177.100.200.50",
          "x-real-ip": "177.100.200.50",
        },
        strictTraefikOptions,
      );

      assert.equal(res.clientIp, "177.100.200.50");
      assert.equal(res.ipSource, "x_forwarded_for");
      assert.equal(res.ipHeaderMismatch, false);
      assert.equal(res.spoofAttemptDetected, true);
    });

    it("detecta divergência entre X-Forwarded-For e X-Real-IP (ipHeaderMismatch = true)", () => {
      const res = extractClientIp(
        "172.18.0.2",
        {
          "x-forwarded-for": "177.100.200.50",
          "x-real-ip": "200.147.67.142",
        },
        strictTraefikOptions,
      );

      assert.equal(res.clientIp, "177.100.200.50");
      assert.equal(res.ipHeaderMismatch, true);
    });

    it("rejeita IPs privados/loopback forjados em X-Forwarded-For quando rejectPrivateClientIps=true", () => {
      const res = extractClientIp(
        "172.18.0.2",
        {
          "x-forwarded-for": "127.0.0.1",
          "x-real-ip": "127.0.0.1",
        },
        strictTraefikOptions,
      );

      assert.equal(res.clientIp, "172.18.0.2");
      assert.equal(res.ipSource, "socket_direct");
      assert.equal(res.spoofAttemptDetected, true);
    });

    it("suporta múltiplos proxies confiáveis configurados explicitamente (ex.: Cloudflare + Traefik)", () => {
      const multiHopOptions = {
        trustedProxyCidrs: ["172.18.0.2/32", "173.245.48.0/20"],
        maxTrustedProxyHops: 2,
        rejectPrivateClientIps: true,
      };

      // Cliente forja 9.9.9.9 -> passa pelo Cloudflare (173.245.48.10) -> chega ao Traefik (172.18.0.2)
      const res = extractClientIp(
        "172.18.0.2",
        {
          "x-forwarded-for": "9.9.9.9, 187.12.34.56, 173.245.48.10",
        },
        multiHopOptions,
      );

      assert.equal(res.clientIp, "187.12.34.56");
      assert.equal(res.spoofAttemptDetected, true);
    });

    it("normaliza IPv6 e IPv4-mapped IPv6 e valida CIDRs corretamente", () => {
      assert.equal(normalizeIp("::ffff:192.0.2.128"), "192.0.2.128");
      assert.equal(normalizeIp("[2001:db8::1]:443"), "2001:db8::1");
      assert.equal(ipMatchesCidr("2001:db8:0:0:1::1", "2001:db8::/32"), true);
      assert.equal(ipMatchesCidr("2001:db9::1", "2001:db8::/32"), false);
    });
  });

  describe("2. Sanitização Estrutural (Não Dependente Exclusivamente de Regex) e Minimização LGPD", () => {
    it("bloqueia PII em parâmetros UTM mesmo com duplo URL-encoding ou formatação atípica", () => {
      // Duplo encoding de '@' (%2540 -> %40 -> @)
      assert.equal(sanitizeUtmValue("cliente%2540gmail.com"), null);

      // Telefone com pontos e espaços (11 dígitos numéricos contados por ASCII)
      assert.equal(countNumericDigits("(11) 9.9836.9565"), 11);
      assert.equal(sanitizeUtmValue("ligue (11) 9.9836.9565"), null);

      // CPF sem pontuação ou com barras
      assert.equal(sanitizeUtmValue("12345678901"), null);

      // UTM legítima de campanha passa normalmente
      assert.equal(sanitizeUtmValue("guincho_zona_oeste_24h"), "guincho_zona_oeste_24h");
    });

    it("valida estruturalmente gclid/wbraid/gbraid por conjunto estrito de caracteres", () => {
      assert.equal(
        sanitizeClickId("EAIaIQobChMI_Valid-Click_12345"),
        "EAIaIQobChMI_Valid-Click_12345",
      );
      assert.equal(sanitizeClickId("gclid com espaco"), null);
      assert.equal(sanitizeClickId("gclid<script>"), null);
      assert.equal(sanitizeClickId("ab"), null); // menor que 4 chars
    });

    it("remove ?text= e qualquer dado pessoal de contactTarget", () => {
      const target =
        "https://wa.me/5511998369565?text=Nome%3A%20Joao%20Telefone%3A%2011999998888";
      assert.equal(sanitizeContactTarget(target), "https://wa.me/5511998369565");
    });

    it("minimiza User-Agent e Referrer descartando strings completas (LGPD)", () => {
      const ua = minimizeUserAgent(
        "Mozilla/5.0 (Linux; Android 14; SM-S918B Build/UP1A.231005.007) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.39 Mobile Safari/537.36",
      );
      assert.deepEqual(ua, {
        browserFamily: "Chrome",
        osFamily: "Android",
        deviceType: "mobile",
      });

      const ref = minimizeReferrer(
        "https://www.google.com.br/search?q=guincho+perto+da+rua+martinho+538&oq=guincho",
      );
      assert.equal(ref, "https://www.google.com.br");
    });
  });

  describe("3. Separação de Requisições, Visitas, Entradas Pagas Identificadas e Eventos de Contato", () => {
    it("diferencia F5/reload e navegação interna sem inflar Visitas nem Entradas Pagas Identificadas", async () => {
      const repo = new InMemoryMonitoringRepository();
      const collector = new CollectorService(repo);
      const sessionId = "550e8400-e29b-41d4-a716-446655440000";
      const ipInfo = {
        clientIp: "189.10.20.30",
        ipSource: "x_forwarded_for" as const,
        ipHeaderMismatch: false,
        spoofAttemptDetected: false,
      };
      const uaMobile =
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

      const baseTime = new Date("2026-11-05T14:00:00Z");

      // 1. Entrada inicial via anúncio do Google Ads na Home (/?gclid=EAIaIQobChMI_ADS_001)
      const p1 = validateAndSanitizeCollectPayload(
        {
          sessionId,
          eventType: "page_view",
          pageUrl:
            "https://memorettiguinchos.com.br/?gclid=EAIaIQobChMI_ADS_001&utm_source=google&utm_medium=cpc&utm_campaign=socorro_24h",
          pagePath: "/",
          referrer: "https://www.google.com/",
        },
        uaMobile,
      );
      assert.equal(p1.ok, true);
      const ev1 = await collector.recordEvent(p1.data, ipInfo, baseTime);
      assert.equal(ev1.isNewVisit, true);
      assert.equal(ev1.isPaidEntry, true);
      assert.equal(ev1.trafficCategory, "paid_google");

      // 2. Visitante dá F5 (reload) na mesma URL com o mesmo gclid 10 segundos depois
      const p2 = validateAndSanitizeCollectPayload(
        {
          sessionId,
          eventType: "page_view",
          pageUrl:
            "https://memorettiguinchos.com.br/?gclid=EAIaIQobChMI_ADS_001&utm_source=google&utm_medium=cpc&utm_campaign=socorro_24h",
          pagePath: "/",
        },
        uaMobile,
      );
      assert.equal(p2.ok, true);
      const ev2 = await collector.recordEvent(
        p2.data,
        ipInfo,
        new Date(baseTime.getTime() + 10_000),
      );
      assert.equal(ev2.isNewVisit, false, "Reload não deve contar nova visita");
      assert.equal(
        ev2.isPaidEntry,
        false,
        "Reload com mesmo GCLID não deve contar nova Entrada Paga Identificada",
      );
      assert.equal(ev2.trafficCategory, "paid_google");

      // 3. Visitante navega internamente para /solicitar-orcamento (sem query string de gclid)
      const p3 = validateAndSanitizeCollectPayload(
        {
          sessionId,
          eventType: "page_view",
          pageUrl: "https://memorettiguinchos.com.br/solicitar-orcamento",
          pagePath: "/solicitar-orcamento",
        },
        uaMobile,
      );
      assert.equal(p3.ok, true);
      const ev3 = await collector.recordEvent(
        p3.data,
        ipInfo,
        new Date(baseTime.getTime() + 25_000),
      );
      assert.equal(ev3.isNewVisit, false);
      assert.equal(ev3.isPaidEntry, false);
      assert.equal(
        ev3.trafficCategory,
        "paid_google",
        "Navegação interna deve herdar a atribuição paga da sessão",
      );
      assert.equal(ev3.paidClickId, "EAIaIQobChMI_ADS_001");

      // 4. Visitante clica no botão de WhatsApp do formulário (com ?text= contendo PII na origem)
      const p4 = validateAndSanitizeCollectPayload(
        {
          sessionId,
          eventType: "whatsapp_click",
          pageUrl: "https://memorettiguinchos.com.br/solicitar-orcamento",
          pagePath: "/solicitar-orcamento",
          buttonLocation: "form_orcamento_submit",
          contactTarget:
            "https://wa.me/5511998369565?text=Nome%3A%20Cliente%20Secreto%20Tel%3A%2011999990000",
        },
        uaMobile,
      );
      assert.equal(p4.ok, true);
      const ev4 = await collector.recordEvent(
        p4.data,
        ipInfo,
        new Date(baseTime.getTime() + 40_000),
      );
      assert.equal(ev4.isNewVisit, false);
      assert.equal(ev4.isPaidEntry, false);
      assert.equal(ev4.eventType, "whatsapp_click");
      assert.equal(ev4.trafficCategory, "paid_google");
      assert.equal(ev4.paidClickId, "EAIaIQobChMI_ADS_001");
      assert.equal(ev4.contactTarget, "https://wa.me/5511998369565");

      // 5. Visitante também aciona o botão de Telefone
      const p5 = validateAndSanitizeCollectPayload(
        {
          sessionId,
          eventType: "phone_click",
          pageUrl: "https://memorettiguinchos.com.br/solicitar-orcamento",
          pagePath: "/solicitar-orcamento",
          buttonLocation: "form_orcamento_phone_direct",
          contactTarget: "tel:+5511998369565",
        },
        uaMobile,
      );
      assert.equal(p5.ok, true);
      await collector.recordEvent(
        p5.data,
        ipInfo,
        new Date(baseTime.getTime() + 50_000),
      );

      // Conferência consolidada do resumo da janela de 24h
      const summary = await repo.getMetricsSummary(
        24,
        new Date(baseTime.getTime() + 60_000),
      );
      assert.equal(summary.totalRequests, 5, "5 eventos registrados no total");
      assert.equal(summary.totalVisits, 1, "Apenas 1 visita/sessão iniciada");
      assert.equal(
        summary.identifiedPaidEntries,
        1,
        "Apenas 1 Entrada Paga Identificada",
      );
      assert.equal(summary.whatsappClicks, 1, "1 clique no WhatsApp");
      assert.equal(summary.phoneClicks, 1, "1 clique no Telefone");
      assert.equal(summary.uniqueIps, 1);

      // Verificação de zero PII nos registros persistidos
      const dump = JSON.stringify(repo.events);
      assert.equal(dump.includes("Cliente Secreto"), false);
      assert.equal(dump.includes("11999990000"), false);
    });
  });

  describe("4. Retenção Automática de 30 Dias (LGPD)", () => {
    it("remove automaticamente eventos com mais de 30 dias preservando registros recentes", async () => {
      const repo = new InMemoryMonitoringRepository();
      const collector = new CollectorService(repo);
      const retention = new RetentionScheduler(repo, 30);

      const now = new Date("2026-11-05T15:00:00Z");
      const thirtyOneDaysAgo = new Date(
        now.getTime() - 31 * 24 * 60 * 60 * 1000,
      );
      const twentyNineDaysAgo = new Date(
        now.getTime() - 29 * 24 * 60 * 60 * 1000,
      );

      const ipInfo = {
        clientIp: "200.100.50.25",
        ipSource: "x_forwarded_for" as const,
        ipHeaderMismatch: false,
        spoofAttemptDetected: false,
      };

      const oldPayload = validateAndSanitizeCollectPayload(
        {
          sessionId: "11111111-1111-4111-8111-111111111111",
          eventType: "page_view",
          pageUrl: "https://memorettiguinchos.com.br/",
        },
        "Mozilla/5.0 Chrome/130.0",
      );
      const recentPayload = validateAndSanitizeCollectPayload(
        {
          sessionId: "22222222-2222-4222-8222-222222222222",
          eventType: "page_view",
          pageUrl: "https://memorettiguinchos.com.br/",
        },
        "Mozilla/5.0 Chrome/130.0",
      );

      assert(oldPayload.ok);
      assert(recentPayload.ok);
      await collector.recordEvent(oldPayload.data, ipInfo, thirtyOneDaysAgo);
      await collector.recordEvent(recentPayload.data, ipInfo, twentyNineDaysAgo);
      assert.equal(repo.events.length, 2);

      const purgedCount = await retention.runOnce(now);
      assert.equal(purgedCount, 1);
      assert.equal(repo.events.length, 1);
      assert.equal(
        repo.events[0]?.sessionId,
        "22222222-2222-4222-8222-222222222222",
      );
    });
  });

  describe("5. Servidor HTTP: Autenticação, Rate Limiting, Prefetch e Isolamento Docker", () => {
    it("ignora prefetch, aplica rate-limit, exige autenticação em rotas admin e protege senhas com scrypt", async () => {
      const repo = new InMemoryMonitoringRepository();
      await repo.createAdminUser("manoel_admin", hashPassword("SenhaForte#2026"));

      assert.equal(
        verifyPassword("SenhaForte#2026", repo.admins[0]!.passwordHash),
        true,
      );
      assert.equal(
        verifyPassword("SenhaErrada", repo.admins[0]!.passwordHash),
        false,
      );

      const server = createMonitoringServer({
        repo,
        ipOptions: {
          trustedProxyCidrs: ["127.0.0.1/32"],
          maxTrustedProxyHops: 1,
          rejectPrivateClientIps: false,
        },
        allowedOrigin: "https://memorettiguinchos.com.br",
        rateLimitWindowMs: 60_000,
        rateLimitMaxEvents: 3,
        loginRateLimitMaxAttempts: 2,
      });

      await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
      const port = (server.address() as AddressInfo).port;
      const baseUrl = `http://127.0.0.1:${port}`;

      try {
        // 1. Requisição de Prefetch deve retornar 204 e não gravar evento
        const prefetchRes = await fetch(`${baseUrl}/api/v1/collect`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Next-Router-Prefetch": "1",
            "X-Forwarded-For": "177.50.60.70",
          },
          body: JSON.stringify({
            sessionId: "33333333-3333-4333-8333-333333333333",
            eventType: "page_view",
            pageUrl: "https://memorettiguinchos.com.br/",
          }),
        });
        assert.equal(prefetchRes.status, 204);
        assert.equal(repo.events.length, 0);

        // 2. Três requisições legítimas aceitas (202) e a 4ª bloqueada por Rate Limit (429)
        for (let i = 0; i < 3; i++) {
          const okRes = await fetch(`${baseUrl}/api/v1/collect`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Forwarded-For": "177.50.60.70",
            },
            body: JSON.stringify({
              sessionId: "33333333-3333-4333-8333-333333333333",
              eventType: "page_view",
              pageUrl: "https://memorettiguinchos.com.br/?gclid=EAIaIQobChMI_TEST999",
            }),
          });
          assert.equal(okRes.status, 202);
        }

        const rateLimitedRes = await fetch(`${baseUrl}/api/v1/collect`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Forwarded-For": "177.50.60.70",
          },
          body: JSON.stringify({
            sessionId: "33333333-3333-4333-8333-333333333333",
            eventType: "page_view",
            pageUrl: "https://memorettiguinchos.com.br/",
          }),
        });
        assert.equal(rateLimitedRes.status, 429);

        // 3. Acesso não autenticado ao resumo administrativo deve retornar 401
        const unauthRes = await fetch(`${baseUrl}/api/v1/admin/summary?hours=24`);
        assert.equal(unauthRes.status, 401);

        // 4. Login com credenciais válidas retorna cookie HttpOnly e permite ler /summary
        const loginRes = await fetch(`${baseUrl}/api/v1/admin/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Forwarded-For": "177.88.99.11",
          },
          body: JSON.stringify({
            username: "manoel_admin",
            password: "SenhaForte#2026",
          }),
        });
        assert.equal(loginRes.status, 200);
        const setCookie = loginRes.headers.get("set-cookie") ?? "";
        assert.equal(setCookie.includes("HttpOnly"), true);
        assert.equal(setCookie.includes("SameSite=Strict"), true);

        const cookiePair = setCookie.split(";")[0] ?? "";
        const authSummaryRes = await fetch(
          `${baseUrl}/api/v1/admin/summary?hours=24`,
          {
            headers: { Cookie: cookiePair },
          },
        );
        assert.equal(authSummaryRes.status, 200);
        const summaryBody = (await authSummaryRes.json()) as {
          summary: {
            totalRequests: number;
            totalVisits: number;
            identifiedPaidEntries: number;
          };
        };
        assert.equal(summaryBody.summary.totalRequests, 3);
        assert.equal(summaryBody.summary.totalVisits, 1);
        assert.equal(summaryBody.summary.identifiedPaidEntries, 1);
      } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });

    it("verifica estaticamente que o PostgreSQL no docker-compose.yml não expõe portas públicas e usa rede internal: true", () => {
      const composePath = join(
        import.meta.dirname,
        "..",
        "docker-compose.yml",
      );
      const composeContent = readFileSync(composePath, "utf8");
      const activeYamlLines = composeContent
        .split(/\r?\n/)
        .filter((line) => !line.trim().startsWith("#"))
        .join("\n");

      assert.equal(
        activeYamlLines.includes("ports:"),
        false,
        "docker-compose.yml não deve conter mapeamento público `ports:`",
      );
      assert.equal(
        activeYamlLines.includes("internal: true"),
        true,
        "A rede interna do banco deve declarar `internal: true`",
      );
    });

    it("garante queries SQL parametrizadas ($1, $2...) em PostgresMonitoringRepository contra SQL Injection", async () => {
      const queriesExecutadas: { text: string; values: unknown[] | undefined }[] = [];

      const fakePool: SqlPoolLike = {
        async query<R = Record<string, unknown>>(text: string, values?: unknown[]) {
          queriesExecutadas.push({ text, values });
          return { rows: [{ id: "1", total_requests: "1" }] as unknown as R[], rowCount: 1 };
        },
      };

      const pgRepo = new PostgresMonitoringRepository(fakePool);
      const maliciousInput = "'; DROP TABLE access_events; --";

      await pgRepo.findAdminByUsername(maliciousInput);
      await pgRepo.purgeExpiredData(30);

      assert.equal(queriesExecutadas.length, 3);
      assert.equal(
        queriesExecutadas[0]?.text.includes("DROP TABLE"),
        false,
        "O texto da query SQL jamais deve interpolar a entrada do usuário",
      );
      assert.deepEqual(queriesExecutadas[0]?.values, [maliciousInput]);
    });
  });

  describe("6. Etapa 3 — Revisão do Parser de IP (Traefik) e Sanitização de UTMs Legítimas", () => {
    it("não desloca leitura para token não confiável à esquerda se o salto à direita em X-Forwarded-For estiver corrompido", () => {
      const options = {
        trustedProxyCidrs: ["172.18.0.2/32"],
        maxTrustedProxyHops: 1,
        rejectPrivateClientIps: true,
      };

      // Se o token mais à direita for inválido ('corrupted_hop'), o parser NÃO pode aceitar '1.2.3.4' enviado pelo cliente
      const res = extractClientIp(
        "172.18.0.2",
        {
          "x-forwarded-for": "1.2.3.4, corrupted_hop",
          "x-real-ip": "177.55.66.77",
        },
        options,
      );

      assert.equal(res.clientIp, "177.55.66.77");
      assert.equal(res.ipSource, "x_real_ip");
      assert.equal(res.ipHeaderMismatch, true);
      assert.equal(res.spoofAttemptDetected, true);
    });

    it("sinaliza ipHeaderMismatch quando um peer privado fora de trustedProxyCidrs envia cabeçalhos de proxy (ex.: mudança de IP do container Traefik)", () => {
      const options = {
        trustedProxyCidrs: ["172.18.0.2/32"],
        maxTrustedProxyHops: 1,
        rejectPrivateClientIps: true,
      };

      const res = extractClientIp(
        "172.18.0.99",
        {
          "x-forwarded-for": "189.40.50.60",
          "x-real-ip": "189.40.50.60",
        },
        options,
      );

      assert.equal(res.clientIp, "172.18.0.99");
      assert.equal(res.ipSource, "socket_direct");
      assert.equal(res.ipHeaderMismatch, true);
      assert.equal(res.spoofAttemptDetected, true);
    });

    it("valida configuração de CIDRs do Traefik e alerta sobre sub-redes Docker excessivamente amplas", () => {
      const broadConfig = validateIpExtractionConfig({
        trustedProxyCidrs: ["172.16.0.0/12"],
        maxTrustedProxyHops: 1,
        rejectPrivateClientIps: true,
      });
      assert.equal(broadConfig.valid, true);
      assert.equal(broadConfig.warnings.length, 1);

      const strictConfig = validateIpExtractionConfig({
        trustedProxyCidrs: ["172.18.0.2/32"],
        maxTrustedProxyHops: 1,
        rejectPrivateClientIps: true,
      });
      assert.equal(strictConfig.valid, true);
      assert.equal(strictConfig.warnings.length, 0);

      const invalidConfig = validateIpExtractionConfig({
        trustedProxyCidrs: ["ip_invalido/99"],
        maxTrustedProxyHops: 0,
        rejectPrivateClientIps: true,
      });
      assert.equal(invalidConfig.valid, false);
      assert.equal(invalidConfig.errors.length >= 2, true);
    });

    it("aceita UTMs legítimas complexas do Google Ads (ValueTrack, datas, múltiplos números separados, cauda longa) e continua bloqueando PII", () => {
      // ValueTrack com dois-pontos e IDs longos prefixados
      assert.equal(
        sanitizeUtmValue("kwd-293847561029:loc-1001773"),
        "kwd-293847561029:loc-1001773",
      );
      assert.equal(
        sanitizeUtmValue("cid-21849085989_agid-168492039481"),
        "cid-21849085989_agid-168492039481",
      );
      assert.equal(
        sanitizeUtmValue("dsa-145678901234"),
        "dsa-145678901234",
      );

      // Datas de campanha + barra 24/7 + números curtos separados
      assert.equal(
        sanitizeUtmValue("campanha_2026-11-06_guincho_24/7_v2_lote35"),
        "campanha_2026-11-06_guincho_24/7_v2_lote35",
      );
      assert.equal(
        sanitizeUtmValue("guincho_sp_20261106_zona_oeste_7ton"),
        "guincho_sp_20261106_zona_oeste_7ton",
      );

      // Termos de busca de cauda longa (> 5 palavras até 12 palavras) e colchetes de correspondência exata
      assert.equal(
        sanitizeUtmValue("[guincho 24 horas zona oeste sp marginal tiete]"),
        "[guincho 24 horas zona oeste sp marginal tiete]",
      );
      assert.equal(
        sanitizeUtmValue("+guincho +socorro +24h +vila +anastacio +lapa +osasco"),
        "+guincho +socorro +24h +vila +anastacio +lapa +osasco",
      );

      // PII real continua estritamente bloqueada
      assert.equal(sanitizeUtmValue("cliente@dominio.com.br"), null);
      assert.equal(sanitizeUtmValue("(11) 99836-9565"), null);
      assert.equal(sanitizeUtmValue("+55 11 99836-9565"), null);
      assert.equal(sanitizeUtmValue("123.456.789-01"), null);
      assert.equal(sanitizeUtmValue("12345678901"), null);
      assert.equal(sanitizeUtmValue("https://site-malicioso.com/phishing"), null);
    });
  });

  describe("7. Etapa 3 — Concorrência e Deduplicação de Eventos e Sessões", () => {
    it("serializa 20 requisições simultâneas (Promise.all) na mesma sessão sem duplicar Visita nem Entrada Paga Identificada", async () => {
      const repo = new InMemoryMonitoringRepository();
      const collector = new CollectorService(repo);
      const sessionId = "77777777-7777-4777-8777-777777777777";
      const ipInfo = {
        clientIp: "189.55.66.77",
        ipSource: "x_forwarded_for" as const,
        ipHeaderMismatch: false,
        spoofAttemptDetected: false,
      };
      const ua = "Mozilla/5.0 (Linux; Android 14) Chrome/131.0 Mobile";
      const now = new Date("2026-11-06T10:00:00Z");

      const tasks = Array.from({ length: 20 }, (_, idx) => {
        const sanitized = validateAndSanitizeCollectPayload(
          {
            sessionId,
            eventType: "page_view",
            pageUrl:
              "https://memorettiguinchos.com.br/?gclid=EAIaIQobChMI_CONCURRENT_01&utm_source=google&utm_medium=cpc",
            pagePath: idx === 0 ? "/" : "/guincho-zona-oeste-sp",
          },
          ua,
        );
        assert(sanitized.ok);
        return collector.recordEvent(
          sanitized.data,
          ipInfo,
          new Date(now.getTime() + idx * 5),
        );
      });

      const results = await Promise.all(tasks);
      assert.equal(results.length, 20);

      const newVisits = results.filter((r) => r.isNewVisit);
      const paidEntries = results.filter((r) => r.isPaidEntry);

      assert.equal(
        newVisits.length,
        1,
        "Apenas 1 evento entre os 20 concorrentes pode iniciar nova visita",
      );
      assert.equal(
        paidEntries.length,
        1,
        "Apenas 1 evento entre os 20 concorrentes pode registrar Entrada Paga Identificada",
      );
    });

    it("deduplica eventos com mesmo eventId (idempotência) e cliques de contato repetidos em rajada (< 1000ms)", async () => {
      const repo = new InMemoryMonitoringRepository();
      const collector = new CollectorService(repo);
      const sessionId = "88888888-8888-4888-8888-888888888888";
      const eventId = "abababab-abab-4bab-8bab-abababababab";
      const ipInfo = {
        clientIp: "189.55.66.88",
        ipSource: "x_forwarded_for" as const,
        ipHeaderMismatch: false,
        spoofAttemptDetected: false,
      };
      const ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile";
      const now = new Date("2026-11-06T11:00:00Z");

      // 1. Duas chamadas com o mesmo eventId
      const p1 = validateAndSanitizeCollectPayload(
        {
          sessionId,
          eventId,
          eventType: "page_view",
          pageUrl: "https://memorettiguinchos.com.br/",
        },
        ua,
      );
      assert(p1.ok);
      const first = await collector.recordEvent(p1.data, ipInfo, now);
      const retry = await collector.recordEvent(
        p1.data,
        ipInfo,
        new Date(now.getTime() + 200),
      );
      assert.equal(first.id, retry.id);
      assert.equal(repo.events.length, 1);

      // 2. Rajada concorrente de 5 cliques idênticos no WhatsApp em 100ms (double-tap / retry)
      const clickPayload = validateAndSanitizeCollectPayload(
        {
          sessionId,
          eventType: "whatsapp_click",
          pageUrl: "https://memorettiguinchos.com.br/",
          buttonLocation: "hero_principal",
          contactTarget: "https://wa.me/5511930299233",
        },
        ua,
      );
      assert(clickPayload.ok);

      await Promise.all([
        collector.recordEvent(
          clickPayload.data,
          ipInfo,
          new Date(now.getTime() + 500),
        ),
        collector.recordEvent(
          clickPayload.data,
          ipInfo,
          new Date(now.getTime() + 550),
        ),
        collector.recordEvent(
          clickPayload.data,
          ipInfo,
          new Date(now.getTime() + 600),
        ),
      ]);

      const summary = await repo.getMetricsSummary(
        24,
        new Date(now.getTime() + 2000),
      );
      assert.equal(
        summary.whatsappClicks,
        1,
        "Rajada de cliques idênticos em < 1s deve ser deduplicada para 1 clique",
      );
      assert.equal(summary.totalRequests, 2);
    });

    it("deduplica entradas pagas baseadas exclusivamente em UTMs (sem GCLID) na mesma sessão e preserva GCLID anterior quando UTMs persistem", async () => {
      const repo = new InMemoryMonitoringRepository();
      const collector = new CollectorService(repo);
      const now = new Date("2026-11-06T12:15:00.000Z");
      const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0";
      const ipInfo = {
        clientIp: "189.40.50.60",
        ipSource: "x_forwarded_for" as const,
        ipHeaderMismatch: false,
        spoofAttemptDetected: false,
      };

      // Cenário A: Sessão iniciada exclusivamente via UTMs pagas (sem gclid)
      // Evento 1: Landing com utm_source=google&utm_medium=cpc&utm_campaign=guincho-barueri
      const sessionUtm = "99999999-9999-4999-8999-999999999991";
      const ev1 = validateAndSanitizeCollectPayload(
        {
          sessionId: sessionUtm,
          eventType: "page_view",
          pageUrl:
            "https://memorettiguinchos.com.br/?utm_source=google&utm_medium=cpc&utm_campaign=guincho-barueri",
        },
        ua,
      );
      assert(ev1.ok);
      const rec1 = await collector.recordEvent(ev1.data, ipInfo, now);
      assert.equal(rec1.isNewVisit, true);
      assert.equal(rec1.isPaidEntry, true);
      assert.equal(rec1.paidClickType, "utm_paid");

      // Evento 2 na mesma sessão: página interna onde utm_campaign foi omitida ou variou (sem gclid)
      const ev2 = validateAndSanitizeCollectPayload(
        {
          sessionId: sessionUtm,
          eventType: "page_view",
          pageUrl:
            "https://memorettiguinchos.com.br/guincho-osasco?utm_source=google&utm_medium=cpc",
        },
        ua,
      );
      assert(ev2.ok);
      const rec2 = await collector.recordEvent(
        ev2.data,
        ipInfo,
        new Date(now.getTime() + 5000),
      );
      assert.equal(rec2.isNewVisit, false);
      assert.equal(
        rec2.isPaidEntry,
        false,
        "Navegação interna na mesma sessão com apenas UTMs não pode inflar entradas pagas identificadas",
      );
      assert.equal(rec2.utmCampaign, "guincho-barueri");

      // Evento 3 na mesma sessão: outra variação de utm_campaign na mesma sessão ativa
      const ev3 = validateAndSanitizeCollectPayload(
        {
          sessionId: sessionUtm,
          eventType: "whatsapp_click",
          pageUrl:
            "https://memorettiguinchos.com.br/guincho-osasco?utm_source=google&utm_medium=cpc&utm_campaign=remarketing",
          buttonLocation: "hero_principal",
          contactTarget: "https://wa.me/5511930299233",
        },
        ua,
      );
      assert(ev3.ok);
      const rec3 = await collector.recordEvent(
        ev3.data,
        ipInfo,
        new Date(now.getTime() + 10000),
      );
      assert.equal(rec3.isPaidEntry, false);

      // Cenário B: Sessão iniciada com GCLID explícito + UTMs, seguida por evento que reteve apenas UTMs
      const sessionGclid = "99999999-9999-4999-8999-999999999992";
      const evG1 = validateAndSanitizeCollectPayload(
        {
          sessionId: sessionGclid,
          eventType: "page_view",
          pageUrl:
            "https://memorettiguinchos.com.br/?gclid=EAIaIQobChMI_UTM_PRESERVE_99&utm_source=google&utm_medium=cpc&utm_campaign=campanha-forte",
        },
        ua,
      );
      assert(evG1.ok);
      const recG1 = await collector.recordEvent(evG1.data, ipInfo, now);
      assert.equal(recG1.isPaidEntry, true);
      assert.equal(recG1.paidClickType, "gclid");
      assert.equal(recG1.paidClickId, "EAIaIQobChMI_UTM_PRESERVE_99");

      const evG2 = validateAndSanitizeCollectPayload(
        {
          sessionId: sessionGclid,
          eventType: "page_view",
          pageUrl:
            "https://memorettiguinchos.com.br/empilhadeiras?utm_source=google&utm_medium=cpc&utm_campaign=campanha-forte",
        },
        ua,
      );
      assert(evG2.ok);
      const recG2 = await collector.recordEvent(
        evG2.data,
        ipInfo,
        new Date(now.getTime() + 8000),
      );
      assert.equal(
        recG2.isPaidEntry,
        false,
        "Sessão iniciada com GCLID não pode contar nova entrada paga quando evento subsequente traz apenas UTMs",
      );
      assert.equal(
        recG2.paidClickType,
        "gclid",
        "Deve preservar paidClickType=gclid herdado da sessão em vez de rebaixar para utm_paid",
      );
      assert.equal(recG2.paidClickId, "EAIaIQobChMI_UTM_PRESERVE_99");

      const summary = await repo.getMetricsSummary(
        24,
        new Date(now.getTime() + 15000),
      );
      assert.equal(summary.totalVisits, 2);
      assert.equal(summary.identifiedPaidEntries, 2);
      assert.equal(summary.totalRequests, 5);
    });
  });

  describe("8. Etapa 3 — Endpoints Administrativos, Autorização, Paginação, Filtros, Exportação e Segurança", () => {
    it("bloqueia acesso não autorizado (401) em TODOS os endpoints administrativos, inclusive exportações, sem vazar dados sensíveis", async () => {
      const repo = new InMemoryMonitoringRepository();
      const server = createMonitoringServer({
        repo,
        ipOptions: {
          trustedProxyCidrs: ["127.0.0.1/32"],
          maxTrustedProxyHops: 1,
          rejectPrivateClientIps: false,
        },
        allowedOrigin: "https://memorettiguinchos.com.br",
      });

      await new Promise<void>((resolve) =>
        server.listen(0, "127.0.0.1", resolve),
      );
      const port = (server.address() as AddressInfo).port;
      const baseUrl = `http://127.0.0.1:${port}`;

      try {
        const protectedRoutes: { method: string; path: string; body?: unknown }[] = [
          { method: "GET", path: "/api/v1/admin/session" },
          { method: "POST", path: "/api/v1/admin/logout" },
          { method: "GET", path: "/api/v1/admin/summary?hours=24" },
          { method: "GET", path: "/api/v1/admin/ips?page=1&limit=10" },
          { method: "GET", path: "/api/v1/admin/ips/177.10.20.30/history" },
          { method: "GET", path: "/api/v1/admin/ip-history?ip=177.10.20.30" },
          { method: "GET", path: "/api/v1/admin/investigated-ips" },
          {
            method: "POST",
            path: "/api/v1/admin/investigated-ips",
            body: { ipAddress: "177.10.20.30", status: "suspeito_ads" },
          },
          {
            method: "PUT",
            path: "/api/v1/admin/ips/177.10.20.30/investigation",
            body: { status: "em_observacao", notes: "Teste" },
          },
          {
            method: "DELETE",
            path: "/api/v1/admin/investigated-ips/177.10.20.30",
          },
          { method: "GET", path: "/api/v1/admin/export?type=events&format=json" },
          { method: "GET", path: "/api/v1/admin/export?type=events&format=csv" },
          { method: "GET", path: "/api/v1/admin/export?type=ips&format=csv" },
          {
            method: "GET",
            path: "/api/v1/admin/export?type=investigated_ips&format=csv",
          },
        ];

        for (const route of protectedRoutes) {
          // 1. Sem credenciais
          const resNoAuth = await fetch(`${baseUrl}${route.path}`, {
            method: route.method,
            headers: route.body
              ? { "Content-Type": "application/json" }
              : undefined,
            body: route.body ? JSON.stringify(route.body) : undefined,
          });
          assert.equal(
            resNoAuth.status,
            401,
            `Rota ${route.method} ${route.path} deve exigir autenticação (401)`,
          );
          assert.equal(
            resNoAuth.headers.get("cache-control")?.includes("no-store"),
            true,
            `Rota ${route.path} deve incluir Cache-Control: no-store`,
          );

          // 2. Com token adulterado/forjado
          const resForged = await fetch(`${baseUrl}${route.path}`, {
            method: route.method,
            headers: {
              Authorization:
                "Bearer token_forjado_invalido_com_mais_de_32_caracteres_12345",
              ...(route.body ? { "Content-Type": "application/json" } : {}),
            },
            body: route.body ? JSON.stringify(route.body) : undefined,
          });
          assert.equal(resForged.status, 401);
        }
      } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });

    it("protege contra manipulação de sessão (múltiplos cookies, divergência Cookie/Bearer, caracteres inválidos, expiração, logout e CSRF)", async () => {
      // Validação unitária do extrator de token contra manipulação de cabeçalhos
      assert.equal(
        extractAuthTokenFromHeaders({
          cookie:
            "meg_admin_session=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA; meg_admin_session=BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
        }),
        null,
        "Múltiplos cookies meg_admin_session (Cookie Tossing) devem ser rejeitados",
      );

      assert.equal(
        extractAuthTokenFromHeaders({
          cookie:
            "meg_admin_session=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          authorization:
            "Bearer BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
        }),
        null,
        "Divergência entre Cookie e Authorization Bearer deve ser rejeitada",
      );

      assert.equal(
        extractAuthTokenFromHeaders({
          authorization:
            "Bearer token_com_injetor_sql_';DROP TABLE admin_sessions;--",
        }),
        null,
        "Tokens fora do alfabeto base64url devem ser rejeitados",
      );

      // Verificação constante para usuário inexistente
      assert.equal(
        verifyPasswordConstantTime("qualquer_senha", null),
        false,
      );

      let currentNow = new Date("2026-11-06T12:00:00Z");
      const repo = new InMemoryMonitoringRepository();
      await repo.createAdminUser("admin_sec", hashPassword("Seguranca#2026"));

      const server = createMonitoringServer({
        repo,
        ipOptions: {
          trustedProxyCidrs: ["127.0.0.1/32"],
          maxTrustedProxyHops: 1,
          rejectPrivateClientIps: false,
        },
        allowedOrigin: "https://memorettiguinchos.com.br",
        nowProvider: () => currentNow,
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
            username: "admin_sec",
            password: "Seguranca#2026",
          }),
        });
        assert.equal(loginRes.status, 200);
        const cookiePair =
          (loginRes.headers.get("set-cookie") ?? "").split(";")[0] ?? "";

        // Sessão ativa funciona
        const sessionOk = await fetch(`${baseUrl}/api/v1/admin/session`, {
          headers: { Cookie: cookiePair },
        });
        assert.equal(sessionOk.status, 200);

        // Mutação com Origin malicioso (CSRF) deve retornar 403
        const csrfRes = await fetch(
          `${baseUrl}/api/v1/admin/investigated-ips`,
          {
            method: "POST",
            headers: {
              Cookie: cookiePair,
              Origin: "https://atacante-externo.com",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ipAddress: "177.10.20.30",
              status: "suspeito_ads",
            }),
          },
        );
        assert.equal(csrfRes.status, 403);

        // Avança o relógio além das 12h de TTL da sessão -> deve expirar (401)
        currentNow = new Date("2026-11-07T01:00:00Z");
        const expiredRes = await fetch(`${baseUrl}/api/v1/admin/session`, {
          headers: { Cookie: cookiePair },
        });
        assert.equal(expiredRes.status, 401);

        // Novo login e invalidação imediata via POST /api/v1/admin/logout
        const reloginRes = await fetch(`${baseUrl}/api/v1/admin/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "admin_sec",
            password: "Seguranca#2026",
          }),
        });
        const newCookie =
          (reloginRes.headers.get("set-cookie") ?? "").split(";")[0] ?? "";

        const logoutRes = await fetch(`${baseUrl}/api/v1/admin/logout`, {
          method: "POST",
          headers: {
            Cookie: newCookie,
            Origin: "https://memorettiguinchos.com.br",
          },
        });
        assert.equal(logoutRes.status, 200);

        // Reutilização do token após logout deve falhar com 401
        const reuseAfterLogout = await fetch(
          `${baseUrl}/api/v1/admin/summary`,
          {
            headers: { Cookie: newCookie },
          },
        );
        assert.equal(reuseAfterLogout.status, 401);
      } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });

    it("bloqueia força bruta distribuída (múltiplos IPs tentando adivinhar a senha da mesma conta administrativa)", async () => {
      const repo = new InMemoryMonitoringRepository();
      await repo.createAdminUser("manoel_alvo", hashPassword("SenhaCorreta#2026"));

      const server = createMonitoringServer({
        repo,
        ipOptions: {
          trustedProxyCidrs: ["127.0.0.1/32"],
          maxTrustedProxyHops: 1,
          rejectPrivateClientIps: false,
        },
        allowedOrigin: "https://memorettiguinchos.com.br",
        loginRateLimitMaxAttempts: 2, // limite por IP = 2; limite por username = 4
      });

      await new Promise<void>((resolve) =>
        server.listen(0, "127.0.0.1", resolve),
      );
      const port = (server.address() as AddressInfo).port;
      const baseUrl = `http://127.0.0.1:${port}`;

      try {
        // 4 tentativas falhas vindas de 4 IPs distintos contra a mesma conta 'manoel_alvo'
        for (let i = 1; i <= 4; i++) {
          const attempt = await fetch(`${baseUrl}/api/v1/admin/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Forwarded-For": `187.10.20.${i}`,
            },
            body: JSON.stringify({
              username: "manoel_alvo",
              password: `SenhaErrada_${i}`,
            }),
          });
          assert.equal(attempt.status, 401);
        }

        // A 5ª tentativa (mesmo de um 5º IP inédito) deve ser bloqueada pelo rate limit da conta (429)
        const fifthAttempt = await fetch(`${baseUrl}/api/v1/admin/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Forwarded-For": "187.10.20.99",
          },
          body: JSON.stringify({
            username: "manoel_alvo",
            password: "SenhaCorreta#2026",
          }),
        });
        assert.equal(fifthAttempt.status, 429);
        assert.equal(Boolean(fifthAttempt.headers.get("retry-after")), true);
      } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });

    it("executa fluxo administrativo completo: filtros temporais, listagem paginada de IPs, histórico por IP, gestão de IPs investigados, validação de parâmetros e exportação CSV/JSON segura", async () => {
      const baseNow = new Date("2026-11-06T15:00:00Z");
      const repo = new InMemoryMonitoringRepository();
      await repo.createAdminUser("manoel", hashPassword("PainelAdmin#2026"));

      const collector = new CollectorService(repo);
      const ua = "Mozilla/5.0 (Linux; Android 14) Chrome/131.0 Mobile";

      // Popula eventos sintéticos de teste para 2 IPs em horários distintos
      const ip1 = {
        clientIp: "177.100.10.1",
        ipSource: "x_forwarded_for" as const,
        ipHeaderMismatch: false,
        spoofAttemptDetected: false,
      };
      const ip2 = {
        clientIp: "177.100.10.2",
        ipSource: "x_forwarded_for" as const,
        ipHeaderMismatch: false,
        spoofAttemptDetected: true,
      };

      // IP 1: 2 sessões pagas diferentes (recorrente) há 2 horas
      for (let s = 1; s <= 2; s++) {
        const sid = `10000000-0000-4000-8000-00000000000${s}`;
        const t = new Date(baseNow.getTime() - s * 3600_000);
        const pv = validateAndSanitizeCollectPayload(
          {
            sessionId: sid,
            eventType: "page_view",
            pageUrl: `https://memorettiguinchos.com.br/?gclid=GCLID_IP1_S${s}&utm_source=google&utm_medium=cpc&utm_campaign=guincho_24h`,
            pagePath: "/",
          },
          ua,
        );
        assert(pv.ok);
        await collector.recordEvent(pv.data, ip1, t);

        const wa = validateAndSanitizeCollectPayload(
          {
            sessionId: sid,
            eventType: "whatsapp_click",
            pageUrl: "https://memorettiguinchos.com.br/",
            buttonLocation: "hero_principal",
            contactTarget: "https://wa.me/5511930299233",
          },
          ua,
        );
        assert(wa.ok);
        await collector.recordEvent(
          wa.data,
          ip1,
          new Date(t.getTime() + 5000),
        );
      }

      // IP 2: 1 sessão orgânica há 48 horas
      const oldTime = new Date(baseNow.getTime() - 48 * 3600_000);
      const pv2 = validateAndSanitizeCollectPayload(
        {
          sessionId: "20000000-0000-4000-8000-000000000001",
          eventType: "page_view",
          pageUrl: "https://memorettiguinchos.com.br/guincho-osasco",
          referrer: "https://www.google.com.br/",
        },
        ua,
      );
      assert(pv2.ok);
      await collector.recordEvent(pv2.data, ip2, oldTime);

      const server = createMonitoringServer({
        repo,
        ipOptions: {
          trustedProxyCidrs: ["127.0.0.1/32"],
          maxTrustedProxyHops: 1,
          rejectPrivateClientIps: false,
        },
        allowedOrigin: "https://memorettiguinchos.com.br",
        nowProvider: () => baseNow,
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
            username: "manoel",
            password: "PainelAdmin#2026",
          }),
        });
        assert.equal(loginRes.status, 200);
        const cookie =
          (loginRes.headers.get("set-cookie") ?? "").split(";")[0] ?? "";
        const authHeaders = {
          Cookie: cookie,
          Origin: "https://memorettiguinchos.com.br",
        };

        // 1. Resumo de 24h (deve incluir apenas IP 1) vs 72h (deve incluir IP 1 e IP 2)
        const sum24Res = await fetch(
          `${baseUrl}/api/v1/admin/summary?hours=24`,
          { headers: authHeaders },
        );
        assert.equal(sum24Res.status, 200);
        const sum24 = (await sum24Res.json()) as {
          summary: {
            totalRequests: number;
            totalVisits: number;
            identifiedPaidEntries: number;
            whatsappClicks: number;
            paidWhatsappClicks: number;
            uniqueIps: number;
            recurringIps: number;
          };
        };
        assert.equal(sum24.summary.totalRequests, 4);
        assert.equal(sum24.summary.totalVisits, 2);
        assert.equal(sum24.summary.identifiedPaidEntries, 2);
        assert.equal(sum24.summary.whatsappClicks, 2);
        assert.equal(sum24.summary.paidWhatsappClicks, 2);
        assert.equal(sum24.summary.uniqueIps, 1);
        assert.equal(sum24.summary.recurringIps, 1);

        // Resumo com intervalo explícito ISO-8601 (from / to) cobrindo 72h
        const fromIso = new Date(
          baseNow.getTime() - 72 * 3600_000,
        ).toISOString();
        const toIso = baseNow.toISOString();
        const sumRangeRes = await fetch(
          `${baseUrl}/api/v1/admin/summary?from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}`,
          { headers: authHeaders },
        );
        assert.equal(sumRangeRes.status, 200);
        const sumRange = (await sumRangeRes.json()) as {
          summary: { totalRequests: number; uniqueIps: number };
        };
        assert.equal(sumRange.summary.totalRequests, 5);
        assert.equal(sumRange.summary.uniqueIps, 2);

        // 2. Validação de parâmetros inválidos (deve retornar 400)
        const badHours = await fetch(
          `${baseUrl}/api/v1/admin/summary?hours=9999`,
          { headers: authHeaders },
        );
        assert.equal(badHours.status, 400);

        const badLimit = await fetch(
          `${baseUrl}/api/v1/admin/ips?page=1&limit=500`,
          { headers: authHeaders },
        );
        assert.equal(badLimit.status, 400);

        const badIpHistory = await fetch(
          `${baseUrl}/api/v1/admin/ips/ip_invalido/history`,
          { headers: authHeaders },
        );
        assert.equal(badIpHistory.status, 400);

        // 3. Gestão de IPs Investigados (POST / PUT / GET / DELETE)
        // Tentativa de CSV Formula Injection no campo notes (`=CMD|' /C calc'!A0`)
        const upsertRes = await fetch(
          `${baseUrl}/api/v1/admin/investigated-ips`,
          {
            method: "POST",
            headers: {
              ...authHeaders,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ipAddress: "177.100.10.1",
              status: "suspeito_ads",
              notes: "=1+1; Cliques repetitivos em anúncios",
            }),
          },
        );
        assert.equal(upsertRes.status, 200);
        const upsertBody = (await upsertRes.json()) as {
          item: { ipAddress: string; status: string; updatedBy: string };
        };
        assert.equal(upsertBody.item.ipAddress, "177.100.10.1");
        assert.equal(upsertBody.item.status, "suspeito_ads");
        assert.equal(upsertBody.item.updatedBy, "manoel");

        const listInvRes = await fetch(
          `${baseUrl}/api/v1/admin/investigated-ips?status=suspeito_ads&page=1&limit=10`,
          { headers: authHeaders },
        );
        assert.equal(listInvRes.status, 200);
        const listInvBody = (await listInvRes.json()) as {
          items: { ipAddress: string }[];
          pagination: { totalItems: number };
        };
        assert.equal(listInvBody.pagination.totalItems, 1);

        // 4. Listagem agregada de IPs (/api/v1/admin/ips) com paginação e filtro
        const ipsRes = await fetch(
          `${baseUrl}/api/v1/admin/ips?hours=72&page=1&limit=1&sortBy=identifiedPaidEntries&sortOrder=desc`,
          { headers: authHeaders },
        );
        assert.equal(ipsRes.status, 200);
        const ipsBody = (await ipsRes.json()) as {
          items: {
            ipAddress: string;
            identifiedPaidEntries: number;
            investigation: { status: string } | null;
          }[];
          pagination: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
            hasNextPage: boolean;
          };
        };
        assert.equal(ipsBody.items.length, 1);
        assert.equal(ipsBody.items[0]?.ipAddress, "177.100.10.1");
        assert.equal(ipsBody.items[0]?.identifiedPaidEntries, 2);
        assert.equal(ipsBody.items[0]?.investigation?.status, "suspeito_ads");
        assert.equal(ipsBody.pagination.totalItems, 2);
        assert.equal(ipsBody.pagination.totalPages, 2);
        assert.equal(ipsBody.pagination.hasNextPage, true);

        // 5. Histórico detalhado por IP (/api/v1/admin/ips/:ip/history)
        const histRes = await fetch(
          `${baseUrl}/api/v1/admin/ips/177.100.10.1/history?hours=72&page=1&limit=2`,
          { headers: authHeaders },
        );
        assert.equal(histRes.status, 200);
        const histBody = (await histRes.json()) as {
          ipAddress: string;
          investigation: { status: string } | null;
          summary: {
            totalRequests: number;
            totalVisits: number;
            identifiedPaidEntries: number;
            paidClickIds: string[];
          };
          events: unknown[];
          pagination: { totalItems: number; totalPages: number };
        };
        assert.equal(histBody.ipAddress, "177.100.10.1");
        assert.equal(histBody.investigation?.status, "suspeito_ads");
        assert.equal(histBody.summary.totalRequests, 4);
        assert.equal(histBody.summary.totalVisits, 2);
        assert.equal(histBody.summary.identifiedPaidEntries, 2);
        assert.equal(histBody.summary.paidClickIds.length, 2);
        assert.equal(histBody.events.length, 2);
        assert.equal(histBody.pagination.totalItems, 4);
        assert.equal(histBody.pagination.totalPages, 2);

        // 6. Exportação CSV neutralizando Formula Injection ('=1+1...)
        const exportCsvRes = await fetch(
          `${baseUrl}/api/v1/admin/export?type=investigated_ips&format=csv&limit=100`,
          { headers: authHeaders },
        );
        assert.equal(exportCsvRes.status, 200);
        assert.equal(
          exportCsvRes.headers.get("content-type")?.includes("text/csv"),
          true,
        );
        const csvText = await exportCsvRes.text();
        assert.equal(
          csvText.includes("'=1+1; Cliques repetitivos em anúncios"),
          true,
          "Células CSV iniciadas por '=' devem receber prefixo de apóstrofo contra Formula Injection",
        );

        // 7. Remoção de IP investigado (DELETE)
        const delRes = await fetch(
          `${baseUrl}/api/v1/admin/investigated-ips/177.100.10.1`,
          {
            method: "DELETE",
            headers: authHeaders,
          },
        );
        assert.equal(delRes.status, 200);
        const delBody = (await delRes.json()) as { deleted: boolean };
        assert.equal(delBody.deleted, true);
      } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });

    it("garante queries parametrizadas ($1, $2...) em TODOS os métodos administrativos do PostgresMonitoringRepository contra SQL Injection", async () => {
      const executed: { text: string; values: unknown[] | undefined }[] = [];
      const fakePool: SqlPoolLike = {
        async query<R = Record<string, unknown>>(
          text: string,
          values?: unknown[],
        ) {
          executed.push({ text, values });
          return {
            rows: [
              {
                id: "1",
                total_requests: "0",
                total_items: "0",
                recurring_ips: "0",
              },
            ] as unknown as R[],
            rowCount: 1,
          };
        },
      };

      const pgRepo = new PostgresMonitoringRepository(fakePool);
      const sqli = "177.1.1.1'; DROP TABLE access_events; --";
      const now = new Date();

      await pgRepo.getMetricsSummary({
        from: new Date(now.getTime() - 3600_000),
        to: now,
        windowHours: 1,
        trafficCategory: sqli as never,
      });
      await pgRepo.listIpAggregates({
        from: new Date(now.getTime() - 3600_000),
        to: now,
        windowHours: 1,
        page: 1,
        limit: 20,
        ipAddress: sqli,
        status: sqli as never,
        sortBy: "identifiedPaidEntries",
        sortOrder: "desc",
      });
      await pgRepo.getIpHistory({
        ipAddress: sqli,
        from: new Date(now.getTime() - 3600_000),
        to: now,
        windowHours: 1,
        page: 1,
        limit: 20,
      });
      await pgRepo.upsertInvestigatedIp(
        sqli,
        "suspeito_ads",
        sqli,
        sqli,
        now,
      );
      await pgRepo.deleteInvestigatedIp(sqli);
      await pgRepo.exportAccessEvents({
        type: "events",
        format: "json",
        from: new Date(now.getTime() - 3600_000),
        to: now,
        windowHours: 1,
        limit: 100,
        ipAddress: sqli,
      });

      assert.equal(executed.length >= 8, true);
      for (const q of executed) {
        assert.equal(
          q.text.includes("DROP TABLE"),
          false,
          `Nenhuma query SQL pode interpolar entrada bruta: ${q.text}`,
        );
      }
    });
  });

  describe("10. Autenticação HMAC-SHA256 da Ponte, Proteção Anti-Replay e Topologia Coolify/Traefik", () => {
    it("rejeita chamadas sem HMAC válido, bloqueia adulteração de IP/corpo e impede ataques de replay", async () => {
      const repo = new InMemoryMonitoringRepository();
      const bridgeSecret =
        "segredo_exclusivo_ponte_hmac_sha256_producao_2026_memoretti_64c";
      const fixedNow = new Date("2026-11-06T15:00:00.000Z");

      const server = createMonitoringServer({
        repo,
        ipOptions: {
          trustedProxyCidrs: ["127.0.0.1/32", "172.29.10.0/29", "172.16.1.3/32"],
          maxTrustedProxyHops: 2,
          rejectPrivateClientIps: true,
        },
        allowedOrigin: "https://memorettiguinchos.com.br",
        bridgeSecret,
        bridgeMaxSkewMs: 30_000,
        nowProvider: () => fixedNow,
      });

      await new Promise<void>((resolve) =>
        server.listen(0, "127.0.0.1", () => resolve()),
      );
      const port = (server.address() as AddressInfo).port;
      const baseUrl = `http://127.0.0.1:${port}`;

      try {
        // 1. Healthcheck interno do container (/healthz) permanece acessível para probe local
        const healthzRes = await fetch(`${baseUrl}/healthz`);
        assert.equal(healthzRes.status, 200);

        // 2. Chamada direta sem cabeçalhos HMAC para /api/v1/collect ou /api/v1/admin/summary é negada com 403
        const rawBody = JSON.stringify({
          sessionId: "550e8400-e29b-41d4-a716-446655440099",
          eventType: "page_view",
          pageUrl: "https://memorettiguinchos.com.br/",
        });

        const noHmacCollect = await fetch(`${baseUrl}/api/v1/collect`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Forwarded-For": "177.200.100.50",
            "X-Real-IP": "177.200.100.50",
          },
          body: rawBody,
        });
        assert.equal(noHmacCollect.status, 403);
        const noHmacBody = (await noHmacCollect.json()) as { code: string };
        assert.equal(noHmacBody.code, "missing_bridge_headers");

        const noHmacAdmin = await fetch(`${baseUrl}/api/v1/admin/summary`);
        assert.equal(noHmacAdmin.status, 403);

        // 3. Chamada com segredo incorreto é negada com 403 (invalid_bridge_signature)
        const wrongSecretHeaders = createSignedBridgeHeaders({
          secret:
            "segredo_incorreto_de_outro_container_na_rede_docker_32_caracteres",
          method: "POST",
          pathWithQuery: "/api/v1/collect",
          forwardedFor: "177.200.100.50",
          realIp: "177.200.100.50",
          rawBody,
          timestampMs: fixedNow.getTime(),
          nonce: "a1b2c3d4e5f60718293a4b5c6d7e8f90",
        });

        const wrongSigRes = await fetch(`${baseUrl}/api/v1/collect`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Forwarded-For": "177.200.100.50",
            "X-Real-IP": "177.200.100.50",
            ...wrongSecretHeaders,
          },
          body: rawBody,
        });
        assert.equal(wrongSigRes.status, 403);
        const wrongSigBody = (await wrongSigRes.json()) as { code: string };
        assert.equal(wrongSigBody.code, "invalid_bridge_signature");

        // 4. Adulteração de X-Forwarded-For após assinatura é negada com 403
        const validHeadersForIpA = createSignedBridgeHeaders({
          secret: bridgeSecret,
          method: "POST",
          pathWithQuery: "/api/v1/collect",
          forwardedFor: "177.200.100.50",
          realIp: "177.200.100.50",
          rawBody,
          timestampMs: fixedNow.getTime(),
          nonce: "b1b2c3d4e5f60718293a4b5c6d7e8f91",
        });

        const tamperedIpRes = await fetch(`${baseUrl}/api/v1/collect`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Forwarded-For": "200.100.50.25", // adulterado!
            "X-Real-IP": "177.200.100.50",
            ...validHeadersForIpA,
          },
          body: rawBody,
        });
        assert.equal(tamperedIpRes.status, 403);

        // 5. Timestamp expirado (fora da janela de 30s) é negado com 403 (bridge_signature_expired)
        const expiredHeaders = createSignedBridgeHeaders({
          secret: bridgeSecret,
          method: "POST",
          pathWithQuery: "/api/v1/collect",
          forwardedFor: "177.200.100.50",
          realIp: "177.200.100.50",
          rawBody,
          timestampMs: fixedNow.getTime() - 45_000, // 45s atrás
          nonce: "c1b2c3d4e5f60718293a4b5c6d7e8f92",
        });

        const expiredRes = await fetch(`${baseUrl}/api/v1/collect`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Forwarded-For": "177.200.100.50",
            "X-Real-IP": "177.200.100.50",
            ...expiredHeaders,
          },
          body: rawBody,
        });
        assert.equal(expiredRes.status, 403);
        const expiredBody = (await expiredRes.json()) as { code: string };
        assert.equal(expiredBody.code, "bridge_signature_expired");

        // 6. Requisição legítima assinada com HMAC válido é aceita (202)
        const legitimateHeaders = createSignedBridgeHeaders({
          secret: bridgeSecret,
          method: "POST",
          pathWithQuery: "/api/v1/collect",
          forwardedFor: "1.2.3.4, 177.200.100.50",
          realIp: "177.200.100.50",
          rawBody,
          timestampMs: fixedNow.getTime(),
          nonce: "d1b2c3d4e5f60718293a4b5c6d7e8f93",
        });

        const validRes = await fetch(`${baseUrl}/api/v1/collect`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Forwarded-For": "1.2.3.4, 177.200.100.50",
            "X-Real-IP": "177.200.100.50",
            ...legitimateHeaders,
          },
          body: rawBody,
        });
        assert.equal(validRes.status, 202);

        // Confirma que o IP real 177.200.100.50 foi extraído e o spoof 1.2.3.4 à esquerda foi sinalizado
        const summary = await repo.getMetricsSummary(24, fixedNow);
        assert.equal(summary.totalRequests, 1);
        assert.equal(summary.spoofAttempts, 1);

        // 7. Ataque de Replay: reenviar exatamente a mesma requisição assinada dentro da janela de 30s é bloqueado (403 bridge_replay_detected)
        const replayRes = await fetch(`${baseUrl}/api/v1/collect`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Forwarded-For": "1.2.3.4, 177.200.100.50",
            "X-Real-IP": "177.200.100.50",
            ...legitimateHeaders,
          },
          body: rawBody,
        });
        assert.equal(replayRes.status, 403);
        const replayBody = (await replayRes.json()) as { code: string };
        assert.equal(replayBody.code, "bridge_replay_detected");
      } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });
  });
});
