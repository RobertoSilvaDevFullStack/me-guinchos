# Instruções do projeto para agentes de desenvolvimento

Leia `README.md` e `specs/001-site-publico/spec.md` antes de alterar o projeto. Esta documentação é a fonte de verdade até que uma decisão seja atualizada explicitamente. Registre decisões novas em `docs/02-arquitetura-decisoes.md` e mantenha spec, tarefas e validação coerentes.

## Regras de execução

- Responda e escreva conteúdo do produto em português do Brasil.
- Construa primeiro para 360–390 px; verifique 360, 390, 768 e 1280 px. Área de toque mínima: 44×44 px.
- Não invente cobertura, atendimento 24h, preço, prazo, avaliações, frota, formas de pagamento, capacidade da empilhadeira ou dados legais. Use `[PREENCHER]` somente em preview local/protegido e impeça publicação de afirmações não aprovadas.
- Mantenha **transporte de empilhadeiras** separado de **serviço executado com empilhadeira própria**. A segunda oferta permanece pendente até confirmação operacional.
- WhatsApp e telefone devem ser links reais, acessíveis e funcionais sem JavaScript e sem consentimento para cookies.
- Scripts de medição e publicidade dependem de consentimento afirmativo. Nenhum dado pessoal do visitante deve ser enviado em parâmetros de evento.
- Use fotos do acervo ME apenas após autorização de reutilização e acesso aos arquivos adequados. Não copie imagens, identidade ou textos da JHC.
- Não adicione backend, banco, formulário, CMS ou dependência sem requisito justificado. Siga a decisão técnica em `docs/02-arquitetura-decisoes.md`.
- Antes de declarar pronto, execute o plano em `specs/001-site-publico/validation.md` e reporte resultados medidos e limitações.

## Fluxo de trabalho

1. Ler contexto e resolver decisões que bloqueiam conteúdo público.
2. Atualizar a spec se o cliente alterar a oferta.
3. Implementar por fatias verificáveis, relacionando cada tarefa a um requisito `RF`/`RNF`.
4. Revisar SEO, acessibilidade, privacidade, segurança e performance mobile.
5. Publicar somente com aprovação editorial, contatos e domínio validados e gate de lançamento aprovado.

