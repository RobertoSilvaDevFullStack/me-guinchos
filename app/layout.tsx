import type { ReactNode } from "react";
import type { Viewport } from "next";
import { ConsentimentoMedicao } from "@/components/ConsentimentoMedicao";
import { DadosEstruturados } from "@/components/DadosEstruturados";
import { homeMetadata } from "@/content/site";
import "./globals.css";

export const metadata = homeMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // A barra do navegador no celular entra no sistema em vez de ficar branca.
  themeColor: "#04203f",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="preload"
          href="/fonts/overpass-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <DadosEstruturados />
        {children}
        <ConsentimentoMedicao />
      </body>
    </html>
  );
}
