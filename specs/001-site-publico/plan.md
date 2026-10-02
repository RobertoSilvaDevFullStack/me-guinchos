# Plano de implementação da Spec 001

## Sequência SDD + harness

1. **Convergir dados:** preencher `docs/00-contexto-fontes.md`; confirmar o que é publicável. Se uma resposta alterar a oferta, atualizar esta spec antes do código.
2. **Arquitetura e conteúdo:** estabelecer configuração tipada, rotas, cópia por serviço, inventário de fotos e mapa de URLs antigas. Registrar decisões novas.
3. **Fatias de interface:** a home e os links de contato formam a fatia 1; a fatia 2 incorpora slides manuais, serviços e pagamentos pendentes; a fatia 3 aplica confirmações de 28/09 ao telefone, horário, cobertura indicativa, empilhadeiras e meios de pagamento, acrescentando galeria curada de fotos da ME. Depois vêm páginas de serviço, cobertura detalhada e FAQ. Cada fatia deve ser verificável isoladamente em mobile.
4. **Destinos de campanha:** após validar serviço e geografia, produzir primeiro as páginas por serviço e a página de áreas; abrir URLs específicas por cidade/rodovia apenas quando houver conteúdo útil próprio e cobertura comprovada. Relacionar anúncio → URL final → H1 → CTA e testar a rota antes de ativar a campanha.
5. **Descoberta e medição:** metadados, arquivos de raiz, JSON-LD, política, banner e eventos com gate de consentimento.
6. **Otimização:** fotos responsivas, fontes, tamanho de bundle e cache; medir mobile antes/depois.
7. **Gate de qualidade:** executar `validation.md`, corrigir falhas e obter aprovação editorial. Deploy só após o gate passar.

## Dependências

| Trabalho | Pode começar com pendências? | Bloqueio de publicação |
| --- | --- | --- |
| Protótipo da home e design | Sim, com placeholders | Faltam teste real de contato, precisão da área e gate final; telefone, horário, mídia e dados legais estão confirmados |
| Slides e fotos na prévia local | Sim, sem avanço automático | Titularidade e uso aprovados; manter descrição factual e validar os arquivos exibidos |
| Rotas de carros/motos/vans | Sim | Copy consultiva aprovada; rota própria ainda exige conteúdo e prova específicos |
| Transporte de empilhadeiras | Sim, como rascunho | Confirmação operacional atual |
| Operação com empilhadeira | Sim, com copy consultiva | Página/anúncio próprio exige prova da operação e conteúdo específico; não publicar limite técnico não confirmado |
| SEO local/campanhas | Pesquisa pode começar | Geografia e conta aprovadas; domínio e oferta consultiva já confirmados |
| Páginas por cidade/rodovia para Ads | Apenas backlog e rascunho protegido | D03, conteúdo local útil, URL final, oferta e D09/D10 aprovados |
| Seção de formas de pagamento | Sim; Pix, cartões, dinheiro e artes atuais autorizados | Condições não informadas continuam fora; dados legais D08 estão confirmados |
| Analytics/Ads | Contrato de eventos pode começar | IDs, contas, consentimento e política validados |

## Responsabilidades

`seo-growth` é dono de URLs, intenção, copy, metadados e eventos; `frontend-engineer` é dono de UI e acessibilidade; `backend-engineer` revisa limites técnicos e integrações se surgirem; `web-performance` mede e corrige em mobile; `qa-security` executa o gate final. Trabalhos independentes podem ocorrer em paralelo, mas um responsável integra e verifica os contratos compartilhados.

## Gestão de mudança

Cada alteração comercial deve atualizar primeiro `spec.md`, depois copy/tarefas/testes afetados. Registrar data, origem da confirmação e impacto; não corrigir uma spec divergente apenas por prompt ad hoc. A validação produz evidência por requisito, inclusive falhas e o que não foi testado.
