import { createMiddleware, createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import {
  deleteCookie,
  getCookie,
  getResponseHeader,
  setCookie,
  setResponseHeader,
} from "@tanstack/react-start/server";
import { z } from "zod";
import { getBindings } from "./bindings";

const COOKIE_NAME = "pdi_session";
const SESSION_DAYS = 30;

const encoder = new TextEncoder();

function base64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return base64url(new Uint8Array(sig));
}

// Comparação em tempo constante via digests de tamanho fixo
async function digestsEqual(a: string, b: string): Promise<boolean> {
  const [da, db] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]);
  const ua = new Uint8Array(da);
  const ub = new Uint8Array(db);
  let diff = 0;
  for (let i = 0; i < ua.length; i++) diff |= ua[i] ^ ub[i];
  return diff === 0;
}

async function signSession(secret: string): Promise<string> {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  return `${exp}.${await hmac(secret, `admin:${exp}`)}`;
}

async function verifySession(): Promise<boolean> {
  const token = getCookie(COOKIE_NAME);
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot < 0) return false;
  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const { SESSION_SECRET } = await getBindings();
  const expected = await hmac(SESSION_SECRET, `admin:${expStr}`);
  return digestsEqual(sig, expected);
}

// Leituras usam isto para decidir o filtro de visibilidade no SQL.
// createServerOnlyFn: o build do cliente não carrega esta função nem o binding do D1.
export const isAdminRequest = createServerOnlyFn(async (): Promise<boolean> => verifySession());

// Leituras que mudam conforme o cookie (visitante x admin) não podem ser guardadas em cache
// compartilhado. Acrescenta Cookie ao Vary sem apagar o valor que já existe.
export const marcarRespostaDeSessao = createServerOnlyFn((): void => {
  setResponseHeader("Cache-Control", "private, no-store");
  const vary = getResponseHeader("Vary");
  const tokens = (vary ?? "").split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
  if (!tokens.includes("cookie")) {
    setResponseHeader("Vary", vary ? `${vary}, Cookie` : "Cookie");
  }
});

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { ADMIN_PASSWORD, SESSION_SECRET } = await getBindings();
    if (!(await digestsEqual(data.password, ADMIN_PASSWORD))) {
      return { ok: false as const };
    }
    setCookie(COOKIE_NAME, await signSession(SESSION_SECRET), {
      httpOnly: true,
      // Em dev o servidor roda em http://localhost (sem TLS); um cookie
      // Secure é silenciosamente descartado pelo navegador nesse caso.
      secure: !import.meta.env.DEV,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DAYS * 24 * 60 * 60,
    });
    return { ok: true as const };
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie(COOKIE_NAME, { path: "/" });
  return { ok: true };
});

// O layout lê isto em beforeLoad de toda rota, então a resposta sempre é marcada como de sessão.
export const getAdminStatusFn = createServerFn({ method: "GET" }).handler(async () => {
  marcarRespostaDeSessao();
  return { isAdmin: await verifySession() };
});

// Proteção server-side de todas as mutations; o isAdmin do client é só UI.
export const adminMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  if (!(await verifySession())) {
    throw new Error("Não autorizado");
  }
  return next();
});
