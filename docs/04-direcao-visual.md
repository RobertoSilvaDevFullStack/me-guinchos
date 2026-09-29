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
4. **Prova visual:** 4–8 imagens curadas com legendas factuais e alt; selecionar operações correspondentes às ofertas do MVP.
5. **Cobertura e dúvidas:** raio aproximado de 20 km, 7h–22h todos os dias para todos os serviços e página agregadora de regiões para consulta. Nenhum município ou rodovia é prometido integralmente. Páginas de destino por localidade/rodovia só recebem link público após validação de cobertura e conteúdo próprio.
6. **Pagamento:** Pix, cartões e dinheiro confirmados, em composição HTML/CSS própria; condições não informadas são consultadas no atendimento.
7. **Contato final:** repetir WhatsApp e ligação, sem exigir formulário.

Na prévia local, o segundo slide apresenta carregamento e transporte de empilhadeiras. O card de movimentação com empilhadeira própria é separado e textual: a foto `23_023.jpg` mostra só transporte. Equipamento próprio e horário foram confirmados pelo usuário; capacidade, operador, limites e prova visual da operação seguem sem validação.

## Slides do hero na prévia

- Primeiro estado: guincho com o carro esportivo laranja de `01_001.jpg`. A cópia de 600×400 px mostra parte do caminhão e requer arquivo original para uso em destaque público.
- Segundo estado: **carregamento e transporte de empilhadeiras**, com `23_023.jpg`; a imagem mostra transporte em plataforma, não operação com empilhadeira no local.
- O controle é manual, acessível por toque e teclado, sem avanço automático. O primeiro estado e os CTAs ficam visíveis mesmo sem JavaScript. A troca de foto não muda o H1 principal nem altera os contatos persistentes. O segundo slide inclui um link HTML contextual para consulta de transporte.
- As cópias em `public/images/preview/` pertencem apenas ao preview local/protegido. D07 continua exigindo confirmação de direitos comerciais, serviço e identificadores, além dos arquivos originais adequados antes da publicação.

## Terceira fatia da prévia — 28/09/2026

- A direção segue **industrial e utilitária**, com azul de plataforma, grafite da via e verde reservado ao contato por WhatsApp. O diferencial visual permanece nas fotografias documentais do acervo ME; os métodos de pagamento são apresentados em elementos próprios sem reaproveitar arte da JHC.
- A home acrescenta a galeria de seis imagens candidatas. Todas foram verificadas visualmente e têm origem, alt e status D07 registrados no [manifesto de prévia](../public/images/preview/README.md). O conjunto inclui um carro esportivo, carro branco, caminhonete, van, motos com carro e uma empilhadeira transportada. A foto da empilhadeira não é apresentada como prova de operação com equipamento próprio.
- A marca `logo-me-guinchos.png` adicionada pelo usuário foi inspecionada. Por conter texto de oferta e composição ilustrada ainda não aprovada, foi mantida como estudo de marca no acervo, sem substituir o cabeçalho da prévia.
- A rota `/areas-de-atendimento/` é uma página agregadora de consulta, com `noindex`; seus nomes de localidades vêm do mapa indicado pelo usuário e não são tratados como cobertura integral ou páginas de anúncio. Os trechos rodoviários permanecem sem nomeação pública até validação operacional.
- A interface escreve “região de Polvilho” conforme o rótulo visto no mapa. Confirmar a denominação administrativa e os limites desta área antes de criar URL local ou anúncio.

## Comportamento responsivo

| Largura | Critério de layout |
| --- | --- |
| 360 px | Base de estilos; H1 e CTAs compreensíveis no primeiro viewport; barra fixa com 2 ações, sem cobrir conteúdo, com `safe-area-inset-bottom`. |
| 390 px | Mesmo fluxo sem quebras artificiais ou overflow. |
| 768 px | Duas colunas apenas onde foto e leitura melhorarem; CTAs mantidos visíveis. |
| 1280 px | Container com largura máxima aproximada de 1200 px; hero texto + foto; navegação curta. |

Todos os alvos de toque têm pelo menos 44×44 px; foco de teclado é visível; contraste, zoom, orientação e redução de movimento são respeitados. Imagens têm dimensões reservadas para evitar deslocamento. Testar com conteúdo real, inclusive nomes longos de cidades e botões.

## Seleção e preparação de fotos

Foram coletadas 56 imagens da galeria em `assets/referencia-site-atual/`, com manifesto, hashes e [curadoria preliminar](../assets/referencia-site-atual/curadoria-preliminar.md). Solicitar arquivos originais e logo; confirmar autorização comercial com Manoel. Escolher hero com guincho ME e carro/moto claramente visíveis; verificar enquadramento mobile antes de cortar. Registrar veículo, local aproximado publicável, autoria e autorização. Remover placas, rostos ou outros identificadores quando necessário. Exportar variantes responsivas em formatos modernos após inspeção visual. As cópias coletadas são material de referência até essa curadoria.
