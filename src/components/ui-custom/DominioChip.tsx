import type { LucideIcon } from "lucide-react";
import { BookOpen, CircleAlert, CircleCheck } from "lucide-react";
import type { Status } from "@/types";
import { cn } from "@/lib/utils";

// Domínio sempre com rótulo escrito, ícone e cor (SPEC 6.1). A cor de fundo é suave
// (6% no claro, 10% no escuro) para o texto forte manter contraste AA.
export const dominioMeta: Record<Status, { label: string; Icon: LucideIcon; className: string }> = {
  domino: {
    label: "Domino",
    Icon: CircleCheck,
    className: "bg-success/[0.06] text-success border-success/40 dark:bg-success/10",
  },
  estudando: {
    label: "Estudando",
    Icon: BookOpen,
    className: "bg-warning/[0.06] text-warning border-warning/50 dark:bg-warning/10",
  },
  "preciso-estudar": {
    label: "Preciso estudar",
    Icon: CircleAlert,
    className: "bg-destructive/[0.06] text-destructive border-destructive/40 dark:bg-destructive/10",
  },
};

export function DominioChip({ status, className }: { status: Status; className?: string }) {
  const { label, Icon, className: tone } = dominioMeta[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        tone,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {label}
    </span>
  );
}
