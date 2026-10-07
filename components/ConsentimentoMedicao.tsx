"use client";

import Link from "next/link";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  CONSENTIMENTO_TOTAL,
  EVENTO_ABRIR_PREFERENCIAS,
  GOOGLE_ADS_ID,
  SEM_CONSENTIMENTO,
  algumaCategoriaAceita,
  assinarPreferencia,
  definirPreferencia,
  hidratacao,
  obterPreferencia,
  obterPreferenciaNoServidor,
  sinalConsentGoogle,
  type CategoriasConsentimento,
} from "@/lib/medicao";

type JanelaMedicao = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

/** Fila do gtag.js criada no cliente, só quando já existe aceite. */
function instalarFila(janela: JanelaMedicao): (...args: unknown[]) => void {
  janela.dataLayer = janela.dataLayer ?? [];
  if (typeof janela.gtag !== "function") {
    janela.gtag = function gtag() {
      // O gtag.js lê o próprio objeto `arguments` da fila; rest args não servem.
      // eslint-disable-next-line prefer-rest-params
      janela.dataLayer?.push(arguments);
    };
  }
  return janela.gtag;
}

const CATEGORIAS = [
  {
    chave: "medicao" as const,
    titulo: "Medição de audiência",
    descricao:
      "Saber quantas pessoas chegam ao site e por quais páginas, em números agregados.",
  },
  {
    chave: "publicidade" as const,
    titulo: "Publicidade",
    descricao:
      "Medir o resultado dos anúncios do Google Ads que trazem visitantes até aqui.",
  },
] as const;

/**
 * Banner e painel de consentimento, e único ponto do site que carrega a tag do
 * Google. A regra que não se negocia: enquanto não houver escolha afirmativa,
 * nenhum script de terceiro entra na página e nenhuma requisição sai para o
 * Google. WhatsApp, telefone e todo o conteúdo funcionam sem decidir nada.
 */
export function ConsentimentoMedicao() {
  const hidratado = useSyncExternalStore(
    hidratacao.assinar,
    hidratacao.noCliente,
    hidratacao.noServidor,
  );
  const preferencia = useSyncExternalStore(
    assinarPreferencia,
    obterPreferencia,
    obterPreferenciaNoServidor,
  );

  const [reaberto, setReaberto] = useState(false);
  const [painelAberto, setPainelAberto] = useState(false);
  const [escolhas, setEscolhas] = useState<CategoriasConsentimento>(SEM_CONSENTIMENTO);
  const carregouNestaVisita = useRef(false);

  // Reabertura do painel pelo rodapé e pela política de privacidade.
  useEffect(() => {
    function abrir() {
      setEscolhas(
        preferencia
          ? { medicao: preferencia.medicao, publicidade: preferencia.publicidade }
          : SEM_CONSENTIMENTO,
      );
      setReaberto(true);
      setPainelAberto(true);
    }
    window.addEventListener(EVENTO_ABRIR_PREFERENCIAS, abrir);
    return () => window.removeEventListener(EVENTO_ABRIR_PREFERENCIAS, abrir);
  }, [preferencia]);

  const ativo = preferencia !== null && algumaCategoriaAceita(preferencia);

  // Consent Mode v2 e configuração da tag. O `default` negado entra antes do
  // `update` para que a ordem na fila fique correta mesmo quando o visitante
  // troca de escolha dentro da mesma visita.
  useEffect(() => {
    if (!ativo || !preferencia) return;
    const janela = window as JanelaMedicao;
    const gtag = instalarFila(janela);

    if (!carregouNestaVisita.current) {
      gtag("consent", "default", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied",
      });
      gtag("js", new Date());
      gtag("config", GOOGLE_ADS_ID);
      carregouNestaVisita.current = true;
    }

    gtag("consent", "update", sinalConsentGoogle(preferencia));
  }, [ativo, preferencia]);

  const decidir = useCallback((novas: CategoriasConsentimento) => {
    definirPreferencia(novas);
    setEscolhas(novas);
    setReaberto(false);
    setPainelAberto(false);

    // Se a tag já havia sido carregada nesta visita e o visitante acabou de
    // retirar o consentimento, o `update` negado não remove o que já está em
    // memória. Recarregar devolve o site ao estado sem scripts.
    if (!algumaCategoriaAceita(novas) && carregouNestaVisita.current) {
      window.location.reload();
    }
  }, []);

  if (!hidratado) return null;

  const avisoVisivel = preferencia === null || reaberto;

  return (
    <>
      {ativo ? (
        <Script
          id="gtag-google-ads"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        />
      ) : null}

      {avisoVisivel ? (
        <aside
          aria-label="Aviso de privacidade e medição"
          className="consentimento"
          role="region"
        >
          <div
            className={
              painelAberto
                ? "consentimento__tarja consentimento__tarja--expandida"
                : "consentimento__tarja"
            }
          >
            <p className="consentimento__texto">
              Cookies do <strong>Google Ads</strong> para medir o resultado dos
              anúncios, carregados só depois da sua escolha. Recusar não limita
              nada no site.{" "}
              <Link href="/politica-de-privacidade">Política de Privacidade</Link>.
            </p>

            {painelAberto ? (
              <div className="consentimento__painel" id="consentimento-painel">
                <fieldset className="consentimento__categorias">
                  <legend>Escolha por finalidade</legend>
                  {CATEGORIAS.map((categoria) => (
                    <label className="consentimento__categoria" key={categoria.chave}>
                      <input
                        checked={escolhas[categoria.chave]}
                        onChange={(evento) =>
                          setEscolhas((atual) => ({
                            ...atual,
                            [categoria.chave]: evento.target.checked,
                          }))
                        }
                        type="checkbox"
                      />
                      <span className="consentimento__categoria-texto">
                        <strong>{categoria.titulo}</strong>
                        <span>{categoria.descricao}</span>
                      </span>
                    </label>
                  ))}
                </fieldset>
                <p className="consentimento__nota">
                  Os links de contato e os registros técnicos da hospedagem são
                  necessários ao funcionamento do site e não entram nesta escolha.
                </p>
              </div>
            ) : null}

            <div className="consentimento__acoes">
              <button
                className="consentimento__botao"
                onClick={() => decidir(CONSENTIMENTO_TOTAL)}
                type="button"
              >
                Aceitar
              </button>
              <button
                className="consentimento__botao"
                onClick={() => decidir(SEM_CONSENTIMENTO)}
                type="button"
              >
                Recusar
              </button>
              {painelAberto ? (
                <button
                  className="consentimento__botao"
                  onClick={() => decidir(escolhas)}
                  type="button"
                >
                  Salvar
                </button>
              ) : (
                <button
                  aria-controls="consentimento-painel"
                  aria-expanded={false}
                  className="consentimento__botao"
                  onClick={() => setPainelAberto(true)}
                  type="button"
                >
                  Gerenciar
                </button>
              )}
            </div>
          </div>
        </aside>
      ) : null}
    </>
  );
}
