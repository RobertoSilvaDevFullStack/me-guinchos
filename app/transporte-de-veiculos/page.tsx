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
import guinchoCarroLuxo from "@/public/images/operacoes/guincho-carro-luxo.webp";

export const metadata: Metadata = metadataDaRota({
  path: "/transporte-de-veiculos",
  title: "Transporte de Veículos em São Paulo — Plataforma Hidráulica | ME Guinchos",
  description:
    "Transporte de veículos em caminhão-plataforma em São Paulo. Remoção e translado seguro para carros de passeio, SUVs, utilitários e carros de luxo. Consulte disponibilidade.",
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
      name: "Transporte de Veículos",
      item: `${siteUrl}/transporte-de-veiculos`,
    },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Transporte de Veículos em Plataforma Hidráulica",
  provider: {
    "@type": "LocalBusiness",
    name: "ME Guinchos",
    telephone: "+5511930299233",
    url: siteUrl,
  },
  description:
    "Serviço de transporte técnico de veículos leves, utilitários, furgões e carros especiais com plataforma hidráulica sem arraste em São Paulo.",
  areaServed: {
    "@type": "City",
    name: "São Paulo",
  },
};

const whatsappUrl = criarLinkWhatsApp(
  "Olá! Gostaria de consultar o transporte de um veículo em São Paulo.",
);

export default function TransporteDeVeiculosPage() {
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
                Transporte de Veículos
              </li>
            </ol>
          </nav>

          <header className="mb-8">
            <div className="inline-block bg-[var(--azul)] text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded mb-3">
              Plataforma Hidráulica Especializada
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--azul-noite)] tracking-tight">
              Transporte de Veículos em São Paulo
            </h1>
            <p className="areas__lead">
              Transporte e translado com caminhão-plataforma para <strong>carros de passeio, SUVs, utilitários leves, furgões e veículos de luxo</strong>.
              Embarque cuidadoso, amarração técnica nas 4 rodas e total preservação da suspensão e carroceria.
            </p>
          </header>

          <div className="areas__acoes mb-10" role="group" aria-label="Ações de contato prioritárias">
            <a
              className="acao acao--whatsapp"
              href={whatsappUrl}
              data-tracking-location="sitelink_veiculos_hero_wa"
            >
              <Pictograma nome="whatsapp" tamanho={22} />
              <span>Consultar Disponibilidade</span>
              <Pictograma nome="seta" tamanho={13} className="acao__seta" />
            </a>
            <a
              className="acao acao--ligar"
              href={siteContactLinks.phoneHref}
              data-tracking-location="sitelink_veiculos_hero_phone"
            >
              <Pictograma nome="telefone" tamanho={20} />
              <span>Ligar {siteContactLinks.phoneDisplay}</span>
              <Pictograma nome="seta" tamanho={13} className="acao__seta" />
            </a>
          </div>

          <div className="mb-12 overflow-hidden rounded-xl border border-[var(--linha)]">
            <Image
              src={guinchoCarroLuxo}
              alt="Carro de luxo esportivo preto sendo transportado com segurança na plataforma azul da ME Guinchos em São Paulo."
              className="w-full h-auto object-cover max-h-[380px]"
              priority
            />
          </div>

          <section className="mb-12">
            <div className="titulo-secao mb-4">
              <h2>Modalidades de transporte veicular</h2>
              <p>
                Soluções planejadas tanto para resgate emergencial quanto para transporte agendado:
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
                  Transporte entre bairros, cidades vizinhas, oficinas, concessionárias ou garagens residenciais. Sem desgaste mecânico ou rodagem.
                </p>
              </div>

              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <div className="text-[var(--azul)] mb-3">
                  <Pictograma nome="van" tamanho={32} />
                </div>
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Vans e utilitários leves
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm">
                  Atendimento para furgões de carga leve e veículos comerciais. Avaliação técnica de entre-eixos e altura livre na cotação.
                </p>
              </div>

              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <div className="text-[var(--azul)] mb-3">
                  <Pictograma nome="carga" tamanho={32} />
                </div>
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Carros de luxo e colecionáveis
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm">
                  Ângulo de ataque suave que protege spoilers, para-choques rebaixados e saias laterais, com cintas de alta tenacidade sem contato com a lataria.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="titulo-secao mb-4">
              <h2>Cuidados técnicos que garantem a integridade do seu veículo</h2>
              <p>
                O transporte sobre caminhão-plataforma elimina os riscos comuns dos reboques tradicionais de arrasto:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Zero arrasto e proteção do trem de força
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm mb-3">
                  Veículos automáticos, híbridos ou com tração 4x4 não podem ser rebocados com rodas no chão sob risco de danificar a transmissão.
                </p>
                <p className="text-sm font-semibold text-[var(--azul-noite)]">
                  ✓ Na plataforma hidráulica da ME Guinchos, o carro é içado e viaja 100% sobre a prancha.
                </p>
              </div>

              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Fixação profissional com cintas de roda
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm mb-3">
                  Utilizamos cintas catraca próprias para pneus, impedindo que o veículo balance ou sofra qualquer atrito na pintura durante o percurso.
                </p>
                <p className="text-sm font-semibold text-[var(--azul-noite)]">
                  ✓ Estabilidade total em curvas, vias de paralelepípedo e lombadas.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="titulo-secao mb-4">
              <h2>Como solicitar o orçamento de transporte</h2>
              <p>
                Basta ter em mãos três dados básicos ao nos contatar:
              </p>
            </div>

            <ol className="acionamento__passos">
              <li className="placa placa--branca passo" data-placa="branca">
                <span className="passo__numero">1</span>
                <h3>Modelo e porte do veículo</h3>
                <p>
                  Informe a marca, modelo (hatch, sedã, SUV, van ou picape) e se está funcionando normalmente.
                </p>
              </li>
              <li className="placa placa--branca passo" data-placa="branca">
                <span className="passo__numero">2</span>
                <h3>Origem e destino do transporte</h3>
                <p>
                  Indique o ponto de coleta e o local exato onde o veículo deve ser entregue.
                </p>
              </li>
              <li className="placa placa--branca passo" data-placa="branca">
                <span className="passo__numero">3</span>
                <h3>Data e horário desejados</h3>
                <p>
                  Defina se precisa de atendimento emergencial ou se prefere agendar o transporte para um horário específico.
                </p>
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <div className="placa placa--azul p-8 rounded-xl" data-placa="azul">
              <h2 className="text-2xl font-black mb-3">Disponibilidade e pagamento</h2>
              <p className="mb-4 text-white/90">
                Operamos <strong>24 horas, todos os dias da semana</strong>, cobrindo São Paulo e Grande SP em um raio de até 20 km a partir da Zona Oeste.
              </p>
              <p className="text-white/80 text-sm mb-6">
                Pagamentos via Pix instantâneo, cartões de crédito/débito e dinheiro no ato do atendimento.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  className="acao acao--whatsapp"
                  href={whatsappUrl}
                  data-tracking-location="sitelink_veiculos_closing_wa"
                >
                  <Pictograma nome="whatsapp" tamanho={22} />
                  <span>Pedir Cotação no WhatsApp</span>
                  <Pictograma nome="seta" tamanho={13} className="acao__seta" />
                </a>
                <a
                  className="acao acao--ligar"
                  href={siteContactLinks.phoneHref}
                  data-tracking-location="sitelink_veiculos_closing_phone"
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
              <h2>Dúvidas comuns sobre transporte veicular</h2>
            </div>

            <div className="space-y-4">
              <div className="placa placa--branca p-5 rounded-lg" data-placa="branca">
                <h3 className="text-base font-bold text-[var(--azul-noite)] mb-1">
                  Vocês transportam veículos que não dão partida ou com câmbio travado?
                </h3>
                <p className="text-sm text-[var(--grafite-medio)]">
                  Sim. Nossos caminhões possuem guincho redutor de cabo de aço e equipamentos de auxílio de rolagem, permitindo o embarque de veículos desligados ou com rodas travadas com segurança.
                </p>
              </div>

              <div className="placa placa--branca p-5 rounded-lg" data-placa="branca">
                <h3 className="text-base font-bold text-[var(--azul-noite)] mb-1">
                  O veículo viaja segurado durante o translado?
                </h3>
                <p className="text-sm text-[var(--grafite-medio)]">
                  Trabalhamos com operadores experientes e caminhão-plataforma próprio revisado, com amarração por cintas técnicas homologadas para garantir integridade total do bem.
                </p>
              </div>

              <div className="placa placa--branca p-5 rounded-lg" data-placa="branca">
                <h3 className="text-base font-bold text-[var(--azul-noite)] mb-1">
                  É possível agendar o transporte com antecedência?
                </h3>
                <p className="text-sm text-[var(--grafite-medio)]">
                  Sim! Você pode agendar o translado com antecedência ou solicitar atendimento imediato 24 horas por dia, 7 dias por semana.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-[var(--azul-noite)] mb-3">
              Conheça também
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/servicos-de-reboque"
                className="placa placa--branca px-4 py-2 text-sm font-bold text-[var(--azul)] hover:underline inline-flex items-center gap-2"
              >
                <span>Serviços de Reboque</span>
                <Pictograma nome="seta" tamanho={12} />
              </Link>
              <Link
                href="/transporte-de-empilhadeiras"
                className="placa placa--branca px-4 py-2 text-sm font-bold text-[var(--azul)] hover:underline inline-flex items-center gap-2"
              >
                <span>Transporte de Empilhadeiras</span>
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
                href="/guincho-zona-oeste-sp"
                className="placa placa--branca px-4 py-2 text-sm font-bold text-[var(--azul)] hover:underline inline-flex items-center gap-2"
              >
                <span>Guincho na Zona Oeste de SP</span>
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
