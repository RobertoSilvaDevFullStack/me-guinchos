import type { MetadataRoute } from "next";
import { INDEXACAO_LIBERADA, siteUrl } from "@/content/site";

/**
 * Com a indexação bloqueada, não anuncia nenhuma URL. Isso mantém a prévia
 * fora do sitemap conforme a Spec 001, ainda que `/sitemap.xml` exista para
 * validação técnica antes da liberação.
 *
 * Quando `INDEXACAO_LIBERADA` for autorizado, inclui somente as três rotas que
 * realmente existem, respondem 200 e são canônicas. Rotas planejadas em
 * `docs/03-conteudo-seo.md` — páginas por serviço, cidade e trecho de rodovia —
 * só entram aqui quando existirem e tiverem cobertura aprovada (D03).
 *
 * `lastModified` é omitido de propósito: o plano de validação exige `lastmod`
 * **apenas quando real**, e usar a data do build produziria uma data de
 * alteração falsa a cada deploy.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!INDEXACAO_LIBERADA) {
    return [];
  }

  return [
    { url: `${siteUrl}/`, changeFrequency: "monthly", priority: 1 },
    {
      url: `${siteUrl}/guincho-24-horas`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/transporte-de-veiculos`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/transporte-de-empilhadeiras`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/solicitar-orcamento`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/servicos-de-reboque`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/guincho-lapa-sp`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/guincho-vila-anastacio`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/guincho-marginal-tiete`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/guincho-zona-oeste-sp`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/guincho-osasco`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/areas-de-atendimento`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/politica-de-privacidade`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
