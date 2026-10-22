import { CalendarDays, Clock, GraduationCap, Pencil, ExternalLink } from "lucide-react";
import type { Disciplina, Fase } from "@/types";
import { DominioChip } from "@/components/ui-custom/DominioChip";

// Fase em texto e ícone, sem cor: a cor fica só no domínio.
export const faseMeta: Record<Fase, { label: string; Icon: typeof GraduationCap }> = {
  cursada: { label: "Cursada", Icon: GraduationCap },
  cursando: { label: "Cursando", Icon: Clock },
  futura: { label: "Futura", Icon: CalendarDays },
};

interface Props {
  disciplina: Disciplina;
  isAdmin?: boolean;
  onEdit?: () => void;
}

// Dados públicos apenas. motivoArquivamento e notaAdmin nunca são renderizados aqui.
export function DisciplinaCard({ disciplina: d, isAdmin = false, onEdit }: Props) {
  const fase = faseMeta[d.fase];
  const FaseIcon = fase.Icon;

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-lg leading-snug">{d.nome}</h4>
          <p className="text-xs text-muted-foreground">Semestre {d.semestre}</p>
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 rounded-full bg-secondary p-2 text-muted-foreground transition hover:bg-primary/10 hover:text-foreground"
            aria-label={`Editar ${d.nome}`}
            title="Editar disciplina"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </header>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
          <FaseIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {fase.label}
        </span>
        <DominioChip status={d.dominio} />
        {isAdmin && d.visibilidade === "admin" && (
          <span className="rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground">
            Só admin
          </span>
        )}
      </div>

      {d.ementaResumo && <p className="mt-3 text-sm text-foreground/90">{d.ementaResumo}</p>}

      <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
        {d.aplicacaoTrabalho && (
          <div>
            <dt className="font-semibold">No trabalho:</dt>
            <dd className="text-muted-foreground">{d.aplicacaoTrabalho}</dd>
          </div>
        )}
        {(d.recursoTitulo || d.recursoUrl) && (
          <div>
            <dt className="font-semibold">Recurso:</dt>
            <dd className="text-muted-foreground">
              {d.recursoUrl ? (
                <a
                  href={d.recursoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                >
                  {d.recursoTitulo || "Abrir recurso"}
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="sr-only">(abre em nova aba)</span>
                </a>
              ) : (
                d.recursoTitulo
              )}
            </dd>
          </div>
        )}
        {d.entregavel && (
          <div>
            <dt className="font-semibold">Entregável:</dt>
            <dd className="text-muted-foreground">{d.entregavel}</dd>
          </div>
        )}
      </dl>
    </article>
  );
}
