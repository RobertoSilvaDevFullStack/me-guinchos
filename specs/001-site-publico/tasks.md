# Tarefas executáveis — Spec 001

Marcar como concluída somente com evidência no relatório de validação. `P` indica prioridade.

| ID | P | Dono | Entrega e vínculo |
| --- | --- | --- | --- |
| T01 | P0 | Produto/cliente | Registrar confirmações de telefone, horário, cobertura aproximada, serviços e pagamentos; resolver teste real de contato, limites operacionais/geográficos, domínio e dados legais (RF02, RF03, RF05, RF07, RF12, RF13). |
| T02 | P0 | SEO | Redigir copy e matriz anúncio → rota → H1 → CTA, sem afirmação não aprovada (RF01, RF04, RF09, RF13). |
| T03 | P0 | Front | Criar base Next/TS/Tailwind e configuração tipada sem backend (RF01–RF05, RNF03). |
| T04 | P0 | Front | Implementar home, CTAs sem JS, barra mobile com safe area (RF01–RF03, RNF01). |
| T05 | P1 | Front + SEO | Páginas específicas aprovadas, FAQ, cobertura e galeria curada (RF04–RF07). |
| T06 | P1 | SEO | `robots.txt`, `sitemap.xml`, `llms.txt`, canonical, OG, JSON-LD e `lang` (RF09, RNF05). |
| T07 | P1 | Front + SEO | Política, preferências e eventos consentidos; testar rede sem escolha/rejeição (RF08, RNF04). |
| T08 | P1 | SEO + arquitetura | Inventário de URLs antigas, mapa de redirects e escolha de hospedagem compatível (RF10). |
| T09 | P1 | Performance | Otimizar fotos/fontes/bundle e registrar medidas mobile antes/depois (RNF02). |
| T10 | P0 | QA | Executar matriz V01–V13 de `validation.md`, corrigir falhas e registrar evidências (todos). |
| T11 | P0 | Responsável pelo projeto | Aprovar editorial, links, fotos, privacidade e gate; então publicar e verificar produção. |
| T12 | P1 | Front + SEO | Hero com slides manuais e acessíveis, guincho primeiro, fotos candidatas e seções de serviços com CTAs contextuais; oferta pendente identificada (RF01, RF04–RF06, RF11, RNF01–RNF03). |
| T13 | P1 | Front + SEO | Seção de pagamento em prévia e publicação apenas de modalidades aprovadas (RF12). |
| T14 | P1 | SEO + Front | Backlog e páginas de destino por serviço/cidade/rodovia com cobertura comprovada, conteúdo próprio, navegação/rodapé e teste da URL final para Ads (RF09, RF13). |
| T15 | P1 | Front + SEO | Aplicar as confirmações de 28/09 à prévia: telefone, horário 7h–22h todos os dias, cobertura indicativa, duas ofertas de empilhadeira, Pix/cartões/dinheiro e galeria curta da ME; revisar a marca candidata sem copiá-la automaticamente para produção (RF02–RF07, RF11–RF13). |

A implementação da prévia foi autorizada nos pedidos de 27 e 28/09/2026. Esta lista não é autorização de deploy.

## Progresso em 27/09/2026

- **T03/T04:** primeira fatia implementada e validada como prévia local; evidência em [validation-2026-09-27.md](validation-2026-09-27.md). RF02/RF03 ainda não têm aceite de publicação porque o número candidato depende de D02 e teste em aparelho real.
- **T12/T13:** implementadas em prévia local com slides manuais, fotos candidatas, serviços, CTAs e pagamento marcado `[PREENCHER]`; evidência em [validation-2026-09-27-fatia2.md](validation-2026-09-27-fatia2.md). Publicação depende de D01, D02, D07 e D08, entre outras decisões editoriais.
- **T14:** matriz e backlog de destinos de campanha documentados em `docs/03-conteudo-seo.md`; rotas e links locais continuam pendentes de D03 e conteúdo aprovado.
- **T01/T05–T11:** pendentes conforme dependências do plano. O gate técnico de build bloqueia publicação até as decisões editoriais aplicáveis serem registradas.

## Atualização em 28/09/2026

- **T01 parcial:** número final 8799, janela 7h–22h de domingo a domingo para todos os serviços, raio aproximado de 20 km com localidades citadas, duas ofertas de empilhadeira e Pix/cartões/dinheiro confirmados pelo usuário. Persistem teste em smartphone, setores/trechos, limites técnicos, fotos/originais, domínio e dados legais.
- **T15:** terceira fatia de prévia em execução. A confirmação comercial atualiza a copy, mas não libera produção nem campanhas por cidade/rodovia.
