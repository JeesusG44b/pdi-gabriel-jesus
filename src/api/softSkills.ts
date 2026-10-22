import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SoftSkill } from "@/types";
import { getBindings } from "./bindings";
import { adminMiddleware } from "./auth";

const softSkillSchema = z.object({
  id: z.string().min(1),
  icon: z.string().trim().min(1),
  title: z.string().trim().min(1, "Título é obrigatório"),
  description: z.string().default(""),
  status: z.enum(["Já pratico", "Em desenvolvimento"]),
});

interface SoftSkillRow {
  id: string;
  icon: string;
  title: string;
  description: string;
  status: string;
}

function rowToSkill(r: SoftSkillRow): SoftSkill {
  return {
    id: r.id,
    icon: r.icon,
    title: r.title,
    description: r.description,
    status: r.status as SoftSkill["status"],
  };
}

export const listSoftSkills = createServerFn({ method: "GET" }).handler(
  async (): Promise<SoftSkill[]> => {
    const { DB } = await getBindings();
    const { results } = await DB.prepare(
      "SELECT * FROM soft_skills ORDER BY sort_order ASC",
    ).all<SoftSkillRow>();
    return results.map(rowToSkill);
  },
);

export const upsertSoftSkill = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(softSkillSchema)
  .handler(async ({ data }) => {
    const { DB } = await getBindings();
    await DB.prepare(
      `INSERT INTO soft_skills (id, icon, title, description, status, sort_order)
       VALUES (?1, ?2, ?3, ?4, ?5,
         (SELECT COALESCE(MAX(sort_order) + 1, 0) FROM soft_skills))
       ON CONFLICT(id) DO UPDATE SET icon = ?2, title = ?3, description = ?4, status = ?5`,
    )
      .bind(data.id, data.icon, data.title, data.description, data.status)
      .run();
    return { ok: true };
  });

export const deleteSoftSkill = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { DB } = await getBindings();
    await DB.prepare("DELETE FROM soft_skills WHERE id = ?1").bind(data.id).run();
    return { ok: true };
  });
