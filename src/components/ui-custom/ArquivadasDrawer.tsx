import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArchiveRestore, EyeOff } from "lucide-react";
import type { Disciplina, Trilha } from "@/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DominioChip } from "@/components/ui-custom/DominioChip";
import { faseMeta } from "@/components/ui-custom/DisciplinaCard";
import { restaurarDisciplina } from "@/api/disciplinas";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Só o admin monta este componente. Inclui arquivadas e as de visibilidade 'admin'.
  disciplinas: Disciplina[];
  trilhas: Trilha[];
}

export function ArquivadasDrawer({ open, onOpenChange, disciplinas, trilhas }: Props) {
  const router = useRouter();
  const [restaurando, setRestaurando] = useState<string | null>(null);
  const lista = disciplinas.filter((d) => d.arquivada || d.visibilidade === "admin");
  const nomeTrilha = (id: string | null) => trilhas.find((t) => t.id === id)?.nome ?? "Sem trilha";

  const handleRestaurar = async (id: string) => {
    setRestaurando(id);
    try {
      await restaurarDisciplina({ data: { id } });
      await router.invalidate();
      toast.success("Disciplina restaurada");
    } catch {
      toast.error("Erro ao restaurar a disciplina");
    } finally {
      setRestaurando(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Arquivadas e só admin</SheetTitle>
          <SheetDescription>
            Itens fora do site público. Restaurar uma disciplina arquivada devolve ela ao roadmap.
          </SheetDescription>
        </SheetHeader>

        {lista.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">Nenhuma disciplina arquivada.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {lista.map((d) => (
              <li key={d.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {d.arquivada ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/[0.06] px-2.5 py-1 text-xs font-medium text-destructive dark:bg-destructive/10">
                      <ArchiveRestore className="h-3.5 w-3.5" aria-hidden="true" />
                      Arquivada
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                      Só admin
                    </span>
                  )}
                  <DominioChip status={d.dominio} />
                </div>

                <h3 className="mt-3 text-lg leading-snug">{d.nome}</h3>
                <p className="text-xs text-muted-foreground">
                  Semestre {d.semestre} · {faseMeta[d.fase].label} · {nomeTrilha(d.trilhaId)}
                </p>

                {d.arquivada && (
                  <p className="mt-3 text-sm">
                    <span className="font-semibold">Motivo:</span>{" "}
                    <span className="text-muted-foreground">{d.motivoArquivamento || "Não informado"}</span>
                  </p>
                )}
                {d.notaAdmin && (
                  <p className="mt-2 text-sm">
                    <span className="font-semibold">Nota do admin:</span>{" "}
                    <span className="text-muted-foreground">{d.notaAdmin}</span>
                  </p>
                )}
                {!d.arquivada && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Visível só no admin. Para mostrar no público, edite a visibilidade no modal da disciplina.
                  </p>
                )}

                {d.arquivada && (
                  <div className="mt-4">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestaurar(d.id)}
                      disabled={restaurando === d.id}
                    >
                      <ArchiveRestore className="mr-2 h-4 w-4" aria-hidden="true" />
                      {restaurando === d.id ? "Restaurando..." : "Restaurar"}
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </SheetContent>
    </Sheet>
  );
}
