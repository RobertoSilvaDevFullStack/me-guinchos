"use client";

import { EVENTO_ABRIR_PREFERENCIAS } from "@/lib/medicao";

/**
 * Reabre o painel de consentimento a partir do rodapé ou da política. Existe
 * para que a escolha seja revogável a qualquer momento, como exige o contrato
 * de consentimento de `docs/05-medicao-privacidade.md`.
 */
export function BotaoPreferencias({ className }: { className?: string }) {
  return (
    <button
      className={className ?? "botao-preferencias"}
      onClick={() => window.dispatchEvent(new Event(EVENTO_ABRIR_PREFERENCIAS))}
      type="button"
    >
      Preferências de privacidade
    </button>
  );
}
