import type { Ciclo, Deadline, GoalPriority, GoalStatus, Trilha } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GoalModalProps {
  isOpen: boolean;
  goal: Deadline;
  trilhas: Trilha[];
  ciclos: Ciclo[];
  onClose: () => void;
  onSave: (updated: Deadline) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
}

const SEM_TRILHA = "nenhuma";
const PRIORITIES: GoalPriority[] = ["Alta", "Média", "Baixa"];
const STATUSES: GoalStatus[] = ["Planejado", "Em progresso", "Concluído"];

export function GoalModal({
  isOpen,
  goal,
  trilhas,
  ciclos,
  onClose,
  onSave,
  onDelete,
}: GoalModalProps) {
  const [formData, setFormData] = useState<Deadline>(goal);
  const [saving, setSaving] = useState(false);

  const handleChange = <K extends keyof Deadline>(field: K, value: Deadline[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.titulo.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    if (!formData.dataPrazo) {
      toast.error("Data de prazo é obrigatória");
      return;
    }
    setSaving(true);
    // A categoria acompanha a trilha: o servidor exige categoria preenchida.
    const trilha = trilhas.find((t) => t.id === formData.trilhaId);
    const ok = await onSave({ ...formData, categoria: trilha?.nome ?? (formData.categoria || "Geral") });
    setSaving(false);
    if (ok) onClose();
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setSaving(true);
    const ok = await onDelete(goal.id);
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Meta</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Trilha (substitui a categoria antiga) */}
          <div className="space-y-2">
            <Label htmlFor="trilha">Trilha</Label>
            <Select
              value={formData.trilhaId ?? SEM_TRILHA}
              onValueChange={(v) => handleChange("trilhaId", v === SEM_TRILHA ? undefined : v)}
            >
              <SelectTrigger id="trilha">
                <SelectValue placeholder="Selecione uma trilha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SEM_TRILHA}>Sem trilha</SelectItem>
                {trilhas.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ciclo */}
          <div className="space-y-2">
            <Label htmlFor="ciclo">Ciclo</Label>
            <Select
              value={formData.cicloId ?? SEM_TRILHA}
              onValueChange={(v) => handleChange("cicloId", v === SEM_TRILHA ? undefined : v)}
            >
              <SelectTrigger id="ciclo">
                <SelectValue placeholder="Selecione um ciclo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SEM_TRILHA}>Sem ciclo</SelectItem>
                {ciclos.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => handleChange("titulo", e.target.value)}
              placeholder="Ex: Dominar PySpark avançado"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              placeholder="Descreva os detalhes da meta"
              rows={3}
            />
          </div>

          {/* Data de Prazo */}
          <div className="space-y-2">
            <Label htmlFor="dataPrazo">Data de Prazo *</Label>
            <Input
              id="dataPrazo"
              type="date"
              value={formData.dataPrazo}
              onChange={(e) => handleChange("dataPrazo", e.target.value)}
            />
          </div>

          {/* Prioridade */}
          <div className="space-y-2">
            <Label htmlFor="prioridade">Prioridade</Label>
            <Select
              value={formData.prioridade}
              onValueChange={(v) => handleChange("prioridade", v as GoalPriority)}
            >
              <SelectTrigger id="prioridade">
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v) => handleChange("status", v as GoalStatus)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Progresso Manual */}
          <div className="space-y-2">
            <Label htmlFor="progresso">Progresso: {formData.progresso ?? 0}%</Label>
            <input
              id="progresso"
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.progresso ?? 0}
              onChange={(e) => handleChange("progresso", parseInt(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <p className="text-xs text-muted-foreground">
              Arraste para atualizar o progresso da meta (0-100%)
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 justify-between">
          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={saving} className="mr-auto">
                  Deletar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Deletar meta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser desfeita. A meta "{goal.titulo}" será removida
                    permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Deletar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gradient-primary text-white">
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
