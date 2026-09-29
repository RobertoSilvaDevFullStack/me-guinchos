/** Número confirmado pelo usuário; teste de recebimento em aparelho real segue pendente. */
const previewPhone = {
  e164: "+5511951998799",
  display: "(11) 95199-8799",
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

export const previewContactLinks = buildContactLinks(previewPhone, initialMessage);
