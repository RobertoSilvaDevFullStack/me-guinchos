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
  path: "/guincho-marginal-tiete",
  title: "Guincho na Marginal Tietê SP | ME Guinchos",
  description:
    "Guincho plataforma na Marginal Tietê para veículos em pane ou colisão. Atendimento rápido nos trechos da Zona Oeste e pontes da região. Atendimento 24 horas.",
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
      name: "Guincho na Marginal Tietê",
      item: `${siteUrl}/guincho-marginal-tiete`,
    },
  ],
};

export default function GuinchoMarginalTietePage() {
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
                Guincho na Marginal Tietê
              </li>
            </ol>
          </nav>

          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--azul-noite)] tracking-tight">
              Guincho na Marginal Tietê
            </h1>
            <p className="areas__lead">
              Remoção ágil com caminhão-plataforma para veículos leves e utilitários em pane ou
              colisão nos trechos da Marginal Tietê e pontes da Zona Oeste de São Paulo.
            </p>
          </header>

          <div className="areas__acoes mb-10" role="group" aria-label="Ações de contato prioritárias">
            <a
              className="acao acao--whatsapp"
              href={siteContactLinks.whatsappHref}
              data-tracking-location="local_marginal_hero"
            >
              <Pictograma nome="whatsapp" tamanho={22} />
              <span>Chamar no WhatsApp</span>
              <Pictograma nome="seta" tamanho={13} className="acao__seta" />
            </a>
            <a
              className="acao acao--ligar"
              href={siteContactLinks.phoneHref}
              data-tracking-location="local_marginal_hero_phone"
            >
              <Pictograma nome="telefone" tamanho={20} />
              <span>Ligar {siteContactLinks.phoneDisplay}</span>
              <Pictograma nome="seta" tamanho={13} className="acao__seta" />
            </a>
          </div>

          <section className="mb-12">
            <div className="titulo-secao mb-4">
              <h2>Trechos e pontes prioritárias na Marginal Tietê</h2>
              <p>
                Com base operacional próxima à via expressa na Zona Oeste, a ME Guinchos atende
                rapidamente acionamentos nos principais trechos e conexões de tráfego pesado:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Pontes e acessos da Zona Oeste
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm mb-3">
                  Atendimento nos dois sentidos (Ayrton Senna e Castelo Branco):
                </p>
                <ul className="space-y-1 text-sm font-semibold text-[var(--azul-noite)]">
                  <li>• Trecho Ponte dos Remédios e Cebolão</li>
                  <li>• Trecho Ponte da Lapa</li>
                  <li>• Trecho Ponte do Piqueri</li>
                  <li>• Trecho Ponte da Freguesia do Ó</li>
                  <li>• Acessos às rodovias Anhanguera e Castello Branco</li>
                </ul>
              </div>

              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Cuidados de segurança na via expressa
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm mb-3">
                  Para garantir sua integridade até a chegada da plataforma:
                </p>
                <ul className="space-y-1 text-sm font-semibold text-[var(--azul-noite)]">
                  <li>• Estacione no refúgio ou acostamento se houver condições</li>
                  <li>• Ligue o pisca-alerta imediatamente</li>
                  <li>• Aguarde em local seguro atrás da defensa metálica</li>
                  <li>• Compartilhe sua localização exata em tempo real no WhatsApp</li>
                  <li>• Indique a pista (expressa, central ou local) e sentido da via</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="titulo-secao mb-4">
              <h2>Situações frequentes atendidas na via</h2>
              <p>
                O tráfego intenso na Marginal demanda reboque sem atraso para evitar riscos de novos acidentes:
              </p>
            </div>

            <ol className="acionamento__passos">
              <li className="placa placa--branca passo" data-placa="branca">
                <span className="passo__numero">1</span>
                <h3>Pane mecânica ou elétrica</h3>
                <p>
                  Superaquecimento, correia partida, pane elétrica, pane seca ou corte repentino de motor.
                </p>
              </li>
              <li className="placa placa--branca passo" data-placa="branca">
                <span className="passo__numero">2</span>
                <h3>Pneu estourado ou suspensão danificada</h3>
                <p>
                  Danos por buracos ou desníveis que impossibilitam a troca segura na faixa de tráfego.
                </p>
              </li>
              <li className="placa placa--branca passo" data-placa="branca">
                <span className="passo__numero">3</span>
                <h3>Colisão leve ou média</h3>
                <p>
                  Remoção de carros, motos e vans após incidentes de trânsito para oficina credenciada ou residência.
                </p>
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <div className="placa placa--azul p-8 rounded-xl" data-placa="azul">
              <h2 className="text-2xl font-black mb-3">Plantão 24 horas todos os dias</h2>
              <p className="mb-4 text-white/90">
                Atendimento 24 horas por dia, 7 dias por semana, inclusive fins de semana, feriados e madrugadas. Caminhão-plataforma
                com guincho asa-delta e prancha hidráulica.
              </p>
              <p className="text-white/80 text-sm mb-6">
                Pagamento descomplicado com Pix, cartões de crédito/débito ou dinheiro diretamente com o operador.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  className="acao acao--whatsapp"
                  href={siteContactLinks.whatsappHref}
                  data-tracking-location="local_marginal_closing"
                >
                  <Pictograma nome="whatsapp" tamanho={22} />
                  <span>Chamar socorro no WhatsApp</span>
                  <Pictograma nome="seta" tamanho={13} className="acao__seta" />
                </a>
                <a
                  className="acao acao--ligar"
                  href={siteContactLinks.phoneHref}
                  data-tracking-location="local_marginal_closing_phone"
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
                href="/guincho-zona-oeste-sp"
                className="placa placa--branca px-4 py-2 text-sm font-bold text-[var(--azul)] hover:underline inline-flex items-center gap-2"
              >
                <span>Guincho na Zona Oeste de SP</span>
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
