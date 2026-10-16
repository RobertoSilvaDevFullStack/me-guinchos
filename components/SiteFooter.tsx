import Link from "next/link";
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
              <dd>Atendimento 24 horas, todos os dias</dd>
            </div>
            <div>
              <dt>
                <Pictograma nome="telefone" tamanho={16} />
                Contato
              </dt>
              <dd>
                <a href={siteContactLinks.phoneHref} data-tracking-location="footer_phone">
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
          <Link href="/guincho-24-horas">Guincho 24 Horas</Link>
          <Link href="/transporte-de-veiculos">Transporte de Veículos</Link>
          <Link href="/transporte-de-empilhadeiras">Transporte de Empilhadeiras</Link>
          <Link href="/servicos-de-reboque">Serviços de Reboque</Link>
          <Link href="/solicitar-orcamento">Solicitar Orçamento</Link>
          <Link href="/areas-de-atendimento">Áreas para consulta</Link>
          <Link href="/guincho-lapa-sp">Lapa</Link>
          <Link href="/guincho-vila-anastacio">Vila Anastácio</Link>
          <Link href="/guincho-marginal-tiete">Marginal Tietê</Link>
          <Link href="/guincho-zona-oeste-sp">Zona Oeste SP</Link>
          <Link href="/guincho-osasco">Osasco</Link>
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
