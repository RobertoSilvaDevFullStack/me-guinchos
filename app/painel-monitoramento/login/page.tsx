import type { Metadata } from "next";
import { LoginPainel } from "@/components/painel-monitoramento/LoginPainel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Autenticação Administrativa | Painel de Monitoramento Memoretti",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function PaginaLoginPainelMonitoramento() {
  return <LoginPainel />;
}
