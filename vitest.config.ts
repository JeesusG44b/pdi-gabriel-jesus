import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Os testes são Node puro. Esta config separada evita carregar o plugin Cloudflare
// e o TanStack Start do vite.config.ts dentro do Vitest.
export default defineConfig({
  plugins: [tsconfigPaths()],
});
