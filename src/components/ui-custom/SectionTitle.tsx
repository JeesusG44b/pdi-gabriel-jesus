interface Props { eyebrow?: string; title: string; description?: string; align?: "left" | "center"; }
export function SectionTitle({ eyebrow, title, description, align = "left" }: Props) {
  return (
    <div className={`mb-10 ${align === "center" ? "text-center" : ""} animate-fade-in`}>
      {eyebrow && (
        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary-deep mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-foreground">{title}</h2>
      {description && <p className="mt-3 text-muted-foreground max-w-2xl">{description}</p>}
    </div>
  );
}
