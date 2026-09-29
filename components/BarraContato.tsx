import { Pictograma } from "@/components/Pictograma";
import { previewContactLinks } from "@/lib/contact";

/** Barra fixa de contato no mobile. As duas ações nunca saem do alcance do polegar. */
export function BarraContato() {
  return (
    <nav className="barra-contato" aria-label="Contato rápido">
      <a
        className="acao acao--whatsapp"
        href={previewContactLinks.whatsappHref}
        aria-label="Consultar pelo WhatsApp"
      >
        <Pictograma nome="whatsapp" tamanho={22} />
        <span>WhatsApp</span>
      </a>
      <a
        className="acao acao--ligar"
        href={previewContactLinks.phoneHref}
        aria-label={`Ligar para ${previewContactLinks.phoneDisplay}`}
      >
        <Pictograma nome="telefone" tamanho={20} />
        <span>Ligar agora</span>
      </a>
    </nav>
  );
}
