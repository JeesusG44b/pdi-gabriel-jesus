import { useEffect, useState } from "react";

const DIA_MS = 24 * 60 * 60 * 1000;

// "YYYY-MM-DD" vira data local. new Date("YYYY-MM-DD") é UTC e pode cair no dia anterior.
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function inicioDoDia(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Dias de calendário de `de` até `ate` (negativo se `ate` já passou).
export function diasEntre(de: Date, ate: Date): number {
  return Math.round((inicioDoDia(ate).getTime() - inicioDoDia(de).getTime()) / DIA_MS);
}

// Meses inteiros de calendário e dias restantes de `de` até `ate`.
export function mesesEDiasEntre(de: Date, ate: Date): { meses: number; dias: number } {
  const a = inicioDoDia(de);
  const b = inicioDoDia(ate);
  if (b <= a) return { meses: 0, dias: 0 };
  // Ancora no mesmo dia do mês (limitado ao último dia do mês de destino).
  const ancora = (n: number) => {
    const ultimoDia = new Date(a.getFullYear(), a.getMonth() + n + 1, 0).getDate();
    return new Date(a.getFullYear(), a.getMonth() + n, Math.min(a.getDate(), ultimoDia));
  };
  let meses = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  while (meses > 0 && ancora(meses) > b) meses -= 1;
  return { meses, dias: diasEntre(ancora(meses), b) };
}

export function formatarDataBR(d: Date): string {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Relógio que atualiza a cada `intervaloMs` (os contadores usam 60 s, como o timer antigo).
// Começa null: só o cliente, depois de montar, tem "agora". Assim servidor e primeiro render
// do cliente são iguais, mesmo com fusos diferentes (o servidor roda em UTC).
export function useAgora(intervaloMs = 60_000): Date | null {
  const [agora, setAgora] = useState<Date | null>(null);
  useEffect(() => {
    const atualizar = () => setAgora(new Date());
    atualizar();
    const i = setInterval(atualizar, intervaloMs);
    return () => clearInterval(i);
  }, [intervaloMs]);
  return agora;
}
