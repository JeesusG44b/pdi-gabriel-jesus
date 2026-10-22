import { cn } from "@/lib/utils";

interface Props {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}
export function FilterTabs({ options, value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium border transition-all",
            value === o
              ? "gradient-primary text-white border-transparent shadow-soft"
              : "bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground"
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
