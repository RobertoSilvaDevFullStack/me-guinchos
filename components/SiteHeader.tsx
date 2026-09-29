import Image from "next/image";
import Link from "next/link";
import { Pictograma } from "@/components/Pictograma";
import { siteContent } from "@/content/site";
import { previewContactLinks } from "@/lib/contact";

const atalhos = [
  { href: "/#servicos", rotulo: "Serviços" },
  { href: "/#atendimento", rotulo: "Como acionar" },
  { href: "/#registros", rotulo: "Registros" },
  { href: "/#pagamento", rotulo: "Pagamento" },
] as const;

export function SiteHeader() {
  return (
    <header className="cabecalho">
      <div className="page-shell cabecalho__interno">
        <Link
          className="marca"
          href="/"
          aria-label={`${siteContent.brandName}, início`}
        >
          <Image
            src="/images/preview/logo-me-guinchos-sem-fundo.png"
            alt="ME Guinchos — guincho com empilhadeira para veículos leves"
            width={260}
            height={104}
            priority
            className="marca__logo"
          />
        </Link>

        <nav className="cabecalho__atalhos" aria-label="Seções da página">
          {atalhos.map((atalho) => (
            <a key={atalho.href} href={atalho.href}>
              {atalho.rotulo}
            </a>
          ))}
        </nav>

        <a
          className="acao acao--whatsapp acao--compacta"
          href={previewContactLinks.whatsappHref}
        >
          <Pictograma nome="whatsapp" tamanho={20} />
          <span className="acao__rotulo">Chamar no WhatsApp</span>
          <span className="acao__rotulo-curto">WhatsApp</span>
        </a>
      </div>
    </header>
  );
}
