import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Painel Privado de Monitoramento | M E Guinchos",
  description:
    "Área administrativa restrita para auditoria de IPs, sessões e entradas pagas identificadas.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function PainelMonitoramentoLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <>{children}</>;
}
