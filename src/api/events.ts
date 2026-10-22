import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Event } from "@/types";
import { getBindings } from "./bindings";
import { adminMiddleware } from "./auth";

export const EVENT_TYPES = [
  "Conferência",
  "Workshop",
  "Hackathon",
  "Meetup",
  "Curso",
  "Palestra",
  "Summit",
] as const;

export const eventSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1, "Título é obrigatório"),
  description: z.string().default(""),
  date: z.string().trim().min(1, "Data é obrigatória"),
  location: z.string().trim().min(1, "Local é obrigatório"),
  type: z.enum(EVENT_TYPES),
  image: z.string().default(""),
  highlights: z.array(z.string().trim().min(1)).default([]),
  link: z.string().optional(),
});

interface EventRow {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: string;
  image: string;
  highlights: string;
  link: string | null;
  sort_order: number;
}

export function rowToEvent(r: EventRow): Event {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    date: r.date,
    location: r.location,
    type: r.type as Event["type"],
    image: r.image,
    highlights: JSON.parse(r.highlights) as string[],
    link: r.link ?? undefined,
  };
}

export const listEvents = createServerFn({ method: "GET" }).handler(async (): Promise<Event[]> => {
  const { DB } = await getBindings();
  const { results } = await DB.prepare(
    "SELECT * FROM events ORDER BY sort_order ASC",
  ).all<EventRow>();
  return results.map(rowToEvent);
});

export const upsertEvent = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(eventSchema)
  .handler(async ({ data }) => {
    const { DB } = await getBindings();
    await DB.prepare(
      `INSERT INTO events (id, title, description, date, location, type, image, highlights, link, sort_order)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9,
         (SELECT COALESCE(MAX(sort_order) + 1, 0) FROM events))
       ON CONFLICT(id) DO UPDATE SET
         title = ?2, description = ?3, date = ?4, location = ?5,
         type = ?6, image = ?7, highlights = ?8, link = ?9`,
    )
      .bind(
        data.id,
        data.title,
        data.description,
        data.date,
        data.location,
        data.type,
        data.image,
        JSON.stringify(data.highlights),
        data.link ?? null,
      )
      .run();
    return { ok: true };
  });

export const deleteEvent = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { DB } = await getBindings();
    await DB.prepare("DELETE FROM events WHERE id = ?1").bind(data.id).run();
    return { ok: true };
  });
