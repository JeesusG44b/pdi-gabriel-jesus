import { createFileRoute } from "@tanstack/react-router";
import { SectionTitle } from "@/components/ui-custom/SectionTitle";
import { SoftSkillsSection } from "@/components/sections/SoftSkillsSection";
import { listSoftSkills } from "@/api/softSkills";

export const Route = createFileRoute("/soft-skills")({
  loader: () => listSoftSkills(),
  head: () => ({
    meta: [
      { title: "Soft Skills · PDI Gabriel Jesus" },
      {
        name: "description",
        content: "Habilidades comportamentais que pratico no dia a dia e as que estou desenvolvendo.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const softSkills = Route.useLoaderData();
  return (
    <section className="py-10">
      <SectionTitle
        eyebrow="Comportamental"
        title="Soft Skills"
        description="As habilidades humanas que sustentam minha evolução técnica."
      />
      <SoftSkillsSection softSkills={softSkills} />
    </section>
  );
}
