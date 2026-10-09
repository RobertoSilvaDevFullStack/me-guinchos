import type { NextConfig } from "next";

/**
 * Cabeçalhos de segurança previstos em `docs/02-arquitetura-decisoes.md` e
 * exigidos por RNF06/V09. Aplicados pelo servidor Next, dentro do container —
 * não substituem nem alteram a configuração do Coolify/Traefik.
 *
 * Decisões conservadoras, para não quebrar nada que o site realmente usa:
 *
 * - **HSTS sem `includeSubDomains` e sem `preload`.** Um ano de `max-age` já
 *   cumpre o requisito. `includeSubDomains` comprometeria qualquer subdomínio
 *   futuro que ainda não tenha HTTPS, e `preload` é praticamente irreversível.
 *   Ambos podem ser acrescentados depois, com decisão explícita.
 *
 * - **CSP com `'unsafe-inline'` em `script-src`.** O App Router emite scripts
 *   inline de bootstrap e do payload RSC. Sem `nonce` por requisição — que
 *   exigiria middleware e tornaria as rotas dinâmicas — uma CSP sem
 *   `'unsafe-inline'` quebraria a hidratação da página. O que esta CSP entrega
 *   de real é bloquear origem externa de script, imagem, fonte e estilo, além
 *   de enquadramento e injeção de `<base>`; o que ela não entrega é proteção
 *   contra inline malicioso. Apertar `script-src` com nonce é tarefa da fase de
 *   medição (D09), quando houver script de terceiro para justificar o custo.
 *
 * - **`img-src` inclui `data:`** porque o otimizador de imagem do Next e SVGs
 *   embutidos podem emitir URIs `data:`. Nenhuma origem externa é permitida.
 */
const cspProducao = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://*.googletagmanager.com https://tagmanager.google.com https://www.googleadservices.com https://*.googleadservices.com https://www.google.com https://*.google.com https://googleads.g.doubleclick.net",
  "style-src 'self' 'unsafe-inline' https://tagmanager.google.com https://fonts.googleapis.com",
  "img-src 'self' data: https://www.googletagmanager.com https://*.googletagmanager.com https://ssl.gstatic.com https://www.gstatic.com https://google.com https://*.google.com https://google.com.br https://*.google.com.br https://googleadservices.com https://*.googleadservices.com https://*.doubleclick.net https://googleads.g.doubleclick.net https://*.g.doubleclick.net https://*.google-analytics.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "connect-src 'self' https://www.googletagmanager.com https://*.googletagmanager.com https://google.com https://*.google.com https://google.com.br https://*.google.com.br https://googleadservices.com https://*.googleadservices.com https://*.doubleclick.net https://googleads.g.doubleclick.net https://*.g.doubleclick.net https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google-analytics.com https://region1.google-analytics.com",
  "frame-src 'self' https://www.googletagmanager.com https://*.googletagmanager.com https://bid.g.doubleclick.net https://*.doubleclick.net https://td.doubleclick.net",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
].join("; ");

const nextConfig: NextConfig = {
  agentRules: false,
  reactStrictMode: true,
  /**
   * Necessário para a imagem Docker enxuta usada no Coolify: o build emite
   * `.next/standalone` com um `server.js` e só as dependências realmente
   * rastreadas, dispensando `node_modules` completo na imagem final.
   * Não altera `npm run dev` nem o comportamento das páginas.
   */
  output: "standalone",

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), camera=(), microphone=(), payment=()",
          },
          { key: "Content-Security-Policy", value: cspProducao },
        ],
      },
    ];
  },

  /**
   * D06 — domínio definitivo `meguinchos.com.br`, sem `www`.
   *
   * A última regra é a normalização de host. DNS, HTTPS e Traefik já foram
   * validados externamente; esta regra é a camada da aplicação e só dispara se
   * a requisição efetivamente chegar com `www`. Se o Coolify já normalizar
   * antes, ela nunca executa e não causa laço.
   *
   * As duas regras seguintes são as **únicas** URLs do site anterior com
   * destino evidente dentro deste site, ambas documentadas em
   * `docs/00-contexto-fontes.md`. O inventário completo das URLs antigas não
   * existe — o site anterior usa o padrão `/{slug}/{id}`, então quase
   * certamente há outras. Nenhum destino foi inventado para elas; a lista de
   * pendências está em `docs/07-deploy-coolify.md`.
   *
   * As URLs antigas vêm antes do curinga de host e apontam diretamente para o
   * domínio canônico. Assim, uma visita pelo `www` não passa por dois redirects.
   * `statusCode: 301` atende literalmente RF10/V07; no Next, `permanent: true`
   * geraria 308.
   */
  async redirects() {
    return [
      {
        // Antiga página de transporte/remoção de empilhadeiras. A oferta existe
        // hoje na seção `#empilhadeira` da home. Será reapontada se e quando
        // `/transporte-de-empilhadeiras/` existir como rota própria (D03).
        source: "/transporte-de-empilhadeiras/14",
        destination: "https://meguinchos.com.br/#empilhadeira",
        statusCode: 301,
      },
      {
        // Antiga galeria de fotos de atendimentos. Equivalente atual é a seção
        // de registros da home.
        source: "/fotos/20",
        destination: "https://meguinchos.com.br/#registros",
        statusCode: 301,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.meguinchos.com.br" }],
        destination: "https://meguinchos.com.br/:path*",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
