# Evidência da fatia 2 — slides, serviços e pagamentos em prévia

**Data:** 27/09/2026. **Ambiente:** Windows, Next.js 16.3.6, prévia local em navegador Edge/IAB e Chrome headless isolado. **Escopo:** T12/T13 e planejamento de T14. A publicação continua bloqueada.

| Gate | Resultado observado | Limite |
| --- | --- | --- |
| `npm run lint` e `npm run typecheck` | Exit 0 após as alterações da home, conteúdo e estilos. | Análise estática; não prova atendimento real. |
| `npm run build:preview` | Exit 0 fora do sandbox; compilação em 3,7 s, TypeScript em 996 ms e home pré-renderizada. Dentro do sandbox, compilou em 3,2 s e falhou na fase TypeScript com `spawn EPERM` ao criar processo filho. | Artefato contém fotos candidatas e `[PREENCHER]`; somente local ou protegido. |
| `npm run build` | Exit 1 esperado fora do sandbox, após compilar: `Publicação bloqueada: contato, cobertura, serviços, domínio e política ainda dependem de aprovação (D01–D08).` | Confirma o bloqueio técnico atual; a aprovação editorial ainda será necessária. Dentro do sandbox, falhou antes com `spawn EPERM`. |

## Matriz V01–V13 nesta fatia

| ID | Evidência e resultado | Não verificado / pendente |
| --- | --- | --- |
| V01 | Viewports CSS **360, 390, 768 e 1280 px**: `scrollWidth` de 345, 375, 753 e 1265 px, respectivamente, sem rolagem horizontal. Menor alvo visível medido: **44 px**. CTAs do hero terminaram em y=460, 451, 481 e 530 px, dentro do primeiro viewport. Capturas vistas no IAB em 360 e 1280 px sem cortes. | Smartphone físico, orientação e zoom real de 200%. |
| V02 | Com JavaScript desligado em Chrome isolado, o HTML contém links `wa.me`/`tel:` e o H1 de guincho. Links continuam âncoras HTML. | D02: testar número, mensagem, abertura dos apps e atendimento em smartphone real. |
| V03 | Seleção manual do slide passou por clique e tecla ArrowLeft; controles de rádio têm rótulos e foco CSS visível. O segundo estado mostra aviso de oferta pendente. IAB limpo sem erros ou avisos de console. | Leitor de tela e zoom real ainda não testados. Um Edge com extensão injetou `id="adr_distai"` e exibiu erro de hidratação; o erro não se repetiu no IAB limpo, portanto a causa não foi atribuída ao código. |
| V04 | A home marca serviços e pagamento como pendentes; operação com empilhadeira própria não é renderizada. Build normal bloqueado. | D01–D08 e aprovação de toda afirmação pública. |
| V05 | Busca no código de `app`, `content`, `lib` e `public` não encontrou scripts de GA/GTM/Ads/pixel; não há medição nesta fatia. | Consentimento, revogação e inspeção de rede quando scripts forem adicionados. |
| V06 | `GET /` 200; prévia mantém `lang="pt-BR"` e metadados `noindex,nofollow`. `/robots.txt`, `/sitemap.xml` e `/llms.txt` retornam 404 nesta fatia. | SEO público: canonical, OG, JSON-LD, três arquivos de raiz, sitemap e URLs finais. |
| V07 | Não aplicável à prévia. | Inventário de URLs antigas, redirects e domínio final. |
| V08 | Não medido. | Lighthouse e Core Web Vitals mobile; nenhuma alegação de melhoria de performance foi feita. |
| V09 | Não foram adicionados backend, formulário ou dependências nesta fatia. `npm audit --omit=dev` retornou 0 vulnerabilidades; varredura textual em `app`, `content`, `lib` e `scripts` não encontrou segredos, XSS/SQL crus ou trackers. | HTTPS, headers, política e ambiente final pendentes. Não há Git neste diretório para auditar histórico de segredos. |
| V10 | Não executado. | Contato humano, operação e rollback após ambiente final aprovado. |
| V11 | Primeiro slide, H1 e contatos permaneceram no HTML sem JavaScript; prévia marcada `noindex`; imagens documentadas em `public/images/preview/README.md` como uso local/protegido. | Garantir controle de acesso caso a prévia saia da máquina local. |
| V12 | Guincho primeiro, seleção manual sem autoplay e segundo slide de **transporte** identificado como pendente. As duas fotos carregaram e têm origem, descrição/alt e pendência D07 registradas no manifesto. | Aprovação de direitos, operação retratada, identificadores e originais de resolução adequada; leitor de tela/zoom real. |
| V13 | Seção de pagamento mostra `[PREENCHER]` sem modalidade ou bandeira inventada. `docs/03-conteudo-seo.md` contém matriz e backlog de destinos para Ads; `/servicos-com-empilhadeira/`, `/transporte-de-empilhadeiras/` e `/areas-de-atendimento/` retornam 404 nesta fatia, sem links locais no rodapé. | D03 para cobertura/cidades/trechos rodoviários, D08 para pagamentos e D09/D10 para campanhas; depois testar cada URL final 200, H1/CTA, canonical e sitemap. |

## Estado de publicação

A segunda fatia é uma prévia técnica local. A foto do carro esportivo (`01_001.jpg`) e a de transporte de empilhadeira (`23_023.jpg`) têm cópias de 600×400 px; não há autorização comercial documentada nem arquivos originais. A oferta de operação com empilhadeira própria continua separada e pendente. Cidades e rodovias vistas na referência JHC são hipóteses de planejamento, não cobertura comprovada da ME Guinchos. O gate de lançamento de `validation.md` permanece aberto.
