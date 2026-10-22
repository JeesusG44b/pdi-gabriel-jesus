import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, CheckCircle2, Circle, Pencil, Plus, Target, Trash2, X } from "lucide-react";
import type { CareerStep, Goal } from "@/types";
import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { CareerStepModal } from "@/components/ui-custom/CareerStepModal";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  deleteCareerStep,
  upsertCareerStep,
  deleteCareerGoal,
  upsertCareerGoal,
} from "@/api/career";

function newStepTemplate(): CareerStep {
  return {
    id: crypto.randomUUID(),
    title: "",
    focus: "",
    current: false,
  };
}

const NEW_GOAL_ID = "__new__";

export function CareerTimeline({ steps, goals }: { steps: CareerStep[]; goals: Goal[] }) {
  const isAdmin = useIsAdmin();
  const router = useRouter();
  const [editingStep, setEditingStep] = useState<{ item: CareerStep; isNew: boolean } | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [goalDraft, setGoalDraft] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);

  const handleSaveStep = async (step: CareerStep) => {
    try {
      await upsertCareerStep({ data: step });
      await router.invalidate();
      toast.success("Etapa salva com sucesso!");
      return true;
    } catch {
      toast.error("Erro ao salvar a etapa");
      return false;
    }
  };

  const handleDeleteStep = async (id: string) => {
    try {
      await deleteCareerStep({ data: { id } });
      await router.invalidate();
      toast.success("Etapa deletada com sucesso!");
      return true;
    } catch {
      toast.error("Erro ao deletar a etapa");
      return false;
    }
  };

  const startAddGoal = () => {
    setEditingGoalId(NEW_GOAL_ID);
    setGoalDraft("");
  };

  const startEditGoal = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setGoalDraft(goal.title);
  };

  const cancelEditGoal = () => {
    setEditingGoalId(null);
    setGoalDraft("");
  };

  const saveGoal = async () => {
    const title = goalDraft.trim();
    if (!title) {
      toast.error("Título é obrigatório");
      return;
    }
    const id = editingGoalId === NEW_GOAL_ID ? crypto.randomUUID() : editingGoalId;
    if (!id) return;
    setSavingGoal(true);
    try {
      await upsertCareerGoal({ data: { id, title } });
      await router.invalidate();
      toast.success("Meta salva com sucesso!");
      cancelEditGoal();
    } catch {
      toast.error("Erro ao salvar a meta");
    } finally {
      setSavingGoal(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteCareerGoal({ data: { id } });
      await router.invalidate();
      toast.success("Meta deletada com sucesso!");
    } catch {
      toast.error("Erro ao deletar a meta");
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        {isAdmin && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setEditingStep({ item: newStepTemplate(), isNew: true })}
              className="px-5 py-2.5 rounded-full gradient-primary text-white font-medium shadow-soft hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Adicionar Etapa
            </button>
          </div>
        )}
        {steps.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">Nenhuma etapa cadastrada ainda.</p>
        ) : (
          <ol className="relative border-l-2 border-border ml-3 space-y-6">
            {steps.map((s, index) => (
              <li key={s.id} className="ml-6 animate-fade-in">
                <span
                  className={cn(
                    "absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full border-2 bg-background",
                    s.current
                      ? "border-primary text-primary animate-pulse-soft"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {s.current ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </span>
                <div
                  className={cn(
                    "relative rounded-2xl border p-5 glass transition",
                    s.current
                      ? "border-primary shadow-soft"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  {isAdmin && (
                    <button
                      onClick={() => setEditingStep({ item: s, isNew: false })}
                      className="absolute top-3 right-3 p-2 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-primary/10 transition"
                      title="Editar etapa"
                      aria-label="Editar etapa"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      Etapa {index + 1}
                    </span>
                    {s.current && (
                      <span className="text-xs px-2 py-0.5 rounded-full gradient-primary text-white">
                        Atual
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Foco: {s.focus}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
      <aside>
        <div className="glass rounded-3xl border border-border p-6 sticky top-20">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary-deep" />
              <h3 className="font-semibold">Metas em andamento</h3>
            </div>
            {isAdmin && !editingGoalId && (
              <button
                onClick={startAddGoal}
                className="p-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-primary/10 transition"
                title="Adicionar meta"
                aria-label="Adicionar meta"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>
          {goals.length === 0 && editingGoalId !== NEW_GOAL_ID ? (
            <p className="text-sm text-muted-foreground">Nenhuma meta cadastrada ainda.</p>
          ) : (
            <ul className="space-y-2">
              {goals.map((g) =>
                editingGoalId === g.id ? (
                  <li key={g.id} className="flex items-center gap-1.5">
                    <Input
                      autoFocus
                      value={goalDraft}
                      onChange={(e) => setGoalDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveGoal();
                        if (e.key === "Escape") cancelEditGoal();
                      }}
                      className="h-8 text-sm"
                    />
                    <button
                      onClick={saveGoal}
                      disabled={savingGoal}
                      className="p-1.5 rounded-full text-success hover:bg-success/10 transition"
                      aria-label="Salvar meta"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={cancelEditGoal}
                      disabled={savingGoal}
                      className="p-1.5 rounded-full text-muted-foreground hover:bg-secondary transition"
                      aria-label="Cancelar edição"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ) : (
                  <li key={g.id} className="group text-sm flex items-center gap-2">
                    <span className="text-primary">◆</span>
                    <span className="flex-1">{g.title}</span>
                    {isAdmin && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => startEditGoal(g)}
                          className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-primary/10 transition"
                          title="Editar meta"
                          aria-label="Editar meta"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="p-1 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                              title="Deletar meta"
                              aria-label="Deletar meta"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Deletar meta?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Essa ação não pode ser desfeita. "{g.title}" será removida
                                permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteGoal(g.id)}>
                                Deletar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </li>
                ),
              )}
              {editingGoalId === NEW_GOAL_ID && (
                <li className="flex items-center gap-1.5">
                  <Input
                    autoFocus
                    value={goalDraft}
                    onChange={(e) => setGoalDraft(e.target.value)}
                    placeholder="Nova meta..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveGoal();
                      if (e.key === "Escape") cancelEditGoal();
                    }}
                    className="h-8 text-sm"
                  />
                  <button
                    onClick={saveGoal}
                    disabled={savingGoal}
                    className="p-1.5 rounded-full text-success hover:bg-success/10 transition"
                    aria-label="Salvar meta"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={cancelEditGoal}
                    disabled={savingGoal}
                    className="p-1.5 rounded-full text-muted-foreground hover:bg-secondary transition"
                    aria-label="Cancelar edição"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
      </aside>
      {editingStep && (
        <CareerStepModal
          isOpen
          step={editingStep.item}
          isNew={editingStep.isNew}
          onClose={() => setEditingStep(null)}
          onSave={handleSaveStep}
          onDelete={editingStep.isNew ? undefined : handleDeleteStep}
        />
      )}
    </div>
  );
}
