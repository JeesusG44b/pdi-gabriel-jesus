import { useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { Contribution } from "@/types";
import { ContributionCard } from "@/components/ui-custom/ContributionCard";
import { ContributionModal } from "@/components/ui-custom/ContributionModal";
import { FilterTabs } from "@/components/ui-custom/FilterTabs";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { deleteContribution, upsertContribution } from "@/api/contributions";

function newContributionTemplate(): Contribution {
  return {
    id: crypto.randomUUID(),
    icon: "Sparkles",
    title: "",
    category: "Projetos",
    description: "",
    technologies: [],
    impacts: [],
    status: "Em andamento",
  };
}

export function ContributionsSection({ contributions }: { contributions: Contribution[] }) {
  const isAdmin = useIsAdmin();
  const router = useRouter();
  const [filter, setFilter] = useState<string>("Todas");
  const [editing, setEditing] = useState<{ item: Contribution; isNew: boolean } | null>(null);

  // Filtros vêm das categorias cadastradas, não de uma lista fixa.
  const categorias = useMemo(
    () => Array.from(new Set(contributions.map((c) => c.category))),
    [contributions],
  );
  const filters = useMemo(() => ["Todas", ...categorias], [categorias]);

  const items = useMemo(
    () => (filter === "Todas" ? contributions : contributions.filter((c) => c.category === filter)),
    [contributions, filter],
  );

  const handleSave = async (item: Contribution) => {
    try {
      await upsertContribution({ data: item });
      await router.invalidate();
      toast.success("Contribuição salva com sucesso!");
      return true;
    } catch {
      toast.error("Erro ao salvar a contribuição");
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteContribution({ data: { id } });
      await router.invalidate();
      toast.success("Contribuição deletada com sucesso!");
      return true;
    } catch {
      toast.error("Erro ao deletar a contribuição");
      return false;
    }
  };

  return (
    <div>
      {isAdmin && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setEditing({ item: newContributionTemplate(), isNew: true })}
            className="px-5 py-2.5 rounded-full gradient-primary text-white font-medium shadow-soft hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Adicionar Contribuição
          </button>
        </div>
      )}
      <div className="mb-8">
        <FilterTabs options={filters} value={filter} onChange={setFilter} />
      </div>
      {items.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          Nenhuma contribuição nessa categoria ainda.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((c) => (
            <ContributionCard
              key={c.id}
              item={c}
              onEdit={isAdmin ? () => setEditing({ item: c, isNew: false }) : undefined}
            />
          ))}
        </div>
      )}
      {editing && (
        <ContributionModal
          isOpen
          contribution={editing.item}
          categorias={categorias}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
          onSave={handleSave}
          onDelete={editing.isNew ? undefined : handleDelete}
        />
      )}
    </div>
  );
}
