import type { Metadata } from "next";
import guinchoBarco from "@/public/images/operacoes/guincho-barco.webp";
import guinchoBobcat from "@/public/images/operacoes/guincho-bobcat.webp";
import guinchoCaminhaoPesado from "@/public/images/operacoes/guincho-caminhao-pesado.webp";
import guinchoCarroLuxo from "@/public/images/operacoes/guincho-carro-luxo.webp";
import guinchoEmpilhadeira7Ton from "@/public/images/operacoes/guincho-empilhadeira-7-ton.webp";
import guinchoEmpilhadeiras from "@/public/images/operacoes/guincho-empilhadeiras.webp";
import guinchoMaquinaRetroescavadeira from "@/public/images/operacoes/guincho-maquina-retroescavadeira.webp";
import guinchoPlataformaElevatoria from "@/public/images/operacoes/guincho-plataforma-elevatoria.webp";
import guinchoPlataformaGrande from "@/public/images/operacoes/guincho-plataforma-grande.webp";
import guinchoRetroescavadeira from "@/public/images/operacoes/guincho-retroescavadeira.webp";
import guinchoTresVeiculos from "@/public/images/operacoes/guincho-tres-veiculos.webp";
import guinchoVanLonga from "@/public/images/operacoes/guincho-van-longa.webp";

/**
 * Liberação de produção e indexação para Google Ads e SEO Local (07/10/2026).
 *
 * Autorizado pelo responsável para auditoria e ativação completa de rastreamento,
 * conversões do Google Ads e páginas locais indexáveis.
 */
export const siteUrl = "https://memorettiguinchos.com.br";

/**
 * Único ponto de liberação de indexação do projeto.
 *
 * Definido como `true` para garantir que o sitemap.xml, robots.txt e tags
 * <meta name="robots"> estejam devidamente configurados para rastreamento
 * e indexação pelo Google Search Console e campanhas do Google Ads.
 */
export const INDEXACAO_LIBERADA = true;

export const siteContent = {
  brandName: "ME Guinchos",
  home: {
    h1: "Guincho para carros e motos na zona oeste de SP",
    description:
      "Guincho plataforma para carros, motos, vans e utilitários. Informe o veículo, o local e o destino para consultar o atendimento.",
    regionLabel: "Raio aproximado de 20 km a partir da zona oeste de São Paulo. Consulte seu endereço.",
    hoursLabel: "Atendimento 24 horas, todos os dias da semana, para todos os serviços.",
    whatsappLabel: "Consultar pelo WhatsApp",
    phoneLabel: "Ligar agora",
  },
} as const;

/**
 * Dados legais retirados do Comprovante de Inscrição e Situação Cadastral do
 * CNPJ, fornecido pelo usuário em 29/09/2026. Resolvem a D08 de
 * `docs/00-contexto-fontes.md` quanto a razão social, CNPJ, endereço e canal de
 * privacidade.
 *
 * `nomeComercial` é o que aparece na interface; `razaoSocial` só é usada onde há
 * necessidade de identificação jurídica.
 */
export const legalContent = {
  nomeComercial: "ME Guinchos",
  razaoSocial: "59.703.468 LUIS CARLOS MORETTI DO NASCIMENTO",
  cnpj: "59.703.468/0001-95",
  atividadePrincipal: "Serviços de reboque de veículos",
  endereco: {
    logradouro: "Rua Martinho de Campos, 538",
    bairro: "Vila Anastácio",
    cidadeUf: "São Paulo/SP",
    cep: "05093-050",
  },
  /** Canal de comunicação com o titular, exigido pela Resolução CD/ANPD nº 2/2022. */
  emailPrivacidade: "MORETTI95@GMAIL.COM",
  anoCorrente: 2026,
  atualizadoEm: "7 de outubro de 2026",
  desenvolvedor: {
    nome: "Roberto Silva",
    url: "https://robertosilvadevfullstack.cloud/",
  },
} as const;

/**
 * Seleção manual de fotos do hero, conforme `docs/04-direcao-visual.md`: a troca
 * de foto não altera o H1 nem esconde os dois contatos, e não há avanço
 * automático.
 *
 * D07 encerrada em 01/10/2026: as fotos pertencem ao Manoel / ME Guinchos e o
 * proprietário confirmou o uso delas no novo site. As descrições factuais e o
 * inventário ficam em `public/images/operacoes/README.md`. Nada além dessa
 * confirmação foi declarado sobre autoria ou licenciamento.
 */
export const heroFotos = [
  {
    id: "tres-veiculos",
    image: guinchoTresVeiculos,
    alt: "Três carros brancos transportados pelo caminhão-plataforma da ME Guinchos em via urbana.",
    caption: "Guincho para 3 veículos",
  },
  {
    id: "carro-luxo",
    image: guinchoCarroLuxo,
    alt: "Carro esportivo preto transportado sobre a plataforma azul da ME Guinchos.",
    caption: "Guincho para carro de luxo",
  },
  {
    id: "van-longa",
    image: guinchoVanLonga,
    alt: "Van branca de carroceria longa transportada sobre a plataforma azul da ME Guinchos.",
    caption: "Guincho para van longa",
  },
  {
    id: "barco",
    image: guinchoBarco,
    alt: "Embarcação branca com motor de popa transportada sobre a plataforma azul da ME Guinchos.",
    caption: "Guincho para barco · Guincho para embarcações",
  },
] as const;

/**
 * Eixo de empilhadeira. Ganha seção própria em vez de virar o segundo slide de
 * um carrossel: é o posicionamento que o concorrente não copia.
 * A foto mostra transporte em plataforma, não operação com empilhadeira no
 * local — o texto não pode sugerir o contrário.
 */
export const empilhadeiraContent = {
  title: "A empilhadeira também é nossa.",
  description:
    "Além do guincho, a ME carrega e transporta empilhadeiras em plataforma e faz movimentação de cargas com empilhadeira própria. Informe o equipamento, a carga e o local para avaliar as condições.",
  image: guinchoEmpilhadeiras,
  alt: "Duas empilhadeiras alaranjadas transportadas sobre a plataforma azul da ME Guinchos.",
  caption: "Guincho para empilhadeira",
  etiqueta: "Registro da frota ME",
  ctaLabel: "Consultar transporte de empilhadeira",
} as const;

/**
 * D01 e D05 resolvidas editorialmente em 01/10/2026: a redação permanece
 * **consultiva por decisão**, sem tonelagem, peso máximo, modelos suportados
 * nem restrição operacional. As condições de cada chamado são confirmadas no
 * atendimento. Acrescentar limite técnico aqui reabre D01/D05 e exige nova
 * confirmação do responsável.
 *
 * O campo `status` ficou sem leitor depois dessa decisão — nenhuma oferta é
 * marcada como pendente na interface, porque nenhuma é apresentada como
 * fechada. Mantido apenas como registro da origem do cartão.
 */
export const serviceCards = [
  {
    id: "carros",
    icone: "guincho",
    title: "Guincho para carros",
    description:
      "Seu carro precisa de transporte? Informe onde ele está e para onde precisa ir para consultar o atendimento.",
    ctaLabel: "Consultar atendimento",
    status: "preview",
  },
  {
    id: "motos",
    icone: "moto",
    title: "Guincho para motos",
    description:
      "Precisa transportar uma moto? Informe o local e o destino para confirmar as condições do serviço.",
    ctaLabel: "Consultar atendimento",
    status: "preview",
  },
  {
    id: "vans",
    icone: "van",
    title: "Guincho para vans e utilitários",
    description:
      "Informe o modelo, o local e o destino. A capacidade de atendimento para o veículo precisa ser confirmada.",
    ctaLabel: "Consultar atendimento",
    status: "preview",
  },
  {
    id: "transporte-empilhadeiras",
    icone: "empilhadeira",
    title: "Carregamento e transporte de empilhadeiras",
    description:
      "Para carregar e transportar uma empilhadeira, informe local, destino e dados do equipamento. As condições são avaliadas no atendimento.",
    ctaLabel: "Consultar transporte",
    status: "preview",
  },
  {
    id: "operacao-empilhadeira",
    icone: "carga",
    title: "Movimentação de cargas com empilhadeira própria",
    description:
      "Movimentação de cargas com empilhadeira própria. Informe o tipo de carga e o local para avaliar as condições da operação.",
    ctaLabel: "Consultar movimentação",
    status: "preview",
  },
] as const;

/**
 * Pix, cartões e dinheiro confirmados (D08). As artes de pagamento foram
 * autorizadas a permanecer no projeto pelo responsável em 01/10/2026 — a
 * ressalva de origem levantada na auditoria de readiness foi decidida, não
 * esquecida, e deixou de ser bloqueador de publicação.
 *
 * Condições de pagamento não informadas continuam fora: o texto remete ao
 * fechamento do chamado em vez de prometer parcelamento ou modalidade.
 */
export const paymentContent = {
  title: "Formas de pagamento",
  description:
    "Aceitamos Pix, cartões de crédito/débito e dinheiro para sua maior comodidade. Condições são confirmadas no fechamento do chamado.",
  methods: [
    {
      id: "pix",
      title: "Pix",
      subtitle: "Transferência instantânea via QR Code ou chave",
      imageSrc: "/images/preview/pix-pagamento.webp",
      imageAlt: "Logotipo oficial do Pix powered by Banco Central",
      badge: "Instantâneo",
      icone: "pix",
    },
    {
      id: "cartoes",
      title: "Cartões",
      subtitle: "Aceitamos as principais bandeiras no débito e crédito",
      imageSrc: "/images/preview/cartoes-pagamento.webp",
      imageAlt: "Bandeiras aceitas: Mastercard, Visa, American Express, Diners Club, Hipercard e Elo",
      badge: "Débito e Crédito",
      icone: "cartao",
    },
    {
      id: "dinheiro",
      title: "Dinheiro",
      subtitle: "Pagamento em espécie diretamente ao operador no local",
      imageSrc: null,
      imageAlt: null,
      badge: "À vista",
      icone: "dinheiro",
    },
  ],
} as const;

export const coverageContent = {
  summary: "A referência de atendimento é um raio aproximado de 20 km a partir da zona oeste de São Paulo. Confirme o endereço e o trecho antes de fechar o serviço.",
  places: [
    "Barueri",
    "Osasco",
    "setores de São Paulo, incluindo Perus",
    "Caieiras",
    "região de Polvilho",
    "setores de São Caetano do Sul",
    "Taboão da Serra",
    "Embu das Artes",
  ],
} as const;

/** Fotos do acervo ME autorizadas (D07); proveniência em public/images/operacoes/README.md. */
export const galleryItems = [
  {
    id: "barco",
    image: guinchoBarco,
    alt: "Embarcação branca com motor de popa transportada sobre a plataforma azul da ME Guinchos.",
    caption: "Guincho para barco · Guincho para embarcações",
  },
  {
    id: "caminhao-pesado",
    image: guinchoCaminhaoPesado,
    alt: "Cavalo mecânico branco transportado sobre um caminhão-plataforma cinza.",
    caption: "Guincho para caminhão pesado",
  },
  {
    id: "maquina-retroescavadeira",
    image: guinchoMaquinaRetroescavadeira,
    alt: "Escavadeira amarela sobre caminhão-plataforma verde em via molhada.",
    caption: "Guincho para máquinas · Guincho para retroescavadeira",
  },
  {
    id: "carro-luxo",
    image: guinchoCarroLuxo,
    alt: "Carro esportivo preto transportado sobre a plataforma azul da ME Guinchos.",
    caption: "Guincho para carro de luxo",
  },
  {
    id: "empilhadeiras",
    image: guinchoEmpilhadeiras,
    alt: "Duas empilhadeiras alaranjadas transportadas sobre a plataforma azul da ME Guinchos.",
    caption: "Guincho para empilhadeira",
  },
  {
    id: "van-longa",
    image: guinchoVanLonga,
    alt: "Van branca de carroceria longa transportada sobre a plataforma azul da ME Guinchos.",
    caption: "Guincho para van longa",
  },
  {
    id: "empilhadeira-7-ton",
    image: guinchoEmpilhadeira7Ton,
    alt: "Empilhadeira verde transportada sobre a plataforma azul da ME Guinchos.",
    caption: "Guincho para empilhadeira de 7 toneladas",
  },
  {
    id: "bobcat",
    image: guinchoBobcat,
    alt: "Minicarregadeira amarela transportada sobre a plataforma azul da ME Guinchos.",
    caption: "Guincho para Bobcat",
  },
  {
    id: "retroescavadeira",
    image: guinchoRetroescavadeira,
    alt: "Retroescavadeira amarela transportada sobre caminhão-plataforma branco e vermelho.",
    caption: "Guincho para retroescavadeira",
  },
  {
    id: "plataforma-elevatoria",
    image: guinchoPlataformaElevatoria,
    alt: "Plataforma elevatória articulada azul transportada sobre a plataforma da ME Guinchos.",
    caption: "Guincho para plataforma elevatória",
  },
  {
    id: "plataforma-grande",
    image: guinchoPlataformaGrande,
    alt: "Caminhão baú branco transportado sobre um caminhão-plataforma branco.",
    caption: "Guincho plataforma grande",
  },
  {
    id: "tres-veiculos",
    image: guinchoTresVeiculos,
    alt: "Três carros brancos transportados pelo caminhão-plataforma da ME Guinchos em via urbana.",
    caption: "Guincho para 3 veículos",
  },
] as const;

/**
 * Imagem de compartilhamento. Usa foto do acervo da ME autorizada pelo
 * proprietário em 01/10/2026 (D07). A versão 1200×630 foi gerada a partir do
 * arquivo atualizado enviado pelo Manoel na mesma data e não depende da cópia
 * de 600×400 px usada na prévia anterior.
 */
export const openGraphImage = {
  url: "/images/operacoes/guincho-caminhao-pesado-og.jpg",
  width: 1200,
  height: 630,
  alt: "Cavalo mecânico branco transportado sobre um caminhão-plataforma.",
} as const;

/**
 * Metadata de produção por rota: `metadataBase`, canonical absoluta, Open Graph
 * e Twitter já definitivos, com `robots` derivado de `INDEXACAO_LIBERADA`.
 *
 * Enquanto o sinalizador é `false`, cada rota continua `noindex, nofollow`
 * mesmo com título, canonical e OG finais — é o que permite validar a camada de
 * descoberta antes de abrir a indexação.
 *
 * `path` é o caminho canônico com barra inicial; `"/"` para a home.
 */
export function metadataDaRota({
  path,
  title,
  description,
}: {
  path: string;
  title: string;
  description: string;
}): Metadata {
  return {
    metadataBase: new URL(siteUrl),
    verification: {
      google: "lMdjHbskLXplkLzO-IQP-vEKVyJBvF-wal8m9GCGZno",
    },
    title,
    description,
    alternates: { canonical: path },
    robots: INDEXACAO_LIBERADA
      ? { index: true, follow: true, googleBot: { index: true, follow: true } }
      : { index: false, follow: false, googleBot: { index: false, follow: false } },
    openGraph: {
      type: "website",
      siteName: siteContent.brandName,
      locale: "pt_BR",
      url: path,
      title,
      description,
      images: [openGraphImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [openGraphImage.url],
    },
  };
}

/** Metadata da home. Título e descrição definitivos, sem rótulo de prévia. */
export const homeMetadata: Metadata = metadataDaRota({
  path: "/",
  title: "ME Guinchos — guincho para carros, motos, vans e empilhadeiras em SP",
  description:
    "Guincho plataforma para carros, motos, vans e utilitários na zona oeste de São Paulo, com empilhadeira própria para transporte e movimentação de cargas. Atendimento 24 horas, de domingo a domingo.",
});
