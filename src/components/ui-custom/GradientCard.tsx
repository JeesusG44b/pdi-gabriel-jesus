import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props { children: ReactNode; className?: string; glow?: boolean; }
export function GradientCard({ children, className, glow }: Props) {
  return (
    <div className={cn("relative rounded-3xl p-[1.5px] gradient-primary", glow && "shadow-glow", className)}>
      <div className="rounded-3xl bg-card p-6 md:p-8 h-full">{children}</div>
    </div>
  );
}
