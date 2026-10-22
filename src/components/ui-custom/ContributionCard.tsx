import type { Contribution } from "@/types";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function ContributionCard({ item, onEdit }: { item: Contribution; onEdit?: () => void }) {
  const Icon = (Icons as unknown as Record<string, LucideIcon>)[item.icon] ?? Icons.Sparkles;
  return (
    <article className="group relative glass rounded-3xl border border-border p-6 hover-scale hover:border-primary hover:shadow-soft animate-fade-in">
      {onEdit && (
        <button
          onClick={onEdit}
          className="absolute top-3 right-3 p-2 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-primary/10 transition"
          title="Editar contribuição"
          aria-label="Editar contribuição"
        >
          <Icons.Pencil className="h-4 w-4" />
        </button>
      )}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl gradient-primary text-white flex items-center justify-center shadow-soft">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg leading-tight">{item.title}</h3>
            <span className="text-xs text-primary-deep font-medium">{item.category}</span>
          </div>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full bg-accent/10 text-accent font-medium whitespace-nowrap ${onEdit ? "mr-8" : ""}`}
        >
          {item.status}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {item.technologies.map((t) => (
          <span
            key={t}
            className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground"
          >
            {t}
          </span>
        ))}
      </div>
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Impactos
        </h4>
        <ul className="space-y-1.5">
          {item.impacts.map((i) => (
            <li key={i} className="text-sm flex gap-2">
              <span className="text-primary mt-1">•</span>
              {i}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
