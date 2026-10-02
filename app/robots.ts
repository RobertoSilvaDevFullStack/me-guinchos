import type { MetadataRoute } from "next";
import { INDEXACAO_LIBERADA, siteUrl } from "@/content/site";

/**
 * `/robots.txt` gerado a partir do mesmo sinalizador que governa a metadata, de
 * modo que robots e `<meta name="robots">` não possam divergir.
 *
 * Com `INDEXACAO_LIBERADA = false` (fase atual): `Disallow: /` e **sem**
 * referência ao sitemap. É a camada redundante de proteção enquanto o site
 * ainda não foi autorizado a publicar.
 *
 * Com `true`: libera o rastreamento e passa a apontar o sitemap, como exige o
 * gate de lançamento do projeto.
 *
 * Nota técnica deliberada: `Disallow` impede o rastreador de **ler** o
 * `noindex` da página. Isso é o comportamento desejado agora, porque nada deste
 * código foi publicado ainda e o objetivo é barrar o acesso. Para remover da
 * busca uma URL já indexada, o caminho correto é o inverso — permitir o
 * rastreamento e deixar o `noindex` ser lido.
 */
export default function robots(): MetadataRoute.Robots {
  if (!INDEXACAO_LIBERADA) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
