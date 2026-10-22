import type { RoadmapArea, Status, Tech } from "@/types";
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
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoadmapAreaModalProps {
  isOpen: boolean;
  area: RoadmapArea;
  isNew?: boolean;
  onClose: () => void;
  onSave: (updated: RoadmapArea) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
}

const STATUS_LABELS: Record<Status, string> = {
  domino: "Domino",
  estudando: "Estudando",
  "preciso-estudar": "Preciso estudar",
};

export function RoadmapAreaModal({
  isOpen,
  area,
  isNew,
  onClose,
  onSave,
  onDelete,
}: RoadmapAreaModalProps) {
  const [formData, setFormData] = useState<RoadmapArea>(area);
  const [saving, setSaving] = useState(false);

  const updateTech = (index: number, patch: Partial<Tech>) => {
    setFormData((prev) => ({
      ...prev,
      techs: prev.techs.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    }));
  };

  const removeTech = (index: number) => {
    setFormData((prev) => ({ ...prev, techs: prev.techs.filter((_, i) => i !== index) }));
  };

  const addTech = () => {
    setFormData((prev) => ({ ...prev, techs: [...prev.techs, { name: "", status: "estudando" }] }));
  };

  const handleSave = async () => {
    if (!formData.area.trim()) {
      toast.error("Nome da área é obrigatório");
      return;
    }
    const techs = formData.techs.filter((t) => t.name.trim());
    setSaving(true);
    const ok = await onSave({ ...formData, icon: formData.icon.trim() || "Code", techs });
    setSaving(false);
    if (ok) onClose();
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setSaving(true);
    const ok = await onDelete(area.id);
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Nova Área do Roadmap" : "Editar Área do Roadmap"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="r-area">Área *</Label>
            <Input
              id="r-area"
              value={formData.area}
              onChange={(e) => setFormData((prev) => ({ ...prev, area: e.target.value }))}
              placeholder="Ex: Backend, Cloud, Data Engineering"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="r-icon">Ícone (nome do Lucide)</Label>
            <Input
              id="r-icon"
              value={formData.icon}
              onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
              placeholder="Ex: Server, Cloud, Database"
            />
          </div>

          <div className="space-y-2">
            <Label>Tecnologias</Label>
            <div className="space-y-2">
              {formData.techs.map((tech, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    value={tech.name}
                    onChange={(e) => updateTech(i, { name: e.target.value })}
                    placeholder="Nome da tecnologia"
                    className="flex-1"
                  />
                  <Select
                    value={tech.status}
                    onValueChange={(v) => updateTech(i, { status: v as Status })}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeTech(i)}
                    aria-label="Remover tecnologia"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addTech} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Adicionar tecnologia
              </Button>
            </div>
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
                  <AlertDialogTitle>Deletar área?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser desfeita. A área "{area.area}" e todas as suas
                    tecnologias serão removidas.
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
