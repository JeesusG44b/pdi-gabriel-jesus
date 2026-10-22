import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Ciclo } from "@/types";
import { getBindings } from "./bindings";
import { adminMiddleware } from "./auth";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD");

export const cicloSchema = z
  .object({
    id: z.string().trim().min(1, "Id é obrigatório"),
    nome: z.string().trim().min(1, "Nome é obrigatório"),
    inicio: isoDate,
    fim: isoDate,
    foco: z.string().default(""),
    status: z.enum(["planejado", "atual", "concluido"]),
  })
  .refine((c) => c.fim >= c.inicio, {
    message: "Fim não pode ser anterior ao início",
    path: ["fim"],
  });

interface CicloRow {
  id: string;
  nome: string;
  inicio: string;
  fim: string;
  foco: string;
  status: string;
}

function rowToCiclo(r: CicloRow): Ciclo {
  return {
    id: r.id,
    nome: r.nome,
    inicio: r.inicio,
    fim: r.fim,
    foco: r.foco,
    status: r.status as Ciclo["status"],
  };
}

export const listCiclos = createServerFn({ method: "GET" }).handler(
  async (): Promise<Ciclo[]> => {
    const { DB } = await getBindings();
    const { results } = await DB.prepare(
      "SELECT * FROM ciclos ORDER BY sort_order ASC",
    ).all<CicloRow>();
    return results.map(rowToCiclo);
  },
);

export const upsertCiclo = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(cicloSchema)
  .handler(async ({ data }) => {
    const { DB } = await getBindings();
    await DB.prepare(
      `INSERT INTO ciclos (id, nome, inicio, fim, foco, status, sort_order)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6,
         (SELECT COALESCE(MAX(sort_order) + 1, 0) FROM ciclos))
       ON CONFLICT(id) DO UPDATE SET
         nome = ?2, inicio = ?3, fim = ?4, foco = ?5, status = ?6`,
    )
      .bind(data.id, data.nome, data.inicio, data.fim, data.foco, data.status)
      .run();
    return { ok: true };
  });

export const deleteCiclo = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { DB } = await getBindings();
    await DB.prepare("DELETE FROM ciclos WHERE id = ?1").bind(data.id).run();
    return { ok: true };
  });
