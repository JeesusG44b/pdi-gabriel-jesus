import type { Event } from "@/types";
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

interface EventModalProps {
  isOpen: boolean;
  event: Event;
  isNew?: boolean;
  onClose: () => void;
  onSave: (updated: Event) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
}

const EVENT_TYPES: Event["type"][] = [
  "Conferência",
  "Workshop",
  "Hackathon",
  "Meetup",
  "Curso",
  "Palestra",
  "Summit",
];

export function EventModal({ isOpen, event, isNew, onClose, onSave, onDelete }: EventModalProps) {
  const [formData, setFormData] = useState<Event>(event);
  const [saving, setSaving] = useState(false);

  const handleChange = <K extends keyof Event>(field: K, value: Event[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    if (!formData.date.trim()) {
      toast.error("Data é obrigatória");
      return;
    }
    if (!formData.location.trim()) {
      toast.error("Local é obrigatório");
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
    const ok = await onDelete(event.id);
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Novo Evento" : "Editar Evento"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="e-title">Título *</Label>
            <Input
              id="e-title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ex: Google Cloud Summit Developer Day"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="e-description">Descrição</Label>
            <Textarea
              id="e-description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descreva o evento"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="e-date">Data *</Label>
              <Input
                id="e-date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                placeholder="Ex: Outubro 2025"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-location">Local *</Label>
              <Input
                id="e-location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="Ex: São Paulo, SP"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="e-type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(v) => handleChange("type", v as Event["type"])}
            >
              <SelectTrigger id="e-type">
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="e-image">Imagem (URL ou caminho)</Label>
            <Input
              id="e-image"
              value={formData.image}
              onChange={(e) => handleChange("image", e.target.value)}
              placeholder="Ex: /images/event-foo.jpg ou https://..."
            />
          </div>

          <div className="space-y-2">
            <Label>Destaques</Label>
            <StringListEditor
              values={formData.highlights ?? []}
              onChange={(v) => handleChange("highlights", v)}
              placeholder="Ex: AWS, Networking..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="e-link">Link</Label>
            <Input
              id="e-link"
              value={formData.link ?? ""}
              onChange={(e) => handleChange("link", e.target.value)}
              placeholder="Ex: https://www.linkedin.com/posts/..."
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
                  <AlertDialogTitle>Deletar evento?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser desfeita. "{event.title}" será removido permanentemente.
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
