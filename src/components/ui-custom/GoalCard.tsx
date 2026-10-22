import type { Ciclo, Deadline, GoalStatus, Trilha } from "@/types";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GoalModal } from "./GoalModal";
import { Progress } from "@/components/ui/progress";
import { parseLocalDate } from "@/lib/datas";

interface GoalCardProps {
  goal: Deadline;
  trilhas: Trilha[];
  ciclos: Ciclo[];
  editable?: boolean;
  onSave: (updated: Deadline) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

const statusConfig: Record<GoalStatus, { Icon: LucideIcon; badge: string }> = {
  Planejado: { Icon: Icons.CircleDashed, badge: "bg-primary/10 text-primary border-primary/30" },
  "Em progresso": { Icon: Icons.Clock, badge: "bg-secondary text-foreground border-border" },
  Concluído: { Icon: Icons.CircleCheck, badge: "bg-success/[0.06] text-success border-success/40 dark:bg-success/10" },
};

const priorityConfig = {
  Alta: { bg: "bg-destructive/10", text: "text-destructive", badge: "bg-destructive/[0.06] text-destructive border-destructive/40 dark:bg-destructive/10" },
  Média: { bg: "bg-warning/10", text: "text-warning", badge: "bg-warning/[0.06] text-warning border-warning/50 dark:bg-warning/10" },
  Baixa: { bg: "bg-success/10", text: "text-success", badge: "bg-success/[0.06] text-success border-success/40 dark:bg-success/10" },
};

export function GoalCard({ goal, trilhas, ciclos, editable = false, onSave, onDelete }: GoalCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  // "Agora" só existe no cliente, depois de montar. No servidor e no primeiro render
  // do cliente o cálculo é null, então o HTML é igual nos dois lados (sem erro de hidratação).
  const [agora, setAgora] = useState<Date | null>(null);
  useEffect(() => {
    const atualizar = () => setAgora(new Date());
    atualizar();
    const i = setInterval(atualizar, 60_000);
    return () => clearInterval(i);
  }, []);

  const calculo = useMemo(() => {
    if (!agora) return null;
    const today = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());

    const targetDate = parseLocalDate(goal.dataPrazo);

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysRemain = Math.ceil((targetDate.getTime() - today.getTime()) / msPerDay);

    // Se tem progresso manual, usar isso
    if (goal.progresso !== undefined) {
      return {
        daysRemaining: daysRemain,
        percentComplete: Math.min(Math.max(goal.progresso, 0), 100),
        isOverdue: daysRemain < 0,
      };
    }

    // Se concluído, mostrar 100%
    if (goal.status === "Concluído") {
      return { daysRemaining: 0, percentComplete: 100, isOverdue: false };
    }

    // Calcular progresso automaticamente baseado em tempo decorrido
    const createdDate = parseLocalDate(goal.dataPrazo);
    createdDate.setDate(createdDate.getDate() - 60); // Assume criada há 60 dias antes do prazo

    const totalDays = Math.ceil((targetDate.getTime() - createdDate.getTime()) / msPerDay);
    const elapsedDays = Math.ceil((today.getTime() - createdDate.getTime()) / msPerDay);
    const percent = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);

    return {
      daysRemaining: daysRemain,
      percentComplete: Math.round(percent),
      isOverdue: daysRemain < 0,
    };
  }, [goal, agora]);

  // Antes de montar, valores neutros (iguais no servidor e no cliente) e sem bloco de prazo.
  const { daysRemaining, percentComplete, isOverdue } = calculo ?? {
    daysRemaining: 0,
    percentComplete: 0,
    isOverdue: false,
  };

  const priority = priorityConfig[goal.prioridade];
  const status = statusConfig[goal.status];
  const StatusIcon = status.Icon;
  const IconComponent =
    (Icons as unknown as Record<string, LucideIcon>)[goal.icon || "Target"] ?? Icons.Target;

  const trilha = trilhas.find((t) => t.id === goal.trilhaId);
  const ciclo = ciclos.find((c) => c.id === goal.cicloId);
  const trilhaTexto = trilha?.nome ?? goal.categoria;

  return (
    <>
      <article
        onClick={editable ? () => setIsOpen(true) : undefined}
        className={`group glass rounded-3xl border border-border p-5 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10 animate-fade-in ${editable ? "cursor-pointer" : ""}`}
      >
        {/* Header com ícone e título */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`rounded-lg p-2 ${priority.bg} flex-shrink-0`}>
            <IconComponent className={`h-5 w-5 ${priority.text}`} aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg leading-snug text-foreground line-clamp-2 group-hover:text-primary transition">
              {goal.titulo}
            </h3>
          </div>
        </div>

        {/* Tags de trilha e ciclo (SPEC 6.3) */}
        {(trilhaTexto || ciclo) && (
          <ul className="mb-3 flex flex-wrap gap-2" aria-label="Trilha e ciclo">
            {trilhaTexto && (
              <li className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary-deep">
                <Icons.Layers className="h-3 w-3" aria-hidden="true" />
                {trilhaTexto}
              </li>
            )}
            {ciclo && (
              <li className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
                <Icons.CalendarDays className="h-3 w-3" aria-hidden="true" />
                {ciclo.nome}
              </li>
            )}
          </ul>
        )}

        {/* Descrição */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{goal.descricao}</p>

        {/* Barra de progresso */}
        <div className="mb-3">
          <Progress value={percentComplete} className="h-2" aria-label="Progresso da meta" />
          <p className="font-mono text-xs tabular-nums text-muted-foreground mt-1">{percentComplete}% concluído</p>
        </div>

        {/* Badges de prioridade e status (texto, ícone e cor) */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${priority.badge}`}>
            Prioridade {goal.prioridade.toLowerCase()}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${status.badge}`}>
            <StatusIcon className="h-3 w-3" aria-hidden="true" />
            {goal.status}
          </span>
        </div>

        {/* Informação de dias restantes */}
        {goal.status !== "Concluído" && calculo && (
          <div className={`flex items-center gap-1.5 text-xs font-medium ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
            {isOverdue ? (
              <>
                <Icons.CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Prazo vencido há <span className="font-mono tabular-nums">{Math.abs(daysRemaining)}</span> dias</span>
              </>
            ) : daysRemaining === 0 ? (
              <>
                <Icons.Flame className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Prazo é hoje</span>
              </>
            ) : (
              <>
                <Icons.Clock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  <span className="font-mono tabular-nums">{daysRemaining}</span> dias restantes
                </span>
              </>
            )}
          </div>
        )}

        {goal.status === "Concluído" && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-success">
            <Icons.CircleCheck className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Meta concluída</span>
          </div>
        )}
      </article>

      {/* Modal de edição */}
      {editable && isOpen && (
        <GoalModal
          isOpen={isOpen}
          goal={goal}
          trilhas={trilhas}
          ciclos={ciclos}
          onClose={() => setIsOpen(false)}
          onSave={onSave}
          onDelete={onDelete}
        />
      )}
    </>
  );
}
