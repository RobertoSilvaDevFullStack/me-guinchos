/**
 * Camada de medição do site e identificadores de monitoramento.
 *
 * Contrato técnico:
 * - O Google Tag Manager (GTM-55QGH9RR) é carregado de forma assíncrona
 *   no layout raiz sem bloquear o primeiro paint do visitante.
 * - Disparos de conversão continuam mapeados via dataLayer em lib/tracking.ts
 *   para whatsapp_click e phone_click.
 */

/** Identificador da conta do Google Ads (tag base). */
export const GOOGLE_ADS_ID = "AW-18490859899";

/**
 * Container do Google Tag Manager.
 * Responsável por orquestrar a tag base do Google Ads, remarketing e eventos de conversão.
 */
export const GTM_ID = "GTM-55QGH9RR";
