# syntax=docker/dockerfile:1.7
#
# Imagem de produção da ME Guinchos para o Coolify.
# Next.js 16 (App Router) com `output: "standalone"`.
#
# BLOQUEIO DE PUBLICAÇÃO — LEIA ANTES DE CONSTRUIR
# `content/site.ts` lança erro quando NODE_ENV=production e SITE_PREVIEW_BUILD
# não é "1". Isso é proposital: existem pendências (D01–D10 em
# docs/00-contexto-fontes.md) que impedem a publicação. Portanto:
#
#   docker build -t me-guinchos .
#     -> FALHA de propósito. O bloqueio está intacto.
#
#   docker build --build-arg SITE_PREVIEW_BUILD=1 -t me-guinchos:preview .
#     -> gera artefato de PRÉVIA, para validação técnica e ambiente protegido.
#        As páginas continuam com noindex.
#
# A imagem de produção real só deve ser construída depois que as pendências
# forem resolvidas e o bloqueio removido deliberadamente de `content/site.ts`.

ARG NODE_VERSION=24.21.0

# ---------------------------------------------------------------------------
# 1. Dependências — instalação determinística a partir do lockfile.
# ---------------------------------------------------------------------------
# Sem `apk add`: o Node 24 sobre Alpine já resolve os binários musl de que o
# Next 16 e o sharp precisam, e evitar o apk tira uma dependência de rede do
# build — que em redes com inspeção de TLS quebra antes de começar.
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------------------------
# 2. Build — compila o Next.js e emite o servidor standalone.
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Vazio por padrão: mantém o bloqueio de publicação ativo.
ARG SITE_PREVIEW_BUILD=""
ENV SITE_PREVIEW_BUILD=${SITE_PREVIEW_BUILD}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---------------------------------------------------------------------------
# 3. Execução — imagem final enxuta, sem código-fonte e sem node_modules completo.
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# O servidor precisa escutar em todas as interfaces: dentro do container,
# 127.0.0.1 seria inalcançável pelo proxy do Coolify.
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# O mesmo sinalizador usado no build precisa existir em execução: a checagem em
# `content/site.ts` é lida em tempo de execução pelo servidor, não apenas na
# compilação. Imagem de prévia e imagem de produção ficam assim coerentes.
ARG SITE_PREVIEW_BUILD=""
ENV SITE_PREVIEW_BUILD=${SITE_PREVIEW_BUILD}

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs

# O standalone já traz `server.js` e só as dependências rastreadas.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

# Healthcheck sem dependência extra: o wget do BusyBox já existe na Alpine.
# 127.0.0.1 aqui é interno ao container, não uma dependência externa.
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
