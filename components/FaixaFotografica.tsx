import Image from "next/image";
import type { StaticImageData } from "next/image";
import type { ReactNode } from "react";

interface FaixaFotograficaProps {
  imagem: StaticImageData | string;
  alt: string;
  /** Texto factual da plaqueta sobreposta. Sem alegação não aprovada. */
  legenda?: string;
  etiqueta?: string;
  children?: ReactNode;
  className?: string;
  id?: string;
}

/**
 * A via passando sob a placa: a fotografia fica travada no viewport enquanto o
 * conteúdo desliza por cima dela.
 *
 * O recorte é feito com `clip-path: inset(0)` no contêiner e `position: fixed`
 * na mídia. `clip-path` recorta sem virar bloco contentor de elementos fixos,
 * então a imagem continua ancorada no viewport — e funciona no iOS Safari,
 * onde `background-attachment: fixed` simplesmente não funciona. Em
 * prefers-reduced-motion o CSS devolve a mídia para `absolute` e a faixa rola
 * junto com a página.
 */
export function FaixaFotografica({
  imagem,
  alt,
  legenda,
  etiqueta,
  children,
  className,
  id,
}: FaixaFotograficaProps) {
  return (
    <section className={`faixa ${className ?? ""}`} id={id}>
      <div className="faixa__media">
        <Image
          src={imagem}
          alt={alt}
          fill
          sizes="100vw"
          className="faixa__img"
          {...(typeof imagem === "string" ? {} : { placeholder: "blur" as const })}
        />
      </div>
      <div className="faixa__veu" aria-hidden="true" />
      <div className="page-shell faixa__conteudo">
        {children}
        {legenda && etiqueta ? (
          <figure className="plaqueta" data-placa="branca">
            <figcaption>
              <span className="plaqueta__etiqueta">{etiqueta}</span>
              <span className="plaqueta__legenda">{legenda}</span>
            </figcaption>
          </figure>
        ) : null}
      </div>
    </section>
  );
}
