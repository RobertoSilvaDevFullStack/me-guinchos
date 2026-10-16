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
  path: "/guincho-osasco",
  title: "Guincho em Osasco SP | ME Guinchos",
  description:
    "Guincho plataforma para carros, motos e vans em Osasco. Atendimento com base próxima na Zona Oeste de SP. Atendimento 24 horas, todos os dias.",
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
      name: "Guincho em Osasco",
      item: `${siteUrl}/guincho-osasco`,
    },
  ],
};

export default function GuinchoOsascoPage() {
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
                Guincho em Osasco
              </li>
            </ol>
          </nav>

          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--azul-noite)] tracking-tight">
              Guincho em Osasco
            </h1>
            <p className="areas__lead">
              Atendimento de guincho com caminhão-plataforma para veículos leves, utilitários e
              transporte de empilhadeiras em Osasco, com partida rápida da Zona Oeste de SP.
            </p>
          </header>

          <div className="areas__acoes mb-10" role="group" aria-label="Ações de contato prioritárias">
            <a
              className="acao acao--whatsapp"
              href={siteContactLinks.whatsappHref}
              data-tracking-location="local_osasco_hero"
            >
              <Pictograma nome="whatsapp" tamanho={22} />
              <span>Chamar no WhatsApp</span>
              <Pictograma nome="seta" tamanho={13} className="acao__seta" />
            </a>
            <a
              className="acao acao--ligar"
              href={siteContactLinks.phoneHref}
              data-tracking-location="local_osasco_hero_phone"
            >
              <Pictograma nome="telefone" tamanho={20} />
              <span>Ligar {siteContactLinks.phoneDisplay}</span>
              <Pictograma nome="seta" tamanho={13} className="acao__seta" />
            </a>
          </div>

          <section className="mb-12">
            <div className="titulo-secao mb-4">
              <h2>Cobertura nos bairros e pólos de Osasco</h2>
              <p>
                Com base próxima e acesso direto pela Ponte dos Remédios, Rodovia Castello Branco
                e Marginal Tietê, a ME Guinchos atende chamados comerciais e residenciais em Osasco:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Bairros e regiões atendidas
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm mb-3">
                  Consulte as condições para o seu endereço específico:
                </p>
                <ul className="space-y-1 text-sm font-semibold text-[var(--azul-noite)]">
                  <li>• Centro e Presidente Altino</li>
                  <li>• Vila Yara e Campesina</li>
                  <li>• Rochdale, Bonfim e Industrial Autonomistas</li>
                  <li>• Bela Vista, Umuarama e Jaguaribe</li>
                  <li>• Km 18 e proximidades da Estação de Trem</li>
                </ul>
              </div>

              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Principais vias e acessos rápidos
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm mb-3">
                  Rotas frequentes para atendimento e transporte:
                </p>
                <ul className="space-y-1 text-sm font-semibold text-[var(--azul-noite)]">
                  <li>• Av. dos Autonomistas (corredor central)</li>
                  <li>• Rodovia Castello Branco (SP-280) e acessos de Osasco</li>
                  <li>• Av. Maria Campos e Viaduto Metálico</li>
                  <li>• Av. Hilário Pereira de Souza e Continental Shopping</li>
                  <li>• Acesso direto via Ponte dos Remédios para a Marginal Tietê</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="titulo-secao mb-4">
              <h2>Serviços prestados no município</h2>
              <p>
                Soluções completas tanto para imprevistos do dia a dia quanto para demandas industriais:
              </p>
            </div>

            <ol className="acionamento__passos">
              <li className="placa placa--branca passo" data-placa="branca">
                <span className="passo__numero">1</span>
                <h3>Guincho para carros e SUVs</h3>
                <p>
                  Remoção cuidadosa com plataforma hidráulica para oficinas, centros automotivos ou residências em Osasco e SP.
                </p>
              </li>
              <li className="placa placa--branca passo" data-placa="branca">
                <span className="passo__numero">2</span>
                <h3>Socorro para motos e utilitários</h3>
                <p>
                  Transporte com fixação adequada de motocicletas e reboque de furgões e vans comerciais.
                </p>
              </li>
              <li className="placa placa--branca passo" data-placa="branca">
                <span className="passo__numero">3</span>
                <h3>Transporte de empilhadeiras em empresas</h3>
                <p>
                  Atendimento especializado para galpões, centros de distribuição e fábricas em polos industriais de Osasco.
                </p>
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <div className="placa placa--azul p-8 rounded-xl" data-placa="azul">
              <h2 className="text-2xl font-black mb-3">Atendimento 24 horas todos os dias</h2>
              <p className="mb-4 text-white/90">
                Sem horário comercial restrito: atendemos 24 horas por dia, 7 dias por semana, inclusive fins de semana e madrugadas,
                com resposta ágil pelo WhatsApp.
              </p>
              <p className="text-white/80 text-sm mb-6">
                Pagamentos aceitos: Pix, cartões de crédito/débito e dinheiro diretamente com o operador no local.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  className="acao acao--whatsapp"
                  href={siteContactLinks.whatsappHref}
                  data-tracking-location="local_osasco_closing"
                >
                  <Pictograma nome="whatsapp" tamanho={22} />
                  <span>Consultar pelo WhatsApp</span>
                  <Pictograma nome="seta" tamanho={13} className="acao__seta" />
                </a>
                <a
                  className="acao acao--ligar"
                  href={siteContactLinks.phoneHref}
                  data-tracking-location="local_osasco_closing_phone"
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
                href="/guincho-zona-oeste-sp"
                className="placa placa--branca px-4 py-2 text-sm font-bold text-[var(--azul)] hover:underline inline-flex items-center gap-2"
              >
                <span>Guincho na Zona Oeste de SP</span>
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
