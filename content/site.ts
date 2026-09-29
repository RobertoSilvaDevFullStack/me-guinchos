import type { Metadata } from "next";
import galleryCarroBranco from "@/public/images/preview/galeria-carro-branco.jpg";
import galleryCaminhonete from "@/public/images/preview/galeria-caminhonete.jpg";
import galleryEmpilhadeira from "@/public/images/preview/galeria-empilhadeira-noturna.jpg";
import galleryEsportivo from "@/public/images/preview/guincho-carro-esportivo.jpg";
import galleryMotos from "@/public/images/preview/galeria-motos.jpg";
import galleryVan from "@/public/images/preview/galeria-van.jpg";

/**
 * Conteúdo da prévia local, ainda sem aprovação editorial.
 * O build padrão de produção é bloqueado até D01–D08 serem resolvidas.
 * SITE_PREVIEW_BUILD=1 permite somente artefato de prévia local/protegida.
 */
if (process.env.NODE_ENV === "production" && process.env.SITE_PREVIEW_BUILD !== "1") {
  throw new Error(
    "Publicação bloqueada: fotos, limites operacionais, trechos, domínio e política ainda dependem de aprovação (D01–D08).",
  );
}

export const siteContent = {
  brandName: "ME Guinchos",
  home: {
    h1: "Guincho para carros e motos na zona oeste de SP",
    description:
      "Guincho plataforma para carros, motos, vans e utilitários. Informe o veículo, o local e o destino para consultar o atendimento.",
    regionLabel: "Raio aproximado de 20 km a partir da zona oeste de São Paulo. Consulte seu endereço.",
    hoursLabel: "Todos os dias, das 7h às 22h, para todos os serviços.",
    whatsappLabel: "Consultar pelo WhatsApp",
    phoneLabel: "Ligar agora",
  },
  previewNotice:
    "Prévia local. Fotos, limites operacionais, trechos atendidos e dados legais ainda exigem validação. Não publicar.",
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
  atualizadoEm: "29 de setembro de 2026",
  desenvolvedor: {
    nome: "Roberto Silva",
    url: "https://robertosilvadevfullstack.cloud/",
  },
} as const;

/**
 * Seleção manual de fotos do hero, conforme `docs/04-direcao-visual.md`: a troca
 * de foto não altera o H1 nem esconde os dois contatos, e não há avanço
 * automático. As imagens são candidatas — conferir acervo, descrição factual,
 * titularidade e autorização (D07) antes de qualquer página pública.
 */
export const heroFotos = [
  {
    id: "esportivo",
    image: galleryEsportivo,
    alt: "Carro esportivo laranja carregado sobre a plataforma azul do guincho ME, em frente a um galpão de tijolo.",
    caption: "Carro de passeio em plataforma",
  },
  {
    id: "carro-branco",
    image: galleryCarroBranco,
    alt: "Carro branco sobre a plataforma de guincho azul e branco da ME em área aberta.",
    caption: "Transporte de carro",
  },
  {
    id: "motos",
    image: galleryMotos,
    alt: "Três motos e um carro escuro acomodados juntos sobre a plataforma do guincho ME.",
    caption: "Motos e carro na mesma viagem",
  },
  {
    id: "caminhonete",
    image: galleryCaminhonete,
    alt: "Caminhonete preta sobre a plataforma do caminhão guincho azul e branco da ME.",
    caption: "Caminhonete em plataforma",
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
  image: galleryEmpilhadeira,
  alt: "Empilhadeira amarela amarrada sobre a plataforma do guincho ME em atendimento noturno.",
  caption: "Empilhadeira carregada em plataforma, atendimento noturno",
  etiqueta: "Registro da frota ME",
  ctaLabel: "Consultar transporte de empilhadeira",
} as const;

/**
 * `preview` significa apenas que o card pode aparecer no protótipo local.
 * Limites, prova e texto final de cada oferta ainda precisam de revisão editorial.
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

/** Fotos candidatas do acervo ME, com proveniência em public/images/preview/README.md. */
export const galleryItems = [
  {
    id: "esportivo",
    image: galleryEsportivo,
    alt: "Carro esportivo laranja sobre plataforma azul e branca de guincho.",
    caption: "Carro sobre plataforma",
  },
  {
    id: "carro-branco",
    image: galleryCarroBranco,
    alt: "Carro branco sobre plataforma de guincho azul e branco em área aberta.",
    caption: "Transporte de carro",
  },
  {
    id: "caminhonete",
    image: galleryCaminhonete,
    alt: "Caminhonete preta sobre plataforma de caminhão guincho azul e branco.",
    caption: "Caminhonete em plataforma",
  },
  {
    id: "van",
    image: galleryVan,
    alt: "Van branca sobre plataforma de caminhão guincho em via urbana.",
    caption: "Van em plataforma",
  },
  {
    id: "motos",
    image: galleryMotos,
    alt: "Três motos e um carro escuro sobre a plataforma de um caminhão guincho.",
    caption: "Motos e carro em plataforma",
  },
  {
    id: "empilhadeira",
    image: galleryEmpilhadeira,
    alt: "Empilhadeira amarela sobre plataforma de guincho azul e branco à noite.",
    caption: "Empilhadeira em transporte",
  },
] as const;

export const previewMetadata: Metadata = {
  title: "Prévia local | ME Guinchos — guincho para veículos leves",
  description:
    "Prévia local da ME Guinchos. Consulte guincho e serviços com empilhadeira pelo telefone ou WhatsApp.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};
