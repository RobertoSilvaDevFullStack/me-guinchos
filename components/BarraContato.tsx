import { Pictograma } from "@/components/Pictograma";
import { siteContactLinks } from "@/lib/contact";

/** Barra fixa de contato no mobile. As duas ações nunca saem do alcance do polegar. */
export function BarraContato() {
  return (
    <nav className="barra-contato" aria-label="Contato rápido">
      <a
        className="acao acao--whatsapp"
        href={siteContactLinks.whatsappHref}
        aria-label="Consultar pelo WhatsApp"
        data-tracking-location="floating_bar_whatsapp"
      >
        <Pictograma nome="whatsapp" tamanho={22} />
        <span>WhatsApp</span>
      </a>
      <a
        className="acao acao--ligar"
        href={siteContactLinks.phoneHref}
        aria-label={`Ligar para ${siteContactLinks.phoneDisplay}`}
        data-tracking-location="floating_bar_phone"
      >
        <Pictograma nome="telefone" tamanho={20} />
        <span>Ligar agora</span>
      </a>
    </nav>
  );
}
