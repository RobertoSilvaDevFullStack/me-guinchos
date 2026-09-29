# 05 — Mensuração, consentimento e privacidade

## Métrica e eventos

O resultado de negócio é **contato qualificado**, confirmado no processo de atendimento do Manoel. Eventos de clique são indicadores de intenção, sujeitos a duplicidade, cancelamento do aplicativo e chamadas não completadas.

| Evento | Gatilho | Parâmetros permitidos | Observação |
| --- | --- | --- | --- |
| `click_whatsapp` | Clique no link WhatsApp | `page_path`, `placement` (`hero`, `sticky`, `service`, `footer`), `service` | Disparar só com consentimento para medição. |
| `click_phone` | Clique em `tel:` | Mesmos parâmetros | Não afirmar chamada atendida. |

A escolha de consentimento **não é um evento enviado ao Analytics/Ads**. Guardar localmente apenas categorias aceitas/rejeitadas (medição e publicidade separadas), versão do aviso e data necessária à expiração da preferência; prazo de retenção e forma de armazenamento serão definidos e documentados na implementação. Revogação limpa/desativa a preferência e bloqueia novas requisições não essenciais. A mera recusa não provoca chamada de rede a fornecedores de medição.

Nenhum evento ou UTM deve carregar nome, telefone, e-mail, placa, localização precisa, texto de mensagem ou dados da ocorrência. Na análise, separar campanha, página e dispositivo; usar apenas **sessões observadas após consentimento** como denominador de taxas medidas. A parcela sem consentimento fica fora dessa amostra e nunca equivale a zero interesse.

## Contrato de consentimento

- Links de contato e conteúdo essencial funcionam sempre.
- GA4, GTM, Google Ads e pixels publicitários **não carregam nem disparam antes de escolha afirmativa**; rejeição mantém esses scripts bloqueados. Aplicar a regra do gate de lançamento do projeto, independentemente de hipótese legal alternativa para analytics.
- Banner com “Aceitar”, “Rejeitar” e “Gerenciar” de destaque equivalente, acessível por teclado; preferência pode ser alterada depois.
- Política informa controlador, finalidades, ferramentas, retenção, direitos e contato do encarregado/responsável `[PREENCHER]`. Revisar texto jurídico com responsável apropriado.
- Validar tecnicamente os estados sem escolha, aceito, rejeitado e revogado; inspecionar requisições de rede.

| Dado/categoria | Finalidade | Destinatário | Base e retenção |
| --- | --- | --- | --- |
| Preferência local de consentimento | Aplicar a escolha do visitante | Navegador do próprio visitante | Necessário à preferência; prazo `[PREENCHER]` e revisão jurídica. |
| Eventos `click_*`, somente após aceite | Medir interesse por página/CTA | Ferramenta de analytics/ads `[PREENCHER]` | Consentimento no projeto; prazo e eventual transferência internacional `[PREENCHER]`. |
| Informação enviada pelo usuário no WhatsApp ou por telefone | Atendimento comercial | WhatsApp/operadora e equipe ME | Tratamento fora do site; controlador, base, retenção e fornecedores devem constar da política aprovada. |

Base de referência: [guia de cookies da ANPD](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais). A configuração específica de conversão do Google Ads só deve ser definida quando contas, modalidade de chamada e consentimento estiverem claros; [o Google distingue clique no número de chamada medida](https://support.google.com/google-ads/answer/16559798?hl=pt-BR).

## Operação de anúncios

Antes de conectar pixels: identificar responsáveis pelas contas, IDs de medição, campanhas, eventos primários/secundários e acesso ao atendimento. Testar UTMs e links sem dados pessoais. Ao analisar performance, apresentar números antes/depois e janela de comparação; não declarar aumento de conversão a partir de cliques isolados.
