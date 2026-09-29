# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Motorista ou responsável por um veículo parado — pane, colisão, bateria, veículo sem
documentação para rodar — em rua ou via urbana da zona oeste de São Paulo e municípios
vizinhos. Está de pé na calçada, com o celular na mão, sob pressão de tempo e muitas
vezes com bateria e sinal ruins. Quer saber em segundos se a ME atende o endereço dele
e falar com uma pessoa.

Segundo público, sem urgência: responsável por pátio, oficina, galpão ou obra que
precisa carregar/transportar uma empilhadeira, ou movimentar carga com empilhadeira no
local. Esse compara fornecedores e checa se a empresa tem o equipamento de fato.

## Product Purpose

Converter o clique (orgânico ou de anúncio) em uma conversa por WhatsApp ou ligação.
Não há formulário, carrinho nem orçamento automático: o sucesso é o toque no botão de
contato. A métrica é contato qualificado — a pessoa já disse veículo/carga, local e
destino na primeira mensagem.

## Positioning

Guincho plataforma para veículos leves **com empilhadeira própria**. A combinação é o
que um concorrente de guincho comum não pode copiar de véspera: além de rebocar o
veículo, a ME carrega e transporta a própria empilhadeira e usa o equipamento para
movimentar carga no local. O site do Manoel é o único da vizinhança competitiva que
pode mostrar foto real da empilhadeira na plataforma.

## Operating Context

- Base operacional na Vila Anastácia, zona oeste de São Paulo. **O endereço exato não
  é publicável automaticamente** (dado de planejamento).
- Referência de cobertura: raio aproximado de 20 km. Localidades citadas no mapa:
  Barueri, Osasco, setores de São Paulo incluindo Perus, Caieiras, região de Polvilho,
  setores de São Caetano do Sul, Taboão da Serra, Embu das Artes. Nenhum município ou
  rodovia é prometido integralmente.
- Atendimento de domingo a domingo, das 7h às 22h, mesmo horário para todos os
  serviços. **Nunca escrever "24h"** — o site antigo diz 24h e isso é dado histórico,
  não verdade atual.
- Consumo majoritariamente em celular, em pé, em movimento, com uma mão.

## Capabilities and Constraints

Serviços confirmados: guincho para carros; guincho para motos; guincho para vans e
utilitários; carregamento e transporte de empilhadeiras; movimentação de cargas com
empilhadeira própria.

Pagamento confirmado: Pix, cartões de crédito e débito, dinheiro.

Contato confirmado: `+55 11 95199-8799` (WhatsApp e ligação). Teste em aparelho real
ainda pendente.

Dados legais confirmados em 29/09/2026, do Comprovante de Inscrição e Situação
Cadastral do CNPJ: razão social **59.703.468 LUIS CARLOS MORETTI DO NASCIMENTO**,
CNPJ **59.703.468/0001-95**, atividade principal "Serviços de reboque de veículos",
endereço **Rua Martinho de Campos, 538, Vila Anastácio, São Paulo/SP, CEP 05093-050**
(agora publicável), e-mail **MORETTI95@GMAIL.COM** como canal de privacidade. "ME
Guinchos" permanece como nome comercial na interface; a razão social só aparece onde há
identificação jurídica. Isso resolve a parte legal da D08. Atenção: o CEP oficial é
`05093-050`, e não `05093-040` como consta em `docs/00-contexto-fontes.md`.

Pendências que o design não pode resolver por conta própria (D01–D10 em
`docs/00-contexto-fontes.md`): capacidade, operador e limites da empilhadeira; pesos e
restrições por tipo de veículo; setores exatos e trechos de rodovia; domínio final;
contas de Ads/Analytics. Enquanto abertas, o build de produção fica bloqueado e nada
disso vira afirmação em página, metadado ou anúncio — usar `[PREENCHER]`.

Stack existente: Next.js App Router + TypeScript + CSS próprio em `app/globals.css`
(não é Tailwind utilitário, apesar do `@import "tailwindcss"`). Sem banco, sem API.

## Brand Commitments

- Nome: **ME Guinchos**.
- Logo `public/images/preview/logo-me-guinchos-sem-fundo.png` (caminhão + empilhadeira,
  letras ME em laranja): **é estudo de marca, não marca aprovada**. Decisão do usuário
  em 29/09/2026 — a identidade se apoia em azul e grafite; laranja só como sinalização
  operacional discreta, nunca como cor dominante. Cores em tokens centralizados para
  que a decisão seja reversível sem refazer o site.
- Verde é reservado à ação de WhatsApp. Não usar verde decorativo.
- O JHC Guincho Pesado é **anti-referência estética** (preto quase puro + laranja). Sua
  organização de jornada pode inspirar; sua aparência, textos, imagens e escopo pesado,
  não. Verificado em 29/09/2026.
- O site antigo `meguinchos.com.br` é inventário histórico, não aprovação: painel branco
  bootstrap, azul ultramarino genérico, faixa de foto com `background-attachment: fixed`
  sob véu azul, carrossel no topo e fileira de quatro ícones sob o hero. O usuário gosta
  da **faixa fotográfica fixa** e da **fileira de acesso rápido**; nenhuma outra parte é
  compromisso.
- Voz: direta, operacional, sem hipérbole. Nada de "o melhor", "líder", "24h".

## Evidence on Hand

Reais e usáveis em prévia (direitos comerciais ainda pendentes em D07):

- `public/images/preview/guincho-carro-esportivo.jpg` — esportivo laranja em plataforma
  azul, galpão de tijolo ao fundo, luz de meio-dia.
- `public/images/preview/galeria-empilhadeira-noturna.jpg` — empilhadeira amarela
  amarrada na plataforma, cena noturna. É a foto que prova o posicionamento.
- `galeria-carro-branco.jpg`, `galeria-caminhonete.jpg`, `galeria-van.jpg`,
  `galeria-motos.jpg`, `transporte-empilhadeira.jpg`.
- `pix-pagamento.webp`, `cartoes-pagamento.webp`.
- Acervo bruto de 56 imagens em `assets/referencia-site-atual/` com manifesto e hashes.

Não existem e não devem ser inventados: depoimentos, avaliações, número de atendimentos,
tempo médio de chegada, preços, certificações, clientes, prova de operação com
empilhadeira no local.

## Product Principles

1. **O contato nunca some.** WhatsApp e ligação alcançáveis com o polegar em qualquer
   ponto do scroll, em qualquer largura.
2. **A foto é a prova.** A frota real da ME carrega a credibilidade; ilustração,
   ícone genérico e foto de banco enfraquecem o argumento.
3. **Cobertura se consulta, não se promete.** Toda menção a região vem com convite a
   confirmar o endereço.
4. **O que não foi aprovado não aparece como afirmação.** Pendência vira consulta no
   atendimento ou `[PREENCHER]`, nunca texto confiante.
5. **Mobile é o critério de aceite**, não um ajuste posterior: 360px é a largura base.

## Accessibility & Inclusion

Alvo de toque mínimo 44×44px. Foco de teclado visível. Contraste AA em texto e em
controles. `prefers-reduced-motion` respeitado — sem avanço automático de slide para
quem pede movimento reduzido. Uso realista com sol na tela, uma mão e conexão móvel:
contraste e peso de página são requisito funcional, não refinamento.
