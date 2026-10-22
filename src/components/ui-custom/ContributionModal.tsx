import type { Contribution, ContributionCategory } from "@/types";
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
import { StringListEditor } from "./StringListEditor";

interface ContributionModalProps {
  isOpen: boolean;
  contribution: Contribution;
  // Categorias já cadastradas nas contribuições (vêm dos dados, não de uma lista fixa).
  categorias: ContributionCategory[];
  isNew?: boolean;
  onClose: () => void;
  onSave: (updated: Contribution) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
}

const STATUSES: Contribution["status"][] = ["Em andamento", "Concluído", "Planejado"];

export function ContributionModal({
  isOpen,
  contribution,
  categorias,
  isNew,
  onClose,
  onSave,
  onDelete,
}: ContributionModalProps) {
  const [formData, setFormData] = useState<Contribution>(contribution);
  const [saving, setSaving] = useState(false);
  // Inclui a categoria atual para que a edição não perca o valor salvo.
  const opcoesCategoria = Array.from(new Set([...categorias, formData.category]));

  const handleChange = <K extends keyof Contribution>(field: K, value: Contribution[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
    const ok = await onDelete(contribution.id);
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Nova Contribuição" : "Editar Contribuição"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="c-title">Título *</Label>
            <Input
              id="c-title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ex: Estudos para certificação AZ-204"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="c-category">Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(v) => handleChange("category", v as ContributionCategory)}
            >
              <SelectTrigger id="c-category">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {opcoesCategoria.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="c-description">Descrição</Label>
            <Textarea
              id="c-description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descreva a contribuição"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Tecnologias</Label>
            <StringListEditor
              values={formData.technologies}
              onChange={(v) => handleChange("technologies", v)}
              placeholder="Ex: Java, AWS, Terraform..."
            />
          </div>

          <div className="space-y-2">
            <Label>Impactos</Label>
            <StringListEditor
              values={formData.impacts}
              onChange={(v) => handleChange("impacts", v)}
              placeholder="Ex: Evolução em cloud"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="c-status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v) => handleChange("status", v as Contribution["status"])}
            >
              <SelectTrigger id="c-status">
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
            <Label htmlFor="c-icon">Ícone (nome do Lucide)</Label>
            <Input
              id="c-icon"
              value={formData.icon}
              onChange={(e) => handleChange("icon", e.target.value)}
              placeholder="Ex: GraduationCap, Cloud, Users"
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
                  <AlertDialogTitle>Deletar contribuição?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser desfeita. "{contribution.title}" será removida
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
