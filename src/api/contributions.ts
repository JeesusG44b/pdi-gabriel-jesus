import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Contribution } from "@/types";
import { getBindings } from "./bindings";
import { adminMiddleware } from "./auth";

const contributionSchema = z.object({
  id: z.string().min(1),
  icon: z.string().trim().min(1),
  title: z.string().trim().min(1, "Título é obrigatório"),
  category: z.string().trim().min(1, "Categoria é obrigatória"),
  description: z.string().default(""),
  technologies: z.array(z.string().trim().min(1)).default([]),
  impacts: z.array(z.string().trim().min(1)).default([]),
  status: z.enum(["Em andamento", "Concluído", "Planejado"]),
});

interface ContributionRow {
  id: string;
  icon: string;
  title: string;
  category: string;
  description: string;
  technologies: string;
  impacts: string;
  status: string;
}

function rowToContribution(r: ContributionRow): Contribution {
  return {
    id: r.id,
    icon: r.icon,
    title: r.title,
    category: r.category as Contribution["category"],
    description: r.description,
    technologies: JSON.parse(r.technologies) as string[],
    impacts: JSON.parse(r.impacts) as string[],
    status: r.status as Contribution["status"],
  };
}

export const listContributions = createServerFn({ method: "GET" }).handler(
  async (): Promise<Contribution[]> => {
    const { DB } = await getBindings();
    const { results } = await DB.prepare(
      "SELECT * FROM contributions ORDER BY sort_order ASC",
    ).all<ContributionRow>();
    return results.map(rowToContribution);
  },
);

export const upsertContribution = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(contributionSchema)
  .handler(async ({ data }) => {
    const { DB } = await getBindings();
    await DB.prepare(
      `INSERT INTO contributions (id, icon, title, category, description, technologies, impacts, status, sort_order)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8,
         (SELECT COALESCE(MAX(sort_order) + 1, 0) FROM contributions))
       ON CONFLICT(id) DO UPDATE SET
         icon = ?2, title = ?3, category = ?4, description = ?5,
         technologies = ?6, impacts = ?7, status = ?8`,
    )
      .bind(
        data.id,
        data.icon,
        data.title,
        data.category,
        data.description,
        JSON.stringify(data.technologies),
        JSON.stringify(data.impacts),
        data.status,
      )
      .run();
    return { ok: true };
  });

export const deleteContribution = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { DB } = await getBindings();
    await DB.prepare("DELETE FROM contributions WHERE id = ?1").bind(data.id).run();
    return { ok: true };
  });
