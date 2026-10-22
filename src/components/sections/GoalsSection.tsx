import { useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { CircleCheck, Clock, Target, Plus } from "lucide-react";
import type { Ciclo, Deadline, GoalStatus, Trilha } from "@/types";
import { GoalCard } from "../ui-custom/GoalCard";
import { GoalModal } from "../ui-custom/GoalModal";
import { FilterTabs } from "@/components/ui-custom/FilterTabs";
import { Card } from "@/components/ui/card";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { deleteGoal, upsertGoal } from "@/api/goals";

const ABA_ATUAL = "Ciclo atual";
const ABA_PROXIMO = "Próximo";
const ABA_TODAS = "Todas";
const STATUS_OPCOES = ["Todos", "Planejado", "Em progresso", "Concluído"] as const;

function newGoalTemplate(cicloId?: string): Deadline {
  return {
    id: crypto.randomUUID(),
    categoria: "Geral",
    titulo: "",
    descricao: "",
    dataPrazo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    prioridade: "Média",
    status: "Planejado",
    icon: "Target",
    progresso: 0,
    cicloId,
    visibilidade: "publica",
  };
}

interface Props {
  deadlines: Deadline[];
  ciclos: Ciclo[];
  trilhas: Trilha[];
}

export function GoalsSection({ deadlines, ciclos, trilhas }: Props) {
  const isAdmin = useIsAdmin();
  const router = useRouter();
  const [aba, setAba] = useState<string>(ABA_ATUAL);
  const [filterStatus, setFilterStatus] = useState<string>("Todos");
  const [newGoal, setNewGoal] = useState<Deadline | null>(null);

  const cicloAtual = ciclos.find((c) => c.status === "atual") ?? null;
  const proximoCiclo = ciclos.find((c) => c.status === "planejado") ?? null;
  const cicloDaAba = aba === ABA_ATUAL ? cicloAtual : aba === ABA_PROXIMO ? proximoCiclo : null;

  // Metas do ciclo da aba. "Todas" não filtra por ciclo.
  const doCiclo = useMemo(() => {
    if (aba === ABA_TODAS) return deadlines;
    return cicloDaAba ? deadlines.filter((d) => d.cicloId === cicloDaAba.id) : [];
  }, [aba, cicloDaAba, deadlines]);

  const stats = useMemo(() => {
    const total = doCiclo.length;
    const inProgress = doCiclo.filter((d) => d.status === "Em progresso").length;
    const completed = doCiclo.filter((d) => d.status === "Concluído").length;
    return { total, inProgress, completed };
  }, [doCiclo]);

  const filteredDeadlines = useMemo(() => {
    const result =
      filterStatus === "Todos" ? doCiclo : doCiclo.filter((d) => d.status === (filterStatus as GoalStatus));
    // Ordenar por data mais próxima primeiro
    return [...result].sort((a, b) => new Date(a.dataPrazo).getTime() - new Date(b.dataPrazo).getTime());
  }, [doCiclo, filterStatus]);

  const handleSaveGoal = async (goal: Deadline) => {
    try {
      await upsertGoal({ data: goal });
      await router.invalidate();
      toast.success("Meta salva com sucesso!");
      return true;
    } catch {
      toast.error("Erro ao salvar a meta");
      return false;
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteGoal({ data: { id } });
      await router.invalidate();
      toast.success("Meta deletada com sucesso!");
      return true;
    } catch {
      toast.error("Erro ao deletar a meta");
      return false;
    }
  };

  const avisoCiclo =
    aba === ABA_TODAS
      ? null
      : !cicloDaAba
        ? aba === ABA_ATUAL
          ? "Nenhum ciclo está ativo agora."
          : "Ainda não há próximo ciclo planejado."
        : null;

  return (
    <section className="py-10">
      {isAdmin && (
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={() => setNewGoal(newGoalTemplate(cicloAtual?.id))}
            className="flex items-center gap-2 rounded-full gradient-primary px-5 py-2.5 font-medium text-white shadow-soft transition-all hover:shadow-lg"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            Adicionar nova meta
          </button>
        </div>
      )}

      <div className="mb-6 space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Ciclo</p>
          <FilterTabs options={[ABA_ATUAL, ABA_PROXIMO, ABA_TODAS]} value={aba} onChange={setAba} />
          {cicloDaAba && (
            <p className="mt-2 text-sm text-muted-foreground">
              {cicloDaAba.nome}
            </p>
          )}
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Status</p>
          <FilterTabs options={[...STATUS_OPCOES]} value={filterStatus} onChange={setFilterStatus} />
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="glass flex items-center gap-4 rounded-3xl border border-border p-6">
          <div className="rounded-lg bg-primary/10 p-3">
            <Target className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total de metas</p>
            <p className="font-mono text-3xl font-medium tabular-nums text-primary-deep">{stats.total}</p>
          </div>
        </Card>

        <Card className="glass flex items-center gap-4 rounded-3xl border border-border p-6">
          <div className="rounded-lg bg-secondary p-3">
            <Clock className="h-6 w-6 text-foreground" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Em progresso</p>
            <p className="font-mono text-3xl font-medium tabular-nums text-primary-deep">{stats.inProgress}</p>
          </div>
        </Card>

        <Card className="glass flex items-center gap-4 rounded-3xl border border-border p-6">
          <div className="rounded-lg bg-success/10 p-3">
            <CircleCheck className="h-6 w-6 text-success" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Concluídas</p>
            <p className="font-mono text-3xl font-medium tabular-nums text-primary-deep">{stats.completed}</p>
          </div>
        </Card>
      </div>

      {avisoCiclo && <p className="mb-6 text-center text-muted-foreground">{avisoCiclo}</p>}

      {/* Grid de Cards */}
      {filteredDeadlines.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDeadlines.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              trilhas={trilhas}
              ciclos={ciclos}
              editable={isAdmin}
              onSave={handleSaveGoal}
              onDelete={handleDeleteGoal}
            />
          ))}
        </div>
      ) : (
        !avisoCiclo && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Nenhuma meta encontrada para este filtro.</p>
          </div>
        )
      )}

      {/* Modal de nova meta */}
      {newGoal && (
        <GoalModal
          isOpen
          goal={newGoal}
          trilhas={trilhas}
          ciclos={ciclos}
          onClose={() => setNewGoal(null)}
          onSave={async (g) => {
            const ok = await handleSaveGoal(g);
            if (ok) setNewGoal(null);
            return ok;
          }}
        />
      )}
    </section>
  );
}
