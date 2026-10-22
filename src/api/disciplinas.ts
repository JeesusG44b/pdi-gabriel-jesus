import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Disciplina } from "@/types";
import { getBindings } from "./bindings";
import { adminMiddleware, isAdminRequest, marcarRespostaDeSessao } from "./auth";

const MOTIVO_MIN = 3;
const MOTIVO_MSG = "Motivo do arquivamento precisa ter pelo menos 3 caracteres";

const dominioEnum = z.enum(["domino", "estudando", "preciso-estudar"]);

const disciplinaBase = z.object({
  id: z.string().min(1),
  nome: z.string().trim().min(1, "Nome é obrigatório"),
  semestre: z.number().int().min(1).max(10),
  fase: z.enum(["cursada", "cursando", "futura"]),
  trilhaId: z.string().min(1).nullable().optional(),
  ementaResumo: z.string().default(""),
  ementaFonte: z.enum(["generica", "plano-de-ensino"]).default("generica"),
  aplicacaoTrabalho: z.string().default(""),
  recursoTitulo: z.string().default(""),
  recursoUrl: z.string().url().nullable().optional(),
  entregavel: z.string().default(""),
  dominio: dominioEnum,
  arquivada: z.boolean().default(false),
  motivoArquivamento: z.string().trim().optional(),
  visibilidade: z.enum(["publica", "admin"]).default("publica"),
  notaAdmin: z.string().nullable().optional(),
});

export const upsertDisciplinaSchema = disciplinaBase.refine(
  (d) => !d.arquivada || (d.motivoArquivamento ?? "").length >= MOTIVO_MIN,
  { message: MOTIVO_MSG, path: ["motivoArquivamento"] },
);

export const arquivarDisciplinaSchema = z.object({
  id: z.string().min(1),
  motivo: z.string().trim().min(MOTIVO_MIN, MOTIVO_MSG),
});

export const restaurarDisciplinaSchema = z.object({
  id: z.string().min(1),
});

export type UpsertDisciplinaInput = z.infer<typeof upsertDisciplinaSchema>;

interface DisciplinaRow {
  id: string;
  nome: string;
  semestre: number;
  fase: string;
  trilha_id: string | null;
  ementa_resumo: string;
  ementa_fonte: string;
  aplicacao_trabalho: string;
  recurso_titulo: string;
  recurso_url: string | null;
  entregavel: string;
  dominio: string;
  arquivada: number;
  motivo_arquivamento: string | null;
  visibilidade: string;
  nota_admin: string | null;
}

// Visitante: lista explícita de colunas. motivo_arquivamento e nota_admin nem são lidos.
const COLUNAS_PUBLICAS = `id, nome, semestre, fase, trilha_id, ementa_resumo, ementa_fonte,
  aplicacao_trabalho, recurso_titulo, recurso_url, entregavel, dominio, arquivada, visibilidade`;

function rowToDisciplina(r: DisciplinaRow, admin: boolean): Disciplina {
  const base: Disciplina = {
    id: r.id,
    nome: r.nome,
    semestre: r.semestre,
    fase: r.fase as Disciplina["fase"],
    trilhaId: r.trilha_id,
    ementaResumo: r.ementa_resumo,
    ementaFonte: r.ementa_fonte as Disciplina["ementaFonte"],
    aplicacaoTrabalho: r.aplicacao_trabalho,
    recursoTitulo: r.recurso_titulo,
    recursoUrl: r.recurso_url,
    entregavel: r.entregavel,
    dominio: r.dominio as Disciplina["dominio"],
    arquivada: r.arquivada === 1,
    visibilidade: r.visibilidade as Disciplina["visibilidade"],
  };
  if (!admin) return base;
  return {
    ...base,
    ...(r.motivo_arquivamento !== null ? { motivoArquivamento: r.motivo_arquivamento } : {}),
    ...(r.nota_admin !== null ? { notaAdmin: r.nota_admin } : {}),
  };
}

// Filtro de visibilidade no SQL. Visitante nunca recebe arquivada nem visibilidade = admin.
export async function selectDisciplinas(DB: D1Database, admin: boolean): Promise<Disciplina[]> {
  const sql = admin
    ? "SELECT * FROM disciplinas ORDER BY arquivada ASC, sort_order ASC"
    : `SELECT ${COLUNAS_PUBLICAS} FROM disciplinas
       WHERE arquivada = 0 AND visibilidade = 'publica'
       ORDER BY sort_order ASC`;
  const { results } = await DB.prepare(sql).all<DisciplinaRow>();
  return results.map((r) => rowToDisciplina(r, admin));
}

export async function gravarDisciplina(DB: D1Database, data: UpsertDisciplinaInput): Promise<void> {
  await DB.prepare(
    `INSERT INTO disciplinas (id, nome, semestre, fase, trilha_id, ementa_resumo, ementa_fonte,
       aplicacao_trabalho, recurso_titulo, recurso_url, entregavel, dominio, arquivada,
       motivo_arquivamento, visibilidade, nota_admin, sort_order, updated_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16,
       (SELECT COALESCE(MAX(sort_order) + 1, 0) FROM disciplinas), datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       nome = ?2, semestre = ?3, fase = ?4, trilha_id = ?5, ementa_resumo = ?6,
       ementa_fonte = ?7, aplicacao_trabalho = ?8, recurso_titulo = ?9, recurso_url = ?10,
       entregavel = ?11, dominio = ?12, arquivada = ?13, motivo_arquivamento = ?14,
       visibilidade = ?15, nota_admin = ?16, updated_at = datetime('now')`,
  )
    .bind(
      data.id,
      data.nome,
      data.semestre,
      data.fase,
      data.trilhaId ?? null,
      data.ementaResumo,
      data.ementaFonte,
      data.aplicacaoTrabalho,
      data.recursoTitulo,
      data.recursoUrl ?? null,
      data.entregavel,
      data.dominio,
      data.arquivada ? 1 : 0,
      data.arquivada ? (data.motivoArquivamento ?? null) : null,
      data.visibilidade,
      data.notaAdmin ?? null,
    )
    .run();
}

export async function marcarArquivada(DB: D1Database, id: string, motivo: string): Promise<void> {
  await DB.prepare(
    "UPDATE disciplinas SET arquivada = 1, motivo_arquivamento = ?2, updated_at = datetime('now') WHERE id = ?1",
  )
    .bind(id, motivo)
    .run();
}

export async function marcarRestaurada(DB: D1Database, id: string): Promise<void> {
  await DB.prepare(
    "UPDATE disciplinas SET arquivada = 0, motivo_arquivamento = NULL, updated_at = datetime('now') WHERE id = ?1",
  )
    .bind(id)
    .run();
}

export const listDisciplinas = createServerFn({ method: "GET" }).handler(
  async (): Promise<Disciplina[]> => {
    marcarRespostaDeSessao();
    const { DB } = await getBindings();
    return selectDisciplinas(DB, await isAdminRequest());
  },
);

export const upsertDisciplina = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(upsertDisciplinaSchema)
  .handler(async ({ data }) => {
    const { DB } = await getBindings();
    await gravarDisciplina(DB, data);
    return { ok: true };
  });

export const arquivarDisciplina = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(arquivarDisciplinaSchema)
  .handler(async ({ data }) => {
    const { DB } = await getBindings();
    await marcarArquivada(DB, data.id, data.motivo);
    return { ok: true };
  });

export const restaurarDisciplina = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(restaurarDisciplinaSchema)
  .handler(async ({ data }) => {
    const { DB } = await getBindings();
    await marcarRestaurada(DB, data.id);
    return { ok: true };
  });
