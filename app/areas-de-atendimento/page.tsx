import type { Metadata } from "next";
import Link from "next/link";
import { BarraContato } from "@/components/BarraContato";
import { Pictograma } from "@/components/Pictograma";
import { Retrorreflexao } from "@/components/Retrorreflexao";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { coverageContent } from "@/content/site";
import { previewContactLinks } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Áreas para consulta | Prévia ME Guinchos",
  description:
    "Regiões indicadas em mapa para consulta de atendimento da ME Guinchos.",
  robots: { index: false, follow: false },
};

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
            <a className="acao acao--whatsapp" href={previewContactLinks.whatsappHref}>
              <Pictograma nome="whatsapp" tamanho={22} />
              <span>Consultar pelo WhatsApp</span>
              <Pictograma nome="seta" tamanho={13} className="acao__seta" />
            </a>
            <a className="acao acao--ligar" href={previewContactLinks.phoneHref}>
              <Pictograma nome="telefone" tamanho={20} />
              <span>Ligar {previewContactLinks.phoneDisplay}</span>
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
