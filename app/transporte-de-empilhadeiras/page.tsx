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
import guinchoEmpilhadeiras from "@/public/images/operacoes/guincho-empilhadeiras.webp";

export const metadata: Metadata = metadataDaRota({
  path: "/transporte-de-empilhadeiras",
  title: "Transporte de Empilhadeiras em São Paulo — Prancha e Plataforma | ME Guinchos",
  description:
    "Remoção e transporte de empilhadeiras em São Paulo com caminhão-plataforma reforçado. Atendimento consultivo para galpões, indústrias e obras. Solicite orçamento.",
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
      name: "Transporte de Empilhadeiras",
      item: `${siteUrl}/transporte-de-empilhadeiras`,
    },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Carregamento e Transporte de Empilhadeiras em Plataforma",
  provider: {
    "@type": "LocalBusiness",
    name: "ME Guinchos",
    telephone: "+5511930299233",
    url: siteUrl,
  },
  description:
    "Serviço especializado de carregamento, remoção e transporte de empilhadeiras elétricas, a combustão e maquinário industrial em caminhão-plataforma em São Paulo.",
  areaServed: {
    "@type": "City",
    name: "São Paulo",
  },
};

const whatsappUrl = criarLinkWhatsApp(
  "Olá! Gostaria de solicitar um orçamento para transporte de empilhadeira em São Paulo.",
);

export default function TransporteDeEmpilhadeirasPage() {
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
                Transporte de Empilhadeiras
              </li>
            </ol>
          </nav>

          <header className="mb-8">
            <div className="inline-block bg-[var(--azul)] text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded mb-3">
              Transporte Especializado de Máquinas
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--azul-noite)] tracking-tight">
              Transporte de Empilhadeiras em São Paulo
            </h1>
            <p className="areas__lead">
              Carregamento, remoção técnica e transporte de empilhadeiras industriais e comerciais em
              caminhão-plataforma reforçado. Atendimento consultivo para <strong>galpões, indústrias, pátios logísticos e empresas</strong> em
              São Paulo e região metropolitana.
            </p>
          </header>

          <div className="areas__acoes mb-10" role="group" aria-label="Ações de contato prioritárias">
            <a
              className="acao acao--whatsapp"
              href={whatsappUrl}
              data-tracking-location="sitelink_empilhadeira_hero_wa"
            >
              <Pictograma nome="whatsapp" tamanho={22} />
              <span>Solicitar Orçamento de Transporte</span>
              <Pictograma nome="seta" tamanho={13} className="acao__seta" />
            </a>
            <a
              className="acao acao--ligar"
              href={siteContactLinks.phoneHref}
              data-tracking-location="sitelink_empilhadeira_hero_phone"
            >
              <Pictograma nome="telefone" tamanho={20} />
              <span>Ligar {siteContactLinks.phoneDisplay}</span>
              <Pictograma nome="seta" tamanho={13} className="acao__seta" />
            </a>
          </div>

          <div className="mb-12 overflow-hidden rounded-xl border border-[var(--linha)]">
            <Image
              src={guinchoEmpilhadeiras}
              alt="Empilhadeiras alaranjadas sendo transportadas com segurança sobre a plataforma azul da ME Guinchos."
              className="w-full h-auto object-cover max-h-[380px]"
              priority
            />
            <div className="p-3 bg-[var(--azul-noite)] text-white/90 text-xs text-center font-medium">
              Registro real de operação da frota ME Guinchos: transporte de empilhadeiras em caminhão-plataforma.
            </div>
          </div>

          <section className="mb-12">
            <div className="titulo-secao mb-4">
              <h2>Como funciona o transporte de empilhadeiras</h2>
              <p>
                O transporte de máquinas exige cuidados especiais de estabilidade, altura de mastro e ancoragem:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <div className="text-[var(--azul)] mb-3">
                  <Pictograma nome="empilhadeira" tamanho={32} />
                </div>
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Embarque e içamento assistido
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm">
                  Subida suave pela prancha hidráulica rebaixada, utilizando guincho redutor de cabo de aço quando o equipamento estiver inoperante ou sem bateria.
                </p>
              </div>

              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <div className="text-[var(--azul)] mb-3">
                  <Pictograma nome="carga" tamanho={32} />
                </div>
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Ancoragem de alta capacidade
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm">
                  Trava por correntes de grau técnico e cintas reforçadas no chassi e contrapeso da máquina, evitando qualquer deslocamento lateral durante o percurso.
                </p>
              </div>

              <div className="placa placa--branca p-6 rounded-lg" data-placa="branca">
                <div className="text-[var(--azul)] mb-3">
                  <Pictograma nome="local" tamanho={32} />
                </div>
                <h3 className="text-lg font-black text-[var(--azul-noite)] mb-2">
                  Planejamento de rotas e docas
                </h3>
                <p className="text-[var(--grafite-medio)] text-sm">
                  Avaliação da altura livre de viadutos, portões de galpão e condições de piso no ponto de coleta e entrega (nível do solo, rampa ou pátio).
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="placa placa--branca p-8 rounded-xl border border-[var(--linha)]" data-placa="branca">
              <h2 className="text-2xl font-black text-[var(--azul-noite)] mb-3">
                Informações necessárias para o orçamento
              </h2>
              <p className="text-sm text-[var(--grafite-medio)] mb-6">
                Como as condições de peso, mastro e acessos variam para cada máquina, confirme os seguintes itens pelo WhatsApp:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="text-[var(--azul)] mt-1 flex-shrink-0">
                    <Pictograma nome="seta" tamanho={14} />
                  </div>
                  <div>
                    <strong className="block text-sm text-[var(--azul-noite)] font-bold">Tipo e modelo do equipamento</strong>
                    <span className="text-xs text-[var(--grafite-medio)]">Empilhadeira elétrica, retrátil, a gás (GLP) ou a diesel.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-[var(--azul)] mt-1 flex-shrink-0">
                    <Pictograma nome="seta" tamanho={14} />
                  </div>
                  <div>
                    <strong className="block text-sm text-[var(--azul-noite)] font-bold">Peso estimado e dimensões</strong>
                    <span className="text-xs text-[var(--grafite-medio)]">Tonelagem aproximada e altura do mastro para checagem da prancha.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-[var(--azul)] mt-1 flex-shrink-0">
                    <Pictograma nome="seta" tamanho={14} />
                  </div>
                  <div>
                    <strong className="block text-sm text-[var(--azul-noite)] font-bold">Local de coleta</strong>
                    <span className="text-xs text-[var(--grafite-medio)]">Endereço de partida e se há doca, rampa ou piso plano no nível da rua.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-[var(--azul)] mt-1 flex-shrink-0">
                    <Pictograma nome="seta" tamanho={14} />
                  </div>
                  <div>
                    <strong className="block text-sm text-[var(--azul-noite)] font-bold">Local de entrega</strong>
                    <span className="text-xs text-[var(--grafite-medio)]">Destino final, galpão de destino e disponibilidade de acesso ao caminhão.</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="placa placa--azul p-8 rounded-xl" data-placa="azul">
              <div className="inline-block bg-[var(--ambar)] text-[var(--azul-noite)] text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded mb-3">
                Diferencial Exclusivo
              </div>
              <h2 className="text-2xl font-black mb-3">Também dispomos de empilhadeira própria para movimentação</h2>
              <p className="mb-4 text-white/90">
                Além do transporte sobre caminhão, a ME Guinchos conta com empilhadeira própria para operações de
                carga, descarga de carretas e movimentação interna de maquinários e pallets na Zona Oeste de SP.
              </p>
              <p className="text-white/80 text-sm mb-6">
                Consulte as condições técnicas e a disponibilidade da operação junto à nossa equipe pelo WhatsApp.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  className="acao acao--whatsapp"
                  href={whatsappUrl}
                  data-tracking-location="sitelink_empilhadeira_closing_wa"
                >
                  <Pictograma nome="whatsapp" tamanho={22} />
                  <span>Consultar Transporte e Movimentação</span>
                  <Pictograma nome="seta" tamanho={13} className="acao__seta" />
                </a>
                <a
                  className="acao acao--ligar"
                  href={siteContactLinks.phoneHref}
                  data-tracking-location="sitelink_empilhadeira_closing_phone"
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
              <h2>Perguntas frequentes sobre empilhadeiras</h2>
            </div>

            <div className="space-y-4">
              <div className="placa placa--branca p-5 rounded-lg" data-placa="branca">
                <h3 className="text-base font-bold text-[var(--azul-noite)] mb-1">
                  Qualquer empilhadeira pode ser transportada na plataforma?
                </h3>
                <p className="text-sm text-[var(--grafite-medio)]">
                  Cada chamado é avaliado de forma consultiva e transparente. Ao nos informar o modelo, peso e altura da máquina, verificamos se as especificações técnicas são 100% compatíveis com a prancha do nosso caminhão antes de confirmar a operação.
                </p>
              </div>

              <div className="placa placa--branca p-5 rounded-lg" data-placa="branca">
                <h3 className="text-base font-bold text-[var(--azul-noite)] mb-1">
                  É possível retirar uma máquina sem funcionamento ou sem bateria?
                </h3>
                <p className="text-sm text-[var(--grafite-medio)]">
                  Sim. O caminhão conta com guincho hidráulico para tracionar o equipamento para cima da plataforma mesmo com freio liberado manualmente e sem energia no motor.
                </p>
              </div>

              <div className="placa placa--branca p-5 rounded-lg" data-placa="branca">
                <h3 className="text-base font-bold text-[var(--azul-noite)] mb-1">
                  Quais as formas de pagamento para pessoas jurídicas e empresas?
                </h3>
                <p className="text-sm text-[var(--grafite-medio)]">
                  Aceitamos Pix instantâneo, cartões de crédito/débito e dinheiro. Detalhes de faturamento ou comprovantes são alinhados diretamente no atendimento comercial.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-[var(--azul-noite)] mb-3">
              Rotas relacionadas
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
                href="/solicitar-orcamento"
                className="placa placa--branca px-4 py-2 text-sm font-bold text-[var(--azul)] hover:underline inline-flex items-center gap-2"
              >
                <span>Solicitar Orçamento</span>
                <Pictograma nome="seta" tamanho={12} />
              </Link>
              <Link
                href="/guincho-vila-anastacio"
                className="placa placa--branca px-4 py-2 text-sm font-bold text-[var(--azul)] hover:underline inline-flex items-center gap-2"
              >
                <span>Base na Vila Anastácio</span>
                <Pictograma nome="seta" tamanho={12} />
              </Link>
              <Link
                href="/areas-de-atendimento"
                className="placa placa--branca px-4 py-2 text-sm font-bold text-[var(--azul)] hover:underline inline-flex items-center gap-2"
              >
                <span>Áreas Atendidas</span>
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
