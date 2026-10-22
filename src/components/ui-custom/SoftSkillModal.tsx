import type { SoftSkill } from "@/types";
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

interface SoftSkillModalProps {
  isOpen: boolean;
  skill: SoftSkill;
  isNew?: boolean;
  onClose: () => void;
  onSave: (updated: SoftSkill) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
}

const STATUSES: SoftSkill["status"][] = ["Já pratico", "Em desenvolvimento"];

export function SoftSkillModal({
  isOpen,
  skill,
  isNew,
  onClose,
  onSave,
  onDelete,
}: SoftSkillModalProps) {
  const [formData, setFormData] = useState<SoftSkill>(skill);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    setSaving(true);
    const ok = await onSave({ ...formData, icon: formData.icon.trim() || "Sparkles" });
    setSaving(false);
    if (ok) onClose();
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setSaving(true);
    const ok = await onDelete(skill.id);
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isNew ? "Nova Soft Skill" : "Editar Soft Skill"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="s-title">Título *</Label>
            <Input
              id="s-title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Comunicação"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="s-description">Descrição</Label>
            <Textarea
              id="s-description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva a habilidade"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="s-status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v) =>
                setFormData((prev) => ({ ...prev, status: v as SoftSkill["status"] }))
              }
            >
              <SelectTrigger id="s-status">
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

          <div className="space-y-2">
            <Label htmlFor="s-icon">Ícone (nome do Lucide)</Label>
            <Input
              id="s-icon"
              value={formData.icon}
              onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
              placeholder="Ex: MessageCircle, Rocket, Target"
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
                  <AlertDialogTitle>Deletar soft skill?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser desfeita. "{skill.title}" será removida permanentemente.
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
