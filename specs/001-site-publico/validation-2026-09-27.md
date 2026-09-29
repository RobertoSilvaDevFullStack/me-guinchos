# Evidência da fatia 1 — base e home de prévia

**Data:** 27/09/2026. **Ambiente:** Windows, Node 24.21.0, Next.js 16.3.6, preview compilado e servido em `127.0.0.1`. **Escopo:** T03/T04, RF01–RF03 e RNF01/RNF03 em prévia local. A publicação continua bloqueada por D01–D08.

| Gate | Resultado observado | Limite |
| --- | --- | --- |
| `npm run typecheck` | Exit 0 após a correção final. | Verifica tipos, não interação. |
| `npm run lint` | Exit 0 após trocar o link da marca por `Link` do Next. A primeira execução útil havia falhado em `app/page.tsx:30` por `@next/next/no-html-link-for-pages`. | Ferramenta estática. |
| `npm run build:preview` | Exit 0; rotas estáticas `/`, `/_not-found` e `/icon.svg`. | Artefato contém `[PREENCHER]`; uso somente local ou protegido. |
| `npm run build` | Exit 1 esperado: `Publicação bloqueada: contato, cobertura, serviços, domínio e política ainda dependem de aprovação (D01–D08).` em `content/site.ts:9`. | Confirma o gate atual; não substitui aprovação editorial futura. |
| `npm audit --audit-level=high --offline=false --cache .npm-cache` | `found 0 vulnerabilities`, exit 0. | Retrato das versões instaladas nesta data. |

## Matriz V01–V11 nesta fatia

| ID | Evidência e resultado | Não verificado / pendente |
| --- | --- | --- |
| V01 | Playwright/Edge no preview compilado em 360×640, 390×844, 768×1024 e 1280×800: `documentElement.scrollWidth === clientWidth`; CTAs no primeiro viewport; menor alvo medido 48 px; sem colisão com barra fixa após ajuste da legenda. Foco por teclado visível; console e `pageerror` vazios. | Orientação, aparelho físico e zoom real de 200%. Uma simulação em 640×800 não equivale ao zoom real. |
| V02 | Dois links `wa.me` e três `tel:` presentes no HTML gerado, com número E.164 candidato e mensagem codificada. | D02: testar WhatsApp, discador, número recebido e mensagem em smartphone real antes de publicação. |
| V03 | Um H1, link para pular conteúdo, ordem inicial de foco alcança marca e CTAs; outline de foco de 3 px. | Leitor de tela, zoom real de 200% e auditoria completa de contraste/teclado. |
| V04 | `npm run build` bloqueia publicação com pendências. Copy e área pendente são explicitamente de prévia. | D01–D08, fotos, horário, capacidade, cobertura e aprovação editorial. |
| V05 | Não há scripts de medição/publicidade nesta fatia; QA encontrou zero referências a GA/GTM/Ads/Meta/Hotjar/Clarity no HTML. | Consentimento, revogação e inspeção de rede no navegador quando medição for implementada. |
| V06 | `GET /` 200; HTML com `lang="pt-BR"`, um H1, metas `robots` e `googlebot` `noindex,nofollow`. `/robots.txt`, `/sitemap.xml` e `/llms.txt` retornam 404 nesta prévia; serviços de empilhadeira terminam em 404 após normalização 308 da barra. | Gate SEO público: domínio/canonical, OG, JSON-LD, três arquivos de raiz e sitemap de URLs aprovadas. |
| V07 | Não aplicável à prévia. | Inventário de URLs antigas, redirects e domínio final. |
| V08 | Não medido. | Lighthouse/CWV mobile e baseline antes de alegar performance. |
| V09 | `npm audit`: 0 vulnerabilidades; não há segredo, API, banco ou formulário implementado nesta fatia. | HTTPS, headers, política de privacidade, hospedagem e inspeção final. |
| V10 | Não executado. | Contato humano e rollback após ambiente de produção aprovado. |
| V11 | `npm run dev`/`npm run start` configurados para `127.0.0.1`; preview `noindex`; links essenciais estão em âncoras HTML e rotas pendentes não existem. | Controle de acesso caso o artefato de preview seja colocado fora da máquina local; teste com JS efetivamente desligado. |

O primeiro `build:preview` no sandbox compilou, mas falhou ao iniciar um processo filho do Next com `spawn EPERM`; a repetição autorizada fora do sandbox passou. A verificação HTTP do QA foi feita no preview compilado: HTML com links de contato sem handler JavaScript e sem scripts externos de medição. Isso ainda não prova abertura do aplicativo ou chamada atendida.
