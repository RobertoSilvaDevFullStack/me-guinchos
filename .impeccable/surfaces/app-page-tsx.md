---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["app/globals.css","components/HeroSlider.tsx","app/areas-de-atendimento/page.tsx"]
---

## Scope

Home pública da ME Guinchos (`app/page.tsx`, `components/`, `app/globals.css`) e a rota
`/areas-de-atendimento/`, que herda o mesmo sistema. Modo: **Persuade** — o sucesso é o
toque no WhatsApp ou no telefone, não a leitura.

## Audience and job

Motorista com veículo parado em via da zona oeste de São Paulo, em pé, celular na mão,
sob sol ou à noite, com pressa. Job: descobrir em segundos se a ME atende o endereço
dele e falar com uma pessoa. Público secundário sem urgência: responsável por pátio ou
galpão que precisa transportar empilhadeira ou movimentar carga com uma.

Ação: WhatsApp (primária) e ligação (secundária), alcançáveis com o polegar em qualquer
ponto do scroll, em qualquer largura a partir de 360px.

Prova: as sete fotografias reais da frota em `public/images/preview/`. A foto noturna da
empilhadeira na plataforma é a única prova do posicionamento e não pode ser decorativa.

Restrições: nada de "24h" (é 7h–22h, domingo a domingo); nenhum município ou rodovia
prometido integralmente; sem formulário; sem depoimento, nota, contagem de atendimentos
ou tempo de chegada — não existem e não se inventam. Laranja fica fora como cor
dominante (decisão do usuário, 29/09/2026); verde é exclusivo do WhatsApp.

## Direction contract

**THESIS:** O site fala a língua que este visitante já lê da janela do carro todo dia —
a sinalização viária brasileira de serviço auxiliar. Recusa o padrão da categoria (herói
preto com foto sangrada, palavra em laranja, chips de reforço — o JHC) e recusa também o
seu oposto previsível, o painel branco de cartões corporativos azuis, que é exatamente o
que o site é hoje e o que o cliente chamou de seco e cru.

**OWN-WORLD:** A **placa** é a única unidade de construção da página: campo de cor
saturada, tarja branca embutida 6px da borda, canto de raio pequeno, legenda em caixa
alta com tracking largo. Aplicada a herói, pórtico de navegação, serviços, legendas de
foto, pagamento e botões — com todo o conteúdo removido, o sistema ainda se reconhece.
Azul de chapa esmaltada `#0B4FA0` é a cor comprometida e ocupa campos inteiros
(cabeçalho, herói, pórtico, véus das faixas, CTA final, rodapé), não respingos sobre
fundo neutro. Concreto `#EDEFF1` é o chão de leitura; âmbar `#F2B01E` é atenção
reservada e nunca decoração; verde só WhatsApp. Um único alfabeto, Overpass
(auto-hospedado, linhagem Highway Gothic), diferenciado só por corpo, peso e caixa —
como um sistema de sinalização real. Pictogramas autorais em SVG, formas cheias e
grossas no idioma viário; zero glifo Unicode fazendo papel de ícone.

**STORY:** O visitante entende em um olhar que isto é socorro na via, na zona oeste de
SP, com guincho plataforma; acredita porque vê o caminhão dele e a empilhadeira dele
fazendo o serviço, não ilustração; e toca no WhatsApp já sabendo o que dizer, porque a
página pediu veículo, local e destino antes de ele perguntar.

**FIRST VIEWPORT:** Em 390px: cabeçalho azul de 64px com a marca à esquerda e a placa
verde de WhatsApp à direita. Abaixo, a placa-mãe azul ocupando a largura: manchete
"Guincho para carros e motos" em Overpass 800, duas linhas, branco sobre azul; uma linha
de legenda; duas placas de ação empilhadas com 56px de altura — WhatsApp em verde,
Ligar em placa branca de legenda azul; e, separada por uma tarja, a faixa suplementar
com horário e raio em numeral tabular. Imediatamente sob a placa, a foto real em faixa
sangrada de ~200px com a legenda numa plaqueta branca sobreposta ao canto inferior
esquerdo. A ação primária fica acima da dobra sem rolagem; a prova fotográfica também.
Em 768px+ a placa-mãe ocupa a coluna esquerda e a foto vira faixa de altura inteira à
direita.

**FORM:** Serviço Auxiliar — sinalização viária brasileira (CET/DER). Candidato 1 da
minha lista ordenada por ressonância, escolhido pelo usuário sobre a carta sorteada
(índice 7, "Plantão na Via"). Seed key **560273ff**, rodada persuade, execução
code-led. Elevações herdadas das cartas recusadas, cada uma já escrita no sistema: uma
escala única de proeminência em três planos (cracktro); os cinco serviços como unidade
idêntica repetida lida por varredura (ponte de VU); o contato como sequência linear de
três passos com uma ação padrão visível em todos (instalador shareware); o vazio medido,
com mais ar acima de um título do que abaixo (ikebana). Interação assinatura:
**retrorreflexão** — a placa não faz nada até a luz bater; ao entrar no viewport, ao
foco e ao toque, a tarja acende e um brilho diagonal varre o campo uma vez. Movimento
único e orquestrado, desligado em `prefers-reduced-motion`. Alavanca web da forma: a
faixa fotográfica travada (`clip-path: inset(0)` com imagem `position: fixed` interna,
técnica que funciona no iOS Safari, onde `background-attachment: fixed` falha) — o
pedido explícito do cliente, construído como sistema e não como enfeite de uma seção.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish
review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Open decisions

- D01–D10 em `docs/00-contexto-fontes.md` seguem abertas; nada delas vira afirmação.
- Direitos comerciais das fotos (D07) pendentes: a prévia continua `noindex` e o build de
  produção continua bloqueado.
- O logo é estudo de marca; as cores vivem em tokens para que a decisão seja reversível.
