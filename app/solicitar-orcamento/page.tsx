import type { Metadata } from "next";
import Link from "next/link";
import { BarraContato } from "@/components/BarraContato";
import { FormularioOrcamento } from "@/components/FormularioOrcamento";
import { Pictograma } from "@/components/Pictograma";
import { Retrorreflexao } from "@/components/Retrorreflexao";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { metadataDaRota, siteUrl } from "@/content/site";
import { siteContactLinks, criarLinkWhatsApp } from "@/lib/contact";

export const metadata: Metadata = metadataDaRota({
  path: "/solicitar-orcamento",
  title: "Solicite um Orçamento de Guincho em São Paulo | ME Guinchos",
  description:
    "Fale com a equipe da ME Guinchos e consulte valores pelo WhatsApp. Preço justo, caminhão-plataforma e atendimento 24 horas em São Paulo, todos os dias.",
});

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Início",
      item: siteUrl,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Solicitar Orçamento",
      item: `${siteUrl}/solicitar-orcamento`,
    },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Orçamento de Guincho e Reboque",
  provider: {
    "@type": "LocalBusiness",
    name: "ME Guinchos",
    telephone: "+5511930299233",
    url: siteUrl,
  },
  description:
    "Cotação rápida e sem intermediários para atendimento de guincho plataforma para veículos leves, utilitários e empilhadeiras em São Paulo.",
  areaServed: {
    "@type": "City",
    name: "São Paulo",
  },
};

const whatsappDireto = criarLinkWhatsApp(
  "Olá! Gostaria de consultar um orçamento de guincho com a equipe da ME Guinchos.",
);

export default function SolicitarOrcamentoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <a className="atalho-conteudo" href="#conteudo">
        Pular para o conteúdo
      </a>

      <SiteHeader />

      <main className="areas" id="conteudo">
        <div className="page-shell">
          <nav aria-label="Navegação estrutural" className="mb-6 text-sm text-[var(--grafite-medio)]">
            <ol className="flex items-center gap-2 flex-wrap">
              <li>
                <Link href="/" className="hover:underline text-[var(--azul)] font-bold">
                  Início
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-[var(--azul-noite)] font-bold">
                Solicitar Orçamento
              </li>
            </ol>
          </nav>

          <header className="mb-8 text-center max-w-2xl mx-auto">
            <div className="inline-block bg-[var(--azul)] text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded mb-3">
              Cotação Direta e Sem Intermediários
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--azul-noite)] tracking-tight">
              Solicite um Orçamento de Guincho
            </h1>
            <p className="areas__lead mt-2">
              Fale diretamente com nossa equipe operacional. Preencha o formulário para enviar os dados
              prontos pelo WhatsApp ou ligue para atendimento imediato.
            </p>
          </header>

          <div className="areas__acoes mb-10 max-w-xl mx-auto" role="group" aria-label="Ações de contato rápidas">
            <a
              className="acao acao--whatsapp"
              href={whatsappDireto}
              data-tracking-location="sitelink_orcamento_hero_wa"
            >
              <Pictograma nome="whatsapp" tamanho={22} />
              <span>Chamar Direto no WhatsApp</span>
              <Pictograma nome="seta" tamanho={13} className="acao__seta" />
            </a>
            <a
              className="acao acao--ligar"
              href={siteContactLinks.phoneHref}
              data-tracking-location="sitelink_orcamento_hero_phone"
            >
              <Pictograma nome="telefone" tamanho={20} />
              <span>Ligar {siteContactLinks.phoneDisplay}</span>
              <Pictograma nome="seta" tamanho={13} className="acao__seta" />
            </a>
          </div>

          <div className="mb-14">
            <FormularioOrcamento />
          </div>

          <section className="mb-12">
            <div className="titulo-secao mb-4 text-center max-w-xl mx-auto">
              <h2>O que é considerado no cálculo do seu orçamento</h2>
              <p>
                Trabalhamos com transparência: o valor é composto de forma clara para que você não tenha surpresas:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <div className="text-[var(--azul)] mb-3">
                  <Pictograma nome="local" tamanho={30} />
                </div>
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Distância do trajeto
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm">
                  Quilometragem entre o ponto de partida e o destino final da remoção em São Paulo e cidades vizinhas.
                </p>
              </div>

              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <div className="text-[var(--azul)] mb-3">
                  <Pictograma nome="guincho" tamanho={30} />
                </div>
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Porte e tipo de veículo
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm">
                  Se é um carro compacto, sedã, SUV grande, van comercial, empilhadeira ou máquina pesada.
                </p>
              </div>

              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <div className="text-[var(--azul)] mb-3">
                  <Pictograma nome="carga" tamanho={30} />
                </div>
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Complexidade do resgate
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm">
                  Situações como rodas travadas, sem chave, colisão ou saída de subsolo que demandam equipamentos auxiliares.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="placa placa--azul p-8 rounded-xl" data-placa="azul">
              <h2 className="text-2xl font-black mb-3">Horário de funcionamento e pagamento</h2>
              <p className="mb-4 text-white/90">
                Atendimento <strong>24 horas por dia, 7 dias por semana</strong>, inclusive domingos, feriados e madrugadas.
              </p>
              <p className="text-white/80 text-sm mb-6">
                Aceitamos Pix, cartões de crédito e débito das principais bandeiras e pagamento em dinheiro no local.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  className="acao acao--whatsapp"
                  href={whatsappDireto}
                  data-tracking-location="sitelink_orcamento_closing_wa"
                >
                  <Pictograma nome="whatsapp" tamanho={22} />
                  <span>Falar com Atendente</span>
                  <Pictograma nome="seta" tamanho={13} className="acao__seta" />
                </a>
                <a
                  className="acao acao--ligar"
                  href={siteContactLinks.phoneHref}
                  data-tracking-location="sitelink_orcamento_closing_phone"
                >
                  <Pictograma nome="telefone" tamanho={20} />
                  <span>Ligar {siteContactLinks.phoneDisplay}</span>
                  <Pictograma nome="seta" tamanho={13} className="acao__seta" />
                </a>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-[var(--azul-noite)] mb-3">
              Outros links úteis
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/guincho-24-horas"
                className="placa placa--branca px-4 py-2 text-sm font-bold text-[var(--azul)] hover:underline inline-flex items-center gap-2"
              >
                <span>Guincho 24 Horas</span>
                <Pictograma nome="seta" tamanho={12} />
              </Link>
              <Link
                href="/transporte-de-veiculos"
                className="placa placa--branca px-4 py-2 text-sm font-bold text-[var(--azul)] hover:underline inline-flex items-center gap-2"
              >
                <span>Transporte de Veículos</span>
                <Pictograma nome="seta" tamanho={12} />
              </Link>
              <Link
                href="/servicos-de-reboque"
                className="placa placa--branca px-4 py-2 text-sm font-bold text-[var(--azul)] hover:underline inline-flex items-center gap-2"
              >
                <span>Serviços de Reboque</span>
                <Pictograma nome="seta" tamanho={12} />
              </Link>
              <Link
                href="/guincho-lapa-sp"
                className="placa placa--branca px-4 py-2 text-sm font-bold text-[var(--azul)] hover:underline inline-flex items-center gap-2"
              >
                <span>Guincho na Lapa</span>
                <Pictograma nome="seta" tamanho={12} />
              </Link>
            </div>
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
