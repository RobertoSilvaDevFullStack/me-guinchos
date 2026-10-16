# Plano de validação e gate de lançamento

## Evidência por etapa

Para cada teste: registrar data, ambiente, dispositivo/viewport, resultado, evidência (captura/log/URL) e responsável. Falha deve incluir a saída observada, sem resumo vago. Não declarar “funciona” por ter compilado.

| ID | Verificação | Critério |
| --- | --- | --- |
| V01 | Visual em **360, 390, 768 e 1280 px** | Sem rolagem horizontal, sobreposição, corte de texto/CTA ou banner cobrindo a ação; alvos ≥44×44 px. |
| V02 | Smartphone real: WhatsApp e ligação | Número correto, mensagem correta, app/discador abre; testar sem JS e sem consentimento. |
| V03 | Teclado, leitor de tela, zoom e contraste | Ordem lógica, foco visível, alt pertinente, headings coerentes, zoom 200% sem perda de função. |
| V04 | Conteúdo | Número e atendimento 24 horas todos os dias coerentes em todas as páginas (ADR-012); áreas apenas na precisão aprovada, serviços de empilhadeira separados, capacidade não inventada, fotos aprovadas; zero `[PREENCHER]` em produção; build falha com dado pendente. |
| V05 | Consentimento e rede | Antes do aceite e após rejeição/revogação, nenhum GA4/GTM/Ads/pixel; contatos continuam operantes. |
| V06 | SEO | Rotas 200, títulos/canonicals/OG/JSON-LD corretos; `/robots.txt`, `/sitemap.xml`, `/llms.txt`; sitemap só com URLs finais. |
| V07 | Migração, se aplicável | URLs antigas relevantes respondem 301 para equivalente; sem cadeia/404 inesperado; Search Console acompanhado. |
| V08 | Performance mobile | Lighthouse em perfil mobile e CWV disponíveis; registrar **número antes e depois** de cada otimização. Sem baseline, reportar “primeira medição”, não “melhora”. |
| V09 | Segurança/privacidade | Sem segredos, dependências auditadas, HTTPS, política publicada com contato, dados mínimos, links externos seguros; CSP, HSTS, `nosniff`, `Referrer-Policy` e proteção contra enquadramento inspecionados no ambiente final. |
| V10 | Operação | Responsável atende contato de teste, recebe WhatsApp no número final, versão anterior pode ser restaurada. |
| V11 | Preview | Preview com placeholders só local ou com acesso controlado, marcado `noindex` e fora do sitemap; oferta pendente não acessível em produção. |
| V12 | Slides, galeria e prova visual | Em 360/390/768/1280 px, guincho e CTAs continuam visíveis no primeiro estado e com JS desligado; seleção manual funciona por toque/teclado/leitor de tela, sem avanço automático ou movimento obrigatório; cada foto da galeria e slide tem origem, alt factual e autorização registrada. Foto de transporte não prova movimentação no local; a logo aprovada é aplicada de forma consistente. |
| V13 | Pagamentos e destinos de campanha | Pix, cartões e dinheiro aparecem sem copiar arte/texto da JHC ou inventar condições; cada página local publicada comprova setor/trecho atendido, tem conteúdo próprio e URL final 200 coerente com anúncio/H1/CTA; links de navegação/rodapé, canonical e sitemap apontam apenas para URLs aprovadas. |

## Referência dos CWV

Alvos de experiência boa no percentil 75 em dados de campo: LCP até 2,5 s, INP até 200 ms, CLS até 0,1, conforme [web.dev](https://web.dev/articles/vitals). Lighthouse é diagnóstico de laboratório; registrar dispositivo, conexão e data e não trocar pontuação de desktop por mobile.

## Checklist de liberação

- [ ] T01 e D01–D08 resolvidos para todo conteúdo exposto.
- [ ] Fotos e textos aprovados pelo cliente; endereço exato só se explicitamente autorizado.
- [ ] V01–V11 passaram ou exceção foi documentada e aceita pelo responsável.
- [ ] SEO, privacidade, consentimento e três arquivos de raiz presentes.
- [ ] Slides, fotos, pagamentos e páginas de destino passaram V12/V13; nenhuma página local replica apenas o nome da cidade/rodovia.
- [ ] Contato e atendimento humano testados no ambiente de produção.
- [ ] Registro de baseline, versão publicada e procedimento de rollback.
- [ ] D09 e D10 resolvidos antes de ativar anúncios, pixels e medição de contatos qualificados.

Se um item obrigatório falhar, o lançamento fica pendente. Um preview técnico pode existir sem ser anunciado ou indexado.
