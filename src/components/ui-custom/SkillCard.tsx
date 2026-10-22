import type { SoftSkill } from "@/types";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function SkillCard({ item, onEdit }: { item: SoftSkill; onEdit?: () => void }) {
  const Icon = (Icons as unknown as Record<string, LucideIcon>)[item.icon] ?? Icons.Sparkles;
  const isPracticed = item.status === "Já pratico";
  return (
    <div className="relative glass rounded-2xl border border-border p-5 hover-scale hover:border-primary hover:shadow-soft animate-fade-in">
      {onEdit && (
        <button
          onClick={onEdit}
          className="absolute top-3 right-3 p-2 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-primary/10 transition"
          title="Editar soft skill"
          aria-label="Editar soft skill"
        >
          <Icons.Pencil className="h-4 w-4" />
        </button>
      )}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center ${isPracticed ? "bg-success/15 text-success" : "bg-accent/15 text-accent"}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-semibold">{item.title}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
      <span
        className={`text-xs px-2 py-1 rounded-full font-medium ${isPracticed ? "bg-success/15 text-success" : "bg-accent/10 text-accent"}`}
      >
        {item.status}
      </span>
    </div>
  );
}
