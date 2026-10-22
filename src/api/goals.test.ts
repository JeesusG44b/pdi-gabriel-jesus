import { describe, expect, it } from "vitest";
import { goalSchema, gravarGoal, selectGoals } from "./goals";
import { criarDbDeTeste } from "./testDb";

const meta = {
  categoria: "cloud",
  titulo: "Certificação CLF-C02",
  dataPrazo: "2027-01-31",
  prioridade: "Alta" as const,
  status: "Planejado" as const,
};

describe("goalSchema", () => {
  it("aceita categoria em texto livre vinda do seed e aplica visibilidade publica por padrão", () => {
    const result = goalSchema.parse({ id: "g1", ...meta, cicloId: "ciclo-1", trilhaId: "cloud" });
    expect(result.categoria).toBe("cloud");
    expect(result.visibilidade).toBe("publica");
  });

  it("rejeita visibilidade fora de publica/admin", () => {
    expect(goalSchema.safeParse({ id: "g1", ...meta, visibilidade: "privada" }).success).toBe(false);
  });
});

describe("selectGoals", () => {
  it("visitante não recebe meta com visibilidade = admin", async () => {
    const db = criarDbDeTeste();
    await gravarGoal(db, goalSchema.parse({ id: "publica", ...meta }));
    await gravarGoal(db, goalSchema.parse({ id: "interna", ...meta, visibilidade: "admin" }));

    expect((await selectGoals(db, false)).map((g) => g.id)).toEqual(["publica"]);
    expect((await selectGoals(db, true)).map((g) => g.id).sort()).toEqual(["interna", "publica"]);
  });

  it("devolve ciclo, trilha e visibilidade", async () => {
    const db = criarDbDeTeste();
    await gravarGoal(
      db,
      goalSchema.parse({ id: "g1", ...meta, cicloId: "ciclo-1", trilhaId: "cloud" }),
    );
    const [goal] = await selectGoals(db, false);
    expect(goal.cicloId).toBe("ciclo-1");
    expect(goal.trilhaId).toBe("cloud");
    expect(goal.visibilidade).toBe("publica");
  });
});
