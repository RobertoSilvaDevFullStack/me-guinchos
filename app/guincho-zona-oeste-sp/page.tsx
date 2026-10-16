import type { Metadata } from "next";
import Link from "next/link";
import { BarraContato } from "@/components/BarraContato";
import { Pictograma } from "@/components/Pictograma";
import { Retrorreflexao } from "@/components/Retrorreflexao";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { metadataDaRota, siteUrl } from "@/content/site";
import { siteContactLinks } from "@/lib/contact";

export const metadata: Metadata = metadataDaRota({
  path: "/guincho-zona-oeste-sp",
  title: "Guincho na Zona Oeste de SP | ME Guinchos",
  description:
    "Guincho plataforma na Zona Oeste de São Paulo para carros, motos, vans e empilhadeiras. Atendimento 24 horas, de domingo a domingo.",
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
      name: "Guincho na Zona Oeste de SP",
      item: `${siteUrl}/guincho-zona-oeste-sp`,
    },
  ],
};

export default function GuinchoZonaOestePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
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
                Guincho na Zona Oeste de SP
              </li>
            </ol>
          </nav>

          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--azul-noite)] tracking-tight">
              Guincho na Zona Oeste de SP
            </h1>
            <p className="areas__lead">
              Socorro e transporte com caminhão-plataforma para veículos leves e utilitários em
              toda a Zona Oeste paulistana. Atendimento ágil e consultivo diretamente no WhatsApp.
            </p>
          </header>

          <div className="areas__acoes mb-10" role="group" aria-label="Ações de contato prioritárias">
            <a
              className="acao acao--whatsapp"
              href={siteContactLinks.whatsappHref}
              data-tracking-location="local_zona_oeste_hero"
            >
              <Pictograma nome="whatsapp" tamanho={22} />
              <span>Chamar no WhatsApp</span>
              <Pictograma nome="seta" tamanho={13} className="acao__seta" />
            </a>
            <a
              className="acao acao--ligar"
              href={siteContactLinks.phoneHref}
              data-tracking-location="local_zona_oeste_hero_phone"
            >
              <Pictograma nome="telefone" tamanho={20} />
              <span>Ligar {siteContactLinks.phoneDisplay}</span>
              <Pictograma nome="seta" tamanho={13} className="acao__seta" />
            </a>
          </div>

          <section className="mb-12">
            <div className="titulo-secao mb-4">
              <h2>Raio de atendimento centralizado na Zona Oeste</h2>
              <p>
                A ME Guinchos opera com referência em um raio de até 20 km na região metropolitana,
                tendo como eixo primordial os principais bairros e vias da Zona Oeste de São Paulo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Bairros da Zona Oeste atendidos
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm mb-3">
                  Consulte disponibilidade para o seu endereço nos setores:
                </p>
                <ul className="space-y-1 text-sm font-semibold text-[var(--azul-noite)]">
                  <li>• Lapa, Vila Anastácio e Vila Romana</li>
                  <li>• Barra Funda, Perdizes e Pompeia</li>
                  <li>• Vila Leopoldina e Jaguaré</li>
                  <li>• Butantã, Rio Pequeno e arredores da USP</li>
                  <li>• Pinheiros e Vila Madalena</li>
                  <li>• Pirituba e proximidades da Rodovia Anhanguera</li>
                </ul>
              </div>

              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Grandes avenidas e corredores
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm mb-3">
                  Rotas de fácil deslocamento para socorro veicular:
                </p>
                <ul className="space-y-1 text-sm font-semibold text-[var(--azul-noite)]">
                  <li>• Av. Francisco Matarazzo e Av. Pompeia</li>
                  <li>• Av. Marquês de São Vicente e Av. Ermano Marchetti</li>
                  <li>• Av. Dr. Gastão Vidigal e Ceagesp</li>
                  <li>• Av. Jaguaré e Av. Corifeu de Azevedo Marques</li>
                  <li>• Av. Rebouças e Av. Brigadeiro Faria Lima</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="titulo-secao mb-4">
              <h2>Variedade de frotas e soluções transportadas</h2>
              <p>
                Equipamentos modernos e caminhões-plataforma dimensionados para o perfil de cada veículo:
              </p>
            </div>

            <ol className="acionamento__passos">
              <li className="placa placa--branca passo" data-placa="branca">
                <span className="passo__numero">1</span>
                <h3>Carros e motos</h3>
                <p>
                  Transporte seguro sem arrasto na prancha hidráulica. Ideal para carros rebaixados,
                  veículos automáticos e motos com amarrações próprias.
                </p>
              </li>
              <li className="placa placa--branca passo" data-placa="branca">
                <span className="passo__numero">2</span>
                <h3>Vans e utilitários</h3>
                <p>
                  Atendimento para veículos comerciais de carga ou passageiros com consulta prévia
                  de entre-eixos e condições do local de embarque.
                </p>
              </li>
              <li className="placa placa--branca passo" data-placa="branca">
                <span className="passo__numero">3</span>
                <h3>Soluções com empilhadeiras</h3>
                <p>
                  Transporte de empilhadeiras em caminhão-plataforma e movimentação de cargas no
                  local com equipamento próprio mediante consulta.
                </p>
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <div className="placa placa--azul p-8 rounded-xl" data-placa="azul">
              <h2 className="text-2xl font-black mb-3">Atendimento 24 horas todos os dias</h2>
              <p className="mb-4 text-white/90">
                Atendimento ininterrupto 24 horas por dia, 7 dias por semana, para guincho de veículos e operações com
                empilhadeira na Zona Oeste de SP.
              </p>
              <p className="text-white/80 text-sm mb-6">
                Pagamentos confirmados: Pix instantâneo, cartões de débito/crédito e dinheiro.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  className="acao acao--whatsapp"
                  href={siteContactLinks.whatsappHref}
                  data-tracking-location="local_zona_oeste_closing"
                >
                  <Pictograma nome="whatsapp" tamanho={22} />
                  <span>Consultar pelo WhatsApp</span>
                  <Pictograma nome="seta" tamanho={13} className="acao__seta" />
                </a>
                <a
                  className="acao acao--ligar"
                  href={siteContactLinks.phoneHref}
                  data-tracking-location="local_zona_oeste_closing_phone"
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
              Outras rotas e regiões próximas atendidas
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
                href="/guincho-osasco"
                className="placa placa--branca px-4 py-2 text-sm font-bold text-[var(--azul)] hover:underline inline-flex items-center gap-2"
              >
                <span>Guincho em Osasco</span>
                <Pictograma nome="seta" tamanho={12} />
              </Link>
              <Link
                href="/areas-de-atendimento"
                className="placa placa--branca px-4 py-2 text-sm font-bold text-[var(--azul)] hover:underline inline-flex items-center gap-2"
              >
                <span>Ver todas as áreas de atendimento</span>
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
