import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { AddressInfo } from "node:net";
import { resolve } from "node:path";
import { describe, it } from "node:test";

import {
  ApiAuthError,
  EXPLICACAO_ENTRADAS_PAGAS_VS_GOOGLE_ADS,
  MonitoringDashboardApiClient,
  OPCOES_JANELA_TEMPORAL,
  ROTULOS_ORIGEM_TRAFEGO,
  ROTULOS_STATUS_INVESTIGACAO,
  agruparEventosPorSessao,
  gerarAlertasInvestigativos,
} from "../lib/painel-monitoramento-api.ts";
import {
  createSignedBridgeHeaders,
  extractSanitizedAdminCookieHeader,
  resolveAllowedBridgeRoute,
  resolveBridgeSecret,
  resolveSafeUpstreamOrigin,
  sanitizeAllowedQueryParams,
} from "../lib/ponte-api-seguranca.ts";
import { InMemoryMonitoringRepository } from "../monitoring/src/db/repository.ts";
import { validateAndSanitizeCollectPayload } from "../monitoring/src/privacy/sanitizer.ts";
import { hashPassword } from "../monitoring/src/security/auth.ts";
import { createMonitoringServer } from "../monitoring/src/server.ts";
import { CollectorService } from "../monitoring/src/services/collectorService.ts";

const ROOT_DIR = resolve(import.meta.dirname, "..");

function readWorkspaceFile(relativePath: string): string {
  return readFileSync(resolve(ROOT_DIR, relativePath), "utf-8");
}

describe("Etapa 4 — Dashboard Privado de Monitoramento da Memoretti", () => {
  describe("1. Testes de Componentes, Domínio de Apresentação e Explicação Google Ads vs Entradas Pagas", () => {
    it("exibe claramente a diferença entre Entradas Pagas Identificadas e Cliques Contabilizados pelo Google Ads", () => {
      assert.ok(
        EXPLICACAO_ENTRADAS_PAGAS_VS_GOOGLE_ADS.titulo.includes(
          "Entradas Pagas Identificadas",
        ),
      );
      assert.ok(
        EXPLICACAO_ENTRADAS_PAGAS_VS_GOOGLE_ADS.titulo.includes("Google Ads"),
      );
      assert.ok(
        EXPLICACAO_ENTRADAS_PAGAS_VS_GOOGLE_ADS.resumoCurto.includes(
          "não equivalem ao total bruto de cliques faturados pelo Google Ads",
        ),
      );
      assert.equal(EXPLICACAO_ENTRADAS_PAGAS_VS_GOOGLE_ADS.pontos.length, 3);
      assert.ok(
        EXPLICACAO_ENTRADAS_PAGAS_VS_GOOGLE_ADS.pontos.some((p) =>
          p.includes("nenhum bloqueio automático é aplicado"),
        ),
      );

      const dashboardSource = readWorkspaceFile(
        "components/painel-monitoramento/PainelMonitoramentoClient.tsx",
      );
      assert.ok(
        dashboardSource.includes("EXPLICACAO_ENTRADAS_PAGAS_VS_GOOGLE_ADS"),
        "O componente principal do dashboard deve renderizar o quadro explicativo sobre Entradas Pagas vs Cliques do Google Ads",
      );
      assert.ok(
        dashboardSource.includes('data-testid="metric-total-visits"'),
        "Deve exibir Total de Visitas",
      );
      assert.ok(
        dashboardSource.includes('data-testid="metric-unique-ips"'),
        "Deve exibir IPs Únicos",
      );
      assert.ok(
        dashboardSource.includes('data-testid="metric-recurring-ips"'),
        "Deve exibir IPs Recorrentes",
      );
      assert.ok(
        dashboardSource.includes('data-testid="metric-paid-entries"'),
        "Deve exibir Entradas Pagas Identificadas",
      );
      assert.ok(
        dashboardSource.includes('data-testid="metric-whatsapp-clicks"'),
        "Deve exibir Cliques no WhatsApp",
      );
      assert.ok(
        dashboardSource.includes('data-testid="metric-phone-clicks"'),
        "Deve exibir Cliques em Telefone",
      );
      assert.ok(
        dashboardSource.includes('data-testid="metric-suspicious-alerts"'),
        "Deve exibir Alertas de Comportamento Suspeito",
      );
    });

    it("gera alertas investigativos para spoofing, divergência de headers e IPs com múltiplas entradas pagas sem contato", () => {
      const alerts = gerarAlertasInvestigativos(
        {
          windowHours: 24,
          totalRequests: 15,
          totalVisits: 6,
          uniqueIps: 3,
          recurringIps: 2,
          identifiedPaidEntries: 4,
          whatsappClicks: 1,
          phoneClicks: 0,
          spoofAttempts: 2,
          headerMismatches: 1,
        },
        [
          {
            ipAddress: "177.88.99.10",
            totalRequests: 8,
            totalVisits: 3,
            identifiedPaidEntries: 3,
            whatsappClicks: 0,
            phoneClicks: 0,
            firstSeenAt: "2026-11-06T10:00:00.000Z",
            lastSeenAt: "2026-11-06T11:30:00.000Z",
            investigationStatus: null,
            investigationNotes: null,
            paidClickIds: ["EAIaIQ_01", "EAIaIQ_02", "EAIaIQ_03"],
            primaryTrafficCategory: "paid_google",
          },
          {
            ipAddress: "177.88.99.20",
            totalRequests: 4,
            totalVisits: 2,
            identifiedPaidEntries: 2,
            whatsappClicks: 0,
            phoneClicks: 0,
            firstSeenAt: "2026-11-06T09:00:00.000Z",
            lastSeenAt: "2026-11-06T09:30:00.000Z",
            investigationStatus: "legitimo_recorrente",
            investigationNotes: "Parceiro confirmado",
            paidClickIds: ["EAIaIQ_04"],
            primaryTrafficCategory: "paid_google",
          },
        ],
      );

      assert.equal(
        alerts.length,
        3,
        "Deve gerar alerta de spoofing, divergência de headers e recorrência paga para 177.88.99.10 (ignorando o IP marcado como legítimo recorrente)",
      );
      assert.ok(alerts.some((a) => a.category === "spoofing_proxy"));
      assert.ok(alerts.some((a) => a.category === "divergencia_headers"));
      const paidAlert = alerts.find(
        (a) => a.category === "recorrencia_paga_sem_contato",
      );
      assert.ok(paidAlert);
      assert.equal(paidAlert.ipAddress, "177.88.99.10");
      assert.equal(
        paidAlert.confidence,
        "baixa",
        "Alertas baseados apenas em repetição de visitas/entradas pagas devem ter baixa confiança",
      );
      assert.equal(paidAlert.severity, "baixa");
      assert.ok(
        paidAlert.disclaimer.includes(
          "não representa conclusão automática de fraude",
        ),
      );
    });

    it("agrupa eventos da linha do tempo por sessão identificando início/fim, cliques de contato e IDs de campanha", () => {
      const grouped = agruparEventosPorSessao([
        {
          id: 1,
          createdAt: "2026-11-06T10:00:00.000Z",
          ipAddress: "177.88.99.10",
          ipSource: "x_forwarded_for",
          ipHeaderMismatch: false,
          spoofAttemptDetected: false,
          sessionId: "11111111-1111-4111-8111-111111111111",
          isNewVisit: true,
          eventType: "page_view",
          pagePath: "/",
          buttonLocation: null,
          contactTarget: null,
          trafficCategory: "paid_google",
          isPaidEntry: true,
          paidClickType: "gclid",
          paidClickId: "EAIaIQobChMI_TEST_GROUP_1",
          utmSource: "google",
          utmMedium: "cpc",
          utmCampaign: "guincho-barueri",
          utmTerm: "guincho 24h",
          utmContent: null,
          referrerOrigin: "https://www.google.com",
          browserFamily: "Chrome",
          osFamily: "Android",
          deviceType: "mobile",
        },
        {
          id: 2,
          createdAt: "2026-11-06T10:01:30.000Z",
          ipAddress: "177.88.99.10",
          ipSource: "x_forwarded_for",
          ipHeaderMismatch: false,
          spoofAttemptDetected: false,
          sessionId: "11111111-1111-4111-8111-111111111111",
          isNewVisit: false,
          eventType: "whatsapp_click",
          pagePath: "/",
          buttonLocation: "hero_principal",
          contactTarget: "https://wa.me/5511930299233",
          trafficCategory: "paid_google",
          isPaidEntry: false,
          paidClickType: "gclid",
          paidClickId: "EAIaIQobChMI_TEST_GROUP_1",
          utmSource: "google",
          utmMedium: "cpc",
          utmCampaign: "guincho-barueri",
          utmTerm: "guincho 24h",
          utmContent: null,
          referrerOrigin: "https://www.google.com",
          browserFamily: "Chrome",
          osFamily: "Android",
          deviceType: "mobile",
        },
      ]);

      assert.equal(grouped.length, 1);
      const session = grouped[0]!;
      assert.equal(session.totalEvents, 2);
      assert.equal(session.hasNewVisit, true);
      assert.equal(session.hasPaidEntry, true);
      assert.equal(session.whatsappClicks, 1);
      assert.equal(session.phoneClicks, 0);
      assert.deepEqual(session.paidClickIds, ["EAIaIQobChMI_TEST_GROUP_1"]);
      assert.deepEqual(session.utmCampaigns, ["guincho-barueri"]);
    });

    it("contempla todos os filtros temporais obrigatórios (24h, 72h, 7 dias e 30 dias) e rótulos em português", () => {
      assert.deepEqual(
        OPCOES_JANELA_TEMPORAL.map((o) => o.hours),
        [24, 72, 168, 720],
      );
      assert.ok(ROTULOS_ORIGEM_TRAFEGO.paid_google.label.includes("Google Ads"));
      assert.ok(ROTULOS_STATUS_INVESTIGACAO.suspeito_ads.label);
      assert.ok(ROTULOS_STATUS_INVESTIGACAO.em_observacao.label);
      assert.ok(ROTULOS_STATUS_INVESTIGACAO.legitimo_recorrente.label);
      assert.ok(ROTULOS_STATUS_INVESTIGACAO.ignorado.label);
    });
  });

  describe("2. Testes de Proteção de Rotas, Privacidade de Logs e Proibição de localStorage", () => {
    it("garante que nenhum arquivo do dashboard armazena tokens em localStorage/sessionStorage nem expõe segredos em console.*", () => {
      const filesToAudit = [
        "lib/painel-monitoramento-api.ts",
        "components/painel-monitoramento/LoginPainel.tsx",
        "components/painel-monitoramento/PainelMonitoramentoClient.tsx",
        "app/painel-monitoramento/page.tsx",
        "app/painel-monitoramento/login/page.tsx",
        "app/painel-monitoramento/layout.tsx",
        "app/api/v1/[...slug]/route.ts",
      ];

      for (const file of filesToAudit) {
        const content = readWorkspaceFile(file);
        // Remove comentários antes de verificar uso de APIs proibidas
        const codeOnly = content
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .replace(/\/\/.*$/gm, "");

        assert.equal(
          /\blocalStorage\b/.test(codeOnly),
          false,
          `O arquivo ${file} JAMAIS deve acessar localStorage para tokens ou sessão`,
        );
        assert.equal(
          /\bsessionStorage\b/.test(codeOnly),
          false,
          `O arquivo ${file} JAMAIS deve acessar sessionStorage para tokens ou sessão`,
        );
        assert.equal(
          /\bconsole\.(log|info|debug|warn|error)\b/.test(codeOnly),
          false,
          `O arquivo ${file} não deve registrar credenciais ou identificadores sensíveis em console.*`,
        );
      }
    });

    it("protege a rota administrativa no servidor (redirect imediato sem cookie meg_admin_session válido) e no cliente", () => {
      const pageSource = readWorkspaceFile("app/painel-monitoramento/page.tsx");
      assert.ok(
        pageSource.includes("cookies()"),
        "A página administrativa deve inspecionar os cookies no servidor",
      );
      assert.ok(
        pageSource.includes('redirect("/painel-monitoramento/login")'),
        "Deve redirecionar requisições não autenticadas para /painel-monitoramento/login",
      );

      const clientSource = readWorkspaceFile(
        "components/painel-monitoramento/PainelMonitoramentoClient.tsx",
      );
      assert.ok(
        clientSource.includes("if (authChecking || !sessionUser)"),
        "O componente cliente deve bloquear a renderização de qualquer dado sensível enquanto a sessão não estiver autenticada",
      );
      assert.ok(
        clientSource.includes('router.replace("/painel-monitoramento/login")'),
        "Deve redirecionar imediatamente para a tela de login quando a API retornar 401",
      );
    });

    it("impede indexação (noindex, nofollow, nocache) nas páginas do painel e exclui rotas administrativas do sitemap", () => {
      const layoutSource = readWorkspaceFile(
        "app/painel-monitoramento/layout.tsx",
      );
      assert.ok(layoutSource.includes("index: false"));
      assert.ok(layoutSource.includes("follow: false"));
      assert.ok(layoutSource.includes("nocache: true"));

      const sitemapSource = readWorkspaceFile("app/sitemap.ts");
      assert.equal(
        sitemapSource.includes("painel-monitoramento"),
        false,
        "O sitemap público jamais deve listar rotas do painel administrativo",
      );
    });
  });

  describe("3. Testes de Responsividade (360px-1280px) e Acessibilidade Básica (WCAG / Áreas de Toque >= 44x44px)", () => {
    it("verifica classes responsivas mobile-first (cards mobile e tabela desktop) e áreas de toque mínimas (min-h-11 / min-h-12)", () => {
      const loginSource = readWorkspaceFile(
        "components/painel-monitoramento/LoginPainel.tsx",
      );
      const dashboardSource = readWorkspaceFile(
        "components/painel-monitoramento/PainelMonitoramentoClient.tsx",
      );

      // Áreas de toque >= 44px (Tailwind min-h-11 = 44px, min-h-12 = 48px)
      assert.ok(
        loginSource.includes("min-h-12"),
        "Inputs e botão de login devem ter altura mínima >= 48px (min-h-12)",
      );
      assert.ok(
        dashboardSource.includes("min-h-11"),
        "Botões e controles interativos do dashboard devem ter área de toque mínima >= 44px (min-h-11)",
      );

      // Layout responsivo: cards no mobile (md:hidden) e tabela no desktop (hidden md:block)
      assert.ok(
        dashboardSource.includes("md:hidden"),
        "Deve conter visualização dedicada em cards para telas móveis (360px-390px)",
      );
      assert.ok(
        dashboardSource.includes("hidden md:block"),
        "Deve conter tabela completa com scroll horizontal seguro para tablet/desktop (768px-1280px)",
      );
      assert.ok(
        dashboardSource.includes("grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"),
        "Cartões de métricas devem adaptar-se de 1 coluna (360px) para 2 (tablet) e 4 (desktop 1280px)",
      );
    });

    it("verifica atributos essenciais de acessibilidade (labels associados, landmarks, aria-live, role=alert e scope=col)", () => {
      const loginSource = readWorkspaceFile(
        "components/painel-monitoramento/LoginPainel.tsx",
      );
      const dashboardSource = readWorkspaceFile(
        "components/painel-monitoramento/PainelMonitoramentoClient.tsx",
      );

      // Login
      assert.ok(loginSource.includes('htmlFor="campo-usuario-admin"'));
      assert.ok(loginSource.includes('id="campo-usuario-admin"'));
      assert.ok(loginSource.includes('htmlFor="campo-senha-admin"'));
      assert.ok(loginSource.includes('id="campo-senha-admin"'));
      assert.ok(loginSource.includes('role="alert"'));
      assert.ok(loginSource.includes('aria-live="assertive"'));

      // Dashboard
      assert.ok(dashboardSource.includes('aria-labelledby="titulo-visao-geral"'));
      assert.ok(
        dashboardSource.includes('aria-labelledby="titulo-monitoramento-ips"'),
      );
      assert.ok(
        dashboardSource.includes('aria-labelledby="titulo-historico-detalhado"'),
      );
      assert.ok(
        dashboardSource.includes('aria-labelledby="titulo-investigacao-ips"'),
      );
      assert.ok(dashboardSource.includes('aria-pressed={active}'));
      assert.ok(dashboardSource.includes('scope="col"'));
      assert.ok(dashboardSource.includes('htmlFor="pesquisa-ip-input"'));
      assert.ok(dashboardSource.includes('htmlFor="campo-ip-investigado"'));
      assert.ok(dashboardSource.includes('htmlFor="campo-status-investigacao"'));
      assert.ok(dashboardSource.includes('htmlFor="campo-notas-investigacao"'));
    });
  });

  describe("4. Testes de Autenticação e Integração Ponta a Ponta do Dashboard com a API", () => {
    it("executa fluxo completo do cliente do dashboard: bloqueio sem sessão, login via cookie HttpOnly, filtros, histórico, investigação, exportação e logout", async () => {
      const repo = new InMemoryMonitoringRepository();
      const password = "Admin_Dashboard_Test_2026!";
      await repo.createAdminUser("admin_memoretti", hashPassword(password));

      const collector = new CollectorService(repo);
      const now = new Date();
      const ua = "Mozilla/5.0 (Linux; Android 14) Chrome/131.0 Mobile";

      // Semeia eventos sintéticos:
      // IP 1: 2 visitas pagas via Google Ads (GCLID + UTM) sem cliques de contato
      const s1 = "11111111-1111-4111-8111-111111111101";
      const s2 = "11111111-1111-4111-8111-111111111102";
      const p1 = validateAndSanitizeCollectPayload(
        {
          sessionId: s1,
          eventType: "page_view",
          pageUrl:
            "https://memorettiguinchos.com.br/?gclid=EAIaIQobChMI_DASH_01&utm_source=google&utm_medium=cpc&utm_campaign=guincho-barueri",
        },
        ua,
      );
      assert(p1.ok);
      await collector.recordEvent(
        p1.data,
        {
          clientIp: "177.55.44.10",
          ipSource: "x_forwarded_for",
          ipHeaderMismatch: false,
          spoofAttemptDetected: false,
        },
        new Date(now.getTime() - 40 * 60 * 1000),
      );

      // Segundo evento na mesma sessão s1 com apenas UTM (não deve duplicar entrada paga)
      const p1Internal = validateAndSanitizeCollectPayload(
        {
          sessionId: s1,
          eventType: "page_view",
          pageUrl:
            "https://memorettiguinchos.com.br/guincho-osasco?utm_source=google&utm_medium=cpc&utm_campaign=guincho-barueri",
        },
        ua,
      );
      assert(p1Internal.ok);
      await collector.recordEvent(
        p1Internal.data,
        {
          clientIp: "177.55.44.10",
          ipSource: "x_forwarded_for",
          ipHeaderMismatch: false,
          spoofAttemptDetected: false,
        },
        new Date(now.getTime() - 39 * 60 * 1000),
      );

      const p2 = validateAndSanitizeCollectPayload(
        {
          sessionId: s2,
          eventType: "page_view",
          pageUrl:
            "https://memorettiguinchos.com.br/?gclid=EAIaIQobChMI_DASH_02&utm_source=google&utm_medium=cpc&utm_campaign=guincho-barueri",
        },
        ua,
      );
      assert(p2.ok);
      await collector.recordEvent(
        p2.data,
        {
          clientIp: "177.55.44.10",
          ipSource: "x_forwarded_for",
          ipHeaderMismatch: false,
          spoofAttemptDetected: true,
        },
        new Date(now.getTime() - 5 * 60 * 1000),
      );

      // IP 2: 1 visita paga exclusivamente por UTM (sem gclid) + 1 clique no WhatsApp
      const s3 = "22222222-2222-4222-8222-222222222201";
      const p3 = validateAndSanitizeCollectPayload(
        {
          sessionId: s3,
          eventType: "page_view",
          pageUrl:
            "https://memorettiguinchos.com.br/?utm_source=google&utm_medium=cpc&utm_campaign=guincho-24h-lapa",
        },
        ua,
      );
      assert(p3.ok);
      await collector.recordEvent(
        p3.data,
        {
          clientIp: "189.10.20.30",
          ipSource: "x_forwarded_for",
          ipHeaderMismatch: false,
          spoofAttemptDetected: false,
        },
        new Date(now.getTime() - 20 * 60 * 1000),
      );

      const p3Wa = validateAndSanitizeCollectPayload(
        {
          sessionId: s3,
          eventType: "whatsapp_click",
          pageUrl: "https://memorettiguinchos.com.br/",
          buttonLocation: "hero_principal",
          contactTarget: "https://wa.me/5511930299233",
        },
        ua,
      );
      assert(p3Wa.ok);
      await collector.recordEvent(
        p3Wa.data,
        {
          clientIp: "189.10.20.30",
          ipSource: "x_forwarded_for",
          ipHeaderMismatch: false,
          spoofAttemptDetected: false,
        },
        new Date(now.getTime() - 19 * 60 * 1000),
      );

      const server = createMonitoringServer({
        repo,
        ipOptions: {
          trustedProxyCidrs: ["127.0.0.1/32"],
          maxTrustedProxyHops: 1,
          rejectPrivateClientIps: false,
        },
        allowedOrigin: "http://127.0.0.1",
      });

      await new Promise<void>((resolveServer) =>
        server.listen(0, "127.0.0.1", resolveServer),
      );
      const port = (server.address() as AddressInfo).port;
      const baseUrl = `http://127.0.0.1:${port}`;

      // Simulador de Cookie Jar do navegador para cookies HttpOnly
      let sessionCookieHeader = "";
      const browserLikeFetch: typeof fetch = async (input, init) => {
        const headers = new Headers(init?.headers);
        if (sessionCookieHeader) {
          headers.set("Cookie", sessionCookieHeader);
        }
        const res = await fetch(input, { ...init, headers });
        const setCookie = res.headers.get("set-cookie");
        if (setCookie) {
          const cookiePair = setCookie.split(";")[0] ?? "";
          if (cookiePair.endsWith("=")) {
            sessionCookieHeader = "";
          } else {
            sessionCookieHeader = cookiePair;
          }
        }
        return res;
      };

      const client = new MonitoringDashboardApiClient({
        baseUrl,
        fetchImpl: browserLikeFetch,
      });

      try {
        // 1. Sem login, getSession e getSummary devem falhar com 401
        await assert.rejects(
          () => client.getSession(),
          (err: unknown) => err instanceof ApiAuthError && err.status === 401,
        );
        await assert.rejects(
          () => client.getSummary(24),
          (err: unknown) => err instanceof ApiAuthError && err.status === 401,
        );

        // 2. Login com senha errada deve falhar com 401
        await assert.rejects(
          () => client.login("admin_memoretti", "SenhaIncorreta!"),
          (err: unknown) => err instanceof ApiAuthError && err.status === 401,
        );

        // 3. Login com credenciais válidas estabelece cookie HttpOnly
        const loginRes = await client.login("admin_memoretti", password);
        assert.equal(loginRes.ok, true);
        assert.equal(loginRes.user.username, "admin_memoretti");
        assert.ok(
          sessionCookieHeader.startsWith("meg_admin_session="),
          "O servidor deve emitir o cookie meg_admin_session",
        );

        // 4. Sessão ativa confirmada
        const sessionRes = await client.getSession();
        assert.equal(sessionRes.authenticated, true);
        assert.equal(sessionRes.user.username, "admin_memoretti");

        // 5. Visão Geral (Summary)
        const summary = await client.getSummary(24);
        assert.equal(summary.totalVisits, 3);
        assert.equal(summary.uniqueIps, 2);
        assert.equal(summary.recurringIps, 1);
        assert.equal(
          summary.identifiedPaidEntries,
          3,
          "Deve contabilizar exatamente 3 entradas pagas (2 GCLIDs + 1 UTM), sem inflar com a navegação interna de s1",
        );
        assert.equal(summary.whatsappClicks, 1);
        assert.equal(summary.phoneClicks, 0);
        assert.equal(summary.spoofAttempts, 1);

        // 6. Listagem de IPs com ordenação e filtro
        const ipList = await client.listIps({
          hours: 24,
          sortBy: "identifiedPaidEntries",
          sortOrder: "desc",
          page: 1,
          limit: 15,
        });
        assert.equal(ipList.total, 2);
        assert.equal(ipList.items[0]?.ipAddress, "177.55.44.10");
        assert.equal(ipList.items[0]?.primaryTrafficCategory, "paid_google");
        assert.equal(ipList.items[0]?.identifiedPaidEntries, 2);

        // Filtro por pesquisa de IP
        const searched = await client.listIps({
          hours: 24,
          searchIp: "189.10.",
        });
        assert.equal(searched.total, 1);
        assert.equal(searched.items[0]?.ipAddress, "189.10.20.30");

        // 7. Histórico detalhado do IP 177.55.44.10
        const history = await client.getIpHistory("177.55.44.10", {
          hours: 24,
        });
        assert.equal(history.total, 3);
        assert.equal(history.summary?.totalVisits, 2);
        const sessionGroups = agruparEventosPorSessao(history.events);
        assert.equal(sessionGroups.length, 2);

        // 8. Classificação manual de IP (Investigação)
        const upsertRes = await client.upsertInvestigation(
          "177.55.44.10",
          "suspeito_ads",
          "2 entradas pagas em 35 min sem acionar WhatsApp.",
        );
        assert.equal(upsertRes.ok, true);
        assert.equal(upsertRes.record.status, "suspeito_ads");

        const invList = await client.listInvestigatedIps();
        assert.equal(invList.total, 1);
        assert.equal(invList.items[0]?.ipAddress, "177.55.44.10");

        // 9. Exportação CSV autenticada
        const csvUrl = client.buildExportUrl({
          type: "ips",
          format: "csv",
          hours: 24,
        });
        const csvRes = await browserLikeFetch(csvUrl);
        assert.equal(csvRes.status, 200);
        const csvBody = await csvRes.text();
        assert.ok(csvBody.includes("177.55.44.10"));
        assert.ok(csvBody.includes("suspeito_ads"));

        // 10. Remoção de classificação manual
        const delRes = await client.deleteInvestigation("177.55.44.10");
        assert.equal(delRes.deleted, true);

        // 11. Logout invalida a sessão imediatamente
        await client.logout();
        await assert.rejects(
          () => client.getSession(),
          (err: unknown) => err instanceof ApiAuthError && err.status === 401,
        );
      } finally {
        await new Promise<void>((resolveClose) =>
          server.close(() => resolveClose()),
        );
      }
    });
  });

  describe("5. Auditoria da Ponte HTTP (Allowlist, Anti-SSRF, Higienização de Cookies e Isolamento GTM)", () => {
    it("aplica allowlist estrita de rotas e métodos na ponte HTTP e bloqueia path traversal ou rotas desconhecidas", () => {
      // Rotas permitidas
      const okSummary = resolveAllowedBridgeRoute("GET", ["admin", "summary"]);
      assert.equal(okSummary.ok, true);
      if (okSummary.ok) {
        assert.equal(okSummary.canonicalPath, "/api/v1/admin/summary");
        assert.equal(okSummary.requiresAdminAuth, true);
      }

      const okCollect = resolveAllowedBridgeRoute("POST", ["collect"]);
      assert.equal(okCollect.ok, true);
      if (okCollect.ok) {
        assert.equal(okCollect.requiresAdminAuth, false);
        assert.equal(okCollect.isAdminRoute, false);
      }

      const okHistory = resolveAllowedBridgeRoute("GET", [
        "admin",
        "ips",
        "177.55.44.10",
        "history",
      ]);
      assert.equal(okHistory.ok, true);

      // Métodos não permitidos para rotas existentes (405)
      const badMethodSummary = resolveAllowedBridgeRoute("DELETE", [
        "admin",
        "summary",
      ]);
      assert.equal(badMethodSummary.ok, false);
      if (!badMethodSummary.ok) {
        assert.equal(badMethodSummary.status, 405);
      }

      const badMethodCollect = resolveAllowedBridgeRoute("GET", ["collect"]);
      assert.equal(badMethodCollect.ok, false);
      if (!badMethodCollect.ok) {
        assert.equal(badMethodCollect.status, 405);
      }

      // Rotas inexistentes ou tentativas de SSRF/traversal (400 / 404)
      const unknownRoute = resolveAllowedBridgeRoute("GET", [
        "admin",
        "config-dump",
      ]);
      assert.equal(unknownRoute.ok, false);
      if (!unknownRoute.ok) {
        assert.equal(unknownRoute.status, 404);
      }

      const traversalRoute = resolveAllowedBridgeRoute("GET", [
        "admin",
        "..",
        "internal",
      ]);
      assert.equal(traversalRoute.ok, false);
      if (!traversalRoute.ok) {
        assert.equal(traversalRoute.status, 400);
      }

      const invalidIpSegment = resolveAllowedBridgeRoute("GET", [
        "admin",
        "ips",
        "177.55.44.10@evil.com",
        "history",
      ]);
      assert.equal(invalidIpSegment.ok, false);
      if (!invalidIpSegment.ok) {
        assert.equal(invalidIpSegment.status, 400);
      }
    });

    it("impede SSRF validando estritamente MONITORING_API_INTERNAL_URL (aceita loopback e container Docker, bloqueia IPs externos/metadata)", () => {
      assert.equal(
        resolveSafeUpstreamOrigin("http://127.0.0.1:4000"),
        "http://127.0.0.1:4000",
      );
      assert.equal(
        resolveSafeUpstreamOrigin("http://monitoring-api:4000"),
        "http://monitoring-api:4000",
      );

      // Bloqueia metadata cloud (AWS/Hostinger/OpenStack), domínios externos, credenciais embutidas e caminhos extras
      assert.throws(() =>
        resolveSafeUpstreamOrigin("http://169.254.169.254/latest/meta-data"),
      );
      assert.throws(() =>
        resolveSafeUpstreamOrigin("https://atacante-externo.com:4000"),
      );
      assert.throws(() =>
        resolveSafeUpstreamOrigin("http://admin:senha@127.0.0.1:4000"),
      );
      assert.throws(() => resolveSafeUpstreamOrigin("file:///etc/passwd"));
    });

    it("higieniza cookies encaminhados (remove _ga/_gcl_au, rejeita Cookie Tossing e tokens malformados) e filtra query strings", () => {
      const validToken = "a".repeat(64);
      const resOk = extractSanitizedAdminCookieHeader(
        `_ga=GA1.1.123456; _gcl_au=1.1.9999; meg_admin_session=${validToken}; theme=dark`,
      );
      assert.equal(resOk.ok, true);
      if (resOk.ok) {
        assert.equal(resOk.cookieHeader, `meg_admin_session=${validToken}`);
      }

      // Cookie Tossing (2 cookies meg_admin_session)
      const tossing = extractSanitizedAdminCookieHeader(
        `meg_admin_session=${validToken}; meg_admin_session=${"b".repeat(64)}`,
      );
      assert.equal(tossing.ok, false);

      // Token curto/malformado
      const malformed = extractSanitizedAdminCookieHeader(
        "meg_admin_session=curto_invalido",
      );
      assert.equal(malformed.ok, false);

      // Filtragem de query params não permitidos
      const dirtyParams = new URLSearchParams(
        "hours=24&searchIp=177.55.&__proto__=polluted&evilParam=inject",
      );
      const cleanQuery = sanitizeAllowedQueryParams("admin_ips", dirtyParams);
      assert.equal(cleanQuery, "?hours=24&searchIp=177.55.");
    });

    it("garante que GoogleTagManager não é carregado em /painel-monitoramento e que a página valida a sessão no servidor", () => {
      const gtmSource = readWorkspaceFile("components/GoogleTagManager.tsx");
      assert.ok(
        gtmSource.includes('pathname?.startsWith("/painel-monitoramento")'),
        "GoogleTagManager deve ser suprimido nas rotas privadas do painel de monitoramento",
      );

      const pageSource = readWorkspaceFile("app/painel-monitoramento/page.tsx");
      assert.ok(
        pageSource.includes("verifySessionOnServer"),
        "A página do painel deve verificar a validade da sessão diretamente contra o backend antes de renderizar",
      );
    });

    it("valida assinatura HMAC-SHA256 da ponte Next.js -> Monitoring API e bloqueia produção sem MONITORING_BRIDGE_SECRET", () => {
      // Em produção real (sem preview), a ausência de MONITORING_BRIDGE_SECRET deve lançar erro (fail-closed)
      assert.throws(() => resolveBridgeSecret("", "production", false));
      assert.throws(() =>
        resolveBridgeSecret("segredo_curto", "development", false),
      );

      const secret =
        "segredo_exclusivo_ponte_nextjs_monitoring_api_2026_64_caracteres";
      assert.equal(resolveBridgeSecret(secret, "production", false), secret);

      const signed = createSignedBridgeHeaders({
        secret,
        method: "POST",
        pathWithQuery: "/api/v1/collect",
        forwardedFor: "177.55.44.10",
        realIp: "177.55.44.10",
        rawBody: '{"eventType":"page_view"}',
        timestampMs: 1762453696000,
        nonce: "0123456789abcdef0123456789abcdef",
      });

      assert.equal(signed["x-monitoring-bridge-ts"], "1762453696000");
      assert.equal(
        signed["x-monitoring-bridge-nonce"],
        "0123456789abcdef0123456789abcdef",
      );
      assert.equal(signed["x-monitoring-bridge-sig"].length, 64);
    });
  });
});
