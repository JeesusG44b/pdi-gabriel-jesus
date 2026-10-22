import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { Event } from "@/types";
import { EventCard } from "@/components/ui-custom/EventCard";
import { EventModal } from "@/components/ui-custom/EventModal";
import { SectionTitle } from "@/components/ui-custom/SectionTitle";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { deleteEvent, upsertEvent } from "@/api/events";

function newEventTemplate(): Event {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    date: "",
    location: "",
    type: "Meetup",
    image: "",
    highlights: [],
    link: "",
  };
}

export function EventsSection({ events }: { events: Event[] }) {
  const isAdmin = useIsAdmin();
  const router = useRouter();
  const [editing, setEditing] = useState<{ item: Event; isNew: boolean } | null>(null);

  const handleSave = async (item: Event) => {
    try {
      await upsertEvent({ data: item });
      await router.invalidate();
      toast.success("Evento salvo com sucesso!");
      return true;
    } catch {
      toast.error("Erro ao salvar o evento");
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEvent({ data: { id } });
      await router.invalidate();
      toast.success("Evento deletado com sucesso!");
      return true;
    } catch {
      toast.error("Erro ao deletar o evento");
      return false;
    }
  };

  return (
    <section className="py-12">
      <SectionTitle
        title="Eventos e Participações"
        description="Conferências, workshops e meetups que participei para me manter atualizada e conectada com a comunidade tech"
      />
      {isAdmin && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setEditing({ item: newEventTemplate(), isNew: true })}
            className="px-5 py-2.5 rounded-full gradient-primary text-white font-medium shadow-soft hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Adicionar Evento
          </button>
        </div>
      )}
      {events.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhum evento cadastrado ainda.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {events.map((event) => (
            <EventCard
              key={event.id}
              item={event}
              onEdit={isAdmin ? () => setEditing({ item: event, isNew: false }) : undefined}
            />
          ))}
        </div>
      )}
      {editing && (
        <EventModal
          isOpen
          event={editing.item}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
          onSave={handleSave}
          onDelete={editing.isNew ? undefined : handleDelete}
        />
      )}
    </section>
  );
}
