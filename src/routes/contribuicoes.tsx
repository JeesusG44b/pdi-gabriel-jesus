import { createFileRoute } from "@tanstack/react-router";
import { SectionTitle } from "@/components/ui-custom/SectionTitle";
import { ContributionsSection } from "@/components/sections/ContributionsSection";
import { listContributions } from "@/api/contributions";

export const Route = createFileRoute("/contribuicoes")({
  loader: () => listContributions(),
  head: () => ({
    meta: [
      { title: "Contribuições · PDI Gabriel Jesus" },
      { name: "description", content: "Projetos, estudos e contribuições profissionais." },
    ],
  }),
  component: Page,
});

function Page() {
  const contributions = Route.useLoaderData();
  return (
    <section className="py-10">
      <SectionTitle
        eyebrow="Projetos & estudos"
        title="Contribuições"
        description="Coleção de projetos, estudos e participações que constroem minha jornada."
      />
      <ContributionsSection contributions={contributions} />
    </section>
  );
}
