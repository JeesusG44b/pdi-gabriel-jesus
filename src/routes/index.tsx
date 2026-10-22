import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/sections/HeroSection";
import { EventsSection } from "@/components/sections/EventsSection";
import { SectionTitle } from "@/components/ui-custom/SectionTitle";
import { WeeklyGrid } from "@/components/ui-custom/WeeklyGrid";
import { listEvents } from "@/api/events";
import { listCiclos } from "@/api/ciclos";
import { listTrilhas } from "@/api/trilhas";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [events, ciclos, trilhas] = await Promise.all([listEvents(), listCiclos(), listTrilhas()]);
    return { events, ciclos, trilhas };
  },
  head: () => ({
    meta: [
      { title: "Sobre · PDI Gabriel Jesus" },
      {
        name: "description",
        content:
          "Plano de Desenvolvimento Individual de Gabriel Jesus, Solutions Engineer: cinco trilhas de estudo, ciclo atual e tempo até a formatura.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { events, ciclos, trilhas } = Route.useLoaderData();
  return (
    <>
      <HeroSection ciclos={ciclos} />
      <section className="py-10">
        <SectionTitle
          eyebrow="Rotina semanal"
          title="Blocos de estudo da semana"
          description="Cada dia tem uma trilha com horas fixas. As disciplinas e o domínio de cada tecnologia ficam no Roadmap."
        />
        <WeeklyGrid trilhas={trilhas} />
      </section>
      <EventsSection events={events} />
    </>
  );
}
