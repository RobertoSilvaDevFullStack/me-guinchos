/**
 * Camada de mensuração e disparo de eventos para o dataLayer (Google Tag Manager).
 *
 * Eventos padronizados de conversão:
 * - `whatsapp_click`: disparado em qualquer clique que inicia conversa no WhatsApp.
 * - `phone_click`: disparado em qualquer clique em links telefônicos (tel:).
 *
 * Conversão do Google Ads fornecida pelo responsável:
 * - send_to: `AW-18490859899/nnUMCNDBzJQdEPvCkPFE`
 *
 * Observação arquitetural:
 * Em consonância com as melhores práticas de GTM + dataLayer, os cliques alimentam
 * o dataLayer de forma consistente e síncrona, permitindo que as tags de conversão
 * do Google Ads (e GA4, quando houver) sejam disparadas pelo container GTM sem
 * snippets soltos espalhados pelo HTML e sem duplicações acidentais.
 */

export const EVENTO_WHATSAPP_CLICK = "whatsapp_click";
export const EVENTO_PHONE_CLICK = "phone_click";

export const GOOGLE_ADS_ID = "AW-18490859899";
export const GOOGLE_ADS_WHATSAPP_CONVERSION_LABEL = "nnUMCNDBzJQdEPvCkPFE";
export const GOOGLE_ADS_WHATSAPP_SEND_TO = `${GOOGLE_ADS_ID}/${GOOGLE_ADS_WHATSAPP_CONVERSION_LABEL}`;

export interface DadosEventoContato {
  page_path: string;
  page_location: string;
  button_location: string;
  link_url: string;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// Janela mínima para ignorar cliques idênticos acidentais (ex.: double-click)
const INTERVALO_DEBOUNCE_MS = 500;
let ultimoDisparoWhatsApp = 0;
let ultimoDisparoTelefone = 0;

/**
 * Garante a existência do dataLayer no objeto window de forma segura.
 */
export function obterDataLayer(): unknown[] {
  if (typeof window === "undefined") return [];
  window.dataLayer = window.dataLayer ?? [];
  return window.dataLayer;
}

/**
 * Registra o evento `whatsapp_click` no dataLayer.
 * Nunca bloqueia a ação do usuário nem impede a abertura do WhatsApp.
 */
export function registrarCliqueWhatsApp(dados: DadosEventoContato): void {
  if (typeof window === "undefined") return;

  const agora = Date.now();
  if (agora - ultimoDisparoWhatsApp < INTERVALO_DEBOUNCE_MS) {
    return;
  }
  ultimoDisparoWhatsApp = agora;

  const dataLayer = obterDataLayer();
  dataLayer.push({
    event: EVENTO_WHATSAPP_CLICK,
    page_path: dados.page_path,
    page_location: dados.page_location,
    button_location: dados.button_location,
    link_url: dados.link_url,
  });
}

/**
 * Registra o evento `phone_click` no dataLayer.
 * Nunca bloqueia o discador nem interfere na ligação.
 */
export function registrarCliqueTelefone(dados: DadosEventoContato): void {
  if (typeof window === "undefined") return;

  const agora = Date.now();
  if (agora - ultimoDisparoTelefone < INTERVALO_DEBOUNCE_MS) {
    return;
  }
  ultimoDisparoTelefone = agora;

  const dataLayer = obterDataLayer();
  dataLayer.push({
    event: EVENTO_PHONE_CLICK,
    page_path: dados.page_path,
    page_location: dados.page_location,
    button_location: dados.button_location,
    link_url: dados.link_url,
  });
}

/**
 * Extrai semanticamente a localização do botão a partir de atributos ou da estrutura do DOM.
 */
export function identificarLocalizacaoBotao(elemento: Element): string {
  // 1. Atributo explícito no próprio elemento ou ancestral mais próximo
  const elementoComLocalizacao = elemento.closest("[data-tracking-location]");
  if (elementoComLocalizacao) {
    const valor = elementoComLocalizacao.getAttribute("data-tracking-location");
    if (valor) return valor;
  }

  // 2. Inferência por classes/tags conhecidas da arquitetura do projeto
  if (elemento.closest(".cabecalho") || elemento.closest("header")) {
    return "header";
  }
  if (elemento.closest(".barra-contato")) {
    return "barra_fixa_mobile";
  }
  if (elemento.closest(".heroi") || elemento.closest("[data-placa='azul'].placa--mae")) {
    return "hero_principal";
  }
  if (elemento.closest(".servicos") || elemento.closest(".servico")) {
    return "grade_servicos";
  }
  if (elemento.closest(".faixa--empilhadeira")) {
    return "secao_empilhadeira";
  }
  if (elemento.closest(".faixa--fechamento") || elemento.closest(".fechamento")) {
    return "cta_fechamento";
  }
  if (elemento.closest(".acionamento")) {
    return "passos_atendimento";
  }
  if (elemento.closest(".rodape") || elemento.closest("footer")) {
    return "footer";
  }
  if (elemento.closest(".areas")) {
    return "pagina_areas";
  }
  if (elemento.closest(".pagina-local")) {
    return "pagina_local";
  }

  return "conteudo_geral";
}

/**
 * Verifica se um link pertence ao WhatsApp.
 */
export function ehLinkWhatsApp(href: string): boolean {
  return (
    href.includes("wa.me") ||
    href.includes("api.whatsapp.com") ||
    href.includes("whatsapp.com/send")
  );
}

/**
 * Verifica se um link é de chamada telefônica.
 */
export function ehLinkTelefone(href: string): boolean {
  return href.startsWith("tel:");
}
