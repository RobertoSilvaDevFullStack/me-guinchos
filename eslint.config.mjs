import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    ".npm-cache/**",
    ".tmp/**",
    "node_modules_stale*/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);
