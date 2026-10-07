"use client";

import { useCallback, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, TouchEvent as ReactTouchEvent } from "react";
import Image from "next/image";
import { Pictograma } from "@/components/Pictograma";
import type { heroFotos } from "@/content/site";
import type { ContactLinks } from "@/lib/contact";

type Foto = (typeof heroFotos)[number];

interface HeroSinalProps {
  fotos: readonly Foto[];
  contactLinks: ContactLinks;
  titulo: string;
  descricao: string;
  regiao: string;
  horario: string;
}

/**
 * A placa-mãe do sistema. A manchete, os dois contatos e a faixa suplementar
 * são fixos: só a fotografia troca, por escolha manual (setas, teclado ou
 * arrasto) e nunca sozinha — conforme `docs/04-direcao-visual.md`.
 */
export function HeroSinal({
  fotos,
  contactLinks,
  titulo,
  descricao,
  regiao,
  horario,
}: HeroSinalProps) {
  const [indice, setIndice] = useState(0);
  const total = fotos.length;
  const atual = fotos[indice];
  const inicioToque = useRef<number | null>(null);

  const irPara = useCallback(
    (proximo: number) => setIndice((proximo + total) % total),
    [total],
  );

  const aoTeclar = (evento: ReactKeyboardEvent<HTMLDivElement>) => {
    if (evento.key === "ArrowLeft") {
      evento.preventDefault();
      irPara(indice - 1);
    } else if (evento.key === "ArrowRight") {
      evento.preventDefault();
      irPara(indice + 1);
    }
  };

  const aoIniciarToque = (evento: ReactTouchEvent) => {
    inicioToque.current = evento.touches[0].clientX;
  };

  const aoTerminarToque = (evento: ReactTouchEvent) => {
    if (inicioToque.current === null) return;
    const deslocamento = inicioToque.current - evento.changedTouches[0].clientX;
    if (Math.abs(deslocamento) > 40) irPara(indice + (deslocamento > 0 ? 1 : -1));
    inicioToque.current = null;
  };

  return (
    <section className="heroi" aria-labelledby="heroi-titulo">
      <div className="page-shell heroi__grade">
        <div className="placa placa--azul placa--mae" data-placa="azul">
          <div className="placa__campo">
            <h1 className="heroi__titulo" id="heroi-titulo">
              {titulo}
            </h1>
            <p className="heroi__descricao">{descricao}</p>

            <div className="heroi__acoes" role="group" aria-label="Formas de contato">
              <a
                className="acao acao--whatsapp"
                href={contactLinks.whatsappHref}
                data-tracking-location="hero_whatsapp"
              >
                <Pictograma nome="whatsapp" tamanho={22} />
                <span>Consultar pelo WhatsApp</span>
                <Pictograma nome="seta" tamanho={13} className="acao__seta" />
              </a>
              <a
                className="acao acao--ligar"
                href={contactLinks.phoneHref}
                data-tracking-location="hero_phone"
              >
                <Pictograma nome="telefone" tamanho={20} />
                <span>Ligar {contactLinks.phoneDisplay}</span>
                <Pictograma nome="seta" tamanho={13} className="acao__seta" />
              </a>
            </div>
          </div>

          <dl className="suplemento">
            <div className="suplemento__item">
              <dt>
                <Pictograma nome="relogio" tamanho={15} />
                Horário
              </dt>
              <dd>{horario}</dd>
            </div>
            <div className="suplemento__item">
              <dt>
                <Pictograma nome="local" tamanho={15} />
                Região
              </dt>
              <dd>{regiao}</dd>
            </div>
          </dl>
        </div>

        <div
          className="heroi__visor"
          onKeyDown={aoTeclar}
          onTouchStart={aoIniciarToque}
          onTouchEnd={aoTerminarToque}
        >
          <figure className="visor">
            {fotos.map((foto, posicao) => (
              <Image
                key={foto.id}
                src={foto.image}
                alt={foto.alt}
                placeholder="blur"
                priority={posicao === 0}
                loading={posicao === 0 ? "eager" : "lazy"}
                sizes="(min-width: 1100px) 46vw, (min-width: 768px) 48vw, 100vw"
                className={`visor__foto${posicao === indice ? " esta-visivel" : ""}`}
                aria-hidden={posicao !== indice}
              />
            ))}

            <figcaption className="visor__legenda">
              <span className="visor__etiqueta">Registro da frota ME</span>
              <span className="visor__texto" aria-live="polite">
                {atual.caption}
              </span>
            </figcaption>
          </figure>

          <div className="visor__comando">
            <span className="visor__contador">
              <strong>{String(indice + 1).padStart(2, "0")}</strong>
              <span aria-hidden="true">/</span>
              <span>{String(total).padStart(2, "0")}</span>
            </span>

            <div className="visor__botoes">
              <button
                type="button"
                className="botao-visor"
                onClick={() => irPara(indice - 1)}
                aria-label="Foto anterior"
              >
                <Pictograma nome="seta" tamanho={14} className="botao-visor__voltar" />
              </button>
              <button
                type="button"
                className="botao-visor"
                onClick={() => irPara(indice + 1)}
                aria-label="Próxima foto"
              >
                <Pictograma nome="seta" tamanho={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
