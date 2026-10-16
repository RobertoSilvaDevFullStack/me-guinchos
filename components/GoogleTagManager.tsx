import Script from "next/script";
import { GTM_ID } from "@/lib/medicao";

/**
 * Google Tag Manager (GTM-55QGH9RR) carregado diretamente no layout raiz.
 *
 * Configurado com Consent Mode v2 em 'granted' por padrão e inicialização
 * imediata do dataLayer e do gtm.js via Script strategy="afterInteractive".
 * Isso garante que:
 * 1. Nenhuma barreira visual ou modal de consentimento bloqueie a interação do usuário.
 * 2. 100% dos cliques e conversões (whatsapp_click / phone_click) sejam mensurados.
 * 3. O Google Ads receba sinais completos para otimização de lances, alcance e relevância.
 * 4. O carregamento assíncrono preserva integralmente a performance mobile (LCP, INP e CLS).
 */
export function GoogleTagManager() {
  return (
    <>
      <Script
        id="google-tag-manager-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'ad_storage': 'granted',
              'ad_user_data': 'granted',
              'ad_personalization': 'granted',
              'analytics_storage': 'granted'
            });
            gtag('js', new Date());
            dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
          `,
        }}
      />
      <Script
        id="google-tag-manager"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
      />
    </>
  );
}
