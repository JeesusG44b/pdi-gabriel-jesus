import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminMiddleware } from "./auth";
import {
  arquivarDisciplinaSchema,
  gravarDisciplina,
  marcarArquivada,
  marcarRestaurada,
  selectDisciplinas,
  upsertDisciplinaSchema,
} from "./disciplinas";
import { criarDbDeTeste } from "./testDb";

// Sem cookie de sessão: verifySession devolve false e o middleware recusa.
vi.mock("@tanstack/react-start/server", () => ({
  getCookie: vi.fn(() => undefined),
  setCookie: vi.fn(),
  deleteCookie: vi.fn(),
}));

const base = {
  semestre: 1,
  fase: "cursada" as const,
  dominio: "domino" as const,
};

async function criarFixtures(db: D1Database) {
  await db
    .prepare("INSERT INTO trilhas (id, nome, icon, dia_semana, horas_semana) VALUES (?1, ?2, ?3, ?4, ?5)")
    .bind("cloud", "Cloud", "Cloud", "segunda", 4)
    .run();

  await gravarDisciplina(
    db,
    upsertDisciplinaSchema.parse({
      ...base,
      id: "ativa-publica",
      nome: "Redes",
      trilhaId: "cloud",
      notaAdmin: "nota de teste",
    }),
  );
  await gravarDisciplina(
    db,
    upsertDisciplinaSchema.parse({
      ...base,
      id: "arquivada-com-motivo",
      nome: "Cálculo antigo",
      arquivada: true,
      motivoArquivamento: "Fora do escopo do PDI",
    }),
  );
  await gravarDisciplina(
    db,
    upsertDisciplinaSchema.parse({
      ...base,
      id: "so-admin",
      nome: "Disciplina de dependência",
      visibilidade: "admin",
    }),
  );
}

describe("selectDisciplinas para visitante", () => {
  let db: D1Database;

  beforeEach(async () => {
    db = criarDbDeTeste();
    await criarFixtures(db);
  });

  it("não traz disciplina arquivada nem com visibilidade = admin", async () => {
    const lista = await selectDisciplinas(db, false);
    expect(lista.map((d) => d.id)).toEqual(["ativa-publica"]);
  });

  it("não traz nota_admin nem motivo_arquivamento, nem como chave nem como texto", async () => {
    const lista = await selectDisciplinas(db, false);
    for (const d of lista) {
      expect(d).not.toHaveProperty("notaAdmin");
      expect(d).not.toHaveProperty("motivoArquivamento");
    }
    const json = JSON.stringify(lista);
    expect(json).not.toContain("nota de teste");
    expect(json).not.toContain("Fora do escopo do PDI");
  });
});

describe("selectDisciplinas para admin", () => {
  it("devolve as arquivadas com motivo e as de visibilidade admin", async () => {
    const db = criarDbDeTeste();
    await criarFixtures(db);

    const lista = await selectDisciplinas(db, true);
    expect(lista.map((d) => d.id).sort()).toEqual([
      "arquivada-com-motivo",
      "ativa-publica",
      "so-admin",
    ]);

    const arquivada = lista.find((d) => d.id === "arquivada-com-motivo");
    expect(arquivada?.arquivada).toBe(true);
    expect(arquivada?.motivoArquivamento).toBe("Fora do escopo do PDI");

    const ativa = lista.find((d) => d.id === "ativa-publica");
    expect(ativa?.notaAdmin).toBe("nota de teste");
  });

  it("arquivar e restaurar muda o que o visitante vê", async () => {
    const db = criarDbDeTeste();
    await criarFixtures(db);

    await marcarArquivada(db, "ativa-publica", "Substituída por outra");
    expect((await selectDisciplinas(db, false)).map((d) => d.id)).toEqual([]);

    await marcarRestaurada(db, "ativa-publica");
    expect((await selectDisciplinas(db, false)).map((d) => d.id)).toEqual(["ativa-publica"]);
  });
});

describe("validação de arquivamento", () => {
  it("arquivar sem motivo é rejeitado", () => {
    expect(arquivarDisciplinaSchema.safeParse({ id: "x", motivo: "" }).success).toBe(false);
    expect(arquivarDisciplinaSchema.safeParse({ id: "x", motivo: "   " }).success).toBe(false);
    expect(arquivarDisciplinaSchema.safeParse({ id: "x", motivo: "ab" }).success).toBe(false);
    expect(arquivarDisciplinaSchema.safeParse({ id: "x", motivo: "Fora do escopo" }).success).toBe(
      true,
    );
  });

  it("upsert com arquivada = true exige motivo de 3 ou mais caracteres", () => {
    const sem = upsertDisciplinaSchema.safeParse({
      ...base,
      id: "x",
      nome: "Disciplina",
      arquivada: true,
    });
    expect(sem.success).toBe(false);

    const curto = upsertDisciplinaSchema.safeParse({
      ...base,
      id: "x",
      nome: "Disciplina",
      arquivada: true,
      motivoArquivamento: "ab",
    });
    expect(curto.success).toBe(false);
  });

  it("o CHECK do banco também recusa arquivamento sem motivo", async () => {
    const db = criarDbDeTeste();
    await criarFixtures(db);
    await expect(marcarArquivada(db, "ativa-publica", "ab")).rejects.toThrow(/CHECK/);
  });

  it("rejeita visibilidade fora de publica/admin", () => {
    const result = upsertDisciplinaSchema.safeParse({
      ...base,
      id: "x",
      nome: "Disciplina",
      visibilidade: "privada",
    });
    expect(result.success).toBe(false);
  });
});

describe("mutations de disciplinas exigem admin", () => {
  // As mutations usam adminMiddleware. Aqui testo o middleware diretamente, sem sessão.
  it("o middleware recusa chamada sem sessão", async () => {
    const next = vi.fn(async () => "executado");
    await expect(
      adminMiddleware.options.server!({ next } as never),
    ).rejects.toThrow("Não autorizado");
    expect(next).not.toHaveBeenCalled();
  });

});
