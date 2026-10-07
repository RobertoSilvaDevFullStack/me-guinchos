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
| Preferência local de consentimento | Aplicar a escolha do visitante | Navegador do próprio visitante | Necessário à preferência; 180 dias como padrão técnico desde 07/10/2026, revisão jurídica pendente. |
| Eventos `click_*`, somente após aceite | Medir interesse por página/CTA | Google Ads `AW-18490859899` (Google LLC) — eventos ainda não implementados | Consentimento; transferência internacional ao Google, prazo conforme a retenção praticada na conta. |
| Informação enviada pelo usuário no WhatsApp ou por telefone | Atendimento comercial | WhatsApp/operadora e equipe ME | Tratamento fora do site; controlador, base, retenção e fornecedores devem constar da política aprovada. |

Base de referência: [guia de cookies da ANPD](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais). A configuração específica de conversão do Google Ads só deve ser definida quando contas, modalidade de chamada e consentimento estiverem claros; [o Google distingue clique no número de chamada medida](https://support.google.com/google-ads/answer/16559798?hl=pt-BR).

## Operação de anúncios

Antes de conectar pixels: identificar responsáveis pelas contas, IDs de medição, campanhas, eventos primários/secundários e acesso ao atendimento. Testar UTMs e links sem dados pessoais. Ao analisar performance, apresentar números antes/depois e janela de comparação; não declarar aumento de conversão a partir de cliques isolados.

## Implementação em 07/10/2026 — tag do Google Ads

O responsável entregou a tag base do Google Ads `AW-18490859899` (gtag.js) para instalação. Ela foi instalada **sob o gate de consentimento**, nunca solta no `<head>`.

| Item | Onde | Comportamento |
| --- | --- | --- |
| Configuração e store de consentimento | `lib/medicao.ts` | ID da conta, versão do aviso, validade de 180 dias, tradução para Consent Mode v2 e leitura/escrita da preferência. |
| Aviso, painel e carga das tags | `components/ConsentimentoMedicao.tsx` | Único ponto do site que insere `googletagmanager.com` (tag do Ads e container do GTM). Sem escolha afirmativa, nenhum dos dois `<script>` existe no DOM. |
| Reabertura da escolha | `components/BotaoPreferencias.tsx` | Botão no rodapé e na política; dispara o evento interno que reabre o painel. |

- **Sem escolha:** nenhuma requisição sai para o Google. O HTML servido pelo servidor é idêntico com ou sem consentimento; a decisão é lida só no cliente, por `useSyncExternalStore`.
- **Categorias separadas:** `medicao` → `analytics_storage`; `publicidade` → `ad_storage`, `ad_user_data`, `ad_personalization`. O painel permite aceitar uma e recusar a outra.
- **Recusa:** nada é carregado e **nada é gravado** — a recusa não deixa registro local, então o aviso reaparece na próxima visita. Essa é a troca consciente entre não persistir identificador de quem disse não e não repetir a pergunta.
- **Revogação:** apaga a preferência, envia `consent update` negado e recarrega a página, de modo que nada que já estava em memória continue ativo.
- **Preferência local:** chave `meg.consentimento` no `localStorage`, com categorias, versão do aviso e data. 180 dias é **padrão técnico adotado na implementação**, não prazo validado juridicamente; a revisão com responsável apropriado continua pendente.
- **Política de Privacidade:** atualizada na mesma alteração (seção de cookies, base legal de consentimento, transferência internacional para o Google LLC, prazos e botão de revogação).

### O que continua pendente

- **Conversões do Google Ads.** Só a tag base foi instalada. Os eventos `click_whatsapp` e `click_phone` ainda não disparam: dependem do rótulo de conversão da conta (`send_to`), que é `[PREENCHER]`, e da decisão sobre medir clique no número ou chamada atendida.
- **GA4.** Não instalado diretamente; se for criado dentro do container, herda o Consent Mode descrito acima. Search Console continua só com a meta tag de verificação, que não é script.
- **Validação em produção.** A tag foi verificada em prévia local: sem aceite, zero requisição; com aceite, o site requisita `https://www.googletagmanager.com/gtag/js?id=AW-18490859899`. A execução do gtag.js em si não pôde ser observada no navegador usado na verificação, que bloqueia o domínio por extensão; confirmar pelo diagnóstico da própria conta do Google Ads depois do deploy.
- **CSP.** A política de segurança de conteúdo do item 6 de `docs/07-deploy-coolify.md` precisa prever os domínios do Google antes de ser aplicada.

## Google Tag Manager — instalado em 07/10/2026

Container `GTM-55QGH9RR`, informado pelo responsável. Não havia GTM no projeto antes disso; a verificação foi feita por varredura de `GTM-`, `gtm.js`, `googletagmanager` e `dataLayer` em `app/`, `components/`, `lib/`, `content/`, `scripts/` e `public/`.

**Onde entrou.** `components/ConsentimentoMedicao.tsx`, ao lado da tag do Ads, atrás do mesmo gate. O `app/layout.tsx` é o único layout raiz do projeto e cobre as quatro rotas (`/`, `/areas-de-atendimento`, `/politica-de-privacidade`, `/_not-found`), então o container vale para o site inteiro. O `<Script id="google-tag-manager">` do Next não duplica o container em navegação client-side.

**Ordem na `dataLayer`**, montada antes do `gtm.js` executar: `consent default` (tudo negado) → `gtag js` → `config AW-18490859899` → `{'gtm.start', event:'gtm.js'}` → `consent update` com a escolha real. Assim as tags configuradas dentro do container nascem sujeitas ao Consent Mode v2 em vez de disparar livres.

### Duas diferenças conscientes em relação ao snippet padrão do Google

| Instrução oficial | O que foi feito | Motivo |
| --- | --- | --- |
| Script o mais alto possível no `<head>` | Injetado depois do aceite, via `next/script` | No `<head>` o container baixaria para todo visitante antes de qualquer escolha, o que contraria o contrato acima, o gate de lançamento do projeto e a Política de Privacidade publicada. |
| `<noscript>` logo após o `<body>` | Não incluído | O iframe do `<noscript>` só age quando o JavaScript está desligado — exatamente a situação em que o banner de consentimento não existe e o visitante não tem como aceitar. Incluí-lo seria medir quem não teve como escolher. |

Reverter qualquer uma das duas é uma decisão de negócio, não um ajuste técnico: exige atualizar este documento e a Política de Privacidade antes, porque passa a haver requisição a terceiro sem escolha prévia.

### Risco a conferir no container

Se o próprio `GTM-55QGH9RR` tiver uma tag do Google Ads com o ID `AW-18490859899`, a conversão passa a ser contada duas vezes — uma pelo gtag direto, outra pelo container. Nesse caso, remover o `<Script id="gtag-google-ads">` de `components/ConsentimentoMedicao.tsx` e deixar o Ads só pelo GTM. Não dá para verificar isso pelo código: depende do que está publicado no container.
