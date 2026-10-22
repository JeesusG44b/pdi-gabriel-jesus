import { describe, expect, it } from "vitest";
import { cicloSchema } from "./ciclos";

describe("cicloSchema", () => {
  it("aceita um ciclo válido", () => {
    const result = cicloSchema.safeParse({
      id: "ciclo-1",
      nome: "Ciclo 1",
      inicio: "2026-10-01",
      fim: "2026-12-31",
      foco: "Projetos P1 a P5",
      status: "atual",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita fim anterior ao início", () => {
    const result = cicloSchema.safeParse({
      id: "ciclo-x",
      nome: "Ciclo X",
      inicio: "2026-12-31",
      fim: "2026-10-01",
      status: "planejado",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita status fora do enum", () => {
    const result = cicloSchema.safeParse({
      id: "ciclo-x",
      nome: "Ciclo X",
      inicio: "2026-10-01",
      fim: "2026-12-31",
      status: "rodando",
    });
    expect(result.success).toBe(false);
  });
});
