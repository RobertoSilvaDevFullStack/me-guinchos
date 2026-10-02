import {
  legalContent,
  openGraphImage,
  serviceCards,
  siteContent,
  siteUrl,
} from "@/content/site";
import { siteContactLinks } from "@/lib/contact";

/**
 * JSON-LD da ME Guinchos — somente dados confirmados.
 *
 * O que entra, e por quê:
 * - identificação jurídica, endereço e CEP vêm do Comprovante de Inscrição do
 *   CNPJ (D08) e já são exibidos na Política de Privacidade, portanto não há
 *   dado novo sendo tornado público aqui;
 * - telefone é o número definitivo da D02;
 * - horário é a janela confirmada na D04: todos os dias, 7h–22h, igual para
 *   todos os serviços. Nunca "24h";
 * - formas de pagamento são as confirmadas na D08;
 * - os serviços reproduzem os cartões da home, sem limite técnico, coerentes
 *   com a decisão consultiva de D01/D05.
 *
 * O que fica deliberadamente **fora**:
 * - `areaServed`: a D03 autoriza apenas um raio aproximado. Listar municípios
 *   em dado estruturado os transformaria em promessa de cobertura integral;
 * - `geo`: não há coordenada confirmada;
 * - `priceRange`, `aggregateRating`, `review`: não existem dados aprovados e
 *   avaliação não pode ser inventada.
 *
 * O bloco é emitido mesmo com a indexação fechada: enquanto `noindex` estiver
 * ativo nenhum buscador o consome, e tê-lo no HTML é o que permite validar a
 * marcação no teste de resultados avançados antes de abrir a indexação.
 */
const horarioConfirmado = {
  "@type": "OpeningHoursSpecification",
  dayOfWeek: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
  opens: "07:00",
  closes: "22:00",
} as const;

const negocio = {
  "@type": "LocalBusiness",
  "@id": `${siteUrl}/#negocio`,
  name: siteContent.brandName,
  legalName: legalContent.razaoSocial,
  taxID: legalContent.cnpj,
  description:
    "Guincho plataforma para carros, motos, vans e utilitários, transporte de empilhadeiras e movimentação de cargas com empilhadeira própria.",
  url: siteUrl,
  logo: `${siteUrl}/images/preview/logo-me-guinchos-sem-fundo.png`,
  image: `${siteUrl}${openGraphImage.url}`,
  telephone: siteContactLinks.phoneHref.replace("tel:", ""),
  email: legalContent.emailPrivacidade,
  address: {
    "@type": "PostalAddress",
    streetAddress: legalContent.endereco.logradouro,
    addressLocality: "São Paulo",
    addressRegion: "SP",
    postalCode: legalContent.endereco.cep,
    addressCountry: "BR",
  },
  openingHoursSpecification: [horarioConfirmado],
  currenciesAccepted: "BRL",
  paymentAccepted: "Pix, cartão de crédito, cartão de débito, dinheiro",
  makesOffer: serviceCards.map((servico) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: servico.title,
      description: servico.description,
      provider: { "@id": `${siteUrl}/#negocio` },
    },
  })),
} as const;

const website = {
  "@type": "WebSite",
  "@id": `${siteUrl}/#site`,
  url: siteUrl,
  name: siteContent.brandName,
  inLanguage: "pt-BR",
  publisher: { "@id": `${siteUrl}/#negocio` },
} as const;

const grafo = {
  "@context": "https://schema.org",
  "@graph": [negocio, website],
};

export function DadosEstruturados() {
  return (
    <script
      type="application/ld+json"
      // Conteúdo estático do repositório, serializado por JSON.stringify.
      // Nenhuma entrada de visitante chega aqui.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(grafo) }}
    />
  );
}
