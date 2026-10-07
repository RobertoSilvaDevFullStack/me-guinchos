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
  path: "/guincho-vila-anastacio",
  title: "Guincho na Vila Anastácio SP | ME Guinchos",
  description:
    "Guincho plataforma para carros, motos, vans e empilhadeiras na Vila Anastácio e entorno da Lapa. Atendimento diário das 7h às 22h. Consulte pelo WhatsApp.",
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
      name: "Guincho na Vila Anastácio",
      item: `${siteUrl}/guincho-vila-anastacio`,
    },
  ],
};

export default function GuinchoVilaAnastacioPage() {
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
                Guincho na Vila Anastácio
              </li>
            </ol>
          </nav>

          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--azul-noite)] tracking-tight">
              Guincho na Vila Anastácio
            </h1>
            <p className="areas__lead">
              Atendimento com caminhão-plataforma para carros, motos, vans e transporte de
              empilhadeiras na Vila Anastácio e adjacências da Zona Oeste de São Paulo.
            </p>
          </header>

          <div className="areas__acoes mb-10" role="group" aria-label="Ações de contato prioritárias">
            <a
              className="acao acao--whatsapp"
              href={siteContactLinks.whatsappHref}
              data-tracking-location="local_anastacio_hero"
            >
              <Pictograma nome="whatsapp" tamanho={22} />
              <span>Chamar no WhatsApp</span>
              <Pictograma nome="seta" tamanho={13} className="acao__seta" />
            </a>
            <a
              className="acao acao--ligar"
              href={siteContactLinks.phoneHref}
              data-tracking-location="local_anastacio_hero_phone"
            >
              <Pictograma nome="telefone" tamanho={20} />
              <span>Ligar {siteContactLinks.phoneDisplay}</span>
              <Pictograma nome="seta" tamanho={13} className="acao__seta" />
            </a>
          </div>

          <section className="mb-12">
            <div className="titulo-secao mb-4">
              <h2>Atendimento local a partir da base ME Guinchos</h2>
              <p>
                A ME Guinchos tem sua base estabelecida na Vila Anastácio (região da Rua
                Martinho de Campos e Rua Bartolomeu Paes), permitindo deslocamento ágil
                por vias locais e acessos rápidos para a Marginal Tietê e Lapa.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Vias e referências atendidas
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm mb-3">
                  Circulação frequente por vias estratégicas do bairro e ligações metropolitanas:
                </p>
                <ul className="space-y-1 text-sm font-semibold text-[var(--azul-noite)]">
                  <li>• Rua Martinho de Campos e Rua Bartolomeu Paes</li>
                  <li>• Av. Raimundo Pereira de Magalhães</li>
                  <li>• Proximidade com a Estação Domingos de Moraes</li>
                  <li>• Acesso ao Viaduto da Lapa e Rua Guaicurus</li>
                  <li>• Conexão imediata com as Pontes dos Remédios e da Lapa</li>
                </ul>
              </div>

              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Serviços prestados no bairro
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm mb-3">
                  Capacidade de transporte em caminhão-plataforma para diferentes necessidades:
                </p>
                <ul className="space-y-1 text-sm font-semibold text-[var(--azul-noite)]">
                  <li>• Guincho plataforma para carros de passeio e SUVs</li>
                  <li>• Transporte seguro de motos</li>
                  <li>• Reboque para vans e furgões comerciais leves</li>
                  <li>• Carregamento e transporte de empilhadeiras em prancha</li>
                  <li>• Movimentação de cargas com empilhadeira própria</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="titulo-secao mb-4">
              <h2>Como consultar o atendimento na Vila Anastácio</h2>
              <p>
                O acionamento é direto, sem intermediação nem formulários complicados. Para agilizar o
                orçamento e a estimativa do atendimento, envie no WhatsApp:
              </p>
            </div>

            <ol className="acionamento__passos">
              <li className="placa placa--branca passo" data-placa="branca">
                <span className="passo__numero">1</span>
                <h3>Endereço ou ponto de referência</h3>
                <p>
                  Indique a rua ou cruzamento em que o veículo está na Vila Anastácio ou na região da Lapa.
                </p>
              </li>
              <li className="placa placa--branca passo" data-placa="branca">
                <span className="passo__numero">2</span>
                <h3>Modelo e condição do veículo</h3>
                <p>
                  Informe a marca, modelo e se o veículo possui rodas travadas, colisão ou pane mecânica.
                </p>
              </li>
              <li className="placa placa--branca passo" data-placa="branca">
                <span className="passo__numero">3</span>
                <h3>Destino pretendido</h3>
                <p>
                  Informe para onde o veículo será transportado (oficina, residência, pátio ou outra cidade).
                </p>
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <div className="placa placa--azul p-8 rounded-xl" data-placa="azul">
              <h2 className="text-2xl font-black mb-3">Horário e formas de pagamento</h2>
              <p className="mb-4 text-white/90">
                Atendimento de <strong>domingo a domingo, das 7h às 22h</strong>, para todos os
                serviços de guincho e empilhadeira.
              </p>
              <p className="text-white/80 text-sm mb-6">
                Aceitamos Pix, cartões de crédito e débito das principais bandeiras e pagamento em
                dinheiro diretamente com o operador no fechamento do chamado.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  className="acao acao--whatsapp"
                  href={siteContactLinks.whatsappHref}
                  data-tracking-location="local_anastacio_closing"
                >
                  <Pictograma nome="whatsapp" tamanho={22} />
                  <span>Consultar pelo WhatsApp</span>
                  <Pictograma nome="seta" tamanho={13} className="acao__seta" />
                </a>
                <a
                  className="acao acao--ligar"
                  href={siteContactLinks.phoneHref}
                  data-tracking-location="local_anastacio_closing_phone"
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
