# 07 — Deploy no Coolify

Preparação técnica atualizada em 01/10/2026. **Nada foi publicado por este
handoff.** O bloqueio de publicação continua ativo e a indexação continua
desligada.

## Configuração no Coolify

| Campo | Valor |
|---|---|
| Build Pack | **Dockerfile** (não Nixpacks — ver a ressalva abaixo) |
| Dockerfile | `./Dockerfile`, na raiz do repositório |
| Base Directory | `/` |
| Porta exposta | **3000** |
| Comando de start | definido na imagem: `node server.js` (não sobrescrever) |
| Node | **24.21.0** na imagem; mínimo suportado pelo Next 16 é 20.9.0 |
| Healthcheck | já embutido no Dockerfile: `GET /` a cada 30s, 25s de carência |
| Domínio | `meguinchos.com.br`, canônico sem `www`; DNS, HTTPS, Coolify e Traefik validados externamente |
| SSL | gerenciado pelo Coolify; o projeto não traz Traefik nem Nginx |

O container escuta em `0.0.0.0:3000` via as variáveis `HOSTNAME` e `PORT` já
definidas na imagem. Não há dependência de `localhost` para acesso externo.

### Por que Dockerfile e não Nixpacks

Com Nixpacks o Coolify roda `npm run build` e `npm start`. Isso quebra por dois
motivos: `npm run build` falha de propósito por causa do bloqueio de publicação, e
`npm start` é `next start --hostname 127.0.0.1`, que deixaria o container
inalcançável pelo proxy. O script `start` foi mantido assim de propósito, porque é
usado para testes locais; se um dia o Nixpacks for adotado, ele precisa virar
`next start --hostname 0.0.0.0`.

## Variáveis de ambiente

Já definidas dentro da imagem, **não precisam ser repetidas no Coolify**:

| Variável | Valor | Papel |
|---|---|---|
| `NODE_ENV` | `production` | |
| `HOSTNAME` | `0.0.0.0` | escuta em todas as interfaces |
| `PORT` | `3000` | |
| `NEXT_TELEMETRY_DISABLED` | `1` | |

| Variável | Quando usar |
|---|---|
| `SITE_PREVIEW_BUILD` | **Somente** para gerar artefato de prévia, via `--build-arg`. Ver a seção de bloqueios. Não definir no Coolify para um deploy de produção real. |

Não há segredo, chave de API, banco de dados nem serviço externo. Nenhum `.env` é
necessário e nenhum é copiado para a imagem (`.dockerignore` bloqueia `.env*`).

## Construindo a imagem

```bash
# Produção real — FALHA hoje, de propósito. O bloqueio está intacto.
docker build -t me-guinchos .

# Prévia técnica, para ambiente protegido. Páginas continuam noindex.
docker build --build-arg SITE_PREVIEW_BUILD=1 -t me-guinchos:preview .

docker run --rm -p 3000:3000 me-guinchos:preview
```

## Bloqueios ativos

### 1. Bloqueio de build de produção
`content/site.ts`. Lança erro quando `NODE_ENV=production` e
`SITE_PREVIEW_BUILD` ≠ `"1"`. **Verificado:** `npm run build` sai com código 1 e a
mensagem "Publicação bloqueada: fotos, limites operacionais, trechos, domínio e
política ainda dependem de aprovação (D01–D08)". Precisa ser removido para publicar,
depois que as pendências caírem.

A mensagem cita o gate histórico D01–D08 e foi preservada deliberadamente porque
há registros de validação que dependem do texto exato. O estado atualizado das
decisões está em `docs/00-contexto-fontes.md`; não interpretar a mensagem isolada
como inventário atual de pendências.

### 2. Indexação centralmente bloqueada

`content/site.ts` mantém `INDEXACAO_LIBERADA = false`. `metadataDaRota` aplica
`noindex, nofollow` à home, áreas e política; `app/robots.ts` responde com
`Disallow: /` e sem referência ao sitemap. Devem permanecer assim até autorização
explícita.

### 3. Arquivos de descoberta preparados, sem liberação

`app/robots.ts`, `app/sitemap.ts` e `public/llms.txt` existem. Enquanto
`INDEXACAO_LIBERADA = false`, o sitemap não anuncia nenhuma URL. O `llms.txt` usa
somente fatos confirmados, mas sua presença não substitui autorização para deploy
ou indexação.

## Limitações da validação feita nesta máquina

O build completo da imagem **não pôde ser concluído aqui**. Esta máquina tem
inspeção de TLS na rede: dentro do container, tanto o repositório Alpine quanto o
`registry.npmjs.org` apresentam certificado não confiável
(`UNABLE_TO_VERIFY_LEAF_SIGNATURE`). Isso é ambiente, não projeto — no servidor do
Coolify, com rede normal, o `npm ci` funciona. Nenhuma verificação de TLS foi
desabilitada no Dockerfile para contornar isso.

O que foi possível validar: `docker build --check` (linter do BuildKit) passou sem
nenhum aviso.

**Risco conhecido, não testado:** o Dockerfile não instala `libc6-compat`. O Next 16
usa `@next/swc-linux-x64-musl` e o sharp usa `@img/sharp-linuxmusl-x64`, ambos
nativos de musl, então a dependência não deveria ser necessária. Se o primeiro build
no servidor falhar com erro de carregamento de binário nativo, a correção é uma
linha em cada estágio `deps` e `builder`:

```dockerfile
RUN apk add --no-cache libc6-compat
```

## Checklist para quando o deploy for autorizado

1. Concluir o teste real de WhatsApp/ligação (D02), a precisão necessária de
   setores/trechos (D03) e o inventário das URLs antigas (D06).
2. Obter autorização explícita para publicar; só então remover a trava de produção
   e decidir, em alteração isolada, o destino de `SITE_PREVIEW_BUILD`.
3. Alterar `INDEXACAO_LIBERADA` para `true` apenas na liberação aprovada e conferir
   em conjunto metadata, `robots.txt` e sitemap.
4. Validar `robots.txt`, `sitemap.xml`, `llms.txt`, `metadataBase`, canonical,
   Open Graph/Twitter e JSON-LD no artefato que será publicado.
5. Resolver os três acabamentos visuais pendentes da auditoria: anel de foco com
   contraste insuficiente em fundo claro, cartões do miolo, enquadramento da foto da
   empilhadeira.
6. Adicionar banner de consentimento antes de qualquer script de medição, e
   atualizar a Política de Privacidade — hoje ela afirma que o site não usa cookies
   nem analytics, o que é verdade e deixa de ser no momento em que algo for
   adicionado.
7. Confirmar os redirects 301 conhecidos, `www` → non-www e a ausência de cadeia;
   listar separadamente toda URL antiga ainda sem equivalente comprovado.
8. Rodar o primeiro `docker build` sem `--build-arg` num ambiente com rede limpa e
   confirmar que a imagem sobe e responde.
9. Verificar novamente o DNS/HTTPS já configurado depois do deploy autorizado.
