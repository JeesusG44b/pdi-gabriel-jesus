import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { CareerStep, Goal } from "@/types";
import { getBindings } from "./bindings";
import { adminMiddleware } from "./auth";

export const careerStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1, "Título é obrigatório"),
  focus: z.string().trim().min(1, "Foco é obrigatório"),
  current: z.boolean().default(false),
});

export const careerGoalSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1, "Título é obrigatório"),
});

interface CareerStepRow {
  id: string;
  title: string;
  focus: string;
  is_current: number;
  sort_order: number;
}

interface CareerGoalRow {
  id: string;
  title: string;
  sort_order: number;
}

function rowToCareerStep(r: CareerStepRow): CareerStep {
  return {
    id: r.id,
    title: r.title,
    focus: r.focus,
    current: r.is_current === 1,
  };
}

function rowToCareerGoal(r: CareerGoalRow): Goal {
  return {
    id: r.id,
    title: r.title,
  };
}

export const listCareer = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ steps: CareerStep[]; goals: Goal[] }> => {
    const { DB } = await getBindings();
    const [stepsResult, goalsResult] = await Promise.all([
      DB.prepare("SELECT * FROM career_steps ORDER BY sort_order ASC").all<CareerStepRow>(),
      DB.prepare("SELECT * FROM career_goals ORDER BY sort_order ASC").all<CareerGoalRow>(),
    ]);
    return {
      steps: stepsResult.results.map(rowToCareerStep),
      goals: goalsResult.results.map(rowToCareerGoal),
    };
  },
);

export type CareerStepInput = z.infer<typeof careerStepSchema>;

interface SqlStatement {
  sql: string;
  args: unknown[];
}

// Extraída como função pura para poder testar a regra de "única etapa atual"
// sem precisar simular o pipeline de middleware do createServerFn.
export function buildCareerStepStatements(data: CareerStepInput): SqlStatement[] {
  const statements: SqlStatement[] = [];
  // Garante uma única etapa "Atual": desmarca as demais antes de aplicar o upsert.
  if (data.current) {
    statements.push({
      sql: "UPDATE career_steps SET is_current = 0 WHERE id != ?1",
      args: [data.id],
    });
  }
  statements.push({
    sql: `INSERT INTO career_steps (id, title, focus, is_current, sort_order)
          VALUES (?1, ?2, ?3, ?4, (SELECT COALESCE(MAX(sort_order) + 1, 0) FROM career_steps))
          ON CONFLICT(id) DO UPDATE SET
            title = ?2, focus = ?3, is_current = ?4`,
    args: [data.id, data.title, data.focus, data.current ? 1 : 0],
  });
  return statements;
}

export const upsertCareerStep = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(careerStepSchema)
  .handler(async ({ data }) => {
    const { DB } = await getBindings();
    const statements = buildCareerStepStatements(data).map((s) =>
      DB.prepare(s.sql).bind(...s.args),
    );
    await DB.batch(statements);
    return { ok: true };
  });

export const deleteCareerStep = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { DB } = await getBindings();
    await DB.prepare("DELETE FROM career_steps WHERE id = ?1").bind(data.id).run();
    return { ok: true };
  });

export const upsertCareerGoal = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(careerGoalSchema)
  .handler(async ({ data }) => {
    const { DB } = await getBindings();
    await DB.prepare(
      `INSERT INTO career_goals (id, title, sort_order)
       VALUES (?1, ?2, (SELECT COALESCE(MAX(sort_order) + 1, 0) FROM career_goals))
       ON CONFLICT(id) DO UPDATE SET title = ?2`,
    )
      .bind(data.id, data.title)
      .run();
    return { ok: true };
  });

export const deleteCareerGoal = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { DB } = await getBindings();
    await DB.prepare("DELETE FROM career_goals WHERE id = ?1").bind(data.id).run();
    return { ok: true };
  });
