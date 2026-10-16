import type { Metadata } from "next";
import Link from "next/link";
import { BarraContato } from "@/components/BarraContato";
import { Pictograma } from "@/components/Pictograma";
import { Retrorreflexao } from "@/components/Retrorreflexao";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { metadataDaRota, siteUrl } from "@/content/site";
import { siteContactLinks, criarLinkWhatsApp } from "@/lib/contact";

export const metadata: Metadata = metadataDaRota({
  path: "/guincho-lapa-sp",
  title: "Guincho na Lapa SP — Atendimento Rápido e Plataforma | ME Guinchos",
  description:
    "Guincho na Lapa em São Paulo. Caminhão-plataforma com base ao lado, na Vila Anastácio. Atendimento ágil para carros, vans e empilhadeiras. Fale pelo WhatsApp.",
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
      name: "Guincho na Lapa",
      item: `${siteUrl}/guincho-lapa-sp`,
    },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  name: "Guincho na Lapa — ME Guinchos",
  description:
    "Serviço de reboque e guincho plataforma para carros, vans e máquinas na Lapa, Alto da Lapa, Lapa de Baixo e Vila Anastácio em São Paulo.",
  url: `${siteUrl}/guincho-lapa-sp`,
  telephone: "+5511930299233",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rua Martinho de Campos, 538",
    addressLocality: "São Paulo",
    addressRegion: "SP",
    postalCode: "05093-050",
    addressCountry: "BR",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
  ],
};

const whatsappUrl = criarLinkWhatsApp(
  "Olá! Preciso de um guincho na região da Lapa em São Paulo.",
);

export default function GuinchoLapaSpPage() {
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
                Guincho na Lapa
              </li>
            </ol>
          </nav>

          <header className="mb-8">
            <div className="inline-block bg-[var(--azul)] text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded mb-3">
              Base Operacional Vizinha à Lapa
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--azul-noite)] tracking-tight">
              Guincho na Lapa — São Paulo
            </h1>
            <p className="areas__lead">
              Atendimento ágil com caminhão-plataforma na <strong>Lapa, Alto da Lapa, Lapa de Baixo, Vila Romana e Vila Ipojuca</strong>.
              Nossa base operacional fica na Vila Anastácio, garantindo deslocamento imediato pelas principais avenidas do bairro.
            </p>
          </header>

          <div className="areas__acoes mb-10" role="group" aria-label="Ações de contato prioritárias">
            <a
              className="acao acao--whatsapp"
              href={whatsappUrl}
              data-tracking-location="sitelink_lapa_hero_wa"
            >
              <Pictograma nome="whatsapp" tamanho={22} />
              <span>Chamar Guincho na Lapa</span>
              <Pictograma nome="seta" tamanho={13} className="acao__seta" />
            </a>
            <a
              className="acao acao--ligar"
              href={siteContactLinks.phoneHref}
              data-tracking-location="sitelink_lapa_hero_phone"
            >
              <Pictograma nome="telefone" tamanho={20} />
              <span>Ligar {siteContactLinks.phoneDisplay}</span>
              <Pictograma nome="seta" tamanho={13} className="acao__seta" />
            </a>
          </div>

          <section className="mb-12">
            <div className="titulo-secao mb-4">
              <h2>Cobertura nos principais pontos e vias da Lapa</h2>
              <p>
                Por estarmos sediados a poucos minutos da Lapa, temos circulação constante e conhecimento profundo das vias da região:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Vias de trânsito rápido e corredores
                </h3>
                <ul className="space-y-1.5 text-sm font-semibold text-[var(--azul-noite)]">
                  <li>• Rua Clélia e Rua Guaicurus</li>
                  <li>• Rua Doze de Outubro e entorno do Shopping Lapa</li>
                  <li>• Rua Faustolo, Rua Scipião e Rua Catão</li>
                  <li>• Viaduto da Lapa e Viaduto Comendador Elias Nagib Breim</li>
                  <li>• Acesso expresso à Marginal Tietê e Ponte da Lapa</li>
                </ul>
              </div>

              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Polos comerciais e setores atendidos
                </h3>
                <ul className="space-y-1.5 text-sm font-semibold text-[var(--azul-noite)]">
                  <li>• Lapa de Baixo e galpões industriais</li>
                  <li>• Alto da Lapa e região residencial</li>
                  <li>• Estações da Lapa (Linha 7-Rubi e Linha 8-Diamante)</li>
                  <li>• Mercado Municipal da Lapa e Poupatempo</li>
                  <li>• Conexão com Barra Funda, Perdizes e Pompéia</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="titulo-secao mb-4">
              <h2>Serviços disponíveis para a região da Lapa</h2>
              <p>
                Equipamento próprio para atender chamados urgentes e demandas comerciais:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <div className="text-[var(--azul)] mb-3">
                  <Pictograma nome="guincho" tamanho={32} />
                </div>
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Carros de passeio e SUVs
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm">
                  Resgate imediato para veículos em pane, pneu furado, bateria descarregada ou envolvidos em colisões na Lapa.
                </p>
              </div>

              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <div className="text-[var(--azul)] mb-3">
                  <Pictograma nome="van" tamanho={32} />
                </div>
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Vans e furgões comerciais
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm">
                  Suporte rápido para veículos de entrega e logística comercial que circulam pelos centros de distribuição da Zona Oeste.
                </p>
              </div>

              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <div className="text-[var(--azul)] mb-3">
                  <Pictograma nome="empilhadeira" tamanho={32} />
                </div>
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Empilhadeiras e maquinário
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm">
                  Transporte em prancha reforçada para galpões e indústrias da Lapa de Baixo, além de movimentação com empilhadeira própria.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="placa placa--azul p-8 rounded-xl" data-placa="azul">
              <h2 className="text-2xl font-black mb-3">Horário de atendimento na Lapa</h2>
              <p className="mb-4 text-white/90">
                Operamos <strong>24 horas por dia, 7 dias por semana</strong>, inclusive domingos, feriados e madrugadas.
              </p>
              <p className="text-white/80 text-sm mb-6">
                Pagamentos facilitados: aceitamos Pix instantâneo, cartões de crédito/débito e dinheiro diretamente no caminhão.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  className="acao acao--whatsapp"
                  href={whatsappUrl}
                  data-tracking-location="sitelink_lapa_closing_wa"
                >
                  <Pictograma nome="whatsapp" tamanho={22} />
                  <span>Pedir Guincho na Lapa</span>
                  <Pictograma nome="seta" tamanho={13} className="acao__seta" />
                </a>
                <a
                  className="acao acao--ligar"
                  href={siteContactLinks.phoneHref}
                  data-tracking-location="sitelink_lapa_closing_phone"
                >
                  <Pictograma nome="telefone" tamanho={20} />
                  <span>Ligar {siteContactLinks.phoneDisplay}</span>
                  <Pictograma nome="seta" tamanho={13} className="acao__seta" />
                </a>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="titulo-secao mb-6">
              <h2>Perguntas frequentes sobre o guincho na Lapa</h2>
            </div>

            <div className="space-y-4">
              <div className="placa placa--branca p-5 rounded-lg" data-placa="branca">
                <h3 className="text-base font-bold text-[var(--azul-noite)] mb-1">
                  Quanto tempo demora para o caminhão chegar na Lapa?
                </h3>
                <p className="text-sm text-[var(--grafite-medio)]">
                  Como nossa base fica na Vila Anastácio (bairro vizinho colado à Lapa), nosso tempo de deslocamento costuma ser muito rápido, variando apenas de acordo com o fluxo de trânsito momentâneo nas vias principais como Rua Clélia e Marginal Tietê.
                </p>
              </div>

              <div className="placa placa--branca p-5 rounded-lg" data-placa="branca">
                <h3 className="text-base font-bold text-[var(--azul-noite)] mb-1">
                  Vocês atendem veículos no Alto da Lapa e Vila Romana?
                </h3>
                <p className="text-sm text-[var(--grafite-medio)]">
                  Sim! Cobrimos toda a região da Lapa, incluindo Alto da Lapa, Lapa de Baixo, Vila Ipojuca, Vila Romana, Siciliano e imediações do Viaduto da Lapa.
                </p>
              </div>

              <div className="placa placa--branca p-5 rounded-lg" data-placa="branca">
                <h3 className="text-base font-bold text-[var(--azul-noite)] mb-1">
                  Para onde o veículo pode ser levado?
                </h3>
                <p className="text-sm text-[var(--grafite-medio)]">
                  Para o destino que você escolher: oficinas mecânicas da região, concessionárias da Zona Oeste, sua residência ou qualquer outro bairro de São Paulo.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-[var(--azul-noite)] mb-3">
              Bairros e rotas vizinhas
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/guincho-vila-anastacio"
                className="placa placa--branca px-4 py-2 text-sm font-bold text-[var(--azul)] hover:underline inline-flex items-center gap-2"
              >
                <span>Guincho na Vila Anastácio</span>
                <Pictograma nome="seta" tamanho={12} />
              </Link>
              <Link
                href="/guincho-marginal-tiete"
                className="placa placa--branca px-4 py-2 text-sm font-bold text-[var(--azul)] hover:underline inline-flex items-center gap-2"
              >
                <span>Guincho na Marginal Tietê</span>
                <Pictograma nome="seta" tamanho={12} />
              </Link>
              <Link
                href="/guincho-zona-oeste-sp"
                className="placa placa--branca px-4 py-2 text-sm font-bold text-[var(--azul)] hover:underline inline-flex items-center gap-2"
              >
                <span>Guincho na Zona Oeste de SP</span>
                <Pictograma nome="seta" tamanho={12} />
              </Link>
              <Link
                href="/solicitar-orcamento"
                className="placa placa--branca px-4 py-2 text-sm font-bold text-[var(--azul)] hover:underline inline-flex items-center gap-2"
              >
                <span>Solicitar Orçamento</span>
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
