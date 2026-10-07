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
