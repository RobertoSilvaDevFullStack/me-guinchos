# Validação do handoff — 01/10/2026

## Escopo e estado inicial

Auditoria da continuidade do trabalho iniciado em outra sessão, sem restaurar ou
descartar alterações. O estado inicial tinha 11 arquivos rastreados modificados e
quatro arquivos novos: `app/robots.ts`, `app/sitemap.ts`,
`components/DadosEstruturados.tsx` e `public/llms.txt`.

Foram inspecionados os arquivos reais do filesystem, o diff completo, a spec, os
documentos de arquitetura e todos os caminhos citados no handoff. Não foram
encontrados imports, exports, propriedades, JSX ou tags duplicados.

## Problemas encontrados e correções

1. `app/sitemap.ts` listava três URLs mesmo com
   `INDEXACAO_LIBERADA = false`, contrariando V11. Foi condicionado ao mesmo
   sinalizador de metadata/robots e agora retorna sitemap sem URLs durante a
   prévia.
2. Os redirects em `next.config.ts` usavam `permanent: true`, que no Next 16
   gera 308, enquanto RF10/V07 exigem 301. URLs antigas acessadas por `www`
   também poderiam passar pela normalização de host antes do destino final. As
   regras conhecidas agora vêm primeiro, apontam diretamente para o host
   canônico e respondem 301; o curinga `www` ficou por último.
3. README, spec, tarefas e documentos de arquitetura/SEO/deploy ainda
   descreviam telefone, domínio, mídia e D01/D05/D07/D08 como pendentes. As
   fontes vigentes foram reconciliadas com as confirmações de 29/09 e 01/10.
4. `next-env.d.ts` foi confirmado como arquivo gerado pelo Next 16. `next dev`
   escreve `.next/dev/types`; `next build` escreve `.next/types`. A alteração
   foi preservada e documentada, sem edição manual.

Não foram alterados: a trava de produção, `INDEXACAO_LIBERADA = false`, o
`noindex`, `SITE_PREVIEW_BUILD`, a interface, a CSP ou dados comerciais.

## Portões executados

| Verificação | Ambiente | Resultado |
| --- | --- | --- |
| `npm run lint` | workspace local | **Passou**, sem diagnósticos. |
| `npm run typecheck` | workspace local | **Passou**, sem diagnósticos. |
| Testes automatizados | `package.json` e arquivos do projeto | **Não existem** script `test`, framework ou suíte automatizada. |
| `npm run build` | sandbox | **Falhou** após compilar, em TypeScript: `spawn EPERM`. Limitação ambiental já conhecida. |
| `npm run build` | fora do sandbox | **Falhou como esperado**, código 1, exclusivamente na trava: `Publicação bloqueada: fotos, limites operacionais, trechos, domínio e política ainda dependem de aprovação (D01–D08).` |
| `npm run build:preview` | sandbox | **Falhou** após compilar, em TypeScript: `spawn EPERM`. |
| `npm run build:preview` | fora do sandbox | **Passou**, código 0. Next 16.3.6 compilou, concluiu TypeScript e pré-renderizou `/`, `/areas-de-atendimento`, `/politica-de-privacidade`, `/robots.txt` e `/sitemap.xml`. |
| `git diff --check` | working tree | Sem erro de whitespace; apenas avisos de futura conversão LF → CRLF. |

## Verificação HTTP do artefato de preview

Artefato standalone iniciado apenas em `127.0.0.1:3100`, encerrado após os
testes. As cópias de `public` e `.next/static` foram feitas somente dentro do
artefato ignorado `.next/`, repetindo os passos do Dockerfile.

- `/`, `/areas-de-atendimento` e `/politica-de-privacidade`: **200**.
- Canonical: host non-www e caminho próprio em cada rota.
- Metadata: `noindex, nofollow`, Open Graph e Twitter presentes.
- JSON-LD: JSON parseável, grafo `LocalBusiness` + `WebSite`, telefone
  `+5511930299233`, horário 07:00–22:00, sem `areaServed` ou preço inventado.
- Links HTML: `tel:+5511930299233` e `wa.me/5511930299233` presentes.
- Telefone antigo: ausente do HTML.
- `/robots.txt`: **200**, `User-Agent: *` e `Disallow: /`, sem sitemap.
- `/sitemap.xml`: **200**, `urlset` sem elementos `<url>`.
- `/llms.txt`: **200**, telefone definitivo e ressalvas factuais presentes.
- `/transporte-de-empilhadeiras/14`: **301** direto para
  `https://meguinchos.com.br/#empilhadeira`.
- `/fotos/20` com host `www`: **301** direto para
  `https://meguinchos.com.br/#registros`, sem cadeia intermediária.
- rota comum com host `www`: **301** para o mesmo caminho em
  `https://meguinchos.com.br`.
- Headers presentes: HSTS `max-age=31536000`, `nosniff`,
  `strict-origin-when-cross-origin`, `SAMEORIGIN`, Permissions-Policy e CSP.

## Classificação das buscas

- `+5511951998799`: zero ocorrências.
- `95199-8799`: somente registros históricos datados e comentário explícito de
  substituição; nenhum caminho ativo usa o número.
- `previewContactLinks`: zero ocorrências.
- `[PREENCHER]`: documentação de regras, planejamento e validações históricas;
  zero ocorrência em `app/`, `components/`, `content/`, `lib/` e `public/llms.txt`.
- `24h` / `24 horas`: proibições, negações, inventário histórico e hash de
  dependência; nenhuma oferta ativa declara atendimento 24h.
- `Prévia`: apenas README/deploy.
- `SITE_PREVIEW_BUILD`: trava, script, Dockerfile e documentação; preservado.
- `INDEXACAO_LIBERADA`: valor `false`, consumidores e documentação; preservado.

## O que não foi verificado nesta rodada

- WhatsApp, discador e recebimento em aparelho real.
- Viewports 360, 390, 768 e 1280, leitor de tela, zoom e toque; não houve mudança
  de interface nesta auditoria, mas a evidência anterior não foi refeita.
- Lighthouse/CWV mobile e números antes/depois.
- `npm audit`, teste de carga ou varredura externa.
- Headers, redirects e HTTPS no ambiente final; a verificação foi local.
- Inventário completo de URLs antigas, Search Console e URLs sem equivalente.
- Validação externa do JSON-LD e cartões sociais; a imagem OG disponível continua
  600×400, abaixo do ideal 1200×630 já documentado.

## Bloqueadores restantes

1. Testar ligação, abertura do WhatsApp e recebimento no número definitivo em
   smartphone real.
2. Concluir a precisão de setores/trechos necessária às páginas que forem
   publicadas e às campanhas futuras.
3. Inventariar URLs antigas e definir somente equivalências comprovadas.
4. Executar os itens não verificados acima que forem obrigatórios para o gate de
   lançamento e obter autorização editorial/técnica explícita.

Nenhum commit, push ou deploy foi realizado.
