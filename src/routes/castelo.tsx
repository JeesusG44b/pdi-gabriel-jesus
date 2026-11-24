import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionTitle } from "@/components/ui-custom/SectionTitle";
import { CasteloGame } from "@/components/castelo/CasteloGame";

export const Route = createFileRoute("/castelo")({
  head: () => ({
    meta: [
      { title: "Castelo · PDI Gabriel Jesus" },
      {
        name: "description",
        content:
          "O mesmo PDI em forma de castelo para explorar: ande, pule e interaja. Todo o conteúdo também está nas páginas do site.",
      },
    ],
  }),
  component: Page,
});

const controles = [
  { tecla: "Setas ou A e D", acao: "Andar" },
  { tecla: "Espaço", acao: "Pular" },
  { tecla: "E ou Enter", acao: "Interagir" },
];

const paginas = [
  { to: "/", label: "Sobre" },
  { to: "/objetivo-carreira", label: "Objetivo" },
  { to: "/metas", label: "Metas" },
  { to: "/roadmap", label: "Roadmap" },
  { to: "/contribuicoes", label: "Contribuições" },
  { to: "/soft-skills", label: "Soft Skills" },
] as const;

// Tudo fora de <CasteloGame> é HTML renderizado no servidor (SPEC 9.4, regra 3):
// sem JavaScript, a página continua explicando o que é e levando ao conteúdo.
function Page() {
  return (
    <section className="py-10">
      <SectionTitle
        eyebrow="Em construção"
        title="Castelo"
        description="O mesmo PDI, em forma de castelo para explorar. Por enquanto existe só uma sala de teste: ande, pule e acenda a tocha."
      />

      <CasteloGame />
      <noscript>
        <p className="mt-3 text-sm text-muted-foreground">
          O castelo precisa de JavaScript. Todo o conteúdo está nas páginas listadas abaixo.
        </p>
      </noscript>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-display text-lg tracking-wide">Controles</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {controles.map((c) => (
              <div key={c.acao} className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
                <dt className="font-mono text-muted-foreground">{c.tecla}</dt>
                <dd className="font-medium">{c.acao}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-sm text-muted-foreground">
            No celular, use os botões que aparecem abaixo do jogo.
          </p>
        </div>

        <div>
          <h2 className="font-display text-lg tracking-wide">Ver como página</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Prefere ler sem jogar? Está tudo aqui:
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {paginas.map((p) => (
              <li key={p.to}>
                <Link
                  to={p.to}
                  className="inline-flex rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-secondary transition"
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
