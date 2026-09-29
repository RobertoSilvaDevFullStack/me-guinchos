# 03 — Conteúdo, SEO local e migração

## Arquitetura de URL proposta

| Rota | Intenção | Estado |
| --- | --- | --- |
| `/` | Marca + guincho para veículos leves na região confirmada | MVP |
| `/guincho-para-carros/` | Pane/reboque de carro | Criar se serviço confirmado e conteúdo específico |
| `/guincho-para-motos/` | Reboque de moto | Criar se serviço confirmado |
| `/guincho-para-vans/` | Van/utilitário; informar limites | Criar se capacidade confirmada |
| `/transporte-de-empilhadeiras/` | Carregamento e transporte de empilhadeiras | Oferta relatada pelo usuário em 28/09; publicar após validação do escopo e dos limites operacionais |
| `/servicos-com-empilhadeira/` | Movimentação de cargas com empilhadeira própria no local | Posse do equipamento relatada em 28/09; publicar após validação da operação, do operador e dos limites |
| `/areas-de-atendimento/` | Setores, bairros e trechos efetivamente atendidos | Raio aproximado e locais candidatos informados; delimitação publicável ainda depende de D03 |
| `/sobre/` | Equipe e operação com provas aprovadas | Opcional MVP |
| `/politica-de-privacidade/` | Transparência sobre dados e contato | Obrigatória antes do lançamento |

Páginas por cidade/rodovia só serão criadas se houver cobertura comprovada e conteúdo útil específico. Evitar páginas quase idênticas feitas para capturar variações de busca, conforme a [política antispam do Google](https://developers.google.com/search/docs/essentials/spam-policies). O backlog abaixo é de **pesquisa e produção condicionada**, não uma promessa de cobertura integral nem um compromisso de criar todas as combinações.

## Backlog de páginas locais para campanhas

Em 28/09/2026, o usuário indicou **um raio operacional aproximado de 20 km a partir da base na Vila Anastácia** e enviou um mapa ilustrativo. O raio serve para triagem de chamados; não é uma fronteira de atendimento garantido. Uma cidade pode estar parcialmente dentro do círculo sem que todos os seus bairros estejam atendidos, e um endereço dentro do círculo ainda depende do serviço, do acesso e da disponibilidade. Antes de anunciar ou publicar uma localidade, registrar em D03 os bairros/setores ou endereços de referência aceitos pela operação, a restrição de serviço e quem confirmou. Não exibir o endereço residencial completo da base.

| Área citada pelo usuário | Granularidade a validar para copy, segmentação e URL | Estado editorial |
| --- | --- | --- |
| Barueri e Osasco | Bairros/setores e acessos aceitos; não prometer os municípios inteiros. | Candidatas declaradas dentro da cobertura aproximada; limite operacional por chamado pendente. |
| São Paulo | Setores da capital dentro do raio, incluindo a região da base; separar dos bairros afastados. | Cobertura parcial declarada; não usar “toda São Paulo”. |
| Perus | Bairro de São Paulo citado especificamente; confirmar endereços e acessos aceitos. | Faixa candidata citada pelo usuário; delimitação pendente. |
| Polvilho | Local citado como “Polvilhos”; confirmar denominação, bairros e endereços aceitos. | Faixa candidata citada pelo usuário; delimitação pendente. |
| Caieiras, Taboão da Serra e Embu das Artes | Setores dentro do alcance efetivo, rotas de deslocamento e serviços disponíveis. | Candidatas declaradas; não equivalem à cobertura integral de cada município. |
| São Caetano do Sul | Apenas o “comecinho” mencionado pelo usuário; delimitar bairro/trecho antes de escrever qualquer promessa. | Faixa limítrofe candidata; sem página local até confirmação precisa. |

**Rodovias:** o mapa e a menção a vias que circulam pela região autorizam uma **investigação de trechos**, não anúncios dizendo que a ME atende uma rodovia inteira. Levantar com a operação quais segmentos, sentidos, acessos e condições de parada/remoção são atendidos. Rodoanel, Castello Branco, Anhanguera e Bandeirantes podem entrar nessa verificação por proximidade aparente; nenhuma dessas vias ganha URL, anúncio ou link no rodapé até que seus trechos sejam aprovados. Não importar Guarulhos, Itaquaquecetuba, Mogi das Cruzes, Presidente Dutra ou outras localidades/vias da [home da JHC](https://jhcguinchopesado.com.br/) para o mapa da ME.

### Prontidão independente de serviço e área

| Frente | Evidência recebida | Gate da oferta | Gate da área antes de campanha |
| --- | --- | --- | --- |
| Guincho para carros e motos | Serviços mencionados no briefing e reforçados pelo usuário. | Confirmar operação, limites e provas/copy para a página específica. | Confirmar bairro/setor ou trecho realmente aceito; raio aproximado isolado não basta. |
| Guincho para vans/utilitários | Serviço previsto na spec. | Confirmar porte/capacidade e eventual restrição antes de anúncio. | Mesmo gate geográfico, com possíveis restrições adicionais para o veículo. |
| Carregamento e transporte de empilhadeiras | Usuário relatou a oferta em 28/09. | Confirmar método de carregamento, veículo, dimensões/peso admitidos, operador e disponibilidade; foto de transporte prova apenas transporte. | Validar origem, destino e rota de cada atendimento; não presumir que toda a operação segue o mesmo raio do guincho. |
| Movimentação de cargas com empilhadeira própria | Usuário declarou possuir empilhadeira para executar o serviço em 28/09. | Confirmar equipamento em operação, operador, tipos/limites de carga e condições do local; página e anúncio são independentes da oferta de transporte. | Validar local de execução e acesso do equipamento, mesmo que o endereço esteja no raio aproximado. |

**Ordem de produção:** (1) páginas de serviço com oferta e limites aprovados; (2) `/areas-de-atendimento/` com setores/trechos aprovados e ressalva de consulta por chamado; (3) uma página por local confirmado que tenha demanda de campanha e informação própria; (4) combinações serviço × local somente quando a intenção do anúncio exigir página distinta e a ME puder comprová-la. Usar rotas próprias, por exemplo `/atendimento/{local-confirmado}/` para local com vários serviços e `/guincho-para-carros-em-{local-confirmado}/` para combinação específica. Para rodovia, o slug deve refletir via **e trecho** aprovado. Os padrões são rascunhos: definir URLs finais após D03/D06 e inventário de migração, sem copiar caminhos da JHC.

| Oportunidade candidata | Destino inicial após aprovação | Condição para destino local próprio |
| --- | --- | --- |
| Carro ou moto × setores confirmados de São Paulo, Osasco ou Barueri | Página geral do serviço, se ela declarar com precisão a área aprovada e corresponder ao anúncio. | Diferenciação útil de acesso, limites ou dúvidas daquele local, com URL canônica e revisão editorial. |
| Carro ou moto × setores confirmados de Caieiras, Perus, Polvilho, Taboão da Serra, Embu das Artes ou São Caetano do Sul | Página geral do serviço ou `/areas-de-atendimento/`, apenas se o setor exato estiver aprovado e explícito no destino. | Evidência de atendimento e copy específica; nenhuma página que sugira cidade inteira a partir do raio. |
| Serviço aprovado × trecho rodoviário aprovado | Página de serviço ou área que identifique o trecho, sentido/acesso e restrições reais. | Demanda e informação própria sobre aquele trecho; nunca URL de rodovia inteira sem cobertura integral comprovada. |
| Transporte de empilhadeira × local aprovado | `/transporte-de-empilhadeiras/`, após gate próprio da oferta e da rota. | Origem/destino, método, limites e prova relevantes à intenção local. |
| Movimentação com empilhadeira × local aprovado | `/servicos-com-empilhadeira/`, após gate próprio da operação e do local. | Tipo de carga, acesso e condições específicas daquela área, sem usar foto de transporte como prova. |

As linhas organizam **investigação**, não orçamento, prontidão publicitária ou confirmação de cada bairro/rodovia. Não gerar o produto cartesiano de todos os serviços e locais. Se várias buscas forem atendidas honestamente por uma página de serviço ou área, usar essa página e manter uma única URL canônica. Antes das aprovações, não há destino local publicável nem anúncio geográfico correspondente.

### Matriz anúncio → rota → H1 → CTA

| Intenção do grupo de anúncios (exemplo de pesquisa) | Rota candidata | H1 de rascunho, sujeito à aprovação | CTA no primeiro bloco |
| --- | --- | --- | --- |
| Guincho para carro na área confirmada | `/guincho-para-carros/` | `Guincho para carros em [PREENCHER: ÁREA]` | `Chamar no WhatsApp` e `Ligar agora` |
| Guincho para moto na área confirmada | `/guincho-para-motos/` | `Guincho para motos em [PREENCHER: ÁREA]` | `Chamar no WhatsApp` e `Ligar agora` |
| Guincho para van/utilitário na área confirmada | `/guincho-para-vans/` | `Guincho para vans e utilitários em [PREENCHER: ÁREA]` | `Consultar atendimento` e `Ligar agora` |
| Guincho para carro em setor aprovado de Osasco ou Barueri | `/guincho-para-carros-em-{local-confirmado}/`, **somente se justificar página própria**; caso contrário, `/guincho-para-carros/` | `Guincho para carros em [PREENCHER: SETOR APROVADO]` | `Consultar atendimento pelo WhatsApp` e `Ligar agora` |
| Guincho para carro ou moto em setor aprovado de São Paulo, Perus, Caieiras, Polvilho, Taboão da Serra, Embu das Artes ou São Caetano do Sul | Página do serviço ou `/atendimento/{local-confirmado}/`, **somente com setor validado** | `Guincho em [PREENCHER: BAIRRO OU SETOR APROVADO]` | `Consultar atendimento pelo WhatsApp` e `Ligar agora` |
| Guincho em trecho de rodovia aprovado | `/atendimento/{via-e-trecho-confirmados}/`, **somente se justificar página própria** | `Guincho em [PREENCHER: VIA, TRECHO E SENTIDO APROVADOS]` | `Consultar atendimento pelo WhatsApp` e `Ligar agora` |
| Transporte de empilhadeira na área aprovada | `/transporte-de-empilhadeiras/` | `Transporte de empilhadeiras em [PREENCHER: ÁREA]` | `Solicitar orçamento`, apenas quando ativo |
| Operação com empilhadeira própria na área aprovada | `/servicos-com-empilhadeira/` | `Serviços com empilhadeira em [PREENCHER: ÁREA]` | `Solicitar orçamento`, apenas quando equipamento e operação estiverem ativos |

A promessa do anúncio, o H1, o serviço descrito, a área/trecho e o destino do contato devem coincidir. Nome de município pode identificar a busca, mas a copy deve explicitar a cobertura parcial quando for o caso. A segmentação geográfica da campanha precisa seguir os endereços realmente aceitos pela operação; o círculo ilustrativo de 20 km não valida automaticamente cada busca dentro dele. O CTA é um link HTML direto para WhatsApp ou telefone confirmado, disponível sem JavaScript ou consentimento. A mensagem predefinida pode identificar a **categoria de serviço**, mas não deve conter dado pessoal do visitante nem afirmar disponibilidade. UTMs não incluem localização precisa do incidente.

### Critérios para uma página local existir e ser publicada

1. **Operação:** o usuário confirmou em 28/09 o telefone, o raio aproximado, as duas linhas de empilhadeira e o atendimento **todos os dias, das 7h às 22h, para todos os serviços**. D01/D03/D05 ainda exigem validar limites, equipamento/operador, capacidade e setores ou trechos exatos aplicáveis a cada página. D06 fixa domínio e URL canônica. Registrar quem confirmou, quando e a precisão autorizada da alegação.
2. **Valor próprio:** explicar quais serviços atendem naquele local, limites reais, como informar origem/destino ao atendimento e dúvidas específicas verificadas. Usar foto/registro próprio do contexto apenas com D07 e descrição correta. Não inventar casos atendidos, tempo de chegada, preço ou permissão rodoviária.
3. **Revisão editorial:** uma pessoa deve conseguir apontar o que a página responde de forma diferente da página geral. Trocar só o nome da cidade ou rodovia no mesmo texto não basta. Se não houver diferença útil, manter a página geral e o link para `/areas-de-atendimento/`.
4. **SEO e Ads:** página aprovada retorna 200, tem title, descrição, H1, canonical e links internos próprios; anúncio aponta exatamente para a oferta e local aprovados. Incluir no sitemap apenas quando indexável. Rascunhos ficam em preview local/protegido e fora de sitemap/anúncios; páginas sem oferta aprovada não são publicadas.
5. **Manutenção:** atribuir responsável para rever cobertura e copy quando operação mudar. Retirar anúncio e página ou ajustar conteúdo/redirect se o atendimento deixar de existir. Medir contato qualificado com o atendimento humano, sem tomar clique como venda.

## Matriz de mensagem

| Serviço | H1 de preview | Prova necessária | CTA |
| --- | --- | --- | --- |
| Carros | `Guincho para carros em [PREENCHER: REGIÃO]` | Foto real de carro atendido; abrangência validada | Chamar no WhatsApp / Ligar agora |
| Motos | `Guincho para motos em [PREENCHER: REGIÃO]` | Foto e capacidade de transporte de moto | Chamar no WhatsApp / Ligar agora |
| Vans/utilitários | `Guincho para vans e utilitários em [PREENCHER: REGIÃO]` | Foto e limites de porte | Consultar atendimento |
| Transporte de empilhadeiras | `Transporte de empilhadeiras em [PREENCHER: REGIÃO]` | Foto de carga e capacidade confirmadas | Solicitar orçamento, quando ativo |
| Serviço com empilhadeira | `Serviços com empilhadeira em [PREENCHER: REGIÃO]` | Foto da operação própria, equipamento, operador e capacidade confirmados | Solicitar orçamento, quando ativo |

Exemplo de apoio: “Seu veículo parou? Informe onde ele está e qual é o modelo para consultar o atendimento.” O horário confirmado pode aparecer como **“Atendimento todos os dias, das 7h às 22h”**, inclusive nas páginas de empilhadeira. Não escrever “24 horas”, “chegamos em X minutos”, “menor preço”, cobertura rodoviária integral ou capacidade sem confirmação. O usuário confirmou **Pix, cartões e dinheiro**; confirmou também as bandeiras mostradas na arte de referência. Antes de exibir logotipos individuais, identificar cada bandeira na imagem e usar arquivos com direito de uso próprio. A estrutura da seção da JHC pode orientar a apresentação, com imagem, identidade e texto próprios da ME. Não inferir parcelamento, condições ou modalidades de cartão não informadas.

## Requisitos de descoberta

- Cada rota indexável: `title` e descrição próprios, canonical absoluta, um H1, Open Graph/Twitter com imagem aprovada, `lang="pt-BR"` e conteúdo em HTML legível sem JavaScript.
- Raiz pública: `/robots.txt`, `/sitemap.xml` e `/llms.txt`; sitemap apenas com páginas 200 e canônicas; `lastmod` apenas quando real. `robots.txt` deve referenciar o sitemap.
- JSON-LD `LocalBusiness`/`Organization` e `Service` somente com dados confirmados e consistentes com a página. Validar com a [documentação do Google](https://developers.google.com/search/docs/appearance/structured-data/local-business) e teste de resultados avançados.
- Se informar horários em HTML, metadados ou JSON-LD, usar a mesma janela confirmada para todos os serviços: **todos os dias, 7h–22h**. Não publicar variantes “24h” herdadas de referências.
- Nome, telefone e área coerentes com o Perfil da Empresa; se o negócio atende no local do cliente, confirmar a configuração de área de serviço e exibição do endereço conforme [Google Business Profile](https://support.google.com/business/answer/3038177?hl=pt-BR).
- Fotos com nome, tamanho, legenda e alt factuais; não forçar palavras-chave em alt.

## Migração se o domínio atual for mantido

Antes de codificar redirects: obter sitemap e lista de URLs antigas, dados de Search Console se disponíveis, páginas com tráfego/backlinks e equivalente novo. Criar uma tabela `URL antiga → URL nova → justificativa`; testar 301, canonical, ausência de cadeia e sitemap final. Não apagar em massa páginas antigas sem inventário. Se o domínio final mudar, planejar mudança de domínio separadamente.

## Campanhas

Separar grupos de anúncios por serviço e geografia real; a página de destino deve corresponder ao anúncio. Programação e texto de anúncio devem respeitar o atendimento **diário, das 7h às 22h**, sem promessa de disponibilidade fora desse intervalo. UTMs podem identificar campanha, mas não devem conter telefone, placa, localização precisa ou outros dados pessoais. Publicação de anúncios depende das mesmas confirmações de oferta, limites, área e contato que o site.
