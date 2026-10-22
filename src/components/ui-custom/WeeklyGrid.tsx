import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Trilha } from "@/types";

const DIAS = ["segunda", "terça", "quarta", "quinta", "sexta"];

// Grade fixa da semana: 5 colunas (seg a sex) a partir de 640 px; abaixo disso vira lista.
export function WeeklyGrid({ trilhas }: { trilhas: Trilha[] }) {
  const ordenadas = [...trilhas].sort(
    (a, b) => DIAS.indexOf(a.diaSemana) - DIAS.indexOf(b.diaSemana),
  );

  return (
    <ol className="grid gap-3 sm:grid-cols-5">
      {ordenadas.map((t) => {
        const Icon = (Icons as unknown as Record<string, LucideIcon>)[t.icon] ?? Icons.Layers;
        return (
          <li
            key={t.id}
            className="glass flex gap-3 rounded-2xl border border-border p-4 sm:flex-col sm:gap-2"
          >
            <p className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wider text-primary-deep sm:w-auto">
              {t.diaSemana}
            </p>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="flex items-center gap-2 font-semibold">
                <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{t.nome}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-mono tabular-nums text-foreground">
                  {t.horasSemana.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
                </span>{" "}
                {t.horasSemana === 1 ? "hora" : "horas"} por semana
              </p>
              {t.foco && <p className="text-xs text-muted-foreground">{t.foco}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
