import type { ReactNode } from "react";

/**
 * Pictogramas autorais no idioma da sinalização viária: massa cheia, sem traço
 * fino, legíveis a 20px. Não usar glifo Unicode nem emoji no lugar deles.
 */

export type NomePictograma =
  | "guincho"
  | "moto"
  | "van"
  | "empilhadeira"
  | "carga"
  | "whatsapp"
  | "telefone"
  | "email"
  | "seta"
  | "local"
  | "relogio"
  | "foto"
  | "cartao"
  | "pix"
  | "dinheiro";

const desenhos: Record<NomePictograma, ReactNode> = {
  guincho: (
    <>
      <path d="M2 20h12l5 7v6H2z" />
      <path d="M17 28h29v6H17z" />
      <path d="M24 15h10l5 8v5H24z" />
      <circle cx="9" cy="38" r="5.5" />
      <circle cx="37" cy="38" r="5.5" />
    </>
  ),
  moto: (
    <>
      <circle cx="10" cy="34" r="7" />
      <circle cx="38" cy="34" r="7" />
      <path d="M13 31l7-10h8l7 10z" />
      <rect x="14" y="16" width="14" height="5" rx="2" />
      <path d="M26 11h11v4h-7l-4 4z" />
    </>
  ),
  van: (
    <>
      <path d="M3 14h24v22H3z" />
      <path d="M27 19h8l9 9v8H27z" />
      <circle cx="13" cy="37" r="5.5" />
      <circle cx="36" cy="37" r="5.5" />
    </>
  ),
  empilhadeira: (
    <>
      <path d="M4 22h16v14H4z" />
      <path d="M6 8h16v3.5H6z" />
      <path d="M6 8h3.5v14H6z" />
      <path d="M19 8h4v28h-4z" />
      <path d="M23 30h15v4H23z" />
      <circle cx="11" cy="39" r="5.5" />
      <circle cx="22" cy="40" r="3.5" />
    </>
  ),
  carga: (
    <>
      <path d="M5 16h38v6H5z" />
      <path d="M9 22h30v18H9z" />
      <path d="M21 22h6v18h-6z" fillOpacity="0" />
      <path d="M2 40h44v4H2z" />
    </>
  ),
  whatsapp: (
    <g fillRule="evenodd" clipRule="evenodd">
      <path d="M24 3C12.4 3 3 12.4 3 24c0 3.9 1.1 7.6 3 10.8L3.2 45l10.6-2.7A21 21 0 1 0 24 3zm0 4.2a16.8 16.8 0 1 1-8.8 31.1l-.8-.5-5.4 1.4 1.4-5.2-.5-.8A16.8 16.8 0 0 1 24 7.2z" />
      <path d="M17.8 14.6c.6 0 1.1.3 1.3.8l1.9 4.4c.2.5.1 1.1-.3 1.5l-1.5 1.4c-.4.4-.5 1-.2 1.4a15.2 15.2 0 0 0 6.3 6.3c.5.3 1 .2 1.4-.2l1.4-1.5c.4-.4 1-.5 1.5-.3l4.4 1.9c.5.2.8.7.8 1.3 0 2.9-2.3 5.2-5.2 5.2-9.2 0-17.1-7.9-17.1-17.1 0-2.9 2.3-5.2 5.2-5.2z" />
    </g>
  ),
  telefone: (
    <path d="M13.6 4c1.1 0 2 .7 2.4 1.7l2.6 7.1c.3 1-.1 2.1-1 2.7l-3.4 2.2a26.6 26.6 0 0 0 12.1 12.1l2.2-3.4c.6-.9 1.7-1.3 2.7-1l7.1 2.6c1 .4 1.7 1.3 1.7 2.4v3.9c0 4.3-3.5 7.7-7.7 7.7C17.6 42 6 30.4 6 11.7 6 7.5 9.4 4 13.7 4z" />
  ),
  email: (
    <g fillRule="evenodd" clipRule="evenodd">
      <path d="M4.4 8h39.2A3.4 3.4 0 0 1 47 11.4v1.9L24 27.8 1 13.3v-1.9A3.4 3.4 0 0 1 4.4 8zM1 18.7v17.9A3.4 3.4 0 0 0 4.4 40h39.2a3.4 3.4 0 0 0 3.4-3.4V18.7L24 33.2z" />
    </g>
  ),
  seta: <path d="M17 5l19 19-19 19-5.4-5.4L25.2 24 11.6 10.4z" />,
  local: (
    <g fillRule="evenodd" clipRule="evenodd">
      <path d="M24 2C15.2 2 8 9.2 8 18c0 11.9 16 28 16 28s16-16.1 16-28c0-8.8-7.2-16-16-16zm0 21.4a5.4 5.4 0 1 1 0-10.8 5.4 5.4 0 0 1 0 10.8z" />
    </g>
  ),
  relogio: (
    <g fillRule="evenodd" clipRule="evenodd">
      <path d="M24 2a22 22 0 1 0 0 44 22 22 0 0 0 0-44zm0 6.4a15.6 15.6 0 1 1 0 31.2 15.6 15.6 0 0 1 0-31.2z" />
      <path d="M21.4 12h5.2v11.4h9.2v5.2H21.4z" />
    </g>
  ),
  foto: (
    <g fillRule="evenodd" clipRule="evenodd">
      <path d="M18.4 5h11.2l3 5.2H42a3.6 3.6 0 0 1 3.6 3.6v25.6A3.6 3.6 0 0 1 42 43H6a3.6 3.6 0 0 1-3.6-3.6V13.8A3.6 3.6 0 0 1 6 10.2h9.4zM24 15.6a11.6 11.6 0 1 0 0 23.2 11.6 11.6 0 0 0 0-23.2zm0 5.8a5.8 5.8 0 1 1 0 11.6 5.8 5.8 0 0 1 0-11.6z" />
    </g>
  ),
  cartao: (
    <g fillRule="evenodd" clipRule="evenodd">
      <path d="M5.6 8h36.8A3.6 3.6 0 0 1 46 11.6V17H2v-5.4A3.6 3.6 0 0 1 5.6 8zM2 22.6h44v13.8a3.6 3.6 0 0 1-3.6 3.6H5.6A3.6 3.6 0 0 1 2 36.4zm6 8.6h11.4v5H8z" />
    </g>
  ),
  pix: (
    <path d="M24 2.6l8.6 8.6-8.6 8.6-8.6-8.6zM11.2 15.4l8.6 8.6-8.6 8.6L2.6 24zm25.6 0L45.4 24l-8.6 8.6-8.6-8.6zM24 28.2l8.6 8.6L24 45.4l-8.6-8.6z" />
  ),
  dinheiro: (
    <g fillRule="evenodd" clipRule="evenodd">
      <path d="M3 10h42a2 2 0 0 1 2 2v24a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2zm21 7.2a6.8 6.8 0 1 0 0 13.6 6.8 6.8 0 0 0 0-13.6zM7 15.4h5v5H7zm29 12.2h5v5h-5z" />
    </g>
  ),
};

interface PictogramaProps {
  nome: NomePictograma;
  /** Lado do quadrado em pixels. */
  tamanho?: number;
  className?: string;
}

export function Pictograma({ nome, tamanho = 24, className }: PictogramaProps) {
  return (
    <svg
      className={className}
      width={tamanho}
      height={tamanho}
      viewBox="0 0 48 48"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {desenhos[nome]}
    </svg>
  );
}
