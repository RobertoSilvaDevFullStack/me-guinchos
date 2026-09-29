import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  reactStrictMode: true,
  /**
   * Necessário para a imagem Docker enxuta usada no Coolify: o build emite
   * `.next/standalone` com um `server.js` e só as dependências realmente
   * rastreadas, dispensando `node_modules` completo na imagem final.
   * Não altera `npm run dev` nem o comportamento das páginas.
   */
  output: "standalone",
};

export default nextConfig;
