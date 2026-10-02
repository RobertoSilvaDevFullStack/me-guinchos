/**
 * Número definitivo de telefone e WhatsApp da ME Guinchos, informado pelo
 * responsável do projeto em 01/10/2026 e registrado como fonte de verdade na
 * D02 de `docs/00-contexto-fontes.md`.
 *
 * Substitui o número `+55 11 95199-8799` usado nas prévias de 27–29/09/2026,
 * que estava incorreto. O número abaixo coincide com o exibido pelo site
 * anterior, o que encerra a divergência registrada em `docs/00`.
 *
 * `approvalStatus: "confirmado"` é aprovação **editorial**. O teste técnico dos
 * links em aparelho real — abrir conversa, abrir discador e confirmar o
 * recebimento pelo responsável — continua pendente e segue listado na D02.
 */
const sitePhone = {
  e164: "+5511930299233",
  display: "(11) 93029-9233",
  approvalStatus: "confirmado",
} as const;

const initialMessage = "Olá! Gostaria de consultar um atendimento de guincho.";

export type ContactLinks = {
  whatsappHref: string;
  phoneHref: string;
  phoneDisplay: string;
  approvalStatus: "pendente" | "confirmado";
};

export function buildContactLinks(
  phone: { e164: string; display: string; approvalStatus: ContactLinks["approvalStatus"] },
  message: string,
): ContactLinks {
  if (!/^\+[1-9]\d{7,14}$/.test(phone.e164)) {
    throw new Error("Número de contato inválido: use o formato E.164.");
  }

  if (!phone.display.trim() || !message.trim()) {
    throw new Error("Exibição do telefone e mensagem inicial são obrigatórias.");
  }

  return {
    whatsappHref: `https://wa.me/${phone.e164.slice(1)}?text=${encodeURIComponent(message)}`,
    phoneHref: `tel:${phone.e164}`,
    phoneDisplay: phone.display,
    approvalStatus: phone.approvalStatus,
  };
}

export const siteContactLinks = buildContactLinks(sitePhone, initialMessage);
