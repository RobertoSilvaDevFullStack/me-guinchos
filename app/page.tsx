import Image from "next/image";
import Link from "next/link";
import { BarraContato } from "@/components/BarraContato";
import { FaixaFotografica } from "@/components/FaixaFotografica";
import { HeroSinal } from "@/components/HeroSinal";
import { Pictograma, type NomePictograma } from "@/components/Pictograma";
import { Retrorreflexao } from "@/components/Retrorreflexao";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  coverageContent,
  empilhadeiraContent,
  galleryItems,
  heroFotos,
  paymentContent,
  serviceCards,
  siteContent,
} from "@/content/site";
import { previewContactLinks } from "@/lib/contact";

/** Pórtico de acesso rápido: a fileira de placas que o visitante passa por baixo. */
const portico = [
  { href: "#servicos", rotulo: "Serviços", icone: "guincho" },
  { href: "#atendimento", rotulo: "Como acionar", icone: "local" },
  { href: "#registros", rotulo: "Registros", icone: "foto" },
  { href: "#pagamento", rotulo: "Pagamento", icone: "cartao" },
] as const;

function whatsappDoServico(titulo: string) {
  const url = new URL(previewContactLinks.whatsappHref);
  url.searchParams.set(
    "text",
    `Olá! Gostaria de consultar a disponibilidade de ${titulo.toLowerCase()}.`,
  );
  return url.toString();
}

export default function HomePage() {
  return (
    <>
      <a className="atalho-conteudo" href="#conteudo">
        Pular para o conteúdo
      </a>

      <SiteHeader />

      <main id="conteudo">
        <HeroSinal
          fotos={heroFotos}
          contactLinks={previewContactLinks}
          titulo={siteContent.home.h1}
          descricao={siteContent.home.description}
          regiao={siteContent.home.regionLabel}
          horario={siteContent.home.hoursLabel}
        />

        {/* PÓRTICO DE ACESSO RÁPIDO */}
        <nav className="portico" aria-label="Acesso rápido às seções">
          <div className="page-shell portico__grade">
            {portico.map((placa) => (
              <a
                className="placa placa--azul portico__placa"
                data-placa="azul"
                href={placa.href}
                key={placa.href}
              >
                <Pictograma nome={placa.icone} tamanho={34} />
                <span>{placa.rotulo}</span>
              </a>
            ))}
          </div>
        </nav>

        {/* SERVIÇOS — UNIDADE IDÊNTICA REPETIDA, LIDA POR VARREDURA */}
        <section className="servicos" id="servicos" aria-labelledby="servicos-titulo">
          <div className="page-shell">
            <div className="titulo-secao">
              <h2 id="servicos-titulo">Guincho e soluções com empilhadeira.</h2>
              <p>
                Escolha o serviço adequado à sua necessidade. O atendimento
                confirma as condições e a disponibilidade de cada chamado.
              </p>
            </div>

            <ul className="servicos__grade">
              {serviceCards.map((servico) => (
                <li className="placa placa--azul servico" data-placa="azul" key={servico.id}>
                  <span className="servico__pictograma" aria-hidden="true">
                    <Pictograma nome={servico.icone as NomePictograma} tamanho={28} />
                  </span>
                  <div className="servico__texto">
                    <h3>{servico.title}</h3>
                    <p>{servico.description}</p>
                  </div>
                  <a
                    href={whatsappDoServico(servico.title)}
                    className="servico__link"
                    aria-label={`${servico.ctaLabel} para ${servico.title}`}
                  >
                    <span>{servico.ctaLabel}</span>
                    <Pictograma nome="seta" tamanho={12} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* EIXO EMPILHADEIRA — A PROVA DO POSICIONAMENTO, NA VIA PASSANDO */}
        <FaixaFotografica
          id="empilhadeira"
          imagem={empilhadeiraContent.image}
          alt={empilhadeiraContent.alt}
          etiqueta={empilhadeiraContent.etiqueta}
          legenda={empilhadeiraContent.caption}
          className="faixa--empilhadeira"
        >
          <div className="faixa__texto" data-placa="azul">
            <h2>{empilhadeiraContent.title}</h2>
            <p>{empilhadeiraContent.description}</p>
            <a
              className="acao acao--whatsapp"
              href={whatsappDoServico("transporte de empilhadeira")}
            >
              <Pictograma nome="whatsapp" tamanho={22} />
              <span>{empilhadeiraContent.ctaLabel}</span>
              <Pictograma nome="seta" tamanho={13} className="acao__seta" />
            </a>
          </div>
        </FaixaFotografica>

        {/* COMO ACIONAR — SEQUÊNCIA LINEAR, A NUMERAÇÃO É INFORMAÇÃO */}
        <section
          className="acionamento"
          id="atendimento"
          aria-labelledby="acionamento-titulo"
        >
          <div className="page-shell">
            <div className="titulo-secao">
              <h2 id="acionamento-titulo">Conte o que aconteceu.</h2>
              <p>
                Atendimento direto e sem formulário. Três informações resolvem a
                consulta na primeira mensagem.
              </p>
            </div>

            <ol className="acionamento__passos">
              <li className="placa placa--branca passo" data-placa="branca">
                <span className="passo__numero">1</span>
                <h3>Descreva a carga ou o veículo</h3>
                <p>
                  Informe o modelo do veículo ou o tipo de equipamento e a
                  situação em que ele está: pane, colisão ou movimentação.
                </p>
              </li>

              <li className="placa placa--branca passo" data-placa="branca">
                <span className="passo__numero">2</span>
                <h3>Indique o local e o destino</h3>
                <p>{coverageContent.summary}</p>
                <Link className="passo__link" href="/areas-de-atendimento/">
                  <span>Ver as regiões citadas no mapa</span>
                  <Pictograma nome="seta" tamanho={12} />
                </Link>
              </li>

              <li className="placa placa--branca passo" data-placa="branca">
                <span className="passo__numero">3</span>
                <h3>Confirme o horário</h3>
                <p>
                  Atendemos <strong>domingo a domingo, das 7h às 22h</strong>,
                  no mesmo horário para guincho e para empilhadeira.
                </p>
                <a className="passo__link" href={previewContactLinks.phoneHref}>
                  <span>Prefere ligar? {previewContactLinks.phoneDisplay}</span>
                  <Pictograma nome="seta" tamanho={12} />
                </a>
              </li>
            </ol>
          </div>
        </section>

        {/* REGISTROS OPERACIONAIS */}
        <section className="registros" id="registros" aria-labelledby="registros-titulo">
          <div className="page-shell">
            <div className="titulo-secao">
              <h2 id="registros-titulo">Registros reais de veículos em plataforma.</h2>
              <p>
                Operações documentadas com a frota ME: carros, caminhonetes,
                vans, motos e empilhadeira.
              </p>
            </div>

            <ul className="registros__grade">
              {galleryItems.map((item) => (
                <li key={item.id}>
                  <figure className="registro">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      sizes="(min-width: 1100px) 32vw, (min-width: 768px) 48vw, calc(100vw - 32px)"
                      placeholder="blur"
                      loading="lazy"
                    />
                    <figcaption>{item.caption}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* PAGAMENTO */}
        <section className="pagamento" id="pagamento" aria-labelledby="pagamento-titulo">
          <div className="page-shell">
            <div className="titulo-secao">
              <h2 id="pagamento-titulo">{paymentContent.title}</h2>
              <p>{paymentContent.description}</p>
            </div>

            <ul className="pagamento__grade">
              {paymentContent.methods.map((metodo) => (
                <li className="placa placa--branca meio-pagamento" data-placa="branca" key={metodo.id}>
                  <div className="meio-pagamento__cabeca">
                    <Pictograma nome={metodo.icone as NomePictograma} tamanho={26} />
                    <h3>{metodo.title}</h3>
                  </div>

                  {metodo.imageSrc ? (
                    <div className="meio-pagamento__arte">
                      <Image
                        src={metodo.imageSrc}
                        alt={metodo.imageAlt}
                        width={metodo.id === "pix" ? 180 : 320}
                        height={metodo.id === "pix" ? 68 : 88}
                        className={`meio-pagamento__imagem meio-pagamento__imagem--${metodo.id}`}
                      />
                    </div>
                  ) : (
                    <div className="meio-pagamento__arte meio-pagamento__arte--especie">
                      <span aria-hidden="true">R$</span>
                    </div>
                  )}

                  <p>{metodo.subtitle}</p>
                  <span className="meio-pagamento__selo">{metodo.badge}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FECHAMENTO — A PLACA MAIOR DA PÁGINA, SOBRE A VIA */}
        <FaixaFotografica
          id="contato"
          imagem={heroFotos[3].image}
          alt={heroFotos[3].alt}
          className="faixa--fechamento"
        >
          <div className="fechamento" data-placa="azul">
            <h2>Fale com a ME sobre seu chamado.</h2>
            <p>
              Diga o veículo ou a carga, onde está e para onde vai. A equipe
              responde com as condições e a disponibilidade.
            </p>

            <div className="fechamento__acoes">
              <a className="acao acao--whatsapp" href={previewContactLinks.whatsappHref}>
                <Pictograma nome="whatsapp" tamanho={22} />
                <span>{siteContent.home.whatsappLabel}</span>
                <Pictograma nome="seta" tamanho={13} className="acao__seta" />
              </a>
              <a className="acao acao--ligar" href={previewContactLinks.phoneHref}>
                <Pictograma nome="telefone" tamanho={20} />
                <span>Ligar {previewContactLinks.phoneDisplay}</span>
                <Pictograma nome="seta" tamanho={13} className="acao__seta" />
              </a>
            </div>

            <dl className="suplemento suplemento--fechamento">
              <div className="suplemento__item">
                <dt>
                  <Pictograma nome="relogio" tamanho={15} />
                  Horário
                </dt>
                <dd>Domingo a domingo, das 7h às 22h</dd>
              </div>
              <div className="suplemento__item">
                <dt>
                  <Pictograma nome="local" tamanho={15} />
                  Região
                </dt>
                <dd>Raio aproximado de 20 km da zona oeste de SP</dd>
              </div>
            </dl>
          </div>
        </FaixaFotografica>
      </main>

      <SiteFooter />
      <BarraContato />
      <Retrorreflexao />
    </>
  );
}
