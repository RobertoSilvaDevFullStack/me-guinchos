# syntax=docker/dockerfile:1.7
# Serviço Isolado de Monitoramento — ME Guinchos
# Compatível com Coolify 4.6.0 (linux/amd64 e linux/arm64).
# Porta interna exclusiva: 4000 (não utiliza a porta 3000 do Next.js).

ARG NODE_VERSION=24.21.0

FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV HOSTNAME=0.0.0.0

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json tsconfig.json ./
COPY --chown=node:node migrations ./migrations
COPY --chown=node:node src ./src

USER node

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:4000/healthz || exit 1

CMD ["node", "--experimental-strip-types", "src/server.ts"]
