import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BarraContato } from "@/components/BarraContato";
import { Pictograma } from "@/components/Pictograma";
import { Retrorreflexao } from "@/components/Retrorreflexao";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { metadataDaRota, siteUrl } from "@/content/site";
import { siteContactLinks, criarLinkWhatsApp } from "@/lib/contact";
import guinchoTresVeiculos from "@/public/images/operacoes/guincho-tres-veiculos.webp";

export const metadata: Metadata = metadataDaRota({
  path: "/guincho-24-horas",
  title: "Guincho 24 Horas em São Paulo — Atendimento Imediato e Noturno | ME Guinchos",
  description:
    "Precisa de guincho 24 horas em São Paulo? Atendimento ágil dia e noite com caminhão-plataforma para carros, vans e motos na Zona Oeste. Chame no WhatsApp.",
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
      name: "Guincho 24 Horas",
      item: `${siteUrl}/guincho-24-horas`,
    },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "EmergencyService",
  name: "ME Guinchos — Atendimento de Guincho 24 Horas em São Paulo",
  description:
    "Serviço de guincho 24 horas com caminhão-plataforma para socorro mecânico, pane e transporte de veículos dia e noite na Zona Oeste e Grande São Paulo.",
  url: `${siteUrl}/guincho-24-horas`,
  telephone: "+5511930299233",
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
  areaServed: {
    "@type": "City",
    name: "São Paulo",
  },
};

const whatsappUrl = criarLinkWhatsApp(
  "Olá! Preciso de atendimento com guincho em São Paulo.",
);

export default function Guincho24HorasPage() {
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
                Guincho 24 Horas
              </li>
            </ol>
          </nav>

          <header className="mb-8">
            <div className="inline-block bg-[var(--azul)] text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded mb-3">
              Atendimento 24 Horas — 7 Dias por Semana
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--azul-noite)] tracking-tight">
              Guincho 24 Horas em São Paulo
            </h1>
            <p className="areas__lead">
              Precisa de guincho 24 horas em São Paulo? A ME Guinchos conta com equipe escalada dia e noite,
              operando de <strong>domingo a domingo, 24 horas por dia</strong>, inclusive na madrugada, feriados e fins de semana,
              garantindo socorro ágil com caminhão-plataforma na Zona Oeste e principais vias da capital.
            </p>
          </header>

          <div className="areas__acoes mb-10" role="group" aria-label="Ações de contato prioritárias">
            <a
              className="acao acao--whatsapp"
              href={whatsappUrl}
              data-tracking-location="sitelink_24h_hero_wa"
            >
              <Pictograma nome="whatsapp" tamanho={22} />
              <span>Chamar no WhatsApp</span>
              <Pictograma nome="seta" tamanho={13} className="acao__seta" />
            </a>
            <a
              className="acao acao--ligar"
              href={siteContactLinks.phoneHref}
              data-tracking-location="sitelink_24h_hero_phone"
            >
              <Pictograma nome="telefone" tamanho={20} />
              <span>Ligar {siteContactLinks.phoneDisplay}</span>
              <Pictograma nome="seta" tamanho={13} className="acao__seta" />
            </a>
          </div>

          <div className="mb-12 overflow-hidden rounded-xl border border-[var(--linha)]">
            <Image
              src={guinchoTresVeiculos}
              alt="Caminhão plataforma da ME Guinchos preparado para socorro e transporte na Zona Oeste de São Paulo."
              className="w-full h-auto object-cover max-h-[380px]"
              priority
            />
          </div>

          <section className="mb-12">
            <div className="titulo-secao mb-4">
              <h2>Situações em que você pode solicitar atendimento</h2>
              <p>
                Socorro automotivo com equipamento moderno e amarração técnica para não danificar o seu patrimônio:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <div className="text-[var(--azul)] mb-3">
                  <Pictograma nome="guincho" tamanho={32} />
                </div>
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Pane mecânica ou elétrica
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm">
                  Superaquecimento, correia partida, pane de injeção ou bateria sem carga. Transporte direto para a oficina de sua confiança ou concessionária.
                </p>
              </div>

              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <div className="text-[var(--azul)] mb-3">
                  <Pictograma nome="carga" tamanho={32} />
                </div>
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Colisão ou avaria
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm">
                  Veículo impossibilitado de rodar após colisão leve ou impacto em via. Plataforma hidráulica com guincho redutor para subida suave.
                </p>
              </div>

              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <div className="text-[var(--azul)] mb-3">
                  <Pictograma nome="van" tamanho={32} />
                </div>
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Vans e utilitários
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm">
                  Plataforma reforçada para transporte de utilitários leves e furgões comerciais. Avaliação das dimensões no momento do chamado.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="titulo-secao mb-4">
              <h2>Como agilizar o seu socorro pelo WhatsApp</h2>
              <p>
                Quanto mais precisos forem os dados informados, mais rápido o caminhão chega até você:
              </p>
            </div>

            <ol className="acionamento__passos">
              <li className="placa placa--branca passo" data-placa="branca">
                <span className="passo__numero">1</span>
                <h3>Envie a localização exata</h3>
                <p>
                  Mande a localização em tempo real pelo WhatsApp ou informe a rua, número aproximado e ponto de referência.
                </p>
              </li>
              <li className="placa placa--branca passo" data-placa="branca">
                <span className="passo__numero">2</span>
                <h3>Diga o modelo do veículo</h3>
                <p>
                  Informe a marca, modelo e se as rodas estão esterçando ou travadas para o operador preparar os acessórios adequados.
                </p>
              </li>
              <li className="placa placa--branca passo" data-placa="branca">
                <span className="passo__numero">3</span>
                <h3>Indique o endereço de entrega</h3>
                <p>
                  Defina o endereço final (oficina, autoelétrica, residência ou pátio) para fechamento do valor sem surpresas.
                </p>
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <div className="placa placa--azul p-8 rounded-xl" data-placa="azul">
              <h2 className="text-2xl font-black mb-3">Atendimento e formas de pagamento</h2>
              <p className="mb-4 text-white/90">
                Atendimento prestado <strong>24 horas por dia, 7 dias por semana</strong>, inclusive aos sábados, domingos e feriados.
              </p>
              <p className="text-white/80 text-sm mb-6">
                Pagamento facilitado via Pix, cartões de crédito e débito das principais bandeiras ou dinheiro com o operador.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  className="acao acao--whatsapp"
                  href={whatsappUrl}
                  data-tracking-location="sitelink_24h_closing_wa"
                >
                  <Pictograma nome="whatsapp" tamanho={22} />
                  <span>Consultar pelo WhatsApp</span>
                  <Pictograma nome="seta" tamanho={13} className="acao__seta" />
                </a>
                <a
                  className="acao acao--ligar"
                  href={siteContactLinks.phoneHref}
                  data-tracking-location="sitelink_24h_closing_phone"
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
              <h2>Perguntas frequentes sobre o atendimento</h2>
            </div>

            <div className="space-y-4">
              <div className="placa placa--branca p-5 rounded-lg" data-placa="branca">
                <h3 className="text-base font-bold text-[var(--azul-noite)] mb-1">
                  A ME Guinchos atende durante a madrugada e feriados (24 horas)?
                </h3>
                <p className="text-sm text-[var(--grafite-medio)]">
                  Sim! Operamos com plantão <strong>24 horas ininterrupto, todos os dias da semana</strong>. Nossa equipe conta com motoristas escalados para atender emergências a qualquer hora do dia ou da noite na Zona Oeste e vias expressas de São Paulo.
                </p>
              </div>

              <div className="placa placa--branca p-5 rounded-lg" data-placa="branca">
                <h3 className="text-base font-bold text-[var(--azul-noite)] mb-1">
                  Qual é o raio de cobertura do guincho?
                </h3>
                <p className="text-sm text-[var(--grafite-medio)]">
                  Atendemos um raio aproximado de 20 km a partir da Zona Oeste de São Paulo (Vila Anastácio, Lapa, Barra Funda, Pinheiros, Perdizes, Pompéia, Jaguaré, Butantã e Osasco), além dos eixos da Marginal Tietê e Pinheiros.
                </p>
              </div>

              <div className="placa placa--branca p-5 rounded-lg" data-placa="branca">
                <h3 className="text-base font-bold text-[var(--azul-noite)] mb-1">
                  Posso acompanhar o transporte dentro da cabine do caminhão?
                </h3>
                <p className="text-sm text-[var(--grafite-medio)]">
                  Sim! Nossos caminhões-plataforma contam com espaço para passageiro acompanhar o transporte até o destino com total segurança.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-[var(--azul-noite)] mb-3">
              Consulte outros serviços e regiões
            </h2>
            <div className="flex flex-wrap gap-3">
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
