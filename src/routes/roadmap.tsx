import { createFileRoute } from "@tanstack/react-router";
import { SectionTitle } from "@/components/ui-custom/SectionTitle";
import { RoadmapSection } from "@/components/sections/RoadmapSection";
import { listRoadmap } from "@/api/roadmap";
import { listTrilhas } from "@/api/trilhas";
import { listDisciplinas } from "@/api/disciplinas";

export const Route = createFileRoute("/roadmap")({
  loader: async () => {
    const [areas, trilhas, disciplinas] = await Promise.all([
      listRoadmap(),
      listTrilhas(),
      listDisciplinas(),
    ]);
    return { areas, trilhas, disciplinas };
  },
  head: () => ({
    meta: [
      { title: "Roadmap · PDI Gabriel Jesus" },
      {
        name: "description",
        content:
          "Disciplinas da graduação e tecnologias de cada trilha de estudo, com domínio e fase de cada item.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { areas, trilhas, disciplinas } = Route.useLoaderData();
  return (
    <section className="py-10">
      <SectionTitle
        eyebrow="Trilhas de estudo"
        title="Roadmap"
        description="Cada trilha tem dia e horas fixos na semana, tecnologias com o nível de domínio e as disciplinas da graduação que a apoiam."
      />
      <RoadmapSection areas={areas} trilhas={trilhas} disciplinas={disciplinas} />
    </section>
  );
}
