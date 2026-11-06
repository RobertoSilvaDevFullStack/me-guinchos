"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type AccessEventItem,
  type AdminSessionUser,
  ApiAuthError,
  EXPLICACAO_ENTRADAS_PAGAS_VS_GOOGLE_ADS,
  type InvestigatedIpItem,
  type InvestigatedIpStatus,
  type IpAggregateSummary,
  type IpSortField,
  type MetricsSummary,
  MonitoringDashboardApiClient,
  OPCOES_JANELA_TEMPORAL,
  ROTULOS_ORIGEM_TRAFEGO,
  ROTULOS_STATUS_INVESTIGACAO,
  ROTULOS_TIPO_EVENTO,
  type SortOrder,
  type TemporalWindowHours,
  type TrafficCategory,
  agruparEventosPorSessao,
  formatarDataHoraPtBr,
  gerarAlertasInvestigativos,
} from "@/lib/painel-monitoramento-api";

export interface PainelMonitoramentoClientProps {
  apiClient?: MonitoringDashboardApiClient;
  initialSelectedIp?: string | null;
  onUnauthenticated?: () => void;
}

export function PainelMonitoramentoClient({
  apiClient,
  initialSelectedIp = null,
  onUnauthenticated,
}: PainelMonitoramentoClientProps) {
  const router = useRouter();
  const [client] = useState(
    () => apiClient ?? new MonitoringDashboardApiClient(),
  );

  // Autenticação e estado de sessão
  const [sessionUser, setSessionUser] = useState<AdminSessionUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Filtros globais e de listagem de IPs
  const [windowHours, setWindowHours] = useState<TemporalWindowHours>(24);
  const [searchIpInput, setSearchIpInput] = useState("");
  const [appliedSearchIp, setAppliedSearchIp] = useState("");
  const [trafficFilter, setTrafficFilter] = useState<TrafficCategory | "">("");
  const [statusFilter, setStatusFilter] = useState<InvestigatedIpStatus | "">(
    "",
  );
  const [onlyPaid, setOnlyPaid] = useState(false);
  const [onlyRecurring, setOnlyRecurring] = useState(false);
  const [sortBy, setSortBy] = useState<IpSortField>("identifiedPaidEntries");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [limit] = useState(15);

  // Dados carregados da API autenticada
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [ipItems, setIpItems] = useState<IpAggregateSummary[]>([]);
  const [ipTotal, setIpTotal] = useState(0);
  const [investigatedList, setInvestigatedList] = useState<
    InvestigatedIpItem[]
  >([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Histórico detalhado do IP selecionado
  const [selectedIp, setSelectedIp] = useState<string | null>(
    initialSelectedIp,
  );
  const [ipHistorySummary, setIpHistorySummary] =
    useState<IpAggregateSummary | null>(null);
  const [ipHistoryEvents, setIpHistoryEvents] = useState<AccessEventItem[]>([]);
  const [ipHistoryTotal, setIpHistoryTotal] = useState(0);
  const [ipHistoryPage, setIpHistoryPage] = useState(1);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Formulário de Investigação Manual (IP selecionado ou manual)
  const [investigationIp, setInvestigationIp] = useState(
    initialSelectedIp ?? "",
  );
  const [investigationStatus, setInvestigationStatus] =
    useState<InvestigatedIpStatus>("em_observacao");
  const [investigationNotes, setInvestigationNotes] = useState("");
  const [savingInvestigation, setSavingInvestigation] = useState(false);
  const [investigationFeedback, setInvestigationFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleUnauthorized = useCallback(() => {
    setSessionUser(null);
    if (onUnauthenticated) {
      onUnauthenticated();
    } else {
      router.replace("/painel-monitoramento/login");
    }
  }, [onUnauthenticated, router]);

  const loadDashboardData = useCallback(async () => {
    setLoadingDashboard(true);
    setDashboardError(null);
    try {
      const [summaryRes, ipsRes, investigatedRes] = await Promise.all([
        client.getSummary(windowHours),
        client.listIps({
          hours: windowHours,
          searchIp: appliedSearchIp,
          trafficCategory: trafficFilter,
          investigationStatus: statusFilter,
          onlyPaid,
          onlyRecurring,
          sortBy,
          sortOrder,
          page,
          limit,
        }),
        client.listInvestigatedIps({ page: 1, limit: 50 }),
      ]);

      setSummary(summaryRes);
      setIpItems(ipsRes.items);
      setIpTotal(ipsRes.total);
      setInvestigatedList(investigatedRes.items);
    } catch (err) {
      if (err instanceof ApiAuthError && err.status === 401) {
        handleUnauthorized();
        return;
      }
      setDashboardError(
        err instanceof Error
          ? err.message
          : "Erro ao carregar os dados do painel de monitoramento.",
      );
    } finally {
      setLoadingDashboard(false);
    }
  }, [
    appliedSearchIp,
    client,
    handleUnauthorized,
    limit,
    onlyPaid,
    onlyRecurring,
    page,
    sortBy,
    sortOrder,
    statusFilter,
    trafficFilter,
    windowHours,
  ]);

  const loadIpHistory = useCallback(
    async (ip: string, targetPage: number) => {
      setLoadingHistory(true);
      setHistoryError(null);
      try {
        const res = await client.getIpHistory(ip, {
          hours: windowHours,
          page: targetPage,
          limit: 50,
        });
        setIpHistorySummary(res.summary);
        setIpHistoryEvents(res.events);
        setIpHistoryTotal(res.total);

        if (res.summary) {
          setInvestigationIp(res.summary.ipAddress);
          setInvestigationStatus(
            res.summary.investigationStatus ?? "em_observacao",
          );
          setInvestigationNotes(res.summary.investigationNotes ?? "");
        }
      } catch (err) {
        if (err instanceof ApiAuthError && err.status === 401) {
          handleUnauthorized();
          return;
        }
        setHistoryError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar o histórico detalhado deste IP.",
        );
      } finally {
        setLoadingHistory(false);
      }
    },
    [client, handleUnauthorized, windowHours],
  );

  // 1. Verifica sessão autenticada ao montar
  useEffect(() => {
    let active = true;
    setAuthChecking(true);
    client
      .getSession()
      .then((res) => {
        if (!active) return;
        setSessionUser(res.user);
        setAuthChecking(false);
      })
      .catch(() => {
        if (!active) return;
        setAuthChecking(false);
        handleUnauthorized();
      });

    return () => {
      active = false;
    };
  }, [client, handleUnauthorized]);

  // 2. Carrega dados do dashboard somente após sessão validada
  useEffect(() => {
    if (!sessionUser) return;
    void loadDashboardData();
  }, [sessionUser, loadDashboardData]);

  // 3. Carrega histórico detalhado quando um IP está selecionado
  useEffect(() => {
    if (!sessionUser || !selectedIp) return;
    void loadIpHistory(selectedIp, ipHistoryPage);
  }, [sessionUser, selectedIp, ipHistoryPage, loadIpHistory]);

  const investigativeAlerts = useMemo(
    () => gerarAlertasInvestigativos(summary, ipItems),
    [summary, ipItems],
  );

  const sessionTimelineGroups = useMemo(
    () => agruparEventosPorSessao(ipHistoryEvents),
    [ipHistoryEvents],
  );

  const totalPages = Math.max(1, Math.ceil(ipTotal / limit));

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await client.logout();
    } catch {
      // Mesmo se houver erro de rede, encerra a visualização local e redireciona
    } finally {
      setLoggingOut(false);
      handleUnauthorized();
    }
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setAppliedSearchIp(searchIpInput.trim());
  }

  function handleSelectIpForInspection(item: IpAggregateSummary) {
    setSelectedIp(item.ipAddress);
    setIpHistoryPage(1);
    setInvestigationIp(item.ipAddress);
    setInvestigationStatus(item.investigationStatus ?? "em_observacao");
    setInvestigationNotes(item.investigationNotes ?? "");
    setInvestigationFeedback(null);
  }

  function handleSelectIpByAddress(ipAddress: string) {
    const existing = ipItems.find((i) => i.ipAddress === ipAddress);
    if (existing) {
      handleSelectIpForInspection(existing);
      return;
    }
    const existingInv = investigatedList.find((i) => i.ipAddress === ipAddress);
    setSelectedIp(ipAddress);
    setIpHistoryPage(1);
    setInvestigationIp(ipAddress);
    setInvestigationStatus(existingInv?.status ?? "em_observacao");
    setInvestigationNotes(existingInv?.notes ?? "");
    setInvestigationFeedback(null);
  }

  async function handleSaveInvestigation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInvestigationFeedback(null);
    const targetIp = investigationIp.trim();
    if (!targetIp) {
      setInvestigationFeedback({
        type: "error",
        text: "Informe um endereço IP válido para classificar.",
      });
      return;
    }

    setSavingInvestigation(true);
    try {
      await client.upsertInvestigation(
        targetIp,
        investigationStatus,
        investigationNotes.trim() ? investigationNotes.trim() : null,
      );
      setInvestigationFeedback({
        type: "success",
        text: `Classificação de ${targetIp} atualizada para "${ROTULOS_STATUS_INVESTIGACAO[investigationStatus].label}".`,
      });
      await loadDashboardData();
      if (selectedIp === targetIp) {
        await loadIpHistory(targetIp, ipHistoryPage);
      }
    } catch (err) {
      if (err instanceof ApiAuthError && err.status === 401) {
        handleUnauthorized();
        return;
      }
      setInvestigationFeedback({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Não foi possível salvar a classificação do IP.",
      });
    } finally {
      setSavingInvestigation(false);
    }
  }

  async function handleDeleteInvestigation(ipAddress: string) {
    setInvestigationFeedback(null);
    setSavingInvestigation(true);
    try {
      await client.deleteInvestigation(ipAddress);
      setInvestigationFeedback({
        type: "success",
        text: `Classificação manual removida para o IP ${ipAddress}.`,
      });
      await loadDashboardData();
      if (selectedIp === ipAddress) {
        await loadIpHistory(ipAddress, ipHistoryPage);
      }
    } catch (err) {
      if (err instanceof ApiAuthError && err.status === 401) {
        handleUnauthorized();
        return;
      }
      setInvestigationFeedback({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Não foi possível remover a classificação do IP.",
      });
    } finally {
      setSavingInvestigation(false);
    }
  }

  // Proteção estrita de rota: enquanto verifica ou sem usuário autenticado, jamais renderiza dados administrativos
  if (authChecking || !sessionUser) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6"
      >
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
          <p className="text-base font-semibold text-white">
            Validando credenciais de acesso administrativo...
          </p>
          <p className="text-xs text-slate-400">
            Nenhum dado de monitoramento é exibido sem sessão autenticada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Cabeçalho Administrativo Fixo em Tablet/Desktop e Fluido em Mobile 360px */}
      <header className="md:sticky md:top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Memoretti Guinchos • Auditoria Privada
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white">
              Painel de Monitoramento de IPs e Tráfego Pago
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200">
              Operador:{" "}
              <strong className="font-semibold text-white">
                {sessionUser.username}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => void loadDashboardData()}
              disabled={loadingDashboard}
              className="min-h-11 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              {loadingDashboard ? "Atualizando..." : "Atualizar Dados"}
            </button>
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              className="min-h-11 px-4 py-2 rounded-xl bg-red-900/70 hover:bg-red-800 text-red-100 text-sm font-semibold border border-red-700/70 transition-colors cursor-pointer"
            >
              {loggingOut ? "Saindo..." : "Encerrar Sessão"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Barra Global de Período (24h, 72h, 7 dias, 30 dias) */}
        <section
          aria-labelledby="titulo-filtro-temporal"
          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h2
              id="titulo-filtro-temporal"
              className="text-sm font-bold uppercase tracking-wider text-slate-300"
            >
              Janela Temporal de Auditoria
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Filtra simultaneamente a Visão Geral, os Alertas, a Tabela de IPs
              e o Histórico Detalhado.
            </p>
          </div>

          <div
            role="group"
            aria-label="Selecionar período de análise"
            className="grid grid-cols-2 sm:grid-cols-4 gap-2"
          >
            {OPCOES_JANELA_TEMPORAL.map((opt) => {
              const active = windowHours === opt.hours;
              return (
                <button
                  key={opt.hours}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setWindowHours(opt.hours);
                    setPage(1);
                  }}
                  className={`min-h-11 px-4 py-2 rounded-xl text-sm font-bold border transition-colors cursor-pointer ${
                    active
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow"
                      : "bg-slate-950 text-slate-200 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Tratamento de Erro Global da API */}
        {dashboardError && (
          <div
            role="alert"
            aria-live="assertive"
            className="p-4 rounded-2xl bg-red-950/90 border border-red-500/60 text-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <strong className="font-bold block">
                Falha ao consultar a API de monitoramento
              </strong>
              <span className="text-sm">{dashboardError}</span>
            </div>
            <button
              type="button"
              onClick={() => void loadDashboardData()}
              className="min-h-11 px-4 py-2 rounded-xl bg-red-800 hover:bg-red-700 text-white text-sm font-semibold self-start sm:self-center cursor-pointer"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* 1. VISÃO GERAL DE MÉTRICAS */}
        <section aria-labelledby="titulo-visao-geral" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2
                id="titulo-visao-geral"
                className="text-xl font-bold text-white"
              >
                1. Visão Geral do Período
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Métricas consolidadas das últimas {windowHours} horas com
                separação estrita entre requisições, visitas e entradas pagas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total de Visitas (Sessões)
              </span>
              <p
                data-testid="metric-total-visits"
                className="mt-2 text-3xl font-extrabold text-white"
              >
                {summary ? summary.totalVisits : "—"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Requisições brutas:{" "}
                <strong className="text-slate-200">
                  {summary ? summary.totalRequests : "—"}
                </strong>
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                IPs Únicos / Recorrentes
              </span>
              <div className="mt-2 flex items-baseline gap-3">
                <p
                  data-testid="metric-unique-ips"
                  className="text-3xl font-extrabold text-white"
                >
                  {summary ? summary.uniqueIps : "—"}
                </p>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Recorrentes:{" "}
                  <strong data-testid="metric-recurring-ips">
                    {summary ? summary.recurringIps : "—"}
                  </strong>
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                IPs com 2 ou mais visitas distintas na janela.
              </p>
            </div>

            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Entradas Pagas Identificadas
              </span>
              <p
                data-testid="metric-paid-entries"
                className="mt-2 text-3xl font-extrabold text-amber-300"
              >
                {summary ? summary.identifiedPaidEntries : "—"}
              </p>
              <p className="mt-1 text-xs text-slate-300">
                Sessões reais com GCLID/WBRAID/GBRAID ou UTM paga deduplicadas.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Cliques em Canais de Contato
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-700/40">
                  <span className="block text-xs text-emerald-300 font-semibold">
                    WhatsApp
                  </span>
                  <strong
                    data-testid="metric-whatsapp-clicks"
                    className="text-2xl font-extrabold text-emerald-200"
                  >
                    {summary ? summary.whatsappClicks : "—"}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-sky-950/50 border border-sky-700/40">
                  <span className="block text-xs text-sky-300 font-semibold">
                    Telefone
                  </span>
                  <strong
                    data-testid="metric-phone-clicks"
                    className="text-2xl font-extrabold text-sky-200"
                  >
                    {summary ? summary.phoneClicks : "—"}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Nota Técnica Obrigatória: Diferença entre Entradas Pagas Identificadas e Cliques do Google Ads */}
          <aside
            aria-labelledby="titulo-diferenca-google-ads"
            className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4 sm:p-5 text-slate-200 space-y-2"
          >
            <h3
              id="titulo-diferenca-google-ads"
              className="text-sm sm:text-base font-bold text-amber-300"
            >
              {EXPLICACAO_ENTRADAS_PAGAS_VS_GOOGLE_ADS.titulo}
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {EXPLICACAO_ENTRADAS_PAGAS_VS_GOOGLE_ADS.resumoCurto}
            </p>
            <ul className="text-xs text-slate-300 space-y-1 list-disc pl-5">
              {EXPLICACAO_ENTRADAS_PAGAS_VS_GOOGLE_ADS.pontos.map((ponto) => (
                <li key={ponto}>{ponto}</li>
              ))}
            </ul>
          </aside>

          {/* Alertas de Comportamento Suspeito */}
          <div
            aria-labelledby="titulo-alertas-suspeitos"
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3
                id="titulo-alertas-suspeitos"
                className="text-base font-bold text-white flex items-center gap-2"
              >
                <span>Alertas de Comportamento Suspeito e Integridade</span>
                <span
                  data-testid="metric-suspicious-alerts"
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40"
                >
                  {investigativeAlerts.length} alerta(s)
                </span>
              </h3>
              <div className="text-xs text-slate-400 flex flex-wrap gap-3">
                <span>
                  Tentativas de Spoofing:{" "}
                  <strong className="text-slate-200">
                    {summary ? summary.spoofAttempts : 0}
                  </strong>
                </span>
                <span>
                  Divergências de Header Proxy:{" "}
                  <strong className="text-slate-200">
                    {summary ? summary.headerMismatches : 0}
                  </strong>
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5">
              <strong className="text-amber-300">Nota de Governança:</strong>{" "}
              Alertas baseados apenas em repetição de visitas ou entradas pagas
              possuem <strong>baixa confiança</strong> (podem decorrer de CGNAT
              em redes móveis ou clientes comparando orçamentos).{" "}
              <strong>
                Nenhuma classificação ou alerta representa uma conclusão
                automática de fraude.
              </strong>
            </p>

            {investigativeAlerts.length === 0 ? (
              <p className="text-sm text-slate-400 py-2">
                Nenhum comportamento suspeito ou anomalia de cabeçalho detectada
                na janela e página atuais.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {investigativeAlerts.map((alert) => (
                  <li
                    key={alert.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      alert.severity === "alta"
                        ? "bg-red-950/40 border-red-500/50 text-red-100"
                        : alert.severity === "media"
                          ? "bg-amber-950/40 border-amber-500/50 text-amber-100"
                          : "bg-slate-950/80 border-slate-700 text-slate-200"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-black/40 border border-white/15">
                          {alert.confidenceLabel}
                        </span>
                        <strong className="text-sm font-bold">
                          {alert.title}
                        </strong>
                      </div>
                      <p className="text-xs opacity-90">{alert.description}</p>
                      <p className="text-[11px] text-amber-200/90 italic">
                        {alert.disclaimer}
                      </p>
                    </div>
                    {alert.ipAddress && (
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectIpByAddress(alert.ipAddress!)
                        }
                        className="min-h-11 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-bold shrink-0 cursor-pointer"
                      >
                        Inspecionar IP {alert.ipAddress}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* 2. MONITORAMENTO DE IPs (Filtros, Pesquisa, Ordenação, Tabela Responsiva e Paginação) */}
        <section
          aria-labelledby="titulo-monitoramento-ips"
          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-5"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2
                id="titulo-monitoramento-ips"
                className="text-xl font-bold text-white"
              >
                2. Monitoramento de IPs
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Clique em qualquer IP para abrir a linha do tempo detalhada de
                sessões, eventos de contato, UTMs/GCLID e registrar
                classificação manual.
              </p>
            </div>

            {/* Botões de Exportação Autenticada CSV / JSON */}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={client.buildExportUrl({
                  type: "ips",
                  format: "csv",
                  hours: windowHours,
                  searchIp: appliedSearchIp,
                  trafficCategory: trafficFilter,
                  investigationStatus: statusFilter,
                  onlyPaid,
                  onlyRecurring,
                })}
                download
                className="min-h-11 inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-bold transition-colors"
              >
                Exportar IPs (CSV)
              </a>
              <a
                href={client.buildExportUrl({
                  type: "ips",
                  format: "json",
                  hours: windowHours,
                  searchIp: appliedSearchIp,
                  trafficCategory: trafficFilter,
                  investigationStatus: statusFilter,
                  onlyPaid,
                  onlyRecurring,
                })}
                download
                className="min-h-11 inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-bold transition-colors"
              >
                Exportar IPs (JSON)
              </a>
              <a
                href={client.buildExportUrl({
                  type: "events",
                  format: "csv",
                  hours: windowHours,
                  searchIp: appliedSearchIp,
                  trafficCategory: trafficFilter,
                })}
                download
                className="min-h-11 inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-bold transition-colors"
              >
                Exportar Eventos (CSV)
              </a>
            </div>
          </div>

          {/* Formulário de Pesquisa e Filtros */}
          <form
            onSubmit={handleSearchSubmit}
            aria-label="Filtros e pesquisa de IPs monitorados"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-800"
          >
            <div className="sm:col-span-2">
              <label
                htmlFor="pesquisa-ip-input"
                className="block text-xs font-semibold text-slate-300 mb-1"
              >
                Pesquisar por Endereço IP
              </label>
              <div className="flex gap-2">
                <input
                  id="pesquisa-ip-input"
                  type="search"
                  value={searchIpInput}
                  onChange={(e) => setSearchIpInput(e.target.value)}
                  placeholder="Ex.: 177.55.44.10 ou 177.55."
                  className="w-full min-h-11 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button
                  type="submit"
                  className="min-h-11 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shrink-0 cursor-pointer"
                >
                  Buscar
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="filtro-origem-trafego"
                className="block text-xs font-semibold text-slate-300 mb-1"
              >
                Origem do Tráfego
              </label>
              <select
                id="filtro-origem-trafego"
                value={trafficFilter}
                onChange={(e) => {
                  setTrafficFilter(e.target.value as TrafficCategory | "");
                  setPage(1);
                }}
                className="w-full min-h-11 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">Todas as origens</option>
                <option value="paid_google">Pago • Google Ads</option>
                <option value="paid_other">Pago • Outras Mídias</option>
                <option value="organic">Busca Orgânica</option>
                <option value="direct">Acesso Direto</option>
                <option value="referral">Referência Externa</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="filtro-status-investigacao"
                className="block text-xs font-semibold text-slate-300 mb-1"
              >
                Classificação Manual
              </label>
              <select
                id="filtro-status-investigacao"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as InvestigatedIpStatus | "");
                  setPage(1);
                }}
                className="w-full min-h-11 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">Todas as classificações</option>
                <option value="suspeito_ads">Suspeito em Ads</option>
                <option value="em_observacao">Em Observação</option>
                <option value="legitimo_recorrente">Legítimo Recorrente</option>
                <option value="ignorado">Ignorado</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="ordenar-por-select"
                className="block text-xs font-semibold text-slate-300 mb-1"
              >
                Ordenar por
              </label>
              <div className="flex gap-1.5">
                <select
                  id="ordenar-por-select"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as IpSortField);
                    setPage(1);
                  }}
                  className="w-full min-h-11 px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="identifiedPaidEntries">Entradas Pagas</option>
                  <option value="totalVisits">Total de Visitas</option>
                  <option value="totalRequests">Total de Requisições</option>
                  <option value="lastSeenAt">Última Ocorrência</option>
                </select>
                <button
                  type="button"
                  aria-label={`Alternar direção da ordenação (atual: ${
                    sortOrder === "desc" ? "decrescente" : "crescente"
                  })`}
                  onClick={() => {
                    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
                    setPage(1);
                  }}
                  className="min-h-11 min-w-11 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-amber-300 cursor-pointer"
                >
                  {sortOrder === "desc" ? "↓" : "↑"}
                </button>
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-5 flex flex-wrap items-center gap-4 pt-1">
              <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-200 cursor-pointer min-h-11">
                <input
                  type="checkbox"
                  checked={onlyPaid}
                  onChange={(e) => {
                    setOnlyPaid(e.target.checked);
                    setPage(1);
                  }}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span>Somente IPs com Entradas Pagas</span>
              </label>

              <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-200 cursor-pointer min-h-11">
                <input
                  type="checkbox"
                  checked={onlyRecurring}
                  onChange={(e) => {
                    setOnlyRecurring(e.target.checked);
                    setPage(1);
                  }}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span>Somente IPs Recorrentes (2+ visitas)</span>
              </label>

              {(appliedSearchIp ||
                trafficFilter ||
                statusFilter ||
                onlyPaid ||
                onlyRecurring) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchIpInput("");
                    setAppliedSearchIp("");
                    setTrafficFilter("");
                    setStatusFilter("");
                    setOnlyPaid(false);
                    setOnlyRecurring(false);
                    setPage(1);
                  }}
                  className="min-h-11 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 cursor-pointer"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          </form>

          {/* Estado de Carregamento / Lista Vazia / Tabela + Cards Mobile */}
          {loadingDashboard ? (
            <div
              role="status"
              aria-live="polite"
              className="py-12 text-center text-sm text-slate-400"
            >
              Carregando IPs monitorados na janela de {windowHours}h...
            </div>
          ) : ipItems.length === 0 ? (
            <div className="py-12 text-center bg-slate-950/60 border border-slate-800 rounded-xl p-6 space-y-2">
              <p className="text-base font-semibold text-slate-200">
                Nenhum endereço IP encontrado para os filtros selecionados.
              </p>
              <p className="text-xs text-slate-400">
                Experimente ampliar a janela temporal (ex.: 7 dias ou 30 dias)
                ou limpar os filtros ativos.
              </p>
            </div>
          ) : (
            <>
              {/* Visualização Mobile (360px - 767px): Cards Responsivos */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {ipItems.map((item) => {
                  const primaryOrigin =
                    item.primaryTrafficCategory ??
                    (item.identifiedPaidEntries > 0 ? "paid_google" : "direct");
                  const originMeta = ROTULOS_ORIGEM_TRAFEGO[primaryOrigin];
                  const statusMeta = item.investigationStatus
                    ? ROTULOS_STATUS_INVESTIGACAO[item.investigationStatus]
                    : null;
                  const isSelected = selectedIp === item.ipAddress;

                  return (
                    <article
                      key={item.ipAddress}
                      className={`p-4 rounded-xl border space-y-3 ${
                        isSelected
                          ? "bg-slate-800/90 border-amber-400"
                          : "bg-slate-950/80 border-slate-800"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-base font-bold text-white">
                            {item.ipAddress}
                          </span>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${originMeta.badgeClass}`}
                            >
                              {originMeta.label}
                            </span>
                            {statusMeta ? (
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${statusMeta.badgeClass}`}
                              >
                                {statusMeta.label}
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] text-slate-400 border border-slate-700">
                                Sem classificação
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectIpForInspection(item)}
                          className="min-h-11 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer"
                        >
                          {isSelected ? "Selecionado" : "Ver Histórico"}
                        </button>
                      </div>

                      <dl className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-slate-900">
                          <dt className="text-slate-400">Visitas / Req.</dt>
                          <dd className="font-bold text-white mt-0.5">
                            {item.totalVisits} vis. ({item.totalRequests} req.)
                          </dd>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900">
                          <dt className="text-amber-300">Entradas Pagas</dt>
                          <dd className="font-bold text-amber-300 mt-0.5">
                            {item.identifiedPaidEntries}
                          </dd>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900">
                          <dt className="text-slate-400">WhatsApp / Tel.</dt>
                          <dd className="font-bold text-emerald-300 mt-0.5">
                            {item.whatsappClicks} WA • {item.phoneClicks} Tel
                          </dd>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900">
                          <dt className="text-slate-400">Última Ocorrência</dt>
                          <dd className="font-semibold text-slate-200 mt-0.5">
                            {formatarDataHoraPtBr(item.lastSeenAt)}
                          </dd>
                        </div>
                      </dl>
                    </article>
                  );
                })}
              </div>

              {/* Visualização Desktop / Tablet (768px+): Tabela Completa */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 text-xs uppercase tracking-wider">
                      <th scope="col" className="py-3.5 px-4 font-bold">
                        Endereço IP
                      </th>
                      <th scope="col" className="py-3.5 px-3 font-bold">
                        Visitas / Req.
                      </th>
                      <th scope="col" className="py-3.5 px-3 font-bold">
                        Entradas Pagas
                      </th>
                      <th scope="col" className="py-3.5 px-3 font-bold">
                        Contatos (WA / Tel)
                      </th>
                      <th scope="col" className="py-3.5 px-3 font-bold">
                        Primeira / Última Ocorrência
                      </th>
                      <th scope="col" className="py-3.5 px-3 font-bold">
                        Origem do Tráfego
                      </th>
                      <th scope="col" className="py-3.5 px-3 font-bold">
                        Classificação
                      </th>
                      <th
                        scope="col"
                        className="py-3.5 px-4 font-bold text-right"
                      >
                        Ação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {ipItems.map((item) => {
                      const primaryOrigin =
                        item.primaryTrafficCategory ??
                        (item.identifiedPaidEntries > 0
                          ? "paid_google"
                          : "direct");
                      const originMeta = ROTULOS_ORIGEM_TRAFEGO[primaryOrigin];
                      const statusMeta = item.investigationStatus
                        ? ROTULOS_STATUS_INVESTIGACAO[item.investigationStatus]
                        : null;
                      const isSelected = selectedIp === item.ipAddress;

                      return (
                        <tr
                          key={item.ipAddress}
                          className={`transition-colors ${
                            isSelected
                              ? "bg-amber-500/10"
                              : "hover:bg-slate-800/50"
                          }`}
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-white">
                            {item.ipAddress}
                            {item.paidClickIds.length > 0 && (
                              <span className="block text-[11px] font-sans font-normal text-amber-300 mt-0.5">
                                {item.paidClickIds.length} ID(s) de campanha
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3">
                            <strong className="text-white font-bold">
                              {item.totalVisits}
                            </strong>{" "}
                            <span className="text-xs text-slate-400">
                              ({item.totalRequests} req)
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                item.identifiedPaidEntries >= 2
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                  : "text-slate-200"
                              }`}
                            >
                              {item.identifiedPaidEntries}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-xs">
                            <span className="text-emerald-300 font-semibold">
                              {item.whatsappClicks} WA
                            </span>{" "}
                            •{" "}
                            <span className="text-sky-300 font-semibold">
                              {item.phoneClicks} Tel
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-xs text-slate-300">
                            <div>
                              <span className="text-slate-400">1ª:</span>{" "}
                              {formatarDataHoraPtBr(item.firstSeenAt)}
                            </div>
                            <div>
                              <span className="text-slate-400">Últ.:</span>{" "}
                              {formatarDataHoraPtBr(item.lastSeenAt)}
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold border ${originMeta.badgeClass}`}
                            >
                              {originMeta.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            {statusMeta ? (
                              <span
                                className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold border ${statusMeta.badgeClass}`}
                              >
                                {statusMeta.label}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">
                                Não classificado
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleSelectIpForInspection(item)}
                              className="min-h-11 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
                            >
                              {isSelected
                                ? "Inspecionando"
                                : "Histórico / Investigar"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Paginação da Tabela de IPs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-400">
                  Exibindo <strong className="text-white">{ipItems.length}</strong>{" "}
                  de <strong className="text-white">{ipTotal}</strong> IP(s) —
                  Página <strong className="text-white">{page}</strong> de{" "}
                  <strong className="text-white">{totalPages}</strong>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="min-h-11 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 text-xs font-bold text-slate-200 cursor-pointer"
                  >
                    Página Anterior
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="min-h-11 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 text-xs font-bold text-slate-200 cursor-pointer"
                  >
                    Próxima Página
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        {/* 3. HISTÓRICO DETALHADO E LINHA DO TEMPO DE ACESSOS + 4. INVESTIGAÇÃO MANUAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal (2/3): Histórico Detalhado do IP Selecionado */}
          <section
            aria-labelledby="titulo-historico-detalhado"
            className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <h2
                  id="titulo-historico-detalhado"
                  className="text-xl font-bold text-white"
                >
                  3. Histórico Detalhado por IP
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Linha do tempo de acessos, agrupamento por sessão, cliques no
                  WhatsApp/Telefone e identificadores de campanha (GCLID / UTMs).
                </p>
              </div>
              {selectedIp && (
                <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 font-mono text-sm font-bold text-amber-300">
                  IP: {selectedIp}
                </span>
              )}
            </div>

            {!selectedIp ? (
              <div className="py-12 text-center bg-slate-950/60 border border-slate-800 rounded-xl p-6 space-y-2">
                <p className="text-base font-semibold text-slate-200">
                  Selecione um endereço IP na tabela acima ou nos alertas para
                  inspecionar seu histórico detalhado.
                </p>
                <p className="text-xs text-slate-400">
                  Você verá todas as sessões, páginas visitadas, cliques de
                  contato e parâmetros de campanha capturados.
                </p>
              </div>
            ) : loadingHistory ? (
              <div
                role="status"
                aria-live="polite"
                className="py-12 text-center text-sm text-slate-400"
              >
                Carregando linha do tempo de acessos para o IP {selectedIp}...
              </div>
            ) : historyError ? (
              <div
                role="alert"
                className="p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-100 text-sm"
              >
                {historyError}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Resumo consolidado do IP e Identificadores de Campanhas Disponíveis */}
                {ipHistorySummary && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block">
                          Visitas / Requisições
                        </span>
                        <strong className="text-base text-white">
                          {ipHistorySummary.totalVisits} vis. /{" "}
                          {ipHistorySummary.totalRequests} req.
                        </strong>
                      </div>
                      <div>
                        <span className="text-amber-300 block">
                          Entradas Pagas Identificadas
                        </span>
                        <strong className="text-base text-amber-300">
                          {ipHistorySummary.identifiedPaidEntries}
                        </strong>
                      </div>
                      <div>
                        <span className="text-emerald-300 block">
                          Cliques no WhatsApp
                        </span>
                        <strong className="text-base text-emerald-300">
                          {ipHistorySummary.whatsappClicks}
                        </strong>
                      </div>
                      <div>
                        <span className="text-sky-300 block">
                          Cliques em Telefone
                        </span>
                        <strong className="text-base text-sky-300">
                          {ipHistorySummary.phoneClicks}
                        </strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-xs font-semibold text-slate-300 block mb-1.5">
                        Identificadores de Campanhas Disponíveis (GCLID / WBRAID /
                        GBRAID / UTM):
                      </span>
                      {ipHistorySummary.paidClickIds.length === 0 ? (
                        <span className="text-xs text-slate-400">
                          Nenhum identificador de campanha paga associado a este
                          IP na janela consultada.
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {ipHistorySummary.paidClickIds.map((cid) => (
                            <code
                              key={cid}
                              className="px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-mono break-all"
                            >
                              {cid}
                            </code>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Agrupamento de Sessões e Linha do Tempo de Acessos */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    Sessões Identificadas ({sessionTimelineGroups.length}) e
                    Linha do Tempo ({ipHistoryTotal} eventos)
                  </h3>

                  {sessionTimelineGroups.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      Nenhum evento encontrado para o IP {selectedIp} nesta
                      janela temporal.
                    </p>
                  ) : (
                    sessionTimelineGroups.map((group) => {
                      const originMeta =
                        ROTULOS_ORIGEM_TRAFEGO[group.primaryTrafficCategory];
                      return (
                        <div
                          key={group.sessionId}
                          className="rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden"
                        >
                          <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                            <div className="space-y-0.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-white">
                                  Sessão:{" "}
                                  <code className="font-mono text-amber-300">
                                    {group.sessionId.slice(0, 18)}...
                                  </code>
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${originMeta.badgeClass}`}
                                >
                                  {originMeta.label}
                                </span>
                                {group.hasPaidEntry && (
                                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                    Entrada Paga Identificada
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400">
                                Início: {formatarDataHoraPtBr(group.startedAt)}{" "}
                                • Última ação:{" "}
                                {formatarDataHoraPtBr(group.endedAt)} •{" "}
                                {group.totalEvents} evento(s)
                              </p>
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-700/50 text-emerald-300 font-semibold">
                                WA: {group.whatsappClicks}
                              </span>
                              <span className="px-2.5 py-1 rounded-lg bg-sky-950 border border-sky-700/50 text-sky-300 font-semibold">
                                Tel: {group.phoneClicks}
                              </span>
                            </div>
                          </div>

                          <ol className="divide-y divide-slate-800/70">
                            {group.events.map((ev) => {
                              const evMeta = ROTULOS_TIPO_EVENTO[ev.eventType];
                              return (
                                <li
                                  key={ev.id}
                                  className="p-3.5 text-xs space-y-1.5"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span
                                        className={`px-2 py-0.5 rounded font-semibold border ${evMeta.badgeClass}`}
                                      >
                                        {evMeta.label}
                                      </span>
                                      <code className="font-mono text-slate-100 font-bold">
                                        {ev.pagePath}
                                      </code>
                                      {ev.isNewVisit && (
                                        <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold">
                                          Início de Visita
                                        </span>
                                      )}
                                      {ev.isPaidEntry && (
                                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                                          1ª Entrada Paga da Sessão
                                        </span>
                                      )}
                                    </div>
                                    <time
                                      dateTime={ev.createdAt}
                                      className="text-slate-400 font-mono"
                                    >
                                      {formatarDataHoraPtBr(ev.createdAt)}
                                    </time>
                                  </div>

                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-300">
                                    <span>
                                      Dispositivo:{" "}
                                      <strong>
                                        {ev.deviceType} ({ev.browserFamily} /{" "}
                                        {ev.osFamily})
                                      </strong>
                                    </span>
                                    {ev.buttonLocation && (
                                      <span>
                                        Local do botão:{" "}
                                        <code className="text-emerald-300">
                                          {ev.buttonLocation}
                                        </code>
                                      </span>
                                    )}
                                    {ev.contactTarget && (
                                      <span>
                                        Alvo de contato:{" "}
                                        <code className="text-emerald-300">
                                          {ev.contactTarget}
                                        </code>
                                      </span>
                                    )}
                                    {ev.paidClickId && (
                                      <span>
                                        Click ID ({ev.paidClickType}):{" "}
                                        <code className="text-amber-300">
                                          {ev.paidClickId}
                                        </code>
                                      </span>
                                    )}
                                    {(ev.utmSource ||
                                      ev.utmMedium ||
                                      ev.utmCampaign ||
                                      ev.utmTerm) && (
                                      <span>
                                        UTM:{" "}
                                        <code className="text-slate-200">
                                          {[
                                            ev.utmSource &&
                                              `source=${ev.utmSource}`,
                                            ev.utmMedium &&
                                              `medium=${ev.utmMedium}`,
                                            ev.utmCampaign &&
                                              `campaign=${ev.utmCampaign}`,
                                            ev.utmTerm && `term=${ev.utmTerm}`,
                                          ]
                                            .filter(Boolean)
                                            .join(" | ")}
                                        </code>
                                      </span>
                                    )}
                                  </div>

                                  {(ev.spoofAttemptDetected ||
                                    ev.ipHeaderMismatch) && (
                                    <div className="text-[11px] text-red-300 font-semibold">
                                      {ev.spoofAttemptDetected &&
                                        "⚠ Tentativa de spoofing em X-Forwarded-For neutralizada. "}
                                      {ev.ipHeaderMismatch &&
                                        "⚠ Divergência entre cabeçalhos de proxy detectada."}
                                    </div>
                                  )}
                                </li>
                              );
                            })}
                          </ol>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Coluna Lateral (1/3): 4. Investigação, Classificação Manual e Exportação */}
          <section
            aria-labelledby="titulo-investigacao-ips"
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-5"
          >
            <div>
              <h2
                id="titulo-investigacao-ips"
                className="text-xl font-bold text-white"
              >
                4. Investigação e Classificação Manual
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Classifique IPs manualmente e registre observações de auditoria.{" "}
                <strong className="text-amber-300">
                  Nenhum bloqueio automático é executado.
                </strong>
              </p>
            </div>

            <form
              onSubmit={handleSaveInvestigation}
              aria-label="Formulário de classificação manual de IP"
              className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800"
            >
              {investigationFeedback && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`p-3 rounded-xl text-xs font-semibold border ${
                    investigationFeedback.type === "success"
                      ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-200"
                      : "bg-red-950/80 border-red-500/50 text-red-200"
                  }`}
                >
                  {investigationFeedback.text}
                </div>
              )}

              <div>
                <label
                  htmlFor="campo-ip-investigado"
                  className="block text-xs font-semibold text-slate-300 mb-1"
                >
                  Endereço IP (IPv4 ou IPv6)
                </label>
                <input
                  id="campo-ip-investigado"
                  type="text"
                  required
                  value={investigationIp}
                  onChange={(e) => setInvestigationIp(e.target.value)}
                  placeholder="Ex.: 177.55.44.10"
                  className="w-full min-h-11 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label
                  htmlFor="campo-status-investigacao"
                  className="block text-xs font-semibold text-slate-300 mb-1"
                >
                  Classificação Manual
                </label>
                <select
                  id="campo-status-investigacao"
                  value={investigationStatus}
                  onChange={(e) =>
                    setInvestigationStatus(
                      e.target.value as InvestigatedIpStatus,
                    )
                  }
                  className="w-full min-h-11 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="suspeito_ads">Suspeito em Ads</option>
                  <option value="em_observacao">Em Observação</option>
                  <option value="legitimo_recorrente">
                    Legítimo Recorrente
                  </option>
                  <option value="ignorado">Ignorado</option>
                </select>
                <p className="mt-1 text-[11px] text-slate-400">
                  {ROTULOS_STATUS_INVESTIGACAO[investigationStatus].description}
                </p>
              </div>

              <div>
                <label
                  htmlFor="campo-notas-investigacao"
                  className="block text-xs font-semibold text-slate-300 mb-1"
                >
                  Observações de Auditoria (até 2.000 caracteres)
                </label>
                <textarea
                  id="campo-notas-investigacao"
                  rows={3}
                  maxLength={2000}
                  value={investigationNotes}
                  onChange={(e) => setInvestigationNotes(e.target.value)}
                  placeholder="Ex.: 4 entradas pagas em 2h sem clique no WhatsApp. Candidato a exclusão manual no Google Ads."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={savingInvestigation}
                className="w-full min-h-11 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm transition-colors cursor-pointer"
              >
                {savingInvestigation
                  ? "Salvando Classificação..."
                  : "Salvar Classificação do IP"}
              </button>
            </form>

            {/* Exportação de IPs Investigados */}
            <div className="flex flex-wrap gap-2">
              <a
                href={client.buildExportUrl({
                  type: "investigated_ips",
                  format: "csv",
                })}
                download
                className="min-h-11 flex-1 inline-flex items-center justify-center px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-100"
              >
                Exportar Investigados (CSV)
              </a>
              <a
                href={client.buildExportUrl({
                  type: "investigated_ips",
                  format: "json",
                })}
                download
                className="min-h-11 flex-1 inline-flex items-center justify-center px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-100"
              >
                Exportar Investigados (JSON)
              </a>
            </div>

            {/* Lista de IPs Investigados */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                IPs Classificados Manualmente ({investigatedList.length})
              </h3>

              {investigatedList.length === 0 ? (
                <p className="text-xs text-slate-400">
                  Nenhum IP classificado manualmente até o momento.
                </p>
              ) : (
                <ul className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {investigatedList.map((inv) => {
                    const meta = ROTULOS_STATUS_INVESTIGACAO[inv.status];
                    return (
                      <li
                        key={inv.ipAddress}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleSelectIpByAddress(inv.ipAddress)
                            }
                            className="font-mono font-bold text-amber-300 hover:underline text-left min-h-11 inline-flex items-center cursor-pointer"
                          >
                            {inv.ipAddress}
                          </button>
                          <span
                            className={`px-2 py-0.5 rounded font-semibold border ${meta.badgeClass}`}
                          >
                            {meta.label}
                          </span>
                        </div>
                        {inv.notes && (
                          <p className="text-slate-300 break-words">
                            {inv.notes}
                          </p>
                        )}
                        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                          <span>
                            Atualizado: {formatarDataHoraPtBr(inv.updatedAt)}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              void handleDeleteInvestigation(inv.ipAddress)
                            }
                            className="min-h-11 px-2.5 py-1 rounded-lg text-red-300 hover:bg-red-950/60 font-semibold cursor-pointer"
                          >
                            Remover
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
