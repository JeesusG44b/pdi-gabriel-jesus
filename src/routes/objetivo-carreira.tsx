import { createFileRoute } from "@tanstack/react-router";
import { SectionTitle } from "@/components/ui-custom/SectionTitle";
import { CareerTimeline } from "@/components/sections/CareerTimeline";
import { listCareer } from "@/api/career";

export const Route = createFileRoute("/objetivo-carreira")({
  loader: () => listCareer(),
  head: () => ({
    meta: [
      { title: "Objetivo · PDI Gabriel Jesus" },
      {
        name: "description",
        content:
          "Três etapas da carreira, de Solutions Engineer Pleno a Solutions Architect, e as metas em andamento.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { steps, goals } = Route.useLoaderData();
  return (
    <section className="py-10">
      <SectionTitle
        eyebrow="Trajetória"
        title="Objetivo de Carreira"
        description="Onde estou agora e onde quero chegar, com a evolução técnica e profissional planejada por etapas."
      />
      <CareerTimeline steps={steps} goals={goals} />
    </section>
  );
}
