/**
 * Camada de medição do site e contrato técnico de consentimento.
 *
 * Tag informada pelo responsável em 07/10/2026: Google Ads `AW-18490859899`
 * (gtag.js). O contrato de `docs/05-medicao-privacidade.md` e o gate de
 * lançamento do projeto valem sem exceção: **o script não é baixado nem
 * executado antes de escolha afirmativa do visitante**. Não há carregamento
 * "em modo negado": na ausência de aceite, nenhuma requisição sai para o
 * Google.
 *
 * Nenhuma conversão do Google Ads é configurada aqui. A tag base mede visitas
 * e permite remarketing; eventos `click_whatsapp`/`click_phone` como conversão
 * dependem do rótulo de conversão da conta, que continua `[PREENCHER]`.
 */

/** Identificador da conta do Google Ads (tag base gtag.js). */
export const GOOGLE_ADS_ID = "AW-18490859899";

/**
 * Container do Google Tag Manager, informado pelo responsável em 07/10/2026.
 *
 * Carregado pelo mesmo gate do Ads: o `gtm.js` só é inserido depois de escolha
 * afirmativa. O `consent default` negado entra na `dataLayer` antes do GTM
 * executar, então as tags de dentro do container nascem sujeitas ao Consent
 * Mode v2 em vez de disparar livres.
 */
export const GTM_ID = "GTM-55QGH9RR";

/**
 * Versão do aviso de privacidade. Mudança material no texto do banner ou nas
 * finalidades incrementa este número e faz o site pedir a escolha de novo.
 */
export const VERSAO_AVISO = 1;

/** Chave única no `localStorage` do próprio visitante. */
export const CHAVE_PREFERENCIA = "meg.consentimento";

/**
 * Validade da escolha em dias. 180 dias é o padrão técnico adotado na
 * implementação, alinhado à renovação periódica recomendada pelo guia de
 * cookies da ANPD; o prazo definitivo depende da revisão jurídica registrada
 * em `docs/05-medicao-privacidade.md`.
 */
export const VALIDADE_DIAS = 180;

/** Categorias independentes, como exige o contrato de consentimento. */
export type CategoriasConsentimento = {
  /** Medição de audiência (`analytics_storage`). */
  medicao: boolean;
  /** Publicidade e remarketing (`ad_storage`, `ad_user_data`, `ad_personalization`). */
  publicidade: boolean;
};

export type PreferenciaConsentimento = CategoriasConsentimento & {
  versao: number;
  /** Data ISO da decisão, usada apenas para expirar a preferência. */
  decididoEm: string;
};

export const SEM_CONSENTIMENTO: CategoriasConsentimento = {
  medicao: false,
  publicidade: false,
};

export const CONSENTIMENTO_TOTAL: CategoriasConsentimento = {
  medicao: true,
  publicidade: true,
};

/** Evento interno que reabre o painel de preferências a partir de qualquer link do site. */
export const EVENTO_ABRIR_PREFERENCIAS = "meg:abrir-preferencias";

function dentroDaValidade(decididoEm: string): boolean {
  const marca = Date.parse(decididoEm);
  if (Number.isNaN(marca)) return false;
  const idadeEmDias = (Date.now() - marca) / 86_400_000;
  return idadeEmDias >= 0 && idadeEmDias <= VALIDADE_DIAS;
}

function preferenciaValida(valor: unknown): valor is PreferenciaConsentimento {
  if (typeof valor !== "object" || valor === null) return false;
  const bruto = valor as Record<string, unknown>;
  return (
    bruto.versao === VERSAO_AVISO &&
    typeof bruto.medicao === "boolean" &&
    typeof bruto.publicidade === "boolean" &&
    typeof bruto.decididoEm === "string" &&
    dentroDaValidade(bruto.decididoEm)
  );
}

/**
 * Lê a escolha guardada. Retorna `null` quando não há escolha, quando ela
 * expirou, quando a versão do aviso mudou ou quando o navegador bloqueia o
 * armazenamento — todos tratados como "ainda não decidiu", o que mantém os
 * scripts desligados.
 */
export function lerPreferencia(): PreferenciaConsentimento | null {
  if (typeof window === "undefined") return null;
  try {
    const cru = window.localStorage.getItem(CHAVE_PREFERENCIA);
    if (!cru) return null;
    const valor: unknown = JSON.parse(cru);
    return preferenciaValida(valor) ? valor : null;
  } catch {
    return null;
  }
}

/** Grava a escolha e devolve o registro efetivamente aplicado. */
export function gravarPreferencia(
  categorias: CategoriasConsentimento,
): PreferenciaConsentimento {
  const preferencia: PreferenciaConsentimento = {
    ...categorias,
    versao: VERSAO_AVISO,
    decididoEm: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(CHAVE_PREFERENCIA, JSON.stringify(preferencia));
  } catch {
    // Navegador sem armazenamento: a escolha vale para a sessão atual e o
    // banner volta a aparecer na próxima visita. Nada é carregado sem aceite.
  }
  return preferencia;
}

/** Apaga a preferência local. Usado na revogação total. */
export function limparPreferencia(): void {
  try {
    window.localStorage.removeItem(CHAVE_PREFERENCIA);
  } catch {
    // Sem armazenamento disponível não há o que apagar.
  }
}

export function algumaCategoriaAceita(categorias: CategoriasConsentimento): boolean {
  return categorias.medicao || categorias.publicidade;
}

type EstadoConsentGoogle = "granted" | "denied";

export type SinalConsentGoogle = {
  ad_storage: EstadoConsentGoogle;
  ad_user_data: EstadoConsentGoogle;
  ad_personalization: EstadoConsentGoogle;
  analytics_storage: EstadoConsentGoogle;
};

/** Traduz as categorias do banner para o Consent Mode v2 do Google. */
export function sinalConsentGoogle(
  categorias: CategoriasConsentimento,
): SinalConsentGoogle {
  const publicidade: EstadoConsentGoogle = categorias.publicidade ? "granted" : "denied";
  return {
    ad_storage: publicidade,
    ad_user_data: publicidade,
    ad_personalization: publicidade,
    analytics_storage: categorias.medicao ? "granted" : "denied",
  };
}

/* --------------------------------------------------------------------------
   Store do consentimento

   A preferência é estado externo ao React: vive no `localStorage` do visitante
   e pode mudar em outra aba. Por isso é lida por `useSyncExternalStore`, e não
   por `setState` dentro de efeito.
   -------------------------------------------------------------------------- */

let cache: PreferenciaConsentimento | null | undefined;
const ouvintes = new Set<() => void>();

function avisarOuvintes() {
  for (const ouvinte of ouvintes) ouvinte();
}

function aoMudarArmazenamento(evento: StorageEvent) {
  if (evento.key !== null && evento.key !== CHAVE_PREFERENCIA) return;
  cache = undefined;
  avisarOuvintes();
}

/** Assina mudanças da preferência, inclusive as feitas em outra aba. */
export function assinarPreferencia(ouvinte: () => void): () => void {
  if (ouvintes.size === 0) {
    window.addEventListener("storage", aoMudarArmazenamento);
  }
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
    if (ouvintes.size === 0) {
      window.removeEventListener("storage", aoMudarArmazenamento);
    }
  };
}

/**
 * Snapshot estável: a mesma referência é devolvida enquanto a preferência não
 * mudar, como `useSyncExternalStore` exige.
 */
export function obterPreferencia(): PreferenciaConsentimento | null {
  if (cache === undefined) cache = lerPreferencia();
  return cache;
}

/** No servidor não existe escolha; o HTML sai sempre igual. */
export function obterPreferenciaNoServidor(): PreferenciaConsentimento | null {
  return null;
}

/**
 * Registra a decisão do visitante. Recusa total não deixa registro: a
 * preferência é apagada e o aviso volta na próxima visita.
 */
export function definirPreferencia(
  categorias: CategoriasConsentimento,
): PreferenciaConsentimento | null {
  if (algumaCategoriaAceita(categorias)) {
    cache = gravarPreferencia(categorias);
  } else {
    limparPreferencia();
    cache = null;
  }
  avisarOuvintes();
  return cache;
}

const semAssinatura = () => () => {};
const noCliente = () => true;
const noServidor = () => false;

/**
 * `true` somente depois da hidratação. Serve para o aviso não existir no HTML
 * estático e não piscar para quem já decidiu.
 */
export const hidratacao = {
  assinar: semAssinatura,
  noCliente,
  noServidor,
} as const;
