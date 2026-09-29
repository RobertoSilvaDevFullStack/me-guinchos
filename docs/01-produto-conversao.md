# 01 — Produto e conversão

## Objetivo e métrica

Criar um site que permita a uma pessoa em situação de pane identificar rapidamente se a ME pode atender e iniciar contato por WhatsApp ou telefone. A mesma base oferece uma jornada separada para carregamento/transporte de empilhadeiras e movimentação de cargas com equipamento próprio, com limites técnicos ainda em validação.

**Métrica de negócio:** contatos **qualificados** por serviço e origem de campanha, registrados pelo atendimento. **Proxy digital:** cliques únicos em WhatsApp e telefone por sessões elegíveis, segmentados por página, dispositivo e campanha quando houver consentimento. Clique não prova conversa, chamada atendida ou venda. Não há meta numérica definida sem linha de base e capacidade operacional do cliente.

## Públicos e tarefas

| Público | Contexto | Informação decisiva | Ação |
| --- | --- | --- | --- |
| Motorista | Carro parado, pouco tempo e talvez conexão ruim. | Tipo de veículo atendido, região real, contato imediato. | Enviar localização e tipo do veículo ou ligar. |
| Motociclista | Moto imobilizada. | Transporte de moto disponível e condições básicas. | Contatar imediatamente. |
| Condutor de van/utilitário | Veículo de trabalho parado. | Confirmação de porte/capacidade e área. | Informar modelo, local e destino. |
| Empresa | Necessidade agendada com empilhadeira. | Serviço exato, capacidade, operador, horários e área confirmados. | Solicitar conversa comercial. |

## Jornada do anúncio

`Busca/anúncio por serviço e região real → página correspondente → confirmação visual/textual da oferta → WhatsApp ou ligação → atendimento humano → qualificação registrada`.

O texto do anúncio, H1 e CTA da página devem manter a mesma intenção. Quem busca guincho urgente não deve depender de formulário, carrossel, menu ou rolagem extensa para encontrar o contato. O site não promete tempo de chegada nem preço sem validação.

## Escopo do MVP

- Home focada em guincho leve, com CTA primário e secundário no primeiro bloco.
- Hero com primeiro estado de guincho e seleção manual de outros serviços, sem avanço automático; WhatsApp e ligação permanecem alcançáveis sem interação com slides ou JavaScript.
- Páginas ou seções específicas para carro, moto, van/utilitário, conforme comprovação do serviço e valor de busca.
- Seções de serviço com ação de contato contextual e bloco de formas de pagamento somente com modalidades confirmadas.
- Páginas de destino por serviço e, após validação de cobertura, por cidade ou rodovia com conteúdo local útil e URL final testada para campanha.
- Área de atendimento descrita como raio aproximado de 20 km e consulta por endereço, prova fotográfica curada da ME e perguntas frequentes reais. A janela confirmada é de domingo a domingo, 7h–22h, para todos os serviços.
- Link de WhatsApp com mensagem curta que pede **ao usuário**, no aplicativo, localização e tipo de veículo; o site não coleta esses dados.
- Link de telefone visível e funcional sem JavaScript.
- Política de privacidade, consentimento, fundamentos técnicos de SEO e medição consentida.

## Fora do MVP, salvo nova decisão

Painel administrativo, orçamento automático, formulário de lead, geolocalização automática do visitante, conta de usuário, pagamentos online, CRM próprio, chatbot e backend. Só entram se houver objetivo de negócio, responsável operacional e spec específica.

## Princípios de copy

1. Dizer **o que é atendido, onde e como chamar** em linguagem direta.
2. Separar urgência B2C de serviço B2B de empilhadeira em estados e seções distintos; o primeiro estado do hero é sempre guincho e seus contatos não dependem do slide seguinte.
3. Usar fotos da própria operação, legendadas corretamente; não usar depoimentos sem aprovação.
4. Priorizar segurança: orientar quem está em local de risco a procurar primeiro um lugar seguro e acionar serviços de emergência quando cabível, sem fazer promessas de socorro imediato.
5. Marcar qualquer dado comercial não confirmado como `[PREENCHER]` no preview.
