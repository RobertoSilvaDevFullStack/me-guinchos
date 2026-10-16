# 04 — Direção visual e UX

## Conceito: Resgate em foco

Uma interface clara e operacional, com o **veículo e a frota reais** no centro. O acervo da [ME Guinchos](https://meguinchos.com.br/fotos/20) sugere azul de plataforma/caminhão, branco da frota e grafite da via. A paleta final deve ser amostrada dos arquivos originais aprovados, não copiada da JHC. Verde fica reservado à ação do WhatsApp. Esta direção é hipótese visual para o protótipo, sujeita à revisão com as fotos e a marca do cliente.

### Sistema visual proposto

- Fundo branco ou claro; títulos grafite; azul operacional para estrutura, destaques e ligação; verde semântico apenas no botão WhatsApp.
- Títulos de leitura rápida com família condensada como Barlow Condensed; corpo com sans de alta legibilidade como Source Sans 3. Validar licença, pesos, arquivos locais e medidas antes de adotar.
- Fotografia documental com cor natural; nada de mockup genérico, imagem de banco fingindo atendimento, avanço automático de slides ou filtro que prejudique identificação.
- Componentes: header compacto, hero com seleção manual de fotos por serviço e dois CTAs permanentes, prova operacional, cartões de serviço, passos de contato, galeria curta, cobertura, pagamentos confirmados, FAQ e rodapé.

## Hierarquia da home

1. **Primeira tela:** marca, H1 de guincho + área confirmada, frase objetiva, WhatsApp primário, “Ligar agora” secundário e primeira foto pertinente. A seleção manual da foto não altera nem esconde os dois contatos.
2. **Serviços:** carro, moto, van/utilitário, carregamento/transporte de empilhadeiras e movimentação de cargas com empilhadeira própria, em cartões separados. Cada um com descrição objetiva e contato contextual; limites por chamado continuam para consulta.
3. **Como acionar:** informar local, tipo de veículo e destino no contato; resposta humana avalia disponibilidade.
4. **Prova visual:** as 12 imagens atuais enviadas pelo Manoel, com legendas vinculadas aos envios e alt factual; transporte fotografado não vira promessa automática de capacidade ou disponibilidade.
5. **Cobertura e dúvidas:** raio aproximado de 20 km, atendimento 24 horas todos os dias para todos os serviços (ADR-012) e página agregadora de regiões para consulta. Nenhum município ou rodovia é prometido integralmente. Páginas de destino por localidade/rodovia só recebem link público após validação de cobertura e conteúdo próprio.
6. **Pagamento:** Pix, cartões e dinheiro confirmados, em composição HTML/CSS própria; condições não informadas são consultadas no atendimento.
7. **Contato final:** repetir WhatsApp e ligação, sem exigir formulário.

Na prévia local, o eixo fotográfico de empilhadeiras apresenta somente carregamento e transporte sobre plataforma. O card de movimentação com empilhadeira própria é separado e textual: nenhuma das fotos novas comprova operação no local. Equipamento próprio e horário foram confirmados pelo usuário; a decisão editorial de 01/10 mantém capacidade, operador e limites gerais fora da copy, com condições consultadas por chamado.

## Slides do hero com o acervo de 01/10

- Primeiro estado: `guincho-tres-veiculos.webp`, com a legenda enviada “Guincho para 3 veículos”. O caminhão-plataforma e os três carros permanecem legíveis no recorte mobile.
- Estados seguintes: carro de luxo, van longa e embarcação. A seleção prioriza variedade de atendimento sem transformar a galeria em promessa de capacidade ou disponibilidade.
- O controle é manual, acessível por toque e teclado, sem avanço automático. O primeiro estado e os CTAs ficam visíveis mesmo sem JavaScript. A troca de foto não muda o H1 principal nem altera os contatos persistentes.
- As 12 fotografias atuais estão em `public/images/operacoes/` com o [manifesto de origem e legendas](../public/images/operacoes/README.md). Foram exportadas sem metadados em WebP e mantêm entre 924 e 1.600 px de largura; a revisão de identificadores visíveis continua necessária.

## Terceira fatia da prévia — 28/09/2026

- A direção segue **industrial e utilitária**, com azul de plataforma, grafite da via e verde reservado ao contato por WhatsApp. O diferencial visual permanece nas fotografias documentais do acervo ME; os métodos de pagamento são apresentados em elementos próprios sem reaproveitar arte da JHC.
- A home acrescenta a galeria de seis imagens do acervo autorizado. Todas foram verificadas visualmente e têm origem e alt registrados no [manifesto](../public/images/preview/README.md). O conjunto inclui um carro esportivo, carro branco, caminhonete, van, motos com carro e uma empilhadeira transportada. A foto da empilhadeira não é apresentada como prova de operação com equipamento próprio.
- A versão sem fundo da marca ME Guinchos está aplicada no cabeçalho e foi aprovada como definitiva em 01/10/2026.
- A rota `/areas-de-atendimento/` é uma página agregadora de consulta, com `noindex`; seus nomes de localidades vêm do mapa indicado pelo usuário e não são tratados como cobertura integral ou páginas de anúncio. Os trechos rodoviários permanecem sem nomeação pública até validação operacional.
- A interface escreve “região de Polvilho” conforme o rótulo visto no mapa. Confirmar a denominação administrativa e os limites desta área antes de criar URL local ou anúncio.

## Atualização fotográfica de 02/10/2026

- As seis fotos antigas da galeria e os recortes antigos do hero foram substituídos pelas 12 fotografias recentes enviadas pelo Manoel na noite anterior.
- As legendas aparecem na ordem e com o sentido dos envios. A única normalização editorial é ortográfica; o manifesto preserva as formas originais.
- A foto de duas empilhadeiras compõe o eixo de transporte. O número “7 toneladas” aparece apenas na legenda do registro correspondente e não é usado em cards, metadata ou promessa geral de capacidade.
- A imagem social agora tem 1200×630 px e deriva do registro de caminhão pesado, evitando o limite anterior de 600×400 px.

## Comportamento responsivo

| Largura | Critério de layout |
| --- | --- |
| 360 px | Base de estilos; H1 e CTAs compreensíveis no primeiro viewport; barra fixa com 2 ações, sem cobrir conteúdo, com `safe-area-inset-bottom`. |
| 390 px | Mesmo fluxo sem quebras artificiais ou overflow. |
| 768 px | Duas colunas apenas onde foto e leitura melhorarem; CTAs mantidos visíveis. |
| 1280 px | Container com largura máxima aproximada de 1200 px; hero texto + foto; navegação curta. |

Todos os alvos de toque têm pelo menos 44×44 px; foco de teclado é visível; contraste, zoom, orientação e redução de movimento são respeitados. Imagens têm dimensões reservadas para evitar deslocamento. Testar com conteúdo real, inclusive nomes longos de cidades e botões.

## Seleção e preparação de fotos

O acervo anterior de 56 imagens permanece em `assets/referencia-site-atual/` como histórico, mas não alimenta mais a fotografia operacional da home. A seleção vigente são os 12 arquivos enviados em 01/10 e registrados no [manifesto de operações](../public/images/operacoes/README.md). Verificar o enquadramento em 360/390/768/1280 px e revisar placas, rostos, marcas ou outros identificadores antes de liberar publicação.
