# 02 — Arquitetura e decisões

## ADR-001 — Site público majoritariamente estático

**Estado:** proposta para implementação, condicionada à hospedagem/domínio finais.

**Decisão:** Next.js App Router + TypeScript + Tailwind, páginas pré-renderizadas e distribuídas por CDN. Conteúdo comercial em configuração tipada versionada no repositório. Sem API, Prisma, PostgreSQL, Docker de produção ou CMS no MVP. O projeto começa vazio, portanto não há stack existente a preservar.

**Razão:** o objetivo é levar o visitante a `wa.me` ou `tel:` com o menor caminho possível. Não há fluxo que exija persistência de dados próprios ou processamento no servidor. Menos JavaScript e menos infraestrutura reduzem pontos de falha para um usuário em situação de urgência.

**Limites:** confirmar se a hospedagem suporta os recursos necessários de redirects e cabeçalhos. Na exportação estática do Next.js, recursos dependentes de runtime e otimização padrão de imagem têm restrições; conferir a [documentação oficial de static exports](https://nextjs.org/docs/app/guides/static-exports) na implementação. Se a migração exigir redirects no servidor, configurar na borda/CDN ou rever a opção de exportação. Uma alteração de arquitetura exige ADR atualizada.

## Contratos de conteúdo e mídia

Uma configuração única deve definir: `brandName`, `domain`, `phoneDisplay`, `phoneE164`, `whatsappE164`, mensagem inicial, status de atendimento, serviços com estado `confirmado|pendente`, área confirmada, dados legais e links sociais. Valores `[PREENCHER]` bloqueiam publicação dos trechos correspondentes. Não embutir número em múltiplos componentes.

Inventário de mídia por arquivo: nome, origem, proprietário, autorização, serviço retratado, descrição factual/alt, proporção, versão otimizada e posição na página. Não fazer *hotlink* do site antigo nem extrair uma foto sem direitos confirmados.

## Contrato de contato

- WhatsApp: `https://wa.me/<numero_E164_sem_+>?text=<mensagem_codificada>`.
- Ligação: `tel:<numero_E164>`.
- Links HTML reais em hero, faixa fixa mobile e rodapé. A navegação e o acionamento não dependem de JavaScript, cookie ou analytics.
- Testar o número exibido, o número de destino e a mensagem predefinida em dispositivo real. A mensagem não contém dados do visitante; apenas pede que ele informe local, veículo e destino no aplicativo.

## Composição proposta

`app/` para rotas e metadados; `components/` para apresentação; `content/` para copy e configuração; `public/images/` para mídia aprovada; `lib/` para construção de URLs/eventos puros. Esta é uma orientação de limites, não uma exigência de criar pastas sem uso.

## Operação e deploy

Ambiente de preview separado de produção; HTTPS; domínio canônico definido; configuração de cache para assets; acesso mínimo a DNS e contas; procedimento de rollback para versão anterior. Se `meguinchos.com.br` for substituído, inventariar URLs indexadas e criar mapa de redirects permanentes antes de publicar. Não iniciar deploy enquanto o gate documental/editorial e técnico de `validation.md` estiver incompleto.

Preview com placeholders fica local ou protegido por autenticação no provedor, com `noindex` e sem sitemap público. O pipeline de produção deve detectar `[PREENCHER]` e serviços pendentes em conteúdo publicado e interromper o build. Na hospedagem escolhida, configurar e testar CSP apropriada aos scripts consentidos, HSTS após HTTPS estável, `X-Content-Type-Options: nosniff`, `Referrer-Policy` e proteção contra enquadramento (`frame-ancestors` ou equivalente). Não copiar uma CSP genérica sem testar contatos, fontes e medição.

## ADR-002 — Primeira fatia como preview local bloqueado para publicação

**Data:** 27/09/2026. **Estado:** aplicada à primeira fatia da Spec 001 (T03/T04).

O build padrão (`npm run build`) é o caminho de produção e falha enquanto os dados editoriais D01–D08 não estiverem aprovados. `npm run build:preview` define explicitamente `SITE_PREVIEW_BUILD=1` para validar a prévia, com `noindex`, sem sitemap público e apenas em ambiente local ou protegido. O comando de desenvolvimento escuta em `127.0.0.1`. O número candidato informado no briefing fica em uma configuração única, marcado como pendente e acompanhado de aviso visível; isso permite conferir o HTML dos links sem tratá-lo como contato validado. Não há scripts de medição nesta fatia.

Na primeira fatia, as fotos coletadas permaneceram somente no acervo de referência e um bloco gráfico temporário ocupou o hero. A decisão para fotos candidatas na prévia da fatia 2 está no ADR-003; publicação ainda depende de D07. Fontes de sistema evitam baixar arquivos na compilação; as famílias finais dependem de licença, arquivos locais e avaliação com a marca/fotos aprovadas. A primeira fatia mantém a renderização HTML essencial sem JavaScript do cliente.

## ADR-003 — Slides manuais e destinos de campanha sujeitos a dados aprovados

**Data:** 27/09/2026. **Estado:** direção aprovada para prototipação local da fatia 2; publicação condicionada à Spec 001.

O pedido de referência na JHC orienta a **estrutura** da ME: primeiro estado do hero para guincho, estados separados por serviço, seções de atendimento, contatos recorrentes, cobertura e formas de pagamento. O hero não avança sozinho. O primeiro conteúdo e os links `wa.me`/`tel:` permanecem em HTML e funcionais sem scripts; controles de slides são manuais, acessíveis e não bloqueiam a conversão. Não copiar textos, marca, fotos ou alegações da JHC.

As cópias do acervo ME podem compor apenas a prévia local/protegida, identificadas como candidatas. Para produção, D07 exige autorização comercial, identificação factual, revisão de placas/rostos e arquivos adequados. Foto de empilhadeira sobre plataforma prova **transporte**, não operação com empilhadeira própria. Métodos de pagamento e links para páginas por cidade/rodovia entram no site público somente após D08/D03 e os gates de conteúdo, SEO e Ads; rascunhos não entram em sitemap, indexação nem campanhas.

## ADR-004 — Confirmações comerciais parciais e terceira fatia de prévia

**Data:** 28/09/2026. **Estado:** aplicada ao conteúdo de prévia; dados de contato e mídia posteriormente atualizados pela ADR-005.

O número `+55 11 95199-8799`, a janela **7h–22h de domingo a domingo para todos os serviços**, Pix/cartões/dinheiro e a existência de equipamento próprio para movimentação de cargas foram confirmados diretamente pelo usuário. O teste do contato em aparelho e o escopo técnico da empilhadeira continuam separados dessas confirmações. A configuração de contato pode marcar o número como confirmado editorialmente, sem afirmar que a ligação e a conversa foram recebidas. O build padrão continua bloqueado enquanto houver dados obrigatórios ou materiais pendentes.

A cobertura do mapa é **aproximada**, centrada na base, com localidades parcialmente incluídas. No conteúdo e nas futuras rotas, usar termos como “consulta de atendimento para endereço/trecho” até validar limites operacionais. Nenhuma lista do rodapé ou sitemap deve transformar o círculo em promessa sobre município ou rodovia inteira. Transporte/carregamento de empilhadeiras e movimentação de cargas com empilhadeira própria têm registros, provas e páginas independentes.

A terceira fatia da home pode mostrar raio indicativo, janela geral confirmada, slide de empilhadeira, Pix/cartões/dinheiro e galeria curada de fotos da ME no preview local/protegido. `Cartoes.webp` contém arte e frase usadas pelo usuário na JHC; ele e o print da JHC servem como **referência visual**, não como material a copiar para a ME. A prévia usa composição própria e só nomeia modalidades confirmadas. `logo-me-guinchos.png` é uma proposta de marca recebida: revisar texto, qualidade, autoria e aplicação antes de substituir a marca atual. Fotos de 600×400 px coletadas do site anterior seguem candidatas até D07 e obtenção dos originais.

## ADR-005 — Dados definitivos preparados com publicação e indexação ainda bloqueadas

**Data:** 01/10/2026. **Estado:** aplicada ao handoff de preparação técnica; não autoriza deploy.

O responsável confirmou o telefone/WhatsApp **+55 11 93029-9233**, o domínio canônico **https://meguinchos.com.br**, a logo atual, a titularidade e reutilização das fotos da ME e a permanência das artes de pagamento. D01/D05 ficam resolvidas para o site atual por decisão editorial: vans, utilitários e os dois serviços de empilhadeira usam linguagem consultiva e não publicam tonelagem, peso máximo, modelos, operador ou limites técnicos. Os dados legais e o endereço publicável já haviam sido confirmados em 29/09/2026 e permanecem na política, no JSON-LD e no `llms.txt`.

Contato, metadata, canonical, Open Graph/Twitter, JSON-LD e arquivos de raiz são preparados com os dados definitivos, mas isso não libera a publicação. `INDEXACAO_LIBERADA = false` mantém `noindex, nofollow`, fecha o `robots.txt` e deixa o sitemap sem URLs. A trava de produção e o bypass explícito `SITE_PREVIEW_BUILD=1` permanecem; uma prévia compilada só pode ser executada localmente ou sob controle de acesso. O teste real de WhatsApp/ligação e o inventário completo de URLs antigas continuam pendentes.

Os redirects conhecidos usam **301** direto para o host canônico, evitando cadeia quando a origem chega por `www`. Não são criadas equivalências para URLs antigas sem destino comprovado. DNS, HTTPS, Coolify e Traefik foram validados externamente, mas nenhum deploy é autorizado por esta ADR.

Na auditoria de handoff, `next-env.d.ts` foi classificado como artefato gerado pelo Next 16: `next dev` aponta para `.next/dev/types` e `next build` para `.next/types`. A alteração observada é preservada como saída automática do último comando, não como decisão manual de arquitetura; não editar esse arquivo à mão nem interpretar futuras alternâncias como mudança funcional sem conferir o gerador da versão instalada.

## ADR-006 — Acervo operacional atualizado e legendas vinculadas aos envios

**Data:** 02/10/2026. **Estado:** aplicada à interface; não altera o bloqueio de publicação.

O Manoel enviou 12 fotografias atuais pelo WhatsApp na noite de 01/10/2026 e pediu que substituíssem o acervo operacional anterior com as legendas que acompanharam cada envio. A interface usa versões WebP sem metadados, preserva o enquadramento integral salvo no recorte social 1200×630 e mantém um manifesto em `public/images/operacoes/README.md` com origem, legenda original, legenda aplicada e alt factual.

A correção pública de “impilhadeira” para “empilhadeira” é exclusivamente ortográfica. A legenda “Guincho para empilhadeira de 7 toneladas” descreve aquele registro fotográfico e não define peso máximo, capacidade de frota ou disponibilidade geral. As mensagens posteriores “Locação de impilhadeira” e “Carga de descarga” não têm vínculo inequívoco com uma foto e não foram convertidas em oferta.

As imagens de empilhadeiras continuam documentando **transporte em plataforma**, não movimentação de cargas no local com empilhadeira própria. A separação exigida por RF05 permanece: o serviço com equipamento próprio segue descrito de forma consultiva e sem usar essas fotos como prova. Placas, marcas e outros identificadores visíveis devem permanecer na revisão editorial do gate de publicação.

## ADR-007 — Camada de conversão (dataLayer + GTM), páginas locais de SEO e liberação de indexação

**Data:** 07/10/2026. **Estado:** aplicada à arquitetura e ao código.

**Decisões:**
1. **Rastreamento via dataLayer unificado:** Implementação de `lib/tracking.ts` e `components/RastreamentoContatos.tsx` com delegação global de eventos de clique. Todos os links de WhatsApp disparam o evento `whatsapp_click` com metadados contextuais (`page_path`, `page_location`, `button_location`, `link_url`). Todos os links de telefone (`tel:`) disparam `phone_click` com metadados equivalentes. Não há snippets `onclick` soltos no HTML e nenhum clique é bloqueado.
2. **Conversão do Google Ads:** A conversão `AW-18490859899/nnUMCNDBzJQdEPvCkPFE` fornecida pelo responsável destina-se ao acionador `whatsapp_click` no GTM (ou gtag auxiliar). Para ligações telefônicas, o evento `phone_click` fica emitido no dataLayer e aguarda a criação da ação de conversão específica de chamadas na conta do Google Ads.
3. **Páginas locais para SEO e Google Ads:** Criação de quatro rotas dedicadas e indexáveis: `/guincho-vila-anastacio` (base sede), `/guincho-marginal-tiete` (via expressa), `/guincho-zona-oeste-sp` (polo central de cobertura) e `/guincho-osasco` (município contíguo no raio operacional). Cada página conta com conteúdo original, vias de acesso, regras factuais de acionamento, dados estruturados BreadcrumbList e links internos cruzados.
4. **Indexação e build de produção:** Ativação de `INDEXACAO_LIBERADA = true`, inclusão das novas rotas em `app/sitemap.ts`, liberação de `robots.txt` para rastreamento e remoção da trava impeditiva de compilação em `content/site.ts`, viabilizando builds limpos de produção.
5. **Ajuste de CSP:** Inclusão dos domínios do Google Tag Manager e Google Ads/Analytics na Content Security Policy em `next.config.ts`, garantindo integridade das requisições sob consentimento.

## ADR-008 — Alinhamento do domínio canônico ativo para memorettiguinchos.com.br

**Data:** 07/10/2026. **Estado:** aplicada à arquitetura e ao código.

**Decisão:** Atualização da constante `siteUrl` de `https://meguinchos.com.br` para `https://memorettiguinchos.com.br`. O novo domínio reflete o ambiente em produção ativo no Coolify (IP 72.61.52.78) associado à razão social do titular Luis Carlos Moretti do Nascimento (ME Moretti Guinchos). Essa mudança garante coerência absoluta entre as URLs canônicas (`<link rel="canonical">`), sitemap.xml, metadados Open Graph/Twitter, llms.txt e os sitelinks cadastrados nas campanhas do Google Ads.

## ADR-009 — Ampliação cirúrgica da CSP para Google Ads Conversion Tracking e saneamento de duplicidade de Tag Base

**Data:** 09/10/2026. **Estado:** aplicada à arquitetura e ao código.

**Decisões:**
1. **Ajuste cirúrgico da CSP:** Atualização de `cspProducao` em `next.config.ts` para permitir os recursos estritamente necessários ao Google Tag Manager e à Tag de Conversão do Google Ads.
   - `script-src`: inclusão de `https://*.googletagmanager.com`, `https://tagmanager.google.com`, `https://www.googleadservices.com`, `https://*.googleadservices.com`, `https://www.google.com`, `https://*.google.com`, `https://googleads.g.doubleclick.net`.
   - `connect-src`: inclusão de domínios apex (`google.com`, `googleadservices.com`), TLD Brasil (`google.com.br`, `*.google.com.br`), telemetria (`pagead2.googlesyndication.com`, `*.googlesyndication.com`, `googleads.g.doubleclick.net`, `*.g.doubleclick.net`).
   - `frame-src`: criação da diretiva restrita para `bid.g.doubleclick.net`, `td.doubleclick.net`, `googletagmanager.com` e `*.doubleclick.net`, evitando bloqueio de sincronização de cookies de conversão pelo fallback `default-src 'self'`.
   - `img-src` e `style-src`/`font-src`: liberação de endpoints de pixel e suporte ao Tag Assistant do GTM (`ssl.gstatic.com`, `fonts.googleapis.com`, `fonts.gstatic.com`).
2. **Eliminação de duplicidade da Tag Base:** Remoção do `<Script id="gtag-google-ads">` e da chamada direta `gtag("config", GOOGLE_ADS_ID)` em `components/ConsentimentoMedicao.tsx`. A governança e disparo da Tag Base `AW-18490859899`, remarketing e conversões é centralizada no container `GTM-55QGH9RR`.
3. **Preservação de integridade:** O Consent Mode v2 (`consent default` e `consent update`), a fila do `dataLayer`, e os eventos customizados de conversão (`whatsapp_click` e `phone_click`) são mantidos 100% íntegros. Nenhuma liberação global `*` ou desativação de CSP foi utilizada.

## ADR-010 — Remoção do banner de consentimento e carregamento direto do Google Tag Manager para restauração de alcance e conversão das campanhas

**Data:** 16/10/2026. **Estado:** aplicada à arquitetura e ao código.

**Contexto:** O projeto enfrentava baixa entrega, alcance reduzido e perda de relevância nas campanhas de tráfego pago (Google Ads). Na modalidade de guincho emergencial, o público busca socorro em situação crítica e quase nunca interagia com o banner de cookies flutuante, que bloqueava a carga das tags antes do clique afirmativo. Como consequência:
1. Mais de 90% das sessões e cliques para WhatsApp/telefone não eram reportados ao Google Ads.
2. O algoritmo de Smart Bidding/Maximização de Conversões do Google Ads operava sem dados de conversão, degradando o Índice de Qualidade, reduzindo a participação em leilões e limitando o alcance.
3. A presença do banner flutuante no mobile disputava espaço visual com a barra fixa de contato (`BarraContato`).

**Decisões:**
1. **Remoção do banner e do modal de preferências:** Os componentes `ConsentimentoMedicao` e `BotaoPreferencias` foram removidos da interface visual, eliminando o atrito no funil de atendimento e reduzindo o bundle CSS.
2. **Carregamento direto e assíncrono do Google Tag Manager:** Inclusão de `components/GoogleTagManager.tsx` no layout raiz (`app/layout.tsx`), com inicialização assíncrona (`strategy="afterInteractive"`). O container `GTM-55QGH9RR` é carregado diretamente, com `consent default` configurado em `granted` para `ad_storage`, `ad_user_data`, `ad_personalization` e `analytics_storage`.
3. **Preservação do rastreamento de eventos:** O `dataLayer` e os eventos de conversão `whatsapp_click` e `phone_click` (`components/RastreamentoContatos.tsx` e `lib/tracking.ts`) permanecem 100% ativos e agora alimentam o Google Ads para todas as interações.
4. **Governança de privacidade e transparência:** A Política de Privacidade (`/politica-de-privacidade`) foi atualizada para descrever o uso das tags com base no Legítimo Interesse (art. 7º, IX da LGPD) para apuração de eficácia de anúncios e métricas agregadas, reiterando que nenhum dado pessoal (nome, telefone, placa, texto de conversa) é enviado em parâmetros de eventos ou URLs.

## ADR-011 — Expansão das Landing Pages de Sitelinks para Google Ads e SEO Técnico

**Data:** 16/10/2026. **Estado:** aplicada à arquitetura e ao código.

**Contexto:** Criação de seis páginas de destino específicas para os sitelinks da campanha de Pesquisa do Google Ads e SEO orgânico local, garantindo máxima relevância de anúncio, aumento de CTR, melhor Índice de Qualidade e rastreamento preciso de conversões.

**Decisões:**
1. **Implementação de 6 rotas dedicadas:**
   - `/guincho-24-horas`: foco na busca por socorro e plantão diário (7h às 22h, de domingo a domingo). Transparência total sobre horário de operação.
   - `/transporte-de-veiculos`: foco em translado e transporte programado de carros, SUVs e utilitários leves sobre plataforma sem arrasto (sem motos).
   - `/transporte-de-empilhadeiras`: linguagem consultiva para carregamento e transporte de máquinas industriais, com menção consultiva a serviços com equipamento próprio.
   - `/solicitar-orcamento`: página de cotação rápida com `FormularioOrcamento.tsx` gerando mensagem estruturada diretamente para o WhatsApp sem backend.
   - `/guincho-lapa-sp`: página regional da Lapa com vias e marcos locais (Rua Clélia, Estação Lapa, Mercado, Viaduto da Lapa).
   - `/servicos-de-reboque`: foco em resgate emergencial em vias/rodovias para veículos quebrados ou acidentados (diferenciado do transporte logístico programado).
2. **Reutilização da arquitetura e design system:** Utilização dos componentes globais (`SiteHeader`, `SiteFooter`, `BarraContato`, `Retrorreflexao`, `Pictograma`), cards com a classe `placa`, e imagens reais da frota autorizada ME (`guinchoTresVeiculos`, `guinchoCarroLuxo`, `guinchoEmpilhadeiras`, `guinchoPlataformaGrande`).
3. **Conversões e dataLayer:** Todas as novas páginas utilizam CTAs mapeados com `data-tracking-location` único e disparam `whatsapp_click` e `phone_click` para o container `GTM-55QGH9RR`.
4. **Descoberta e SEO Técnico:** Inclusão no `app/sitemap.ts`, metadados completos com canonicals em `metadataDaRota`, dados estruturados Schema.org (`BreadcrumbList` e `Service`/`EmergencyService`/`AutoRepair`).

## ADR-012 — Ampliação operacional para Atendimento 24 Horas (7 dias por semana)

**Data:** 16/10/2026. **Estado:** aplicada à arquitetura e ao código.

**Contexto:** O cliente confirmou a contratação de um novo motorista para a escala noturna/plantão, expandindo a capacidade operacional da Memoretti Guinchos de 7h–22h para atendimento ininterrupto 24 horas por dia, 7 dias por semana (inclusive madrugadas, fins de semana e feriados).

**Decisões:**
1. **Atualização das informações comerciais:**
   - Atualização da constante `hoursLabel` em `content/site.ts` para `"Atendimento 24 horas, todos os dias"`.
   - Atualização do rodapé (`SiteFooter.tsx`), página inicial (`app/page.tsx`), formulário (`FormularioOrcamento.tsx`) e resumo de atendimento.
   - Atualização de todas as páginas regionais (`app/guincho-lapa-sp`, `app/guincho-marginal-tiete`, `app/guincho-osasco`, `app/guincho-vila-anastacio`, `app/guincho-zona-oeste-sp`) e páginas de sitelink (`app/guincho-24-horas`, `app/transporte-de-veiculos`, `app/solicitar-orcamento`, `app/servicos-de-reboque`).
2. **Dados Estruturados Schema.org:**
   - Em `components/DadosEstruturados.tsx` e `app/guincho-lapa-sp/page.tsx`, a especificação `openingHoursSpecification` foi atualizada de `07:00`/`22:00` para `opens: "00:00"` e `closes: "23:59"`.
   - Em `app/guincho-24-horas/page.tsx`, o schema `@type: "EmergencyService"` reflete `openingHoursSpecification` cobrindo 24h em todos os dias da semana.
3. **Coerência de Anúncios e SEO:**
   - A rota `/guincho-24-horas` passa a operar como representação fidedigna do serviço ativo 24h, garantindo perfeita correspondência com anúncios no Google Ads para termos de busca de emergência 24 horas.

## ADR-013 — Saneamento de privacidade (zero PII) no dataLayer e em eventos de contato

**Data:** 05/11/2026. **Estado:** aplicada em branch de desenvolvimento (`feat/painel-monitoramento-ips`).

**Contexto:** A auditoria técnica de Fase 0 identificou que o componente `components/FormularioOrcamento.tsx` repassava a URL completa de destino do WhatsApp (`https://wa.me/5511998369565?text=...`), contendo nome, telefone, origem, destino e observações preenchidos pelo usuário, no parâmetro `link_url` de `registrarCliqueWhatsApp()`, expondo dados pessoais (PII) ao `window.dataLayer` e às tags do Google Tag Manager (`GTM-55QGH9RR`) / Google Ads (`AW-18490859899`).

**Decisões:**
1. **Sanitização centralizada em `lib/tracking.ts`:** Criação das funções puras `sanitizarUrlContato`, `sanitizarUrlPagina` e `sanitizarCaminhoPagina`. Qualquer chamada a `registrarCliqueWhatsApp` ou `registrarCliqueTelefone` remove automaticamente o parâmetro `?text=` e quaisquer query strings não autorizadas de `link_url`, preservando apenas o destino base (`https://wa.me/5511998369565` ou `tel:+5511998369565`).
2. **Allowlist estrita em `page_location`:** São mantidos em `page_location` apenas a origem, o `pathname` e os parâmetros de atribuição de campanha permitidos (`gclid`, `wbraid`, `gbraid`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`), desde que não contenham padrões de e-mail, telefone ou CPF.
3. **Isolamento e resiliência em `FormularioOrcamento.tsx` e `RastreamentoContatos.tsx`:** O formulário continua abrindo o WhatsApp com a mensagem completa para o usuário (`window.open(linkDestino, ...)`), mas envia ao rastreamento apenas a URL base sem `?text=`, envolvida em bloco `try/catch` silencioso para garantir que falhas de rastreamento jamais afetem o acionamento do WhatsApp ou discador.

## ADR-014 — Serviço isolado de monitoramento de IPs, atribuição e prevenção a tráfego inválido (`monitoring/`)

**Data:** 05/11/2026. **Estado:** implementada em branch de desenvolvimento (`feat/painel-monitoramento-ips`).

**Decisões:**
1. **Desacoplamento arquitetural:** Criação do serviço independente em `monitoring/` (Node.js + TypeScript + PostgreSQL 17 Alpine), sem acoplamento em tempo de compilação ou SSR ao site público Next.js.
2. **Isolamento de rede do PostgreSQL:** Em `monitoring/docker-compose.yml`, o banco `monitoring-db` usa exclusivamente rede interna (`internal: true`) e `expose: ["5432"]`, sem mapeamento `ports:` para o host.
3. **Extração segura do IP real (`monitoring/src/ip/extractClientIp.ts`):** Validação estrita do `socket.remoteAddress` contra `TRUSTED_PROXY_CIDRS` (sem confiar cegamente em toda a rede privada Docker), leitura *right-to-left* de `X-Forwarded-For`, detecção de divergência com `X-Real-IP` (`ipHeaderMismatch`) e sinalização de tentativas de spoofing (`spoofAttemptDetected`).
4. **Separação estrita de métricas (`monitoring/src/services/collectorService.ts`):**
   - **Requisições:** cada evento válido aceito (`page_view`, `whatsapp_click`, `phone_click`), excluindo `prefetch`.
   - **Visitas:** sessões únicas iniciadas dentro da janela deslizante de 30 minutos (`is_new_visit = TRUE`).
   - **Entradas pagas identificadas:** contabilizadas em `is_paid_entry = TRUE` e deduplicadas por sessão e `paid_click_id` (impedindo inflação por reload F5 ou navegação interna, e sem confusão com cliques faturados pelo Google Ads).
   - **Eventos de contato:** cliques em `whatsapp_click` e `phone_click`, herdando a atribuição de entrada da sessão ativa.
5. **Minimização, sanitização estrutural e retenção de 30 dias (LGPD):** Validação estrutural de Click IDs e UTMs sem depender exclusivamente de expressões regulares (decodificação recursiva de URI, contagem ASCII de dígitos `< 8`, bloqueio de caracteres de e-mail/HTML), minimização de `User-Agent` e `Referrer`, e expurgo automático de registros após 30 dias (`monitoring/src/retention/retentionJob.ts`).

## ADR-015 — API Administrativa Autenticada, Controle de Concorrência e Refinamento de Sanitização/Traefik (Etapa 3)

**Data:** 06/11/2026. **Estado:** implementada em branch de desenvolvimento (`feat/painel-monitoramento-ips`).

**Decisões:**
1. **Guard centralizado de autenticação, autorização e cache (`monitoring/src/server.ts` e `monitoring/src/security/auth.ts`):**
   - Todos os endpoints administrativos sob `/api/v1/admin/*` (incluindo resumo, listagem de IPs, histórico por IP, gestão de IPs investigados, sessão, logout e exportações JSON/CSV) exigem sessão autenticada válida e emitem `Cache-Control: no-store, no-cache, must-revalidate, private`.
   - Proteção anti-força bruta dupla no login (por IP do cliente e por conta/username) combinada com derivação `scrypt` em tempo constante (`verifyPasswordConstantTime` com hash dummy para usuários inexistentes).
   - Defesa contra manipulação de sessão: validação estrita do alfabeto base64url do token, rejeição de múltiplos cookies `meg_admin_session` (Cookie Tossing), rejeição de divergência entre Cookie e `Authorization: Bearer`, invalidação imediata no banco via `POST /api/v1/admin/logout` e verificação de `Origin` contra CSRF em mutações (`POST`, `PUT`, `DELETE`).
2. **Validação estrita de parâmetros, limites de consulta e paginação (`monitoring/src/security/adminValidator.ts`):**
   - Janela temporal máxima de 720 horas (30 dias) tanto por `hours` (`1..720`) quanto por intervalo ISO-8601 (`from` e `to`).
   - Paginação limitada a `1..100` registros por página nas listagens e `1..5000` registros nas exportações, com proteção contra *CSV/Formula Injection* (`escapeCsvCell`).
   - Queries 100% parametrizadas (`$1, $2...`) e *whitelist* estrita para colunas de ordenação em `PostgresMonitoringRepository`.
3. **Concorrência multi-instância e deduplicação no banco (`monitoring/src/services/collectorService.ts` e `monitoring/src/db/repository.ts`):**
   - Não depende exclusivamente de travas em memória: `PostgresMonitoringRepository.withSessionTransaction` abre transação explícita (`BEGIN ... COMMIT`) e adquire lock transacional no motor PostgreSQL (`SELECT pg_advisory_xact_lock(hashtext('meg_session_lock'), hashtext($1))`), serializando requisições concorrentes da mesma sessão mesmo entre múltiplas réplicas/instâncias independentes do backend.
   - Defesa em profundidade no schema (`monitoring/migrations/001_init.sql`): índices únicos parciais `idx_access_events_event_id` (`WHERE event_id IS NOT NULL`) com `ON CONFLICT DO NOTHING` e `idx_access_events_unique_paid_entry` (`ON (session_id, COALESCE(paid_click_id, '')) WHERE is_paid_entry = TRUE`), além de deduplicação transacional de rajadas (`< 1000ms`) para eventos de contato.
4. **Refinamento da sanitização de UTMs (`lib/tracking.ts` e `monitoring/src/privacy/sanitizer.ts`):**
   - Preservação de UTMs legítimas do Google Ads (ValueTrack `kwd-...:loc-...`, `cid-...`, `agid-...`, `dsa-...`, datas `2026-11-06`, `24/7`, colchetes de correspondência exata e termos de cauda longa até 12 palavras / 128 caracteres), mantendo o bloqueio determinístico de sequências numéricas contíguas de PII (`>= 8` dígitos), e-mails e URLs.
5. **Endurecimento do parser de IP e validação real em PostgreSQL 17 (`monitoring/src/ip/extractClientIp.ts` e `monitoring/tests/postgres-integration.test.mts`):**
   - Parsing posicional *right-to-left* que aborta `X-Forwarded-For` se o salto esperado à direita estiver corrompido (sem deslocar a leitura para tokens não confiáveis à esquerda), sinalização de `ipHeaderMismatch` quando peers privados fora de `trustedProxyCidrs` enviam cabeçalhos de proxy e validação de CIDRs na inicialização (`validateIpExtractionConfig`).
   - **Validação em PostgreSQL 17 Real concluída:** suíte `npm run test:pg:strict` executada e aprovada contra container isolado em RAM (`meg-monitoring-pg-test-isolated` em `127.0.0.1:55439/meg_monitoring_test_only_db`), operando sob role restrita (`NOSUPERUSER NOCREATEDB NOCREATEROLE`) e protegida por trava anti-produção (`assertSafeTestDatabaseUrl`).
   - **Pendência operacional remanescente para produção:** confirmar na VPS a configuração efetiva do Traefik (`docker network inspect` e `forwardedHeaders`) antes do deploy, visto que testes simulados de cabeçalho não substituem a inspeção da rede real de borda.






## ADR-016 — Dashboard Privado de Monitoramento de IPs e Deduplicação de Entradas Pagas via UTM (Etapa 4)

**Data:** 06/11/2026. **Estado:** implementada e validada localmente em branch de desenvolvimento (`feat/painel-monitoramento-ips`).

**Decisões:**
1. **Arquitetura Frontend e Ponte Same-Origin (`app/api/v1/[...slug]/route.ts`, `app/painel-monitoramento/*`, `components/painel-monitoramento/*`):**
   - O dashboard administrativo foi implementado em React 19 + TypeScript + Tailwind CSS v4 sob `/painel-monitoramento` e `/painel-monitoramento/login`, consumindo exclusivamente os endpoints autenticados `/api/v1/admin/*` através de uma ponte *same-origin* (`app/api/v1/[...slug]/route.ts`).
   - Essa abordagem garante compatibilidade estrita com a Content Security Policy (`connect-src 'self'`) definida em `next.config.ts` e com cookies `HttpOnly; SameSite=Strict`, sem expor portas internas do serviço de monitoramento ao navegador.
2. **Segurança de Sessão, Proteção de Rotas e Privacidade de Logs:**
   - Nenhum token ou credencial é armazenado em `localStorage` ou `sessionStorage`; nenhuma credencial ou identificador sensível é registrado em `console.*`.
   - Dupla barreira de proteção de rota: validação no Server Component (`app/painel-monitoramento/page.tsx` via `cookies()` e `redirect("/painel-monitoramento/login")`) e verificação ativa de `/api/v1/admin/session` no Client Component (`PainelMonitoramentoClient.tsx`), impedindo que qualquer dado administrativo seja renderizado sem sessão válida.
   - Isolamento de SEO e telemetria: todas as rotas administrativas declaram `robots: { index: false, follow: false, nocache: true }`, estão excluídas de `app/sitemap.ts` e são ignoradas pelo listener global de eventos de visitante em `components/RastreamentoContatos.tsx`.
3. **Deduplicação de Entradas Pagas Baseadas Exclusivamente em UTMs (`monitoring/src/services/collectorService.ts`, `monitoring/src/db/repository.ts`, `monitoring/migrations/001_init.sql`):**
   - Sessões iniciadas exclusivamente com UTMs pagas (`paid_click_type = 'utm_paid'`, sem `gclid`/`wbraid`/`gbraid`) verificam `hasAnyPaidEntryInSession` e possuem índice único parcial `idx_access_events_unique_utm_paid_per_session`, garantindo que navegações internas na mesma sessão onde `utm_campaign`/`utm_term` variem ou sejam omitidos jamais inflem `identifiedPaidEntries`.
   - Quando uma sessão inicia com Click ID forte (`gclid`, `wbraid` ou `gbraid`) e uma página subsequente na mesma sessão retém apenas parâmetros `utm_*` (sem o Click ID na query string), o coletor preserva o `paidClickType` e o `paidClickId` originais da sessão em vez de rebaixar para `utm_paid`.
4. **Governança Operacional e Transparência de Métricas:**
   - O painel exibe em destaque a distinção técnica entre **Entradas Pagas Identificadas no Site** (sessões reais carregadas com sinal pago e deduplicadas na janela de 30 minutos) e **Cliques Contabilizados pelo Google Ads** (cliques no anúncio na SERP, incluindo extensões de chamada e desistências pré-carregamento).
   - A classificação de IPs (`suspeito_ads`, `em_observacao`, `legitimo_recorrente`, `ignorado`) é 100% manual e auditável, sem nenhum bloqueio automático de visitantes.

## ADR-017 — Arquitetura de Produção no Coolify 4.6.0, Isolamento de Redes e Autenticação Criptográfica HMAC-SHA256 da Ponte

**Data:** 06/11/2026. **Estado:** implementada e validada localmente em branch de desenvolvimento (`feat/painel-monitoramento-ips`), aguardando autorização de deploy.

**Contexto:** A inspeção da VPS Hostinger (Ubuntu 24.04.4 LTS, Docker 29.6.1, Docker Compose 5.3.1, 2 vCPUs, 7,8 GiB RAM, ~80 GB livres) confirmou que o ambiente utiliza **Coolify 4.6.0** com proxy de borda **Traefik 3.6** (`coolify-proxy`, IP `172.16.1.3` na rede `coolify` `172.16.1.0/24`) e hospeda serviços críticos coexistentes (Mailcow e outros bancos/aplicações).

**Decisões:**
1. **Isolamento de Rede Compatível com Redeploys do Coolify (`monitoring/docker-compose.yml`):**
   - `monitoring-db` (`postgres:17-alpine`) reside exclusivamente na rede privada `monitoring_db_net` (`internal: true`, sub-rede `172.29.11.0/29`), sem `ports:` expostas no host e com `traefik.enable=false`, tornando o banco fisicamente inacessível pela internet, pela rede compartilhada `coolify` e pelo próprio container Next.js.
   - `monitoring-api` roda na porta `4000` (sem usar a porta `3000` do Next.js), sem domínio público, sem `ports:` no host e com `traefik.enable=false`, conectando-se a `monitoring_db_net` (para acessar o banco) e à rede `coolify` (com alias `monitoring-api`), eliminando a necessidade de scripts privilegiados de pós-deploy (`docker network connect`) e garantindo conectividade automática após qualquer redeploy no Coolify.
2. **Autenticação Criptográfica `HMAC-SHA256` e Anti-Replay entre Next.js e Monitoring API (`monitoring/src/security/bridgeAuth.ts`, `lib/ponte-api-seguranca.ts`):**
   - Não confia na sub-rede Docker `coolify` por si só: toda chamada de `app/api/v1/[...slug]/route.ts` e `app/painel-monitoramento/page.tsx` para a `Monitoring API` é assinada com `HMAC-SHA256` utilizando o segredo exclusivo `MONITORING_BRIDGE_SECRET` (`>= 32` caracteres) sobre a carga canônica `v1\n${timestamp}\n${nonce}\n${method}\n${pathWithQuery}\n${xForwardedFor}\n${xRealIp}\n${bodySha256}`.
   - O `BridgeReplayGuard` valida a presença e formato dos cabeçalhos (`x-monitoring-bridge-ts`, `x-monitoring-bridge-nonce`, `x-monitoring-bridge-sig`) e a janela temporal (`±30s`) antes de ler o corpo da requisição, verifica a assinatura em tempo constante (`timingSafeEqual`) e bloqueia a reutilização de `nonce` (proteção anti-replay), impedindo que outros containers na rede `coolify` acessem a API ou forjem cabeçalhos de IP.
3. **Extração Dinâmica de IP sem Posição Fixa (`monitoring/src/ip/extractClientIp.ts`):**
   - Configurada com `TRUSTED_PROXY_CIDRS=172.16.1.0/24` (sub-rede onde operam o container Next.js autenticado via HMAC e o `coolify-proxy` `172.16.1.3`) e `MAX_TRUSTED_PROXY_HOPS=2`, percorrendo `X-Forwarded-For` da direita para a esquerda apenas sobre saltos comprovadamente pertencentes aos proxies confiáveis e cruzando o resultado com `X-Real-IP`, sem depender de índice fixo à esquerda.
4. **Limites de Recursos e Persistência:**
   - Tanto `monitoring-db` quanto `monitoring-api` operam com limite de `0.50 vCPU` e `256 MiB` de RAM (`shared_buffers=64MB`, `max_connections=30`), preservando ampla folga para o Mailcow e demais serviços da VPS, com dados persistidos no volume dedicado `memoretti_monitoring_pgdata`.

