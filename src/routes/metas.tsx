import { createFileRoute } from "@tanstack/react-router";
import { SectionTitle } from "@/components/ui-custom/SectionTitle";
import { GoalsSection } from "@/components/sections/GoalsSection";
import { listGoals } from "@/api/goals";
import { listCiclos } from "@/api/ciclos";
import { listTrilhas } from "@/api/trilhas";

export const Route = createFileRoute("/metas")({
  loader: async () => {
    const [deadlines, ciclos, trilhas] = await Promise.all([listGoals(), listCiclos(), listTrilhas()]);
    return { deadlines, ciclos, trilhas };
  },
  head: () => ({
    meta: [
      { title: "Metas · PDI Gabriel Jesus" },
      {
        name: "description",
        content:
          "Metas por ciclo trimestral, com trilha, prazo e status de cada uma.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { deadlines, ciclos, trilhas } = Route.useLoaderData();
  return (
    <section className="py-10">
      <SectionTitle
        eyebrow="Planejamento"
        title="Metas por ciclo"
        description="Metas de cada ciclo trimestral, com a trilha e o prazo de cada uma e o status de progresso."
      />
      <GoalsSection deadlines={deadlines} ciclos={ciclos} trilhas={trilhas} />
    </section>
  );
}
