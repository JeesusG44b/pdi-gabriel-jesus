import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminMiddleware } from "./auth";

// Teste adicionado pelo qa-verifier (Fase 4). Controle positivo do middleware:
// o teste "sem sessão é rejeitada" em disciplinas.test.ts só prova que o middleware
// recusa quando não há cookie. Aqui confirmo que um cookie válido passa, e que
// assinatura errada ou sessão expirada são recusadas.

const SEGREDO_DE_TESTE = "segredo-de-teste-qa-nao-e-producao";

let cookieAtual: string | undefined;

vi.mock("@tanstack/react-start/server", () => ({
  getCookie: vi.fn(() => cookieAtual),
  setCookie: vi.fn(),
  deleteCookie: vi.fn(),
}));

vi.mock("./bindings", () => ({
  getBindings: async () => ({ SESSION_SECRET: SEGREDO_DE_TESTE }),
}));

// Mesmo formato que signSession() em auth.ts: `${exp}.${hmac(secret, "admin:" + exp)}` em base64url.
async function assinar(secret: string, exp: number): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`admin:${exp}`));
  return `${exp}.${Buffer.from(new Uint8Array(sig)).toString("base64url")}`;
}

async function rodarMiddleware(): Promise<{ passou: boolean; resultado?: unknown; erro?: string }> {
  const next = vi.fn(async () => "executado");
  try {
    const resultado = await adminMiddleware.options.server!({ next } as never);
    return { passou: next.mock.calls.length > 0, resultado };
  } catch (e) {
    return { passou: false, erro: (e as Error).message };
  }
}

describe("adminMiddleware com sessão", () => {
  beforeEach(() => {
    cookieAtual = undefined;
  });

  it("sem cookie é rejeitado (controle negativo)", async () => {
    const r = await rodarMiddleware();
    expect(r.passou).toBe(false);
    expect(r.erro).toBe("Não autorizado");
  });

  it("cookie assinado com o segredo e não expirado deixa passar (controle positivo)", async () => {
    const exp = Date.now() + 60_000;
    cookieAtual = await assinar(SEGREDO_DE_TESTE, exp);
    const r = await rodarMiddleware();
    expect(r.passou).toBe(true);
    expect(r.resultado).toBe("executado");
  });

  it("cookie assinado com outro segredo é rejeitado", async () => {
    cookieAtual = await assinar("outro-segredo", Date.now() + 60_000);
    const r = await rodarMiddleware();
    expect(r.passou).toBe(false);
    expect(r.erro).toBe("Não autorizado");
  });

  it("cookie válido mas expirado é rejeitado", async () => {
    cookieAtual = await assinar(SEGREDO_DE_TESTE, Date.now() - 1_000);
    const r = await rodarMiddleware();
    expect(r.passou).toBe(false);
    expect(r.erro).toBe("Não autorizado");
  });
});
