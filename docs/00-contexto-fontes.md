# 00 — Contexto, evidências e decisões pendentes

**Data da pesquisa:** 26/09/2026. **Tipo de projeto:** site de serviço local, orientado a contato imediato após clique em anúncio. **Trilha:** conversão.

## O que veio do briefing

- O projeto é para Manoel/ME Guinchos, indicado ao usuário por um contato da equipe JHC.
- Prioridade do novo site: guincho para **carros, motos, vans e utilitários**, com experiência rápida e totalmente responsiva.
- Conversão desejada: contato direto por **WhatsApp ou ligação**, especialmente em situações de pane na rua ou rodovia.
- O novo site deve contemplar **transporte de empilhadeiras** e **operação com empilhadeira no local** como ofertas distintas. A aquisição, prontidão e data de início da operação ainda não foram confirmadas.
- Fotos existentes devem orientar uma identidade própria, após validação de direitos e seleção dos arquivos originais.
- O briefing inicial preparou documentação e specs antes do início da implementação.

**Atualização de 27/09/2026:** a implementação da prévia local começou. O usuário gostou da primeira home e pediu que o planejamento incorpore a estrutura de jornada da JHC: slides de serviços no hero, seções de serviço com contatos, formas de pagamento e links para páginas por cidade/rodovia que possam servir de destino a campanhas. Indicou fotos já coletadas, inclusive carro esportivo e empilhadeira, como candidatas à prévia. A JHC continua apenas referência de organização; sua cobertura, modalidades, disponibilidade, textos e identidade não são dados da ME. Ver Spec 001 RF11–RF13 e ADR-003.

**Atualização direta do usuário em 28/09/2026:** confirmou `+55 11 95199-8799` (final 8799); informou atendimento das **7h às 22h**, sem definir dias; indicou no mapa raio aproximado de 20 km com Barueri, Osasco, partes de São Paulo, Caieiras, Perus, Polvilho, começo de São Caetano do Sul, Taboão da Serra e Embu das Artes. Confirmou carregamento/transporte de empilhadeiras e a existência de empilhadeira própria para movimentação de cargas, sem especificar capacidade, operador ou limites. Adicionou ao acervo `Cartoes.webp`, `pix-pagamento.webp` e `logo-me-guinchos.png` e pediu seção de pagamentos e galeria de atendimentos da ME, usando a organização da JHC como referência. O mapa não autoriza prometer municípios/rodovias inteiros; as imagens não comprovam por si só bandeiras aceitas, direitos de uso ou operação retratada.

**Respostas complementares em 28/09/2026:** atendimento de **domingo a domingo, 7h–22h, para todos os serviços**, inclusive empilhadeiras; **Pix, cartões e dinheiro** aceitos. O usuário também respondeu “sim” à pergunta agrupada sobre as bandeiras da arte recebida.

## O que foi observado nos sites públicos

| Fonte | Observação | Como usar |
| --- | --- | --- |
| [ME Guinchos — início](https://meguinchos.com.br/) | Apresenta carros, motos, utilitários, máquinas, empilhadeiras e caminhões; mostra `(011) 93029-9233`, e-mail e afirma atendimento 24h. | Inventário do estado atual. Telefone, disponibilidade e escopo precisam ser revalidados. |
| [ME — transporte de empilhadeiras](https://meguinchos.com.br/transporte-de-empilhadeiras/14) | Anuncia transporte/remoção de empilhadeiras. | Serviço diferente de operar uma empilhadeira no local. |
| [ME — fotos](https://meguinchos.com.br/fotos/20) | Galeria extensa de atendimentos e frota; há material para curadoria visual. | Solicitar arquivos originais, autorização de uso e identificação correta de cada operação. |
| [JHC Guincho Pesado](https://jhcguinchopesado.com.br/) | Primeiro bloco prioriza urgência, região, WhatsApp/ligação e fotos da operação. | Referência de jornada de contato, sem copiar estética, textos, imagens ou escopo pesado. |

## Decisões e validações restantes — ordem de impacto

| ID | Estado e ponto a validar | Impacto |
| --- | --- | --- |
| D01 | **Parcial:** carregamento/transporte e equipamento próprio para movimentação de cargas confirmados pelo usuário. Faltam capacidade, operador, restrições, disponibilidade e prova visual de cada operação. | Separar ofertas, páginas, fotos e anúncios; evitar limites técnicos não aprovados. |
| D02 | **Número confirmado pelo usuário:** `+55 11 95199-8799`. Falta testar WhatsApp, ligação e recebimento em aparelho real. | Links usam o número confirmado; teste operacional ainda bloqueia publicação. |
| D03 | **Raio e localidades indicativos recebidos:** ~20 km da Vila Anastácia; Barueri, Osasco, partes de São Paulo, Caieiras, Perus, Polvilho, começo de São Caetano do Sul, Taboão da Serra e Embu das Artes. Confirmar setores, exceções e trechos/acessos de rodovia por serviço. | Copy, campanhas, SEO local e schema sem prometer cidade/rodovia inteira. |
| D04 | **Confirmado:** domingo a domingo, 7h–22h, mesmo horário para todos os serviços. | Não usar “24h”. |
| D05 | Quais veículos e pesos podem ser atendidos hoje? Vans/utilitários possuem restrições? | Escopo comercial e qualificação do lead. |
| D06 | Domínio final: manter `meguinchos.com.br`? Acesso DNS, hospedagem e URLs antigas? | Migração, canonical e redirects. |
| D07 | **Acervo e logo candidata recebidos.** Confirmar com Manoel titularidade/uso comercial das fotos e da marca, pedir arquivos originais e legendas corretas; depoimentos exigem aprovação específica. | Identidade, prova e direitos de uso. |
| D08 | **Pix, cartões e dinheiro confirmados pelo usuário**; resposta afirmativa também para as bandeiras mostradas na arte. Faltam razão social/CNPJ, contato de privacidade/encarregado, endereço público se existir e eventuais condições de pagamento. | Rodapé, política, pagamentos e dados estruturados. |
| D09 | Contas e responsáveis por Google Ads, Analytics, Search Console e Perfil da Empresa; consentimento e orçamento de mídia. | Medição, campanhas e operação. |
| D10 | Quem atende chamadas, como registra contato qualificado e quais serviços têm prioridade comercial? | Métrica real e roteiro de atendimento. |

**Regra:** dado publicado no site antigo é evidência histórica, não confirmação para o novo. As respostas de 28/09 substituem as ressalvas anteriores somente nos pontos expressamente confirmados. Usar `[PREENCHER]` para o que falta. A confirmação das bandeiras não transfere a arte/texto da JHC para a ME.

**Informações fornecidas diretamente pelo usuário em 26/09/2026:** base na Rua Martinho de Campos, 538, Vila Anastácia, São Paulo, CEP 05093-040; raio desejado de cerca de 20 km; início às 7h; encerramento aproximado às 22h; número então candidato `+55 11 95199-8799`; possibilidade de reutilizar fotos do site atual. O endereço exato foi dado para planejamento e **não deve ser publicado automaticamente**. Número e horário foram confirmados posteriormente em 28/09, conforme atualização acima. A galeria já foi coletada em `assets/referencia-site-atual/` para curadoria.

## Base metodológica

Adotamos *harness engineering* como repositório legível, instruções curtas, limites e feedback verificável para agentes, conforme a experiência descrita pela [OpenAI](https://openai.com/index/harness-engineering/). Adotamos SDD como sequência **requisito → plano → tarefas → implementação → convergência**, inspirada no [Spec Kit](https://github.github.com/spec-kit/reference/agentic-sdd.html). O projeto não depende da instalação do Spec Kit; os artefatos desta pasta já formam a primeira spec.
