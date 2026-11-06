"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ApiAuthError,
  MonitoringDashboardApiClient,
} from "@/lib/painel-monitoramento-api";

export interface LoginPainelProps {
  apiClient?: MonitoringDashboardApiClient;
  onLoginSuccess?: () => void;
}

export function LoginPainel({ apiClient, onLoginSuccess }: LoginPainelProps) {
  const router = useRouter();
  const [client] = useState(
    () => apiClient ?? new MonitoringDashboardApiClient(),
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    client
      .getSession()
      .then(() => {
        if (!active) return;
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          router.replace("/painel-monitoramento");
        }
      })
      .catch(() => {
        if (active) setCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, [client, onLoginSuccess, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg(null);

    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      setErrorMsg("Preencha o usuário administrativo e a senha.");
      return;
    }

    setLoading(true);
    try {
      await client.login(trimmedUser, password);
      setPassword("");
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        router.replace("/painel-monitoramento");
      }
    } catch (err) {
      if (err instanceof ApiAuthError) {
        if (err.status === 429) {
          setErrorMsg(
            "Limite de tentativas excedido temporariamente por segurança. Aguarde alguns minutos antes de tentar novamente.",
          );
        } else if (err.status === 401) {
          setErrorMsg("Credenciais inválidas. Verifique o usuário e a senha.");
        } else {
          setErrorMsg(err.message);
        }
      } else {
        setErrorMsg(
          "Falha de comunicação com o serviço de monitoramento. Tente novamente.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-8">
      <main
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8"
        aria-labelledby="titulo-login-monitoramento"
      >
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
            Acesso Restrito • Auditoria de Tráfego
          </span>
          <h1
            id="titulo-login-monitoramento"
            className="mt-3 text-2xl sm:text-3xl font-bold text-white tracking-tight"
          >
            Painel de Monitoramento Memoretti
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Ambiente privado para auditoria de IPs, entradas pagas identificadas
            e cliques em canais de contato. Sessão protegida via cookie{" "}
            <code className="text-amber-300 font-mono text-xs">HttpOnly</code>{" "}
            sem armazenamento local de tokens.
          </p>
        </div>

        {checkingSession ? (
          <div
            role="status"
            aria-live="polite"
            className="py-8 text-center text-sm text-slate-300"
          >
            Verificando sessão administrativa ativa...
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            aria-label="Formulário de autenticação do painel de monitoramento"
            className="space-y-5"
            noValidate
          >
            {errorMsg && (
              <div
                role="alert"
                aria-live="assertive"
                className="p-4 rounded-xl bg-red-950/80 border border-red-500/60 text-red-100 text-sm leading-relaxed"
              >
                <strong className="font-semibold block mb-0.5">
                  Não foi possível autenticar
                </strong>
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="campo-usuario-admin"
                className="block text-sm font-semibold text-slate-200 mb-2"
              >
                Usuário administrativo
              </label>
              <input
                id="campo-usuario-admin"
                name="username"
                type="text"
                autoComplete="username"
                required
                disabled={loading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex.: admin_memoretti"
                className="w-full min-h-12 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-base"
              />
            </div>

            <div>
              <label
                htmlFor="campo-senha-admin"
                className="block text-sm font-semibold text-slate-200 mb-2"
              >
                Senha de acesso
              </label>
              <input
                id="campo-senha-admin"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full min-h-12 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-base"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-12 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-slate-950 font-bold text-base transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-amber-400 cursor-pointer"
            >
              {loading ? "Autenticando..." : "Entrar no Painel"}
            </button>
          </form>
        )}

        <footer className="mt-6 pt-5 border-t border-slate-800 text-xs text-slate-400 space-y-1.5">
          <p>
            • Proteção ativa contra força bruta por IP e por conta
            administrativa.
          </p>
          <p>
            • Nenhum bloqueio automático de visitantes é executado por este
            painel.
          </p>
        </footer>
      </main>
    </div>
  );
}
