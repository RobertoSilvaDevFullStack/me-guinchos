import type { Metadata } from "next";
import Link from "next/link";
import { BarraContato } from "@/components/BarraContato";
import { Pictograma } from "@/components/Pictograma";
import { Retrorreflexao } from "@/components/Retrorreflexao";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { coverageContent, metadataDaRota } from "@/content/site";
import { siteContactLinks } from "@/lib/contact";

// Canonical, Open Graph e título definitivos; `robots` continua `noindex`
// enquanto `INDEXACAO_LIBERADA` for `false` em `content/site.ts`.
export const metadata: Metadata = metadataDaRota({
  path: "/areas-de-atendimento",
  title: "Áreas de atendimento | ME Guinchos",
  description:
    "Regiões de referência para consulta de atendimento da ME Guinchos, a partir da zona oeste de São Paulo. Confirme o endereço e o trecho antes de fechar o serviço.",
});

export default function AreasDeAtendimentoPage() {
  return (
    <>
      <a className="atalho-conteudo" href="#conteudo">
        Pular para o conteúdo
      </a>

      <SiteHeader />

      <main className="areas" id="conteudo">
        <div className="page-shell">
          <h1>Confirme o atendimento para o seu endereço.</h1>
          <p className="areas__lead">{coverageContent.summary}</p>

          <ul className="areas__grade">
            {coverageContent.places.map((local) => (
              <li
                className="placa placa--branca areas__local"
                data-placa="branca"
                key={local}
              >
                <Pictograma nome="local" tamanho={20} />
                <span>{local}</span>
              </li>
            ))}
          </ul>

          <p className="areas__nota">
            A presença de uma localidade nesta lista não significa cobertura
            integral. Rodovias e limites por trecho ainda não foram definidos.
            Informe o endereço e o serviço necessário para consultar a
            possibilidade de atendimento.
          </p>

          <div className="areas__acoes" role="group" aria-label="Formas de contato">
            <a className="acao acao--whatsapp" href={siteContactLinks.whatsappHref}>
              <Pictograma nome="whatsapp" tamanho={22} />
              <span>Consultar pelo WhatsApp</span>
              <Pictograma nome="seta" tamanho={13} className="acao__seta" />
            </a>
            <a className="acao acao--ligar" href={siteContactLinks.phoneHref}>
              <Pictograma nome="telefone" tamanho={20} />
              <span>Ligar {siteContactLinks.phoneDisplay}</span>
              <Pictograma nome="seta" tamanho={13} className="acao__seta" />
            </a>
          </div>

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
