import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { SoftSkill } from "@/types";
import { SkillCard } from "@/components/ui-custom/SkillCard";
import { SoftSkillModal } from "@/components/ui-custom/SoftSkillModal";
import { SectionTitle } from "@/components/ui-custom/SectionTitle";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { deleteSoftSkill, upsertSoftSkill } from "@/api/softSkills";

function newSkillTemplate(): SoftSkill {
  return {
    id: crypto.randomUUID(),
    icon: "Sparkles",
    title: "",
    description: "",
    status: "Em desenvolvimento",
  };
}

export function SoftSkillsSection({ softSkills }: { softSkills: SoftSkill[] }) {
  const isAdmin = useIsAdmin();
  const router = useRouter();
  const [editing, setEditing] = useState<{ item: SoftSkill; isNew: boolean } | null>(null);

  const practiced = softSkills.filter((s) => s.status === "Já pratico");
  const developing = softSkills.filter((s) => s.status === "Em desenvolvimento");

  const handleSave = async (skill: SoftSkill) => {
    try {
      await upsertSoftSkill({ data: skill });
      await router.invalidate();
      toast.success("Soft skill salva com sucesso!");
      return true;
    } catch {
      toast.error("Erro ao salvar a soft skill");
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSoftSkill({ data: { id } });
      await router.invalidate();
      toast.success("Soft skill deletada com sucesso!");
      return true;
    } catch {
      toast.error("Erro ao deletar a soft skill");
      return false;
    }
  };

  return (
    <div className="space-y-12">
      {isAdmin && (
        <div className="flex justify-end">
          <button
            onClick={() => setEditing({ item: newSkillTemplate(), isNew: true })}
            className="px-5 py-2.5 rounded-full gradient-primary text-white font-medium shadow-soft hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Adicionar Soft Skill
          </button>
        </div>
      )}
      <div>
        <SectionTitle
          eyebrow="Habilidades"
          title="Já pratico"
          description="Soft skills que aplico no meu dia a dia profissional."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {practiced.map((s) => (
            <SkillCard
              key={s.id}
              item={s}
              onEdit={isAdmin ? () => setEditing({ item: s, isNew: false }) : undefined}
            />
          ))}
        </div>
      </div>
      <div>
        <SectionTitle
          eyebrow="Em evolução"
          title="Em desenvolvimento"
          description="Habilidades em construção contínua."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {developing.map((s) => (
            <SkillCard
              key={s.id}
              item={s}
              onEdit={isAdmin ? () => setEditing({ item: s, isNew: false }) : undefined}
            />
          ))}
        </div>
      </div>
      {editing && (
        <SoftSkillModal
          isOpen
          skill={editing.item}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
          onSave={handleSave}
          onDelete={editing.isNew ? undefined : handleDelete}
        />
      )}
    </div>
  );
}
