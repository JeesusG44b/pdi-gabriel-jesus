import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { RoadmapArea, Tech } from "@/types";
import { getBindings } from "./bindings";
import { adminMiddleware } from "./auth";

const roadmapAreaSchema = z.object({
  id: z.string().min(1),
  area: z.string().trim().min(1, "Nome da área é obrigatório"),
  icon: z.string().trim().min(1),
  techs: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        status: z.enum(["domino", "estudando", "preciso-estudar"]),
      }),
    )
    .default([]),
});

interface RoadmapRow {
  id: string;
  area: string;
  icon: string;
  techs: string;
}

function rowToArea(r: RoadmapRow): RoadmapArea {
  return {
    id: r.id,
    area: r.area,
    icon: r.icon,
    techs: JSON.parse(r.techs) as Tech[],
  };
}

export const listRoadmap = createServerFn({ method: "GET" }).handler(
  async (): Promise<RoadmapArea[]> => {
    const { DB } = await getBindings();
    const { results } = await DB.prepare(
      "SELECT * FROM roadmap_areas ORDER BY sort_order ASC",
    ).all<RoadmapRow>();
    return results.map(rowToArea);
  },
);

export const upsertRoadmapArea = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(roadmapAreaSchema)
  .handler(async ({ data }) => {
    const { DB } = await getBindings();
    await DB.prepare(
      `INSERT INTO roadmap_areas (id, area, icon, techs, sort_order)
       VALUES (?1, ?2, ?3, ?4,
         (SELECT COALESCE(MAX(sort_order) + 1, 0) FROM roadmap_areas))
       ON CONFLICT(id) DO UPDATE SET area = ?2, icon = ?3, techs = ?4`,
    )
      .bind(data.id, data.area, data.icon, JSON.stringify(data.techs))
      .run();
    return { ok: true };
  });

export const deleteRoadmapArea = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { DB } = await getBindings();
    await DB.prepare("DELETE FROM roadmap_areas WHERE id = ?1").bind(data.id).run();
    return { ok: true };
  });
