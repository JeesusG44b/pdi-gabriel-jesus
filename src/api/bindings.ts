export interface AppEnv {
  DB: D1Database;
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
}

let cached: AppEnv | undefined;

// O guia oficial do TanStack Start na Cloudflare usa `env` de `cloudflare:workers`
// tanto em dev quanto em produção, com o plugin @cloudflare/vite-plugin no Vite.
// Não usamos mais getPlatformProxy.
export async function getBindings(): Promise<AppEnv> {
  if (cached) return cached;
  const mod = await import("cloudflare:workers");
  cached = (mod as unknown as { env: AppEnv }).env;
  return cached;
}
