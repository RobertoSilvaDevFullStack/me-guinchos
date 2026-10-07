"use client";

import { useEffect } from "react";
import {
  ehLinkTelefone,
  ehLinkWhatsApp,
  identificarLocalizacaoBotao,
  obterDataLayer,
  registrarCliqueTelefone,
  registrarCliqueWhatsApp,
} from "@/lib/tracking";

/**
 * Componente cliente sem renderização visual que gerencia o listener global
 * unificado para todos os links de contato (WhatsApp e Telefone).
 *
 * Características:
 * - Delegação de evento no window (apenas 1 listener para toda a aplicação).
 * - Suporta navegação SPA / App Router e hidratação sem perder o rastreamento.
 * - Não bloqueia nem atrasa a ação do usuário (não chama preventDefault).
 * - Extrai automaticamente rota atual, localização estrutural do botão e URL.
 * - Evita duplicações com debounce interno em lib/tracking.ts.
 */
export function RastreamentoContatos() {
  useEffect(() => {
    // Garante que o dataLayer exista imediatamente em memória no cliente
    obterDataLayer();

    function tratarCliqueGlobal(evento: MouseEvent) {
      const alvo = evento.target;
      if (!(alvo instanceof Element)) return;

      const link = alvo.closest("a");
      if (!link) return;

      const href = link.href || link.getAttribute("href") || "";
      if (!href) return;

      const page_path = window.location.pathname;
      const page_location = window.location.href;
      const button_location = identificarLocalizacaoBotao(link);

      if (ehLinkWhatsApp(href)) {
        registrarCliqueWhatsApp({
          page_path,
          page_location,
          button_location,
          link_url: href,
        });
      } else if (ehLinkTelefone(href)) {
        registrarCliqueTelefone({
          page_path,
          page_location,
          button_location,
          link_url: href,
        });
      }
    }

    // Usamos capture: true para garantir captura antes de qualquer parada de propagação
    window.addEventListener("click", tratarCliqueGlobal, { capture: true });

    return () => {
      window.removeEventListener("click", tratarCliqueGlobal, { capture: true });
    };
  }, []);

  return null;
}
