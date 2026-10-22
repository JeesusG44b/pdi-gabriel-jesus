import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Pencil } from "lucide-react";
import type { Disciplina, Tech, Trilha } from "@/types";
import { TechnologyBadge } from "@/components/ui-custom/TechnologyBadge";
import { DisciplinaCard } from "@/components/ui-custom/DisciplinaCard";

interface Props {
  trilha: Trilha;
  techs: Tech[];
  disciplinas: Disciplina[];
  isAdmin?: boolean;
  onEditDisciplina?: (d: Disciplina) => void;
  onEditTechs?: () => void;
}

// Bloco de uma trilha: cabeçalho com dia e horas, chips de tecnologia e cards de disciplina.
export function TrilhaBlock({
  trilha,
  techs,
  disciplinas,
  isAdmin = false,
  onEditDisciplina,
  onEditTechs,
}: Props) {
  const Icon = (Icons as unknown as Record<string, LucideIcon>)[trilha.icon] ?? Icons.Layers;
  const horas = trilha.horasSemana.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

  return (
    <section
      aria-labelledby={`trilha-${trilha.id}`}
      className="glass rounded-3xl border border-border p-6 md:p-8 animate-fade-in"
    >
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl gradient-primary text-white shadow-soft">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 id={`trilha-${trilha.id}`} className="text-2xl md:text-3xl">
            {trilha.nome}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="capitalize">{trilha.diaSemana}</span>
            {" · "}
            <span className="font-mono tabular-nums text-foreground">{horas}</span>{" "}
            {trilha.horasSemana === 1 ? "hora" : "horas"} por semana
          </p>
          {trilha.foco && <p className="mt-2 text-sm text-foreground/80">{trilha.foco}</p>}
        </div>
        {isAdmin && onEditTechs && (
          <button
            type="button"
            onClick={onEditTechs}
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Editar tecnologias
          </button>
        )}
      </header>

      {techs.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2" aria-label={`Tecnologias de ${trilha.nome}`}>
          {techs.map((t) => (
            <li key={t.name} className="max-w-full">
              <TechnologyBadge name={t.name} status={t.status} />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 border-t border-border pt-6">
        <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary-deep">
          Disciplinas da graduação ({disciplinas.length})
        </h4>
        {disciplinas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma disciplina nesta trilha com o filtro atual.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {disciplinas.map((d) => (
              <DisciplinaCard
                key={d.id}
                disciplina={d}
                isAdmin={isAdmin}
                onEdit={isAdmin && onEditDisciplina ? () => onEditDisciplina(d) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
