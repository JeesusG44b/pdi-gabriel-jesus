import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Trilha } from "@/types";
import { getBindings } from "./bindings";
import { adminMiddleware } from "./auth";

export const trilhaSchema = z.object({
  id: z.string().trim().min(1, "Id é obrigatório"),
  nome: z.string().trim().min(1, "Nome é obrigatório"),
  icon: z.string().trim().min(1, "Ícone é obrigatório"),
  diaSemana: z.enum(["segunda", "terça", "quarta", "quinta", "sexta"]),
  horasSemana: z.number().positive().max(40),
  foco: z.string().default(""),
});

interface TrilhaRow {
  id: string;
  nome: string;
  icon: string;
  dia_semana: string;
  horas_semana: number;
  foco: string;
}

function rowToTrilha(r: TrilhaRow): Trilha {
  return {
    id: r.id,
    nome: r.nome,
    icon: r.icon,
    diaSemana: r.dia_semana,
    horasSemana: r.horas_semana,
    foco: r.foco,
  };
}

export const listTrilhas = createServerFn({ method: "GET" }).handler(
  async (): Promise<Trilha[]> => {
    const { DB } = await getBindings();
    const { results } = await DB.prepare(
      "SELECT * FROM trilhas ORDER BY sort_order ASC",
    ).all<TrilhaRow>();
    return results.map(rowToTrilha);
  },
);

export const upsertTrilha = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(trilhaSchema)
  .handler(async ({ data }) => {
    const { DB } = await getBindings();
    await DB.prepare(
      `INSERT INTO trilhas (id, nome, icon, dia_semana, horas_semana, foco, sort_order)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6,
         (SELECT COALESCE(MAX(sort_order) + 1, 0) FROM trilhas))
       ON CONFLICT(id) DO UPDATE SET
         nome = ?2, icon = ?3, dia_semana = ?4, horas_semana = ?5, foco = ?6`,
    )
      .bind(data.id, data.nome, data.icon, data.diaSemana, data.horasSemana, data.foco)
      .run();
    return { ok: true };
  });

// Trilha referenciada por disciplinas não pode ser apagada: a FK recusa e o erro sobe.
export const deleteTrilha = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { DB } = await getBindings();
    await DB.prepare("DELETE FROM trilhas WHERE id = ?1").bind(data.id).run();
    return { ok: true };
  });
