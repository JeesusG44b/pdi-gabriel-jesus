import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Deadline, Visibilidade } from "@/types";
import { getBindings } from "./bindings";
import { adminMiddleware, isAdminRequest, marcarRespostaDeSessao } from "./auth";

export const goalSchema = z.object({
  id: z.string().min(1),
  categoria: z.string().trim().min(1, "Categoria é obrigatória"),
  titulo: z.string().trim().min(1, "Título é obrigatório"),
  descricao: z.string().default(""),
  dataPrazo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de prazo é obrigatória"),
  prioridade: z.enum(["Alta", "Média", "Baixa"]),
  status: z.enum(["Planejado", "Em progresso", "Concluído"]),
  icon: z.string().optional(),
  progresso: z.number().int().min(0).max(100).optional(),
  cicloId: z.string().min(1).nullable().optional(),
  trilhaId: z.string().min(1).nullable().optional(),
  visibilidade: z.enum(["publica", "admin"]).default("publica"),
});

interface GoalRow {
  id: string;
  categoria: string;
  titulo: string;
  descricao: string;
  data_prazo: string;
  prioridade: string;
  status: string;
  icon: string | null;
  progresso: number | null;
  ciclo_id: string | null;
  trilha_id: string | null;
  visibilidade: string;
}

function rowToDeadline(r: GoalRow): Deadline {
  return {
    id: r.id,
    categoria: r.categoria,
    titulo: r.titulo,
    descricao: r.descricao,
    dataPrazo: r.data_prazo,
    prioridade: r.prioridade as Deadline["prioridade"],
    status: r.status as Deadline["status"],
    icon: r.icon ?? undefined,
    progresso: r.progresso ?? undefined,
    cicloId: r.ciclo_id ?? undefined,
    trilhaId: r.trilha_id ?? undefined,
    visibilidade: r.visibilidade as Visibilidade,
  };
}

// Visitante só recebe metas com visibilidade = 'publica'. Filtro no SQL, não na UI.
export async function selectGoals(DB: D1Database, admin: boolean): Promise<Deadline[]> {
  const sql = admin
    ? "SELECT * FROM goals ORDER BY data_prazo ASC"
    : "SELECT * FROM goals WHERE visibilidade = 'publica' ORDER BY data_prazo ASC";
  const { results } = await DB.prepare(sql).all<GoalRow>();
  return results.map(rowToDeadline);
}

export const listGoals = createServerFn({ method: "GET" }).handler(
  async (): Promise<Deadline[]> => {
    marcarRespostaDeSessao();
    const { DB } = await getBindings();
    return selectGoals(DB, await isAdminRequest());
  },
);

export type GoalInput = z.infer<typeof goalSchema>;

export async function gravarGoal(DB: D1Database, data: GoalInput): Promise<void> {
  await DB.prepare(
    `INSERT INTO goals (id, categoria, titulo, descricao, data_prazo, prioridade, status, icon, progresso,
       ciclo_id, trilha_id, visibilidade)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
     ON CONFLICT(id) DO UPDATE SET
       categoria = ?2, titulo = ?3, descricao = ?4, data_prazo = ?5,
       prioridade = ?6, status = ?7, icon = ?8, progresso = ?9,
       ciclo_id = ?10, trilha_id = ?11, visibilidade = ?12,
       updated_at = datetime('now')`,
  )
    .bind(
      data.id,
      data.categoria,
      data.titulo,
      data.descricao,
      data.dataPrazo,
      data.prioridade,
      data.status,
      data.icon ?? null,
      data.progresso ?? null,
      data.cicloId ?? null,
      data.trilhaId ?? null,
      data.visibilidade,
    )
    .run();
}

export const upsertGoal = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(goalSchema)
  .handler(async ({ data }) => {
    const { DB } = await getBindings();
    await gravarGoal(DB, data);
    return { ok: true };
  });

export const deleteGoal = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { DB } = await getBindings();
    await DB.prepare("DELETE FROM goals WHERE id = ?1").bind(data.id).run();
    return { ok: true };
  });
