# Spec 001 — Site público ME Guinchos

**Estado:** pronto para prototipação; publicação bloqueada pelas decisões do cliente listadas em `docs/00-contexto-fontes.md`. **Fonte de verdade:** esta spec para comportamento; documentos de apoio para conteúdo, arquitetura, visual e validação.

**Atualização de 28/09/2026:** o usuário confirmou o número terminado em **8799**, a faixa **7h–22h, todos os dias e para todos os serviços**, um raio operacional aproximado de **20 km**, Pix/cartões/dinheiro e as ofertas de carregamento/transporte de empilhadeiras e movimentação de cargas com empilhadeira própria. Limites por chamado, trechos rodoviários, capacidade, operador e condições operacionais ainda exigem definição. O mapa enviado é referência aproximada, não uma lista de municípios integralmente atendidos.

**Atualização de 01/10/2026:** o responsável corrigiu o contato definitivo para **+55 11 93029-9233**, aprovou a logo atual, confirmou que as fotos pertencem ao Manoel/ME Guinchos e autorizou as artes de pagamento em uso. O domínio canônico é **https://meguinchos.com.br**, com `www` redirecionando para non-www. D01/D05 foram resolvidas para o site atual pela manutenção deliberada de copy consultiva, sem tonelagem, peso máximo, modelos ou limites técnicos. A publicação e a indexação continuam bloqueadas até autorização explícita e conclusão dos testes restantes.

**Atualização de 02/10/2026:** 12 fotografias atuais enviadas pelo Manoel na noite anterior substituem o acervo operacional exibido. As legendas associadas aos envios são aplicadas com correção apenas de ortografia evidente; a origem e a redação original ficam no manifesto de mídia. A menção a 7 toneladas descreve somente a empilhadeira daquele registro e não autoriza declarar capacidade máxima do serviço. Fotos de empilhadeiras continuam sendo prova de transporte, não de movimentação de cargas no local.

**Atualização de 16/10/2026:** O cliente contratou um novo motorista para a escala noturna e confirmou a ampliação operacional para **atendimento 24 horas, 7 dias por semana**, inclusive madrugadas, domingos e feriados (ver ADR-012). O site e as 6 landing pages passam a comunicar o serviço 24h de forma factual e transparente.

## Resultado esperado

Um visitante mobile que chegou por anúncio entende o serviço e consegue chamar a ME por WhatsApp ou telefone em poucos segundos. O site apresenta provas reais, evita promessas não confirmadas e é indexável para serviços e áreas efetivamente atendidos.

## Dados recebidos do usuário em 26/09/2026

- Base informada: **Vila Anastácia, São Paulo**, Rua Martinho de Campos, 538, CEP 05093-040. O endereço serve ao planejamento interno; **não exibir número da rua/endereço residencial** sem decisão de publicação específica.
- Cobertura desejada: **aproximadamente 20 km a partir da base**, sujeita a confirmação operacional por chamado. Não transformar o raio em lista automática de municípios/rodovias.
- Janela discutida: abertura às **7h** e atendimento **até por volta das 22h**. Encerramento e dias da semana ainda precisam de confirmação; não escrever 24h no novo site.
- Número candidato: **+55 11 95199-8799**, informado com ressalva (“acredito que é o número que vai utilizar”). Validar que recebe ligação e WhatsApp antes de publicar.
- O usuário autorizou usar fotos exibidas no site atual. Confirmar titularidade/uso comercial com Manoel e preferir arquivos originais quando disponíveis.
- As duas ofertas de empilhadeira são desejadas: **transporte** e **operação com empilhadeira no local**. A segunda depende de aquisição e prontidão do equipamento; disponibilidade de ambas requer confirmação.

## Direção adicional recebida em 27/09/2026

- Usar a JHC como referência de **estrutura da jornada**: hero por serviço, seções claras, links para páginas de serviços e áreas, contatos recorrentes e informação de pagamento. Textos, identidade, fotos, cobertura e promessas da JHC não são transferidos à ME.
- O hero deve permitir ver mais de um serviço em slides, com **guincho no primeiro estado** e transporte de empilhadeiras em estado separado. A movimentação com empilhadeira própria permanece uma oferta distinta e consultiva, sem limite técnico inventado.
- O usuário indicou as fotos já coletadas no repositório, inclusive carro esportivo e empilhadeira, como candidatas para a prévia. A titularidade e a autorização de reutilização foram confirmadas em 01/10; descrição factual e adequação de cada arquivo continuam requisitos editoriais.
- Prever seções de serviço e contatos contextuais, informação de formas de pagamento e páginas de destino por serviço/localidade/rodovia para campanhas. Cidade, trecho e pagamento específicos dependem de D03/D08; páginas com dados pendentes ficam apenas em rascunho local/protegido.

## Confirmações e direção recebidas em 28/09/2026

- **Contato:** o número `+55 11 95199-8799` foi confirmado naquela data, mas foi corrigido em 01/10 para `+55 11 93029-9233`. Abrir conversa e discador em aparelho real, com recebimento pelo responsável, segue como teste de lançamento.
- **Cobertura:** raio aproximado de 20 km a partir da base, com Barueri, Osasco, partes de São Paulo, Caieiras, Perus, Polvilho, início de São Caetano do Sul, Taboão da Serra e Embu das Artes indicados no mapa. Esta enumeração não confirma cobertura integral de cada município nem qualquer rodovia inteira; atendimento de endereço e trecho depende de consulta.
- **Horário:** **7h às 22h, de domingo a domingo, para todos os serviços**, conforme resposta complementar. Não declarar 24h.
- **Empilhadeiras:** o usuário confirmou carregamento e transporte de empilhadeiras e informou que Manoel possui empilhadeira própria para movimentação de cargas. São serviços distintos; capacidade, operador, restrições, disponibilidade e prova visual específica de operação ainda precisam de validação antes de alegações detalhadas e anúncios.
- **Pagamentos e mídia:** o usuário confirmou **Pix, cartões e dinheiro**; respondeu afirmativamente à pergunta sobre as bandeiras mostradas em `Cartoes.webp`. Os arquivos `Cartoes.webp`, `pix-pagamento.webp` e `logo-me-guinchos.png` foram adicionados ao acervo. Em 01/10, a logo foi aprovada como definitiva e as artes atuais de pagamento foram autorizadas a permanecer. A galeria usa apenas operações da ME com descrição factual e autorização confirmada.

## Requisitos funcionais

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| RF01 | Home apresenta guincho leve, região validada e duas ações de contato no primeiro bloco. | Em 360 e 390 px, texto principal e CTAs aparecem sem menu obrigatório; nenhum texto pendente é publicado. |
| RF02 | WhatsApp é um link HTML com número e mensagem válidos. | Ao tocar, abre conversa com número confirmado; link funciona sem JS e sem aceitar cookies. |
| RF03 | Ligação usa `tel:` com número confirmado, exibido de forma legível. | Ao tocar em dispositivo móvel, discador apresenta o número esperado; sem JS/cookie. |
| RF04 | Serviços de carro, moto e van/utilitário são diferenciados. | Cada serviço tem texto e prova correspondentes, sem listar capacidade não comprovada. |
| RF05 | Empilhadeira distingue carregamento/transporte e movimentação de cargas com equipamento próprio. | As duas ofertas são apresentadas separadamente, com escopo técnico ainda em validação; não se usa foto de transporte como prova de operação. |
| RF06 | Galeria curta usa fotos autorizadas e acessíveis. | Cada imagem possui origem registrada, alt factual quando informativa e tamanho responsivo. |
| RF07 | Área e horário são apresentados apenas na precisão aprovada. | O horário de atendimento 24 horas, todos os dias (7 dias por semana), vale para guincho e serviços ativos (ADR-012). Raio aproximado não vira cobertura integral de cidades ou rodovias. |
| RF08 | Mensuração direta e transparente de conversões sem barreira visual. | Tags de GTM e Google Ads carregam assincronamente sem bloquear a navegação ou exigir clique em banner; sem PII em parâmetros (ADR-010). |
| RF09 | Cada rota pública tem conteúdo, metadados e navegação coerentes. | Páginas sem oferta aprovada não entram em sitemap, indexação ou anúncios. |
| RF10 | Quando houver migração do domínio atual, URLs antigas relevantes chegam ao equivalente novo. | Inventário e redirects 301 aprovados e testados antes do lançamento. |
| RF11 | Hero apresenta serviços em slides selecionáveis manualmente. | Primeiro estado de guincho e dois CTAs permanecem claros em 360/390 px e com JS bloqueado; sem avanço automático; controles, foco, leitura e redução de movimento acessíveis; serviço pendente não é anunciado como ativo. |
| RF12 | Home apresenta formas de pagamento. | Pix, cartões e dinheiro confirmados aparecem em composição própria da ME, sem copiar a arte da JHC; condições não informadas não são inventadas. |
| RF13 | Páginas de destino por serviço, cidade ou rodovia atendem campanhas aprovadas. | Cada rota publicada tem oferta e cobertura confirmadas, H1/copy/prova/CTA próprios, URL final funcional e link coerente na navegação/rodapé; rascunhos e páginas quase duplicadas não entram em anúncios, sitemap ou indexação. |

## Cenários de comportamento

1. **Dado** visitante em 360 px, **quando** abre a home, **então** vê guincho e ações de WhatsApp/ligar e consegue acioná-las sem scripts de terceiros ou barreiras visuais flutuantes.
2. **Dado** anúncio de guincho para moto, **quando** abre a página de destino, **então** o H1, prova e CTA tratam de moto e região realmente atendida.
3. **Dado** equipamento próprio informado, mas operador, capacidade e disponibilidade não validados, **quando** o site é gerado para produção, **então** `/servicos-com-empilhadeira/` e seus metadados só são publicados após aprovar o escopo factual; a rota de transporte tem status independente.
4. **Dado** visitante aciona WhatsApp ou discador, **quando** clica no CTA, **então** o link funciona sem atraso e o evento de conversão é enviado ao dataLayer para otimização de campanha no Google Ads.
5. **Dado** fotografia sem autorização ou descrição correta, **quando** ocorre a curadoria, **então** ela fica fora da seleção publicável.
6. **Dado** visitante em 360 px sem JavaScript, **quando** abre a home, **então** encontra o primeiro slide de guincho e consegue acionar WhatsApp ou ligação sem interagir com o controle de slides.
7. **Dado** condição de pagamento ou setor/trecho local ainda sem confirmação, **quando** o build de produção é executado, **então** a alegação e a rota correspondente não são publicadas nem usadas como destino de anúncio.
8. **Dado** cidade apenas parcialmente coberta pelo raio, **quando** há uma página local, **então** copy e anúncio descrevem o setor/trecho comprovado e pedem consulta do endereço, sem prometer o município inteiro.

## Requisitos não funcionais

| ID | Requisito | Aceite |
| --- | --- | --- |
| RNF01 | Mobile-first e acessibilidade | Verificações em 360, 390, 768, 1280 px; sem overflow; toque ≥44×44 px; teclado, foco, contraste, zoom e redução de movimento. |
| RNF02 | Performance mobile | Medir Lighthouse e CWV em mobile; registrar baseline e resultado após ajustes. Alvos de campo: LCP ≤2,5 s, INP ≤200 ms, CLS ≤0,1 quando houver dados de campo; não declarar cumprimento só por build. |
| RNF03 | Resiliência | Conteúdo e links essenciais renderizados em HTML e utilizáveis com JS bloqueado/conexão limitada. |
| RNF04 | Privacidade e transparência | Política de privacidade publicada e acessível com controlador e canal de contato; medição técnica sem PII em eventos/URLs; links essenciais utilizáveis sem JS. |
| RNF05 | SEO técnico | Canonical, OG, JSON-LD válido, `lang=pt-BR`, `robots.txt`, `sitemap.xml`, `llms.txt`; apenas fatos e URLs aprovados. |
| RNF06 | Segurança | Dependências mínimas, sem segredos no cliente/repo, HTTPS, links externos seguros, atualização de dependências antes de deploy. |

## Não objetivos

O site não despacha guinchos automaticamente, calcula frete, promete chegada, acompanha veículo, armazena leads ou substitui atendimento humano.

## Preview e produção

Preview com `[PREENCHER]` é **local ou protegido por controle de acesso**; também recebe `noindex` e fica fora do sitemap. `noindex` sozinho não protege dados. O build de produção deve falhar se encontrar `[PREENCHER]` em conteúdo exposto, rota de serviço pendente, número não confirmado ou dado obrigatório da política ausente. Preview nunca recebe dados pessoais de atendimento ou endereço exato na interface.

Fotos autorizadas do acervo podem ser avaliadas no preview local/protegido após revisão visual. O slide de empilhadeira pode destacar o transporte confirmado, mas a foto de transporte não prova movimentação de cargas. Detalhes de operação não aprovados continuam fora de metadado, schema e anúncio.

## Gate editorial para produção

Resolver os pontos restantes de `docs/00-contexto-fontes.md` na medida necessária às páginas publicadas. Para o lançamento atual, continuam pendentes o teste do telefone/WhatsApp em aparelho, a precisão de setores/trechos e o inventário completo das URLs antigas. D01/D05/D07 foram resolvidas pela decisão de 01/10; o domínio canônico e os dados legais estão definidos. Cada URL usada no Google Ads depende também de D09/D10 e de teste da página final, embora anúncios e medição não bloqueiem o site institucional sem scripts. Protótipo pode prosseguir com `[PREENCHER]` e dados ainda pendentes ocultos em produção.
