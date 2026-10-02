# Validação — atualização de imagens e contato (02/10/2026)

**Escopo:** T16, RF02, RF03, RF05, RF06, RF11 e RNF01–RNF03.
**Ambiente:** Windows, Node local, Next.js 16.3.6; build de prévia servido em `http://127.0.0.1:3100`.
**Responsável pela execução:** Codex.

## Resultados verificados

| Verificação | Resultado | Evidência |
| --- | --- | --- |
| Proveniência e legendas | **Passou.** As 12 fotos têm origem por horário, legenda original, legenda aplicada e alt factual registrados. “Impilhadeira” foi corrigido apenas na interface; “7 toneladas” foi limitado ao registro fotográfico. | `public/images/operacoes/README.md`; `content/site.ts`. |
| Substituição do acervo visível | **Passou por código e HTML.** Hero, faixa de empilhadeiras, galeria e Open Graph apontam para `public/images/operacoes/`; a resposta HTML contém 12 figuras e as 12 legendas esperadas. | Busca sem referências ao acervo operacional antigo em `app/`, `components/` e `content/`; `Invoke-WebRequest` retornou HTTP 200, `gallery-figures=12`, `captions-present=12`. |
| Otimização das fotos | **Passou.** As 12 fontes somavam 3.528.293 bytes; as 12 versões WebP somam 2.320.790 bytes, redução de **34,2%**. Metadados foram removidos; não houve ampliação. A foto vertical foi limitada a 924×2000 e o OG foi gerado em 1200×630. | Inventário do `sharp` e manifesto de mídia. A redução mede apenas os arquivos-fonte, não LCP/CWV. |
| Telefone e WhatsApp | **Passou por configuração e HTML.** O ponto único usa `+5511930299233` e exibe `(11) 93029-9233`. A resposta HTML contém 10 ocorrências `tel:+5511930299233`, 20 links `wa.me/5511930299233` e nenhuma ocorrência do contato anterior. | `lib/contact.ts`; resposta HTTP local. O recebimento em aparelho real não foi testado. |
| Separação de empilhadeiras | **Passou por revisão de conteúdo.** A foto documenta transporte em plataforma; movimentação com empilhadeira própria permanece em card separado e consultivo. | `content/site.ts`, ADR-006 e manifesto de mídia. |
| Lint | **Passou.** | `npm run lint`, exit code 0. |
| TypeScript | **Passou.** | `npm run typecheck`, exit code 0. |
| Build de prévia | **Passou.** | `npm run build:preview`, exit code 0; 8 páginas estáticas geradas. A primeira tentativa restrita compilou e falhou em `spawn EPERM`; a repetição autorizada fora do sandbox concluiu. |
| Visual responsivo | **Passou nos quatro viewports obrigatórios.** Em 360, 390, 768 e 1280 px não houve overflow horizontal nem alvo interativo visível menor que 44×44 px. Hero, CTAs, foto, legenda e barra de contato permaneceram legíveis; a galeria manteve 12 figuras e 12 legendas. | Navegador interno com viewport explícito; inspeção visual e medição de `scrollWidth`, caixas dos alvos e elementos fora do viewport. |
| Controle manual do hero | **Passou.** O botão “Próxima foto” trocou o registro inicial pela foto e legenda “Guincho para carro de luxo”, sem avanço automático observado. | Interação semântica pelo navegador interno e leitura do DOM após o clique. |
| Resiliência/preview | **Passou parcialmente.** A home respondeu HTTP 200 e permaneceu com `noindex`; os links de contato estão presentes no HTML renderizado. | `Invoke-WebRequest` local. A execução automatizada com JavaScript desativado não foi concluída. |
| `git diff --check` | **Passou.** | Sem erro de whitespace; apenas avisos de normalização LF→CRLF já existentes no worktree. |

## Limitações e falhas observadas

- A primeira tentativa de validação visual no subagente falhou ao iniciar o Chromium com `browserType.launch: spawn UNKNOWN`. A verificação foi repetida pelo agente principal no navegador interno e passou em 360, 390, 768 e 1280 px. O teste específico com JavaScript desativado continua pendente.
- `npm run build` não chegou à trava editorial esperada porque encontrou outro processo de build já em execução: `Another next build process is already running.` Nenhum processo compartilhado foi encerrado. O gate de produção já permanece deliberadamente bloqueado pelo projeto, mas seu texto de falha não foi revalidado nesta execução.
- WhatsApp, discador e recebimento pelo responsável não foram testados em smartphone real; V02/V10 continuam abertos.
- As fotos incluem placas, marcas e outros identificadores visíveis. A autorização de uso foi registrada, porém a revisão editorial final desses elementos continua pendente antes da publicação.
- Não foram medidos Lighthouse, LCP, INP ou CLS. A redução de 34,2% é somente de bytes dos 12 arquivos-fonte.

## Processos locais

- Uma tentativa de `npm run dev` iniciada nesta validação falhou com `spawn EPERM` e encerrou. A repetição detectou um servidor Next já existente no PID 16944, porta 3000, e encerrou sem criar um segundo servidor. Esse processo existente não foi iniciado nem encerrado por esta validação.
- O agente principal serviu o build aprovado temporariamente em `127.0.0.1:3100` para a validação visual e encerrou esse processo ao final dos testes.
- A primeira rodada paralela de lint/typecheck/build excedeu o tempo de retorno e perdeu o identificador da sessão. Como outro agente/processo também usava o mesmo diretório, nenhum processo Node foi encerrado sem identificação segura. Os três comandos foram repetidos sequencialmente; os resultados válidos estão acima.

## Gate

T16 está implementada e validada em código, HTML, lint, tipos, build de prévia e nos quatro viewports de RNF01/V01/V12. O teste com JavaScript desativado, o recebimento real de WhatsApp/ligação e os demais gates gerais continuam pendentes; esta evidência não autoriza publicação.
