import type { CareerStep } from "@/types";
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
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";

interface CareerStepModalProps {
  isOpen: boolean;
  step: CareerStep;
  isNew?: boolean;
  onClose: () => void;
  onSave: (updated: CareerStep) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
}

export function CareerStepModal({
  isOpen,
  step,
  isNew,
  onClose,
  onSave,
  onDelete,
}: CareerStepModalProps) {
  const [formData, setFormData] = useState<CareerStep>(step);
  const [saving, setSaving] = useState(false);

  const handleChange = <K extends keyof CareerStep>(field: K, value: CareerStep[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    if (!formData.focus.trim()) {
      toast.error("Foco é obrigatório");
      return;
    }
    setSaving(true);
    const ok = await onSave(formData);
    setSaving(false);
    if (ok) onClose();
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setSaving(true);
    const ok = await onDelete(step.id);
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isNew ? "Nova Etapa" : "Editar Etapa"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cs-title">Título *</Label>
            <Input
              id="cs-title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ex: Desenvolvedora Júnior"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cs-focus">Foco *</Label>
            <Input
              id="cs-focus"
              value={formData.focus}
              onChange={(e) => handleChange("focus", e.target.value)}
              placeholder="Ex: APIs REST, testes, microsserviços"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label htmlFor="cs-current">Etapa atual</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Marca essa etapa como a atual e desmarca as demais.
              </p>
            </div>
            <Switch
              id="cs-current"
              checked={formData.current ?? false}
              onCheckedChange={(v) => handleChange("current", v)}
            />
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
                  <AlertDialogTitle>Deletar etapa?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser desfeita. "{step.title}" será removida permanentemente.
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
