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
import guinchoPlataformaGrande from "@/public/images/operacoes/guincho-plataforma-grande.webp";

export const metadata: Metadata = metadataDaRota({
  path: "/servicos-de-reboque",
  title: "Serviços de Reboque em São Paulo — Socorro com Plataforma | ME Guinchos",
  description:
    "Serviços de reboque em São Paulo para socorro emergencial em panes, colisões e imobilizações. Plataforma com guincho redutor na Zona Oeste. Chame pelo WhatsApp.",
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
      name: "Serviços de Reboque",
      item: `${siteUrl}/servicos-de-reboque`,
    },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "EmergencyService",
  name: "Serviços de Reboque e Socorro Veicular",
  provider: {
    "@type": "LocalBusiness",
    name: "ME Guinchos",
    telephone: "+5511930299233",
    url: siteUrl,
  },
  description:
    "Serviço de reboque emergencial para resgate de veículos quebrados, acidentados ou imobilizados em vias públicas e rodovias na Zona Oeste de São Paulo.",
  areaServed: {
    "@type": "City",
    name: "São Paulo",
  },
};

const whatsappUrl = criarLinkWhatsApp(
  "Olá! Preciso de um serviço de reboque emergencial em São Paulo.",
);

export default function ServicosDeReboquePage() {
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
                Serviços de Reboque
              </li>
            </ol>
          </nav>

          <header className="mb-8">
            <div className="inline-block bg-[var(--azul)] text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded mb-3">
              Socorro e Resgate na Via
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--azul-noite)] tracking-tight">
              Serviços de Reboque em São Paulo
            </h1>
            <p className="areas__lead">
              Socorro emergencial com <strong>caminhão-plataforma e guincho redutor hidráulico</strong> para resgate
              de veículos quebrados, acidentados ou imobilizados em ruas, avenidas e rodovias da Zona Oeste e Grande São Paulo.
            </p>
          </header>

          <div className="areas__acoes mb-10" role="group" aria-label="Ações de contato prioritárias">
            <a
              className="acao acao--whatsapp"
              href={whatsappUrl}
              data-tracking-location="sitelink_reboque_hero_wa"
            >
              <Pictograma nome="whatsapp" tamanho={22} />
              <span>Chamar Reboque no WhatsApp</span>
              <Pictograma nome="seta" tamanho={13} className="acao__seta" />
            </a>
            <a
              className="acao acao--ligar"
              href={siteContactLinks.phoneHref}
              data-tracking-location="sitelink_reboque_hero_phone"
            >
              <Pictograma nome="telefone" tamanho={20} />
              <span>Ligar {siteContactLinks.phoneDisplay}</span>
              <Pictograma nome="seta" tamanho={13} className="acao__seta" />
            </a>
          </div>

          <div className="mb-12 overflow-hidden rounded-xl border border-[var(--linha)]">
            <Image
              src={guinchoPlataformaGrande}
              alt="Caminhão plataforma da ME Guinchos preparado para reboque e desobstrução de veículos em São Paulo."
              className="w-full h-auto object-cover max-h-[380px]"
              priority
            />
          </div>

          <section className="mb-12">
            <div className="titulo-secao mb-4">
              <h2>Situações em que o reboque é necessário</h2>
              <p>
                Diferente do transporte de agendamento, o reboque atua quando o veículo perde a capacidade de rodar por meios próprios:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <div className="text-[var(--azul)] mb-3">
                  <Pictograma nome="guincho" tamanho={32} />
                </div>
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Panes mecânicas e superaquecimento
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm">
                  Rompimento de mangueira, vazamento de fluido, quebra de homocinética ou embreagem danificada que impede a tração.
                </p>
              </div>

              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <div className="text-[var(--azul)] mb-3">
                  <Pictograma nome="carga" tamanho={32} />
                </div>
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Acidentes e colisões de trânsito
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm">
                  Retirada rápida de veículos da via com guincho hidráulico para desobstrução de faixas e liberação do tráfego com segurança.
                </p>
              </div>

              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <div className="text-[var(--azul)] mb-3">
                  <Pictograma nome="van" tamanho={32} />
                </div>
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Rodas travadas ou pneus estourados
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm">
                  Içamento assistido por cabo de aço e patins auxiliares que evitam danos ao rodado e à lataria durante a subida na prancha.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="titulo-secao mb-4">
              <h2>O que você deve informar para agilizar o resgate</h2>
              <p>
                Para que o operador chegue com o caminhão e os equipamentos exatos para a situação:
              </p>
            </div>

            <ol className="acionamento__passos">
              <li className="placa placa--branca passo" data-placa="branca">
                <span className="passo__numero">1</span>
                <h3>Ponto de referência e localização</h3>
                <p>
                  Informe a via, sentido da pista (caso esteja em avenida ou Marginal) e um ponto conhecido próximo.
                </p>
              </li>
              <li className="placa placa--branca passo" data-placa="branca">
                <span className="passo__numero">2</span>
                <h3>Estado das rodas e da direção</h3>
                <p>
                  Diga se a direção está destravada e se o câmbio pode ser colocado em ponto morto (neutro).
                </p>
              </li>
              <li className="placa placa--branca passo" data-placa="branca">
                <span className="passo__numero">3</span>
                <h3>Oficina ou local de descarregamento</h3>
                <p>
                  Defina o endereço para onde o veículo deve ser levado após o resgate.
                </p>
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <div className="placa placa--azul p-8 rounded-xl" data-placa="azul">
              <h2 className="text-2xl font-black mb-3">Horário de operação e pagamento</h2>
              <p className="mb-4 text-white/90">
                Atendimento prestado <strong>24 horas por dia, 7 dias por semana</strong>, inclusive fins de semana, feriados e madrugadas.
              </p>
              <p className="text-white/80 text-sm mb-6">
                Aceitamos Pix instantâneo, cartões de crédito e débito das principais bandeiras e dinheiro diretamente ao operador no local.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  className="acao acao--whatsapp"
                  href={whatsappUrl}
                  data-tracking-location="sitelink_reboque_closing_wa"
                >
                  <Pictograma nome="whatsapp" tamanho={22} />
                  <span>Pedir Reboque pelo WhatsApp</span>
                  <Pictograma nome="seta" tamanho={13} className="acao__seta" />
                </a>
                <a
                  className="acao acao--ligar"
                  href={siteContactLinks.phoneHref}
                  data-tracking-location="sitelink_reboque_closing_phone"
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
              <h2>Perguntas frequentes sobre serviços de reboque</h2>
            </div>

            <div className="space-y-4">
              <div className="placa placa--branca p-5 rounded-lg" data-placa="branca">
                <h3 className="text-base font-bold text-[var(--azul-noite)] mb-1">
                  Qual a diferença entre guincho plataforma e reboque tradicional?
                </h3>
                <p className="text-sm text-[var(--grafite-medio)]">
                  O reboque tradicional puxa o veículo com duas rodas arrastando no chão (tipo asa-delta), o que pode danificar o para-choque, a suspensão e o câmbio. Na ME Guinchos, utilizamos caminhão-plataforma hidráulica: o veículo é içado e viaja 100% sobre a prancha de aço, sem nenhum desgaste.
                </p>
              </div>

              <div className="placa placa--branca p-5 rounded-lg" data-placa="branca">
                <h3 className="text-base font-bold text-[var(--azul-noite)] mb-1">
                  Vocês rebocam carros automáticos ou elétricos?
                </h3>
                <p className="text-sm text-[var(--grafite-medio)]">
                  Sim. Veículos com câmbio automático ou tração integral elétrica exigem obrigatoriamente transporte em plataforma plana sem arrasto. Nosso equipamento atende rigorosamente a essa especificação dos fabricantes.
                </p>
              </div>

              <div className="placa placa--branca p-5 rounded-lg" data-placa="branca">
                <h3 className="text-base font-bold text-[var(--azul-noite)] mb-1">
                  O que fazer enquanto espero o reboque na rua ou rodovia?
                </h3>
                <p className="text-sm text-[var(--grafite-medio)]">
                  Ligue o pisca-alerta, posicione o triângulo a uma distância segura (mínimo de 30 passos largos) e permaneça em local seguro fora da pista, preferencialmente atrás da mureta ou calçada.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-[var(--azul-noite)] mb-3">
              Veja outras páginas de atendimento
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
                href="/guincho-24-horas"
                className="placa placa--branca px-4 py-2 text-sm font-bold text-[var(--azul)] hover:underline inline-flex items-center gap-2"
              >
                <span>Guincho 24 Horas</span>
                <Pictograma nome="seta" tamanho={12} />
              </Link>
              <Link
                href="/solicitar-orcamento"
                className="placa placa--branca px-4 py-2 text-sm font-bold text-[var(--azul)] hover:underline inline-flex items-center gap-2"
              >
                <span>Solicitar Orçamento</span>
                <Pictograma nome="seta" tamanho={12} />
              </Link>
              <Link
                href="/guincho-marginal-tiete"
                className="placa placa--branca px-4 py-2 text-sm font-bold text-[var(--azul)] hover:underline inline-flex items-center gap-2"
              >
                <span>Guincho na Marginal Tietê</span>
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
