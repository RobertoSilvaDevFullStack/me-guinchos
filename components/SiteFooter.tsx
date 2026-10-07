import Link from "next/link";
import { BotaoPreferencias } from "@/components/BotaoPreferencias";
import { Pictograma } from "@/components/Pictograma";
import { legalContent, siteContent } from "@/content/site";
import { siteContactLinks } from "@/lib/contact";

const navegacao = [
  { href: "/#servicos", rotulo: "Serviços" },
  { href: "/#atendimento", rotulo: "Como acionar" },
  { href: "/#registros", rotulo: "Registros" },
  { href: "/#pagamento", rotulo: "Pagamento" },
] as const;

export function SiteFooter() {
  return (
    <footer className="rodape">
      <div className="page-shell rodape__interno">
        <div className="rodape__identidade">
          <strong className="rodape__marca">{siteContent.brandName}</strong>
          <p className="rodape__resumo">
            Guincho plataforma para veículos leves e soluções com empilhadeira
            própria, na zona oeste de São Paulo.
          </p>
          <dl className="rodape__dados">
            <div>
              <dt>
                <Pictograma nome="relogio" tamanho={16} />
                Horário
              </dt>
              <dd>Domingo a domingo, das 7h às 22h</dd>
            </div>
            <div>
              <dt>
                <Pictograma nome="telefone" tamanho={16} />
                Contato
              </dt>
              <dd>
                <a href={siteContactLinks.phoneHref}>
                  {siteContactLinks.phoneDisplay}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <nav className="rodape__nav" aria-label="Navegação do rodapé">
          {navegacao.map((item) => (
            <a key={item.href} href={item.href}>
              {item.rotulo}
            </a>
          ))}
          <Link href="/areas-de-atendimento">Áreas para consulta</Link>
          <BotaoPreferencias className="rodape__preferencias" />
        </nav>
      </div>

      <div className="rodape__legal">
        <div className="page-shell rodape__legal-interno">
          <p className="rodape__direitos">
            <span>
              © {legalContent.anoCorrente} {legalContent.nomeComercial}. Todos os
              direitos reservados.
            </span>
            <span>
              CNPJ {legalContent.cnpj} —{" "}
              <Link href="/politica-de-privacidade">Política de Privacidade</Link>
            </span>
          </p>

          <p className="rodape__credito">
            Desenvolvido por{" "}
            <a
              href={legalContent.desenvolvedor.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {legalContent.desenvolvedor.nome}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
