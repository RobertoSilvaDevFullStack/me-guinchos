# ME Guinchos — documentação do novo site

Este repositório contém **briefing, decisões, especificação e plano de validação** para um site de conversão mobile-first. A home tem uma **prévia local**, ainda sem aprovação para publicação.

## Ordem de leitura

1. [Contexto, fontes e pendências](docs/00-contexto-fontes.md)
2. [Produto e conversão](docs/01-produto-conversao.md)
3. [Arquitetura e decisões](docs/02-arquitetura-decisoes.md)
4. [Conteúdo, SEO e migração](docs/03-conteudo-seo.md)
5. [Direção visual e UX](docs/04-direcao-visual.md)
6. [Mensuração e privacidade](docs/05-medicao-privacidade.md)
7. [Especificação do MVP](specs/001-site-publico/spec.md), [plano](specs/001-site-publico/plan.md), [tarefas](specs/001-site-publico/tasks.md) e [validação](specs/001-site-publico/validation.md)
8. [Handoff para Claude Code](docs/06-handoff-claude.md)
9. [Galeria coletada e curadoria preliminar](assets/referencia-site-atual/curadoria-preliminar.md)

`[PREENCHER]` marca informação que precisa vir do Manoel. Conteúdo pendente pode aparecer em protótipo local, mas não em página pública, metadados, dados estruturados ou anúncios.

## Estado

- A base Next.js/TypeScript/Tailwind e a home de prévia foram iniciadas em 27/09/2026. A segunda fatia acrescentou slides manuais com fotos candidatas, blocos de serviços, CTAs contextuais e uma seção de pagamento pendente; consulte ADR-002/ADR-003 em `docs/02-arquitetura-decisoes.md` e [a validação da fatia 2](specs/001-site-publico/validation-2026-09-27-fatia2.md).
- Páginas de serviço, cidade e rodovia para Google Ads estão planejadas em `docs/03-conteudo-seo.md`. As rotas locais e os links do rodapé dependem de cobertura confirmada, conteúdo próprio e URLs finais aprovadas.
- Fontes públicas revisadas em 26/09/2026; seus dados **não** equivalem à aprovação atual do cliente.
- Número, cobertura, horário, fotos, domínio e dados legais ainda precisam de aprovação. O build padrão de produção é bloqueado enquanto essas pendências permanecerem.

## Prévia local

Após instalar as dependências com `npm ci --offline=false` (este ambiente tem o modo offline do npm ativado globalmente), execute `npm run dev` e abra `http://127.0.0.1:3000`. O servidor de desenvolvimento escuta somente no computador local. `npm run build:preview` compila a prévia para verificação técnica com `noindex`; o resultado só pode ser executado localmente ou sob controle de acesso. `npm run build` é o gate de publicação e deve falhar até D01–D08 serem resolvidos. Nenhum desses comandos publica o site.
