import type { Metadata } from "next";
import Link from "next/link";
import { BarraContato } from "@/components/BarraContato";
import { BotaoPreferencias } from "@/components/BotaoPreferencias";
import { Pictograma } from "@/components/Pictograma";
import { Retrorreflexao } from "@/components/Retrorreflexao";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { legalContent, metadataDaRota } from "@/content/site";
import { siteContactLinks } from "@/lib/contact";

// Canonical e Open Graph definitivos. O `robots` desta rota deixou de ser
// escrito à mão: vem de `INDEXACAO_LIBERADA`, junto com todas as demais.
export const metadata: Metadata = metadataDaRota({
  path: "/politica-de-privacidade",
  title: "Política de Privacidade | ME Guinchos",
  description:
    "Política de Privacidade da ME Guinchos e informações sobre o tratamento de dados pessoais conforme a LGPD.",
});

/** Direitos do titular previstos nos arts. 17 a 22 da Lei 13.709/2018. */
const direitosDoTitular = [
  "Confirmar se tratamos dados seus e acessar esses dados.",
  "Corrigir dados incompletos, inexatos ou desatualizados.",
  "Pedir a anonimização, o bloqueio ou a eliminação de dados desnecessários, excessivos ou tratados fora da lei.",
  "Pedir a portabilidade dos dados a outro fornecedor, nos termos da regulamentação da ANPD.",
  "Pedir a eliminação dos dados tratados com base no seu consentimento.",
  "Saber com quais entidades públicas e privadas compartilhamos seus dados.",
  "Ser informado sobre a possibilidade de não consentir e sobre as consequências da recusa.",
  "Revogar o consentimento a qualquer momento.",
  "Opor-se a tratamento feito sem o seu consentimento, quando houver descumprimento da lei.",
  "Peticionar perante a Autoridade Nacional de Proteção de Dados (ANPD).",
] as const;

export default function PoliticaDePrivacidadePage() {
  return (
    <>
      <a className="atalho-conteudo" href="#conteudo">
        Pular para o conteúdo
      </a>

      <SiteHeader />

      <main className="politica" id="conteudo">
        <div className="page-shell">
          <h1>Política de Privacidade</h1>
          <p className="politica__lead">
            Esta política explica quais dados pessoais a {legalContent.nomeComercial}{" "}
            trata quando você usa este site, com que finalidade, com que base
            legal e como você exerce seus direitos. Ela segue a Lei Geral de
            Proteção de Dados Pessoais, Lei nº 13.709/2018 (LGPD).
          </p>
          <p className="politica__data">
            Última atualização: {legalContent.atualizadoEm}.
          </p>

          <div className="placa placa--branca politica__identificacao" data-placa="branca">
            <h2>Quem é o controlador dos dados</h2>
            <p className="politica__nota-marca">
              {legalContent.nomeComercial} é o nome comercial sob o qual operamos.
              A identificação jurídica do controlador é a seguinte.
            </p>
            <dl>
              <div>
                <dt>Razão social</dt>
                <dd>{legalContent.razaoSocial}</dd>
              </div>
              <div>
                <dt>CNPJ</dt>
                <dd>{legalContent.cnpj}</dd>
              </div>
              <div>
                <dt>Atividade principal</dt>
                <dd>{legalContent.atividadePrincipal}</dd>
              </div>
              <div>
                <dt>Endereço</dt>
                <dd>
                  {legalContent.endereco.logradouro}
                  <br />
                  {legalContent.endereco.bairro} — {legalContent.endereco.cidadeUf}
                  <br />
                  CEP {legalContent.endereco.cep}
                </dd>
              </div>
              <div>
                <dt>E-mail para assuntos de privacidade</dt>
                <dd>
                  <a href={`mailto:${legalContent.emailPrivacidade}`}>
                    {legalContent.emailPrivacidade}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Telefone e WhatsApp</dt>
                <dd>
                  <a href={siteContactLinks.phoneHref}>
                    {siteContactLinks.phoneDisplay}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <section className="politica__secao" aria-labelledby="pol-coleta">
            <h2 id="pol-coleta">Quais dados podemos coletar</h2>
            <p>
              Este site não tem formulário de contato, área de cadastro, login,
              carrinho nem newsletter. Você não precisa informar nenhum dado
              pessoal para ler qualquer página. A coleta acontece em duas
              situações distintas, descritas abaixo.
            </p>

            <h3>Dados que você fornece voluntariamente</h3>
            <p>
              Os botões de contato do site são links diretos. O botão de ligação
              abre o discador do seu aparelho com o nosso número, e o botão de
              WhatsApp abre uma conversa no aplicativo ou no site do WhatsApp,
              com uma mensagem inicial já escrita. Nada é enviado para nós
              enquanto você não decidir ligar ou mandar a mensagem.
            </p>
            <p>
              Quando você inicia o contato, passamos a tratar o que você nos
              conta: nome ou forma de tratamento, número de telefone, dados do
              veículo ou do equipamento, local de origem, local de destino e a
              descrição da ocorrência. Envie apenas o necessário para o
              atendimento — não peça nem envie documentos, dados bancários ou
              dados sensíveis por esses canais.
            </p>

            <h3>Dados coletados durante a navegação</h3>
            <p>
              Como em qualquer site, o servidor que hospeda estas páginas
              registra automaticamente dados técnicos da requisição, como
              endereço IP, data e hora, páginas acessadas, tipo de navegador e
              sistema operacional. Esses registros existem para manter o site no
              ar e protegê-lo contra abuso, e não são usados para criar perfil de
              visitante nem cruzados com os dados de atendimento.
            </p>
            <p>
              Esses registros são gerados e guardados pela infraestrutura de
              hospedagem do site, que atua como operadora. Não mantemos base de
              dados própria de visitantes e não temos acesso a esses registros
              para qualquer finalidade comercial.
            </p>
          </section>

          <section className="politica__secao" aria-labelledby="pol-cookies">
            <h2 id="pol-cookies">Cookies e tecnologias semelhantes</h2>
            <p>
              <strong>
                Nenhum cookie de medição ou de publicidade é gravado antes da sua
                escolha.
              </strong>{" "}
              Na primeira visita, o site exibe um aviso com as opções
              &ldquo;Aceitar&rdquo;, &ldquo;Recusar&rdquo; e
              &ldquo;Gerenciar&rdquo;. Enquanto você não escolher, nenhum script
              de terceiro é carregado e nenhuma requisição sai do seu navegador
              para outra empresa. Se você recusar, nada é carregado e nada é
              gravado.
            </p>
            <p>
              Aceitando, passa a ser carregada a <strong>tag do Google Ads</strong>{" "}
              (gtag.js, identificador <code>AW-18490859899</code>), fornecida pelo
              Google. Ela grava cookies no seu navegador e permite ao Google
              informar quantas pessoas chegaram ao site a partir dos nossos
              anúncios. A escolha é separada em duas finalidades, que você pode
              aceitar de forma independente em &ldquo;Gerenciar&rdquo;:
            </p>
            <ul className="politica__lista">
              <li>
                <strong>Medição de audiência.</strong> Quantas pessoas chegam ao
                site e por quais páginas, em números agregados.
              </li>
              <li>
                <strong>Publicidade.</strong> Medição do resultado dos anúncios do
                Google Ads e exibição de anúncios nossos a quem já visitou o site.
              </li>
            </ul>
            <p>
              Essas medições não envolvem nome, telefone, e-mail, placa, texto de
              mensagem, localização precisa nem qualquer dado da ocorrência. Nós
              não recebemos do Google a identificação de visitante nenhum; vemos
              apenas totais.
            </p>
            <p>
              Para aplicar a sua escolha, o site guarda no{" "}
              <strong>armazenamento local do seu próprio navegador</strong> apenas
              as categorias aceitas ou recusadas, a versão deste aviso e a data da
              decisão. Esse registro fica no seu dispositivo, não é enviado a
              ninguém e vale por <strong>180 dias</strong>, após o que a escolha é
              pedida de novo.
            </p>
            <p>
              Você pode mudar ou revogar a escolha a qualquer momento, sem
              justificar e sem perder nenhuma função do site:
            </p>
            <p>
              <BotaoPreferencias className="acao acao--ligar" />
            </p>
            <p>
              Ao revogar, a preferência é apagada, as categorias voltam a ficar
              negadas e a página é recarregada para que nada do que já havia sido
              carregado continue ativo. Os cookies já gravados pelo Google podem
              ser apagados nas configurações do seu navegador.
            </p>
            <p>
              Não usamos Google Analytics, Google Tag Manager, Meta Pixel, mapa de
              calor, gravação de sessão nem impressão digital de navegador. As
              fontes tipográficas e as imagens são servidas pelo próprio site, de
              modo que a leitura das páginas, sem aceite, não gera requisição a
              terceiros. Os links de WhatsApp e de telefone funcionam sem
              JavaScript e sem depender de qualquer escolha de cookies.
            </p>
          </section>

          <section className="politica__secao" aria-labelledby="pol-finalidades">
            <h2 id="pol-finalidades">Finalidades e bases legais</h2>
            <p>
              Tratamos dados pessoais apenas para as finalidades abaixo, cada uma
              com a sua hipótese legal do art. 7º da LGPD.
            </p>

            <ul className="politica__bases">
              <li>
                <strong>Responder ao seu contato e avaliar o atendimento</strong>
                <span>
                  Base legal: procedimentos preliminares relacionados a contrato
                  do qual você é parte, a seu pedido (art. 7º, V).
                </span>
              </li>
              <li>
                <strong>Executar o serviço de guincho ou de movimentação com
                empilhadeira contratado</strong>
                <span>
                  Base legal: execução de contrato (art. 7º, V).
                </span>
              </li>
              <li>
                <strong>Manter o site disponível, seguro e livre de abuso</strong>
                <span>
                  Base legal: legítimo interesse (art. 7º, IX), limitado ao
                  mínimo necessário e sem criação de perfil.
                </span>
              </li>
              <li>
                <strong>Medir a audiência do site e o resultado dos anúncios do
                Google Ads</strong>
                <span>
                  Base legal: consentimento (art. 7º, I), coletado antes do
                  carregamento de qualquer script e revogável a qualquer momento.
                </span>
              </li>
              <li>
                <strong>Cumprir obrigações fiscais, tributárias e de defesa em
                processo</strong>
                <span>
                  Base legal: cumprimento de obrigação legal ou regulatória
                  (art. 7º, II) e exercício regular de direitos (art. 7º, VI).
                </span>
              </li>
            </ul>
          </section>

          <section className="politica__secao" aria-labelledby="pol-compartilhamento">
            <h2 id="pol-compartilhamento">Com quem os dados são compartilhados</h2>
            <p>
              Não vendemos, alugamos nem cedemos dados pessoais. O
              compartilhamento acontece apenas nestas situações:
            </p>
            <ul className="politica__lista">
              <li>
                <strong>WhatsApp.</strong> Ao tocar no botão de WhatsApp você é
                levado para um serviço operado pela Meta Platforms. A conversa
                passa a ocorrer dentro do aplicativo e fica também sujeita à
                política de privacidade da Meta, sobre a qual não temos controle.
                Se preferir não usar esse canal, ligue para o nosso número.
              </li>
              <li>
                <strong>Operadora de telefonia.</strong> A ligação telefônica
                trafega pela sua operadora e pela nossa, conforme as regras do
                setor.
              </li>
              <li>
                <strong>Provedor de hospedagem.</strong> Atua como operador e
                mantém os registros técnicos de acesso descritos acima.
              </li>
              <li>
                <strong>Google.</strong> Somente se você aceitar a medição e a
                publicidade. A tag do Google Ads envia ao Google LLC dados de
                navegação como endereço IP, identificador de cookie, página
                acessada e origem da visita. O Google atua como operador e, no
                que fizer com esses dados para os seus próprios fins, como
                controlador, nos termos das suas condições de serviço.
              </li>
              <li>
                <strong>Autoridades.</strong> Quando houver ordem judicial,
                requisição de autoridade competente ou obrigação legal.
              </li>
            </ul>
            <p>
              <strong>Transferência internacional.</strong> Aceitando a medição,
              os dados descritos acima são tratados pelo Google em servidores fora
              do Brasil. A transferência se apoia no seu consentimento específico
              (art. 33, VIII, da LGPD) e deixa de ocorrer a partir da revogação.
              Ao usar o WhatsApp, o tratamento feito pela Meta também pode
              envolver servidores fora do Brasil, nos termos da política daquele
              serviço. Fora dessas hipóteses, não realizamos transferência
              internacional de dados por iniciativa própria.
            </p>
          </section>

          <section className="politica__secao" aria-labelledby="pol-retencao">
            <h2 id="pol-retencao">Armazenamento e prazo de guarda</h2>
            <ul className="politica__lista">
              <li>
                <strong>Conversas e registros de atendimento:</strong> mantidos
                enquanto durar o atendimento e, depois dele, pelo prazo
                necessário ao exercício regular de direitos.
              </li>
              <li>
                <strong>Documentos fiscais do serviço prestado:</strong> mantidos
                pelo prazo exigido pela legislação tributária.
              </li>
              <li>
                <strong>Preferência de cookies:</strong> guardada no seu próprio
                navegador por 180 dias, ou até você revogar a escolha ou limpar os
                dados do site. Não temos acesso a esse registro.
              </li>
              <li>
                <strong>Dados de medição do Google Ads, quando houver aceite:</strong>{" "}
                guardados pelo Google conforme os prazos de retenção praticados
                por ele na nossa conta de anúncios. Não mantemos cópia própria
                desses dados.
              </li>
              <li>
                <strong>Registros técnicos de acesso ao site:</strong> guardados
                pela infraestrutura de hospedagem pelo período por ela praticado.
                Não definimos prazo próprio para esses registros nem os
                utilizamos fora da manutenção e da segurança do site. Quando
                aplicável à operação, observa-se o prazo mínimo de guarda de
                registros de acesso a aplicações de internet previsto no art. 15
                da Lei nº 12.965/2014 (Marco Civil da Internet).
              </li>
            </ul>
            <p>
              Encerrado o prazo e a finalidade, os dados são eliminados ou
              anonimizados, salvo hipótese legal de conservação.
            </p>
          </section>

          <section className="politica__secao" aria-labelledby="pol-seguranca">
            <h2 id="pol-seguranca">Medidas de segurança</h2>
            <p>
              Adotamos medidas técnicas e administrativas compatíveis com o porte
              da operação: tráfego do site por conexão criptografada (HTTPS),
              ausência de banco de dados de visitantes neste site, acesso às
              conversas restrito às pessoas envolvidas no atendimento e uso dos
              dados limitado à finalidade que motivou o contato. Nenhum sistema é
              totalmente imune a incidentes; havendo incidente de segurança com
              risco relevante, comunicaremos os titulares afetados e a ANPD, nos
              termos do art. 48 da LGPD.
            </p>
          </section>

          <section className="politica__secao" aria-labelledby="pol-direitos">
            <h2 id="pol-direitos">Seus direitos como titular</h2>
            <p>
              A LGPD garante a você, a qualquer momento e sem custo, os seguintes
              direitos:
            </p>
            <ul className="politica__lista politica__lista--direitos">
              {direitosDoTitular.map((direito) => (
                <li key={direito}>
                  <Pictograma nome="seta" tamanho={11} />
                  <span>{direito}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="politica__acionar" data-placa="azul">
            <h2>Como exercer seus direitos</h2>
            <p>
              Envie o pedido pelos nossos canais de atendimento, informando qual
              direito deseja exercer e o número de telefone usado no contato, para
              que possamos localizar seus dados. Podemos pedir informações
              adicionais apenas para confirmar a sua identidade e evitar entregar
              dados à pessoa errada. Respondemos no menor prazo possível,
              observados os prazos da LGPD e da regulamentação da ANPD.
            </p>
            <dl className="politica__canais">
              <div>
                <dt>
                  <Pictograma nome="email" tamanho={15} />
                  E-mail (canal preferencial)
                </dt>
                <dd>
                  <a href={`mailto:${legalContent.emailPrivacidade}`}>
                    {legalContent.emailPrivacidade}
                  </a>
                </dd>
              </div>
              <div>
                <dt>
                  <Pictograma nome="telefone" tamanho={15} />
                  Telefone e WhatsApp
                </dt>
                <dd>{siteContactLinks.phoneDisplay}</dd>
              </div>
            </dl>
            <div className="politica__acoes">
              <a
                className="acao acao--ligar"
                href={`mailto:${legalContent.emailPrivacidade}?subject=${encodeURIComponent(
                  "Solicitação LGPD — titular de dados",
                )}`}
              >
                <Pictograma nome="email" tamanho={20} />
                <span>Enviar solicitação por e-mail</span>
              </a>
              <a className="acao acao--ligar" href={siteContactLinks.phoneHref}>
                <Pictograma nome="telefone" tamanho={20} />
                <span>Ligar {siteContactLinks.phoneDisplay}</span>
              </a>
            </div>
          </div>

          <section className="politica__secao" aria-labelledby="pol-encarregado">
            <h2 id="pol-encarregado">Encarregado pelo tratamento de dados</h2>
            <p>
              O art. 41 da LGPD determina que o controlador indique um encarregado
              (DPO). A Resolução CD/ANPD nº 2, de 27 de janeiro de 2022, que
              regulamenta a aplicação da lei aos agentes de tratamento de pequeno
              porte, dispensa essa indicação formal e exige, em seu lugar, um
              canal de comunicação com o titular.
            </p>
            <p>
              A operação descrita nesta política se enquadra nessa condição: o
              site não tem formulário nem cadastro, não trata dados sensíveis, não
              faz tratamento em larga escala, não realiza monitoramento
              sistemático de titulares e não constitui tratamento de alto risco.
              Por isso <strong>não há encarregado formalmente nomeado</strong>, e o
              canal de comunicação com o titular é o e-mail{" "}
              <a href={`mailto:${legalContent.emailPrivacidade}`}>
                {legalContent.emailPrivacidade}
              </a>
              .
            </p>
            <p>
              Se a operação passar a envolver tratamento de alto risco ou deixar
              de se enquadrar como agente de pequeno porte, um encarregado será
              indicado e esta política será atualizada antes disso.
            </p>
          </section>

          <section className="politica__secao" aria-labelledby="pol-alteracoes">
            <h2 id="pol-alteracoes">Alterações desta política</h2>
            <p>
              Esta política pode ser atualizada quando houver mudança nos
              serviços, na tecnologia do site ou na legislação. A data da última
              atualização fica sempre no início da página. Mudança que amplie o
              tratamento de dados será informada antes de entrar em vigor, e
              nenhuma nova ferramenta de medição ou de publicidade é carregada
              sem consentimento afirmativo. A atualização de 7 de outubro de 2026
              registra a adoção da tag do Google Ads, submetida a esse mesmo
              aviso de escolha.
            </p>
          </section>

          <Link className="areas__voltar" href="/">
            <Pictograma nome="seta" tamanho={12} />
            <span>Voltar para a página inicial</span>
          </Link>
        </div>
      </main>

      <SiteFooter />
      <BarraContato />
      <Retrorreflexao />
    </>
  );
}
