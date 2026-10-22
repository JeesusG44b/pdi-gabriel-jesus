import type { Status } from "@/types";
import { DominioChip } from "@/components/ui-custom/DominioChip";

// Chip de tecnologia: nome + rótulo de domínio escrito (não só cor).
export function TechnologyBadge({ name, status }: { name: string; status: Status }) {
  return (
    <span className="inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-border bg-card px-3 py-1.5 text-sm">
      <span className="font-medium text-foreground">{name}</span>
      <DominioChip status={status} className="py-0.5 text-[0.7rem]" />
    </span>
  );
}
