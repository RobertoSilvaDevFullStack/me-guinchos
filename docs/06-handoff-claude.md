# 06 — Handoff para Claude Code

## Como iniciar a fase de código

O operador abre esta pasta no Claude Code e fornece o prompt abaixo. A versão de modelo escolhida no Claude Code não altera os contratos do repositório. Antes de implementar, resolver ou marcar explicitamente as pendências de publicação em `docs/00-contexto-fontes.md`.

> Leia `README.md`, `AGENTS.md`, `docs/00-contexto-fontes.md` e toda a pasta `specs/001-site-publico/`. Execute a Spec 001 por fatias conforme `plan.md` e `tasks.md`. Comece com home e CTAs sem JavaScript, em 360 px. Use `[PREENCHER]` apenas em preview; não publique afirmações pendentes. Trate transporte de empilhadeiras e operação com empilhadeira como ofertas distintas. Para cada fatia, atualize a spec se uma decisão mudar, execute os testes correspondentes de `validation.md`, reporte evidência e indique o que não foi verificado. Não faça deploy antes do gate de lançamento e aprovação editorial.

## Agentes especializados

Delegar por domínio quando disponíveis no ambiente Claude Code. As instruções de cada agente devem apontar para os arquivos deste repositório; nenhuma skill externa substitui as decisões e critérios de aceite da Spec 001.

| Agente | Quando acionar | Entrega esperada |
| --- | --- | --- |
| `seo-growth` | Antes e durante construção | Arquitetura de URL, copy por intenção, SEO local, metadata, schema, analytics e campanha coerente com oferta. |
| `frontend-engineer` | Construção da interface | Home e páginas mobile-first, links funcionais sem JS, galeria, acessibilidade e estados de consentimento. |
| `backend-engineer` | Revisão técnica e eventual integração | Configuração tipada, limites de exportação/hospedagem e contratos de links; API somente se surgir requisito aprovado. |
| `web-performance` | Após primeira versão navegável | Medição mobile, causas de LCP/INP/CLS e correções com números antes/depois. |
| `qa-security` | Antes de publicar | Execução de `validation.md`, privacidade/LGPD, segurança, links, regressão e relatório de falhas. |
| `refactor-architect` | Se o código perder clareza ou surgir mudança estrutural | Refatoração preservando requisitos e atualização do ADR. |

SEO e direção visual podem ser planejados em paralelo. Front e revisão de integração podem avançar em paralelo com contratos definidos. Performance e QA só medem uma versão executável.

## Skills a selecionar, sem carregar todas de uma vez

| Etapa | Skills úteis no Claude Code, se instaladas | Resultado concreto |
| --- | --- | --- |
| Descoberta e copy | `seo-keyword-strategist`, `seo-structure-architect`, `copywriting`, `page-cro`, `geo-fundamentals` | Mapa intenção → rota → H1 → CTA; regiões comprovadas. |
| Interface | `frontend-design`, `nextjs-app-router-patterns`, `tailwind-patterns`, `wcag-audit-patterns` | UI de conversão, tipografia/fotos coerentes, 360/390/768/1280. |
| Busca e marcação | `seo-meta-optimizer`, `schema-markup`, `ai-discoverability` | Metadata, JSON-LD, robots/sitemap/llms sem dados inventados. |
| Medição e privacidade | `analytics-tracking`, `lgpd-compliance` | Eventos mínimos com consentimento e política revisável. |
| Performance | `performance-engineer` ou `web-performance`, `vercel-react-best-practices` quando aplicável | Relatório mobile com baseline e resultado. |
| Gate | `test-automator`, `security-auditor`, `wcag-audit-patterns` | Evidência de testes, segurança e acessibilidade. |

Não carregar `prisma-expert`, `postgresql`, `docker-expert` ou skills de API para o MVP estático. Se uma decisão futura exigir backend, abrir nova spec e só então chamar esses especialistas.

## Ciclo de trabalho esperado

1. **Specify/clarify:** revisar `spec.md` e pendências com cliente; nenhuma inferência comercial vira fato.
2. **Plan/tasks:** confirmar dependências e marcar fatia de implementação.
3. **Implement:** construir somente a fatia; revisar visualmente em mobile.
4. **Converge:** comparar comportamento com critérios RF/RNF, corrigir divergências e registrar resultados em `validation.md` ou relatório separado.
5. Repetir até o gate. O [Spec Kit](https://github.github.com/spec-kit/reference/agentic-sdd.html) pode automatizar esse ciclo, mas não é obrigatório e não deve recriar artefatos conflitantes.

## Formato do relatório de cada fatia

`Requisitos cobertos | Arquivos | Verificações com comando/ambiente/resultado | Medidas antes/depois se houver performance | Pendências | Próxima fatia`.

No fechamento, indicar explicitamente testes não executados, razões e risco material. Build, Lighthouse, teste de link e contato humano são verificações diferentes.
