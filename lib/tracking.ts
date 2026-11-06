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

const PARAMETROS_CLICK_ID = new Set(["gclid", "wbraid", "gbraid"]);
const PARAMETROS_UTM_PERMITIDOS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
]);

/**
 * Decodifica percent-encoding de forma segura em até 3 passos para impedir
 * bypasses como `%2540` -> `%40` -> `@` ou `%3C` (`<`).
 */
function decodificarValorSeguro(valor: string): string {
  let atual = valor;
  for (let i = 0; i < 3; i++) {
    try {
      const decodificado = decodeURIComponent(atual);
      if (decodificado === atual) break;
      atual = decodificado;
    } catch {
      break;
    }
  }
  return atual;
}

/**
 * Conta a quantidade total de dígitos numéricos (0-9) em uma string sem usar regex.
 */
function contarDigitosNumericos(texto: string): number {
  let contagem = 0;
  for (let i = 0; i < texto.length; i++) {
    const code = texto.charCodeAt(i);
    if (code >= 48 && code <= 57) {
      contagem++;
    }
  }
  return contagem;
}

/**
 * Remove prefixos técnicos legítimos do Google Ads / ValueTrack e datas de campanha
 * antes de avaliar sequências numéricas contíguas de PII (telefone, CPF, CNPJ, CEP).
 */
function removerTokensTecnicosUtm(valor: string): string {
  return valor
    // Prefixos de IDs técnicos de mídia paga (ex.: kwd-123456789, dsa-987654321, cid-21849085989, loc-1001773)
    .replace(
      /(?<![a-zA-Z0-9])(?:kwd|dsa|pla|loc|cid|agid|adid|crid|trg|target|camp|campaign|adgroup|creative|id|ver|versao)[-_:]\d{1,24}(?![a-zA-Z0-9])/gi,
      " ",
    )
    // Datas ISO / calendário em nomes de campanha (ex.: 2026-11-06, 20261106, 06-11-2026)
    .replace(
      /(?<![a-zA-Z0-9])20\d{2}[-_/.]?(?:0[1-9]|1[0-2])[-_/.]?(?:0[1-9]|[12]\d|3[01])(?![a-zA-Z0-9])/g,
      " ",
    )
    .replace(
      /(?<![a-zA-Z0-9])(?:0[1-9]|[12]\d|3[01])[-_/.]?(?:0[1-9]|1[0-2])[-_/.]?20\d{2}(?![a-zA-Z0-9])/g,
      " ",
    )
    // Menções operacionais comuns (ex.: 24h, 24/7, 24horas)
    .replace(/(?<![a-zA-Z0-9])24\s*(?:h|hs|hrs|horas|\/7)(?![a-zA-Z0-9])/gi, " ");
}

/**
 * Verifica se há algum agrupamento numérico contíguo com >= 8 dígitos (padrão de
 * telefone, CPF, CNPJ ou CEP, mesmo quando formatado com pontos, traços, barras,
 * parênteses ou espaços), sem rejeitar números curtos espalhados em palavras distintas.
 */
function contemSequenciaNumericaPii(valor: string): boolean {
  const textoSemTokensTecnicos = removerTokensTecnicosUtm(valor);
  let digitosNoAgrupamento = 0;

  for (let i = 0; i < textoSemTokensTecnicos.length; i++) {
    const code = textoSemTokensTecnicos.charCodeAt(i);
    const ehDigito = code >= 48 && code <= 57;

    if (ehDigito) {
      digitosNoAgrupamento++;
      if (digitosNoAgrupamento >= 8) {
        return true;
      }
      continue;
    }

    // Separadores comuns usados para formatar telefones/CPF/CNPJ: espaço, '.', '-', '/', '(', ')', '+'
    const ehSeparadorFormatacao =
      code === 32 ||
      code === 46 ||
      code === 45 ||
      code === 47 ||
      code === 40 ||
      code === 41 ||
      code === 43;

    if (!ehSeparadorFormatacao) {
      digitosNoAgrupamento = 0;
    }
  }

  return false;
}

/**
 * Verifica estruturalmente se um Click ID (gclid, wbraid, gbraid) contém apenas
 * caracteres base64url/alfanuméricos seguros ([A-Za-z0-9_-]) e tamanho entre 4 e 128.
 */
function ehClickIdEstruturalmenteValido(valor: string): boolean {
  if (valor.length < 4 || valor.length > 128) return false;
  for (let i = 0; i < valor.length; i++) {
    const code = valor.charCodeAt(i);
    const ehMaiuscula = code >= 65 && code <= 90;
    const ehMinuscula = code >= 97 && code <= 122;
    const ehDigito = code >= 48 && code <= 57;
    const ehHifenOuUnderscore = code === 45 || code === 95;
    if (!ehMaiuscula && !ehMinuscula && !ehDigito && !ehHifenOuUnderscore) {
      return false;
    }
  }
  return true;
}

/**
 * Valida estruturalmente parâmetros UTM preservando UTMs legítimas de campanhas
 * (incluindo ValueTrack `kwd-...:loc-...`, `cid-...`, datas `2026-11-06`, `24/7`,
 * correspondência de palavra-chave `[guincho 24 horas zona oeste sp]`):
 * 1. Limite de tamanho (1..128 caracteres após decodificação).
 * 2. Bloqueio de caracteres de e-mail/HTML/injeção (`@`, `<`, `>`, `"`, `'`, `` ` ``, `\r`, `\n`, `\0`, `\\`).
 * 3. Bloqueio de esquemas de URL/URI (`http://`, `https://`, `mailto:`, `tel:`, `javascript:`, `data:`).
 * 4. Detecção de sequências numéricas contíguas >= 8 dígitos (telefone, CPF, CNPJ, CEP),
 *    preservando IDs técnicos prefixados e números curtos distribuídos no nome da campanha.
 * 5. Limite de até 12 palavras para permitir termos de busca de cauda longa em `utm_term`.
 */
function ehUtmEstruturalmenteSegura(valorBruto: string): boolean {
  const valor = decodificarValorSeguro(valorBruto).trim();
  if (valor.length < 1 || valor.length > 128) return false;

  const caracteresProibidos = ["@", "<", ">", '"', "'", "`", "\r", "\n", "\0", "\\"];
  for (const proibido of caracteresProibidos) {
    if (valor.includes(proibido)) return false;
  }

  const valorLower = valor.toLowerCase();
  const esquemasProibidos = [
    "http://",
    "https://",
    "mailto:",
    "tel:",
    "javascript:",
    "data:",
    "vbscript:",
  ];
  for (const esquema of esquemasProibidos) {
    if (valorLower.includes(esquema)) return false;
  }

  if (
    /\b(?:cpf|cnpj|telefone|celular|whatsapp|ligue|email|e-mail)\b/i.test(valor) &&
    contarDigitosNumericos(valor) >= 6
  ) {
    return false;
  }

  if (contemSequenciaNumericaPii(valor)) {
    return false;
  }

  const partesEspaco = valor.split(/\s+/);
  if (partesEspaco.length > 12) {
    return false;
  }

  return true;
}

/**
 * Verifica se uma string de telefone contém apenas dígitos (e opcionalmente '+' inicial)
 * entre 8 e 15 dígitos, sem depender apenas de regex.
 */
function ehTelefoneNumericoValido(telefone: string): boolean {
  const limpo = telefone.trim();
  if (limpo.length < 8 || limpo.length > 16) return false;
  for (let i = 0; i < limpo.length; i++) {
    const code = limpo.charCodeAt(i);
    if (i === 0 && code === 43) continue; // '+'
    if (code < 48 || code > 57) return false;
  }
  return contarDigitosNumericos(limpo) >= 8;
}

/**
 * Remove qualquer texto de mensagem (`?text=...`) ou parâmetros arbitrários de links
 * de contato (WhatsApp e Telefone) antes de enviar ao dataLayer ou telemetria,
 * garantindo que dados preenchidos pelo usuário nunca vazem para terceiros.
 */
export function sanitizarUrlContato(rawUrl: string): string {
  if (!rawUrl) return "";
  const urlLimpa = rawUrl.trim();

  if (urlLimpa.startsWith("tel:")) {
    const apenasNumero = urlLimpa.split("?")[0]?.split("#")[0] ?? "tel:";
    return apenasNumero;
  }

  try {
    const parsed = new URL(urlLimpa);
    const host = parsed.hostname.toLowerCase();

    if (
      host === "wa.me" ||
      host.endsWith(".whatsapp.com") ||
      host === "whatsapp.com"
    ) {
      const phoneParam = parsed.searchParams.get("phone");
      parsed.search = "";
      parsed.hash = "";
      if (phoneParam && ehTelefoneNumericoValido(phoneParam)) {
        parsed.searchParams.set("phone", phoneParam.trim());
      }
      return parsed.toString();
    }

    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    // Fallback seguro caso a string não seja uma URL absoluta válida
    return urlLimpa.split("?")[0]?.split("#")[0] ?? "";
  }
}

/**
 * Sanitiza a URL da página mantendo apenas a origem, o pathname e parâmetros
 * estritamente permitidos de atribuição de campanha validados estruturalmente.
 */
export function sanitizarUrlPagina(rawUrl: string): string {
  if (!rawUrl) return "";
  try {
    const parsed = new URL(rawUrl.trim());
    const paramsSeguros = new URLSearchParams();

    for (const [chave, valor] of parsed.searchParams.entries()) {
      const chaveLower = chave.toLowerCase();
      const valorTrim = valor.trim();

      if (PARAMETROS_CLICK_ID.has(chaveLower)) {
        if (ehClickIdEstruturalmenteValido(valorTrim)) {
          paramsSeguros.set(chaveLower, valorTrim);
        }
      } else if (PARAMETROS_UTM_PERMITIDOS.has(chaveLower)) {
        if (ehUtmEstruturalmenteSegura(valorTrim)) {
          paramsSeguros.set(chaveLower, decodificarValorSeguro(valorTrim));
        }
      }
    }

    parsed.search = paramsSeguros.toString();
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return rawUrl.split("?")[0]?.split("#")[0] ?? "";
  }
}

/**
 * Sanitiza o caminho da página (pathname) removendo query string e hash.
 */
export function sanitizarCaminhoPagina(rawPath: string): string {
  if (!rawPath) return "/";
  const base = rawPath.split("?")[0]?.split("#")[0]?.trim() || "/";
  return base.startsWith("/") ? base : `/${base}`;
}

/**
 * Garante a existência do dataLayer no objeto window de forma segura.
 */
export function obterDataLayer(): unknown[] {
  if (typeof window === "undefined") return [];
  window.dataLayer = window.dataLayer ?? [];
  return window.dataLayer;
}

/**
 * Registra o evento `whatsapp_click` no dataLayer com URLs sanitizadas (sem PII).
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
    page_path: sanitizarCaminhoPagina(dados.page_path),
    page_location: sanitizarUrlPagina(dados.page_location),
    button_location: dados.button_location,
    link_url: sanitizarUrlContato(dados.link_url),
  });
}

/**
 * Registra o evento `phone_click` no dataLayer com URLs sanitizadas (sem PII).
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
    page_path: sanitizarCaminhoPagina(dados.page_path),
    page_location: sanitizarUrlPagina(dados.page_location),
    button_location: dados.button_location,
    link_url: sanitizarUrlContato(dados.link_url),
  });
}

/**
 * Apenas para uso em testes automatizados: reseta o estado de debounce.
 */
export function resetarDebounceTrackingParaTestes(): void {
  ultimoDisparoWhatsApp = 0;
  ultimoDisparoTelefone = 0;
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
