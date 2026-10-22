import { useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Disciplina, Fase, RoadmapArea, Status, Trilha } from "@/types";
import { FilterTabs } from "@/components/ui-custom/FilterTabs";
import { TrilhaBlock } from "@/components/ui-custom/TrilhaBlock";
import { TechnologyBadge } from "@/components/ui-custom/TechnologyBadge";
import { DisciplinaCard } from "@/components/ui-custom/DisciplinaCard";
import { DominioChip } from "@/components/ui-custom/DominioChip";
import { RoadmapAreaModal } from "@/components/ui-custom/RoadmapAreaModal";
import { DisciplinaModal, type DisciplinaPayload } from "@/components/ui-custom/DisciplinaModal";
import { ArquivadasDrawer } from "@/components/ui-custom/ArquivadasDrawer";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { deleteRoadmapArea, upsertRoadmapArea } from "@/api/roadmap";
import { upsertDisciplina } from "@/api/disciplinas";

const TODAS = "Todas";
const FASE_OPCOES: { label: string; fase: Fase | null }[] = [
  { label: "Todas as fases", fase: null },
  { label: "Cursadas", fase: "cursada" },
  { label: "Cursando", fase: "cursando" },
  { label: "Futuras", fase: "futura" },
];
const DOMINIOS: Status[] = ["domino", "estudando", "preciso-estudar"];

interface Props {
  areas: RoadmapArea[];
  trilhas: Trilha[];
  disciplinas: Disciplina[];
}

// Roadmap: resumo por domínio, um bloco por trilha, filtros de trilha e fase.
// Recebe só o que a rota já filtrou (visitante não recebe arquivadas nem admin).
export function RoadmapSection({ areas, trilhas, disciplinas }: Props) {
  const isAdmin = useIsAdmin();
  const router = useRouter();
  const [trilhaFiltro, setTrilhaFiltro] = useState<string>(TODAS);
  const [faseFiltro, setFaseFiltro] = useState<string>(FASE_OPCOES[0].label);
  const [editingArea, setEditingArea] = useState<{ item: RoadmapArea; isNew: boolean } | null>(null);
  const [editingDisciplina, setEditingDisciplina] = useState<Disciplina | null>(null);
  const [arquivadasAberto, setArquivadasAberto] = useState(false);
  const totalArquivadas = disciplinas.filter((d) => d.arquivada).length;

  const fase = FASE_OPCOES.find((f) => f.label === faseFiltro)?.fase ?? null;
  const ativas = useMemo(() => disciplinas.filter((d) => !d.arquivada), [disciplinas]);

  // Resumo: tecnologias das áreas + disciplinas ativas, por domínio.
  const resumo = useMemo(() => {
    const total = Object.fromEntries(DOMINIOS.map((s) => [s, { techs: 0, disciplinas: 0 }])) as Record<
      Status,
      { techs: number; disciplinas: number }
    >;
    for (const a of areas) for (const t of a.techs) total[t.status].techs += 1;
    for (const d of ativas) total[d.dominio].disciplinas += 1;
    return total;
  }, [areas, ativas]);

  const trilhasVisiveis = trilhaFiltro === TODAS ? trilhas : trilhas.filter((t) => t.nome === trilhaFiltro);
  const idsTrilha = new Set(trilhas.map((t) => t.id));
  const areasExtras = areas.filter((a) => !idsTrilha.has(a.id));
  const semTrilha = ativas.filter((d) => !d.trilhaId || !idsTrilha.has(d.trilhaId));

  const filtrarFase = (lista: Disciplina[]) => (fase ? lista.filter((d) => d.fase === fase) : lista);

  const handleSaveDisciplina = async (payload: DisciplinaPayload) => {
    try {
      await upsertDisciplina({ data: payload });
      await router.invalidate();
      toast.success("Disciplina salva com sucesso!");
      return true;
    } catch {
      toast.error("Erro ao salvar a disciplina");
      return false;
    }
  };

  const handleSaveArea = async (area: RoadmapArea) => {
    try {
      await upsertRoadmapArea({ data: area });
      await router.invalidate();
      toast.success("Tecnologias salvas com sucesso!");
      return true;
    } catch {
      toast.error("Erro ao salvar as tecnologias");
      return false;
    }
  };

  const handleDeleteArea = async (id: string) => {
    try {
      await deleteRoadmapArea({ data: { id } });
      await router.invalidate();
      toast.success("Área deletada com sucesso!");
      return true;
    } catch {
      toast.error("Erro ao deletar a área");
      return false;
    }
  };

  return (
    <div className="space-y-10">
      {isAdmin && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setArquivadasAberto(true)}
            className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-foreground"
          >
            <Icons.Archive className="h-4 w-4" aria-hidden="true" />
            Arquivadas ({totalArquivadas})
          </button>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        {DOMINIOS.map((s) => (
          <div key={s} className="rounded-2xl border border-border bg-card p-5">
            <DominioChip status={s} />
            <p className="mt-3 font-mono text-3xl font-medium tabular-nums text-primary-deep">
              {resumo[s].techs + resumo[s].disciplinas}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {resumo[s].techs} {resumo[s].techs === 1 ? "tecnologia" : "tecnologias"} e{" "}
              {resumo[s].disciplinas} {resumo[s].disciplinas === 1 ? "disciplina" : "disciplinas"}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-4" role="group" aria-label="Filtros do roadmap">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Trilha</p>
          <FilterTabs
            options={[TODAS, ...trilhas.map((t) => t.nome)]}
            value={trilhaFiltro}
            onChange={setTrilhaFiltro}
          />
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Fase</p>
          <FilterTabs
            options={FASE_OPCOES.map((f) => f.label)}
            value={faseFiltro}
            onChange={setFaseFiltro}
          />
        </div>
      </div>

      {trilhasVisiveis.map((t) => {
        const area = areas.find((a) => a.id === t.id);
        return (
          <TrilhaBlock
            key={t.id}
            trilha={t}
            techs={area?.techs ?? []}
            disciplinas={filtrarFase(ativas.filter((d) => d.trilhaId === t.id))}
            isAdmin={isAdmin}
            onEditDisciplina={setEditingDisciplina}
            onEditTechs={
              isAdmin
                ? () =>
                    setEditingArea({
                      item: area ?? { id: t.id, area: t.nome, icon: t.icon, techs: [] },
                      isNew: !area,
                    })
                : undefined
            }
          />
        );
      })}

      {trilhaFiltro === TODAS &&
        areasExtras.map((a) => (
          <AreaExtraBlock
            key={a.id}
            area={a}
            isAdmin={isAdmin}
            onEditTechs={() => setEditingArea({ item: a, isNew: false })}
          />
        ))}

      {trilhaFiltro === TODAS && filtrarFase(semTrilha).length > 0 && (
        <section className="glass rounded-3xl border border-border p-6 md:p-8" aria-labelledby="sem-trilha">
          <h3 id="sem-trilha" className="text-2xl">Sem trilha</h3>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {filtrarFase(semTrilha).map((d) => (
              <DisciplinaCard
                key={d.id}
                disciplina={d}
                isAdmin={isAdmin}
                onEdit={isAdmin ? () => setEditingDisciplina(d) : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {isAdmin && editingDisciplina && (
        <DisciplinaModal
          key={editingDisciplina.id}
          isOpen
          disciplina={editingDisciplina}
          trilhas={trilhas}
          onClose={() => setEditingDisciplina(null)}
          onSave={handleSaveDisciplina}
        />
      )}

      {isAdmin && (
        <ArquivadasDrawer
          open={arquivadasAberto}
          onOpenChange={setArquivadasAberto}
          disciplinas={disciplinas}
          trilhas={trilhas}
        />
      )}

      {editingArea && (
        <RoadmapAreaModal
          isOpen
          area={editingArea.item}
          isNew={editingArea.isNew}
          onClose={() => setEditingArea(null)}
          onSave={handleSaveArea}
          onDelete={editingArea.isNew ? undefined : handleDeleteArea}
        />
      )}
    </div>
  );
}

// Áreas do roadmap que não são trilha (ex.: certificações).
function AreaExtraBlock({
  area,
  isAdmin,
  onEditTechs,
}: {
  area: RoadmapArea;
  isAdmin: boolean;
  onEditTechs: () => void;
}) {
  const Icon = (Icons as unknown as Record<string, LucideIcon>)[area.icon] ?? Icons.Award;
  return (
    <section className="glass rounded-3xl border border-border p-6 md:p-8" aria-labelledby={`area-${area.id}`}>
      <header className="flex items-center gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl gradient-primary text-white shadow-soft">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 id={`area-${area.id}`} className="flex-1 text-2xl">{area.area}</h3>
        {isAdmin && (
          <button
            type="button"
            onClick={onEditTechs}
            className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-foreground"
          >
            Editar tecnologias
          </button>
        )}
      </header>
      {area.techs.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2">
          {area.techs.map((t) => (
            <li key={t.name} className="max-w-full">
              <TechnologyBadge name={t.name} status={t.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
