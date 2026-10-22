import { describe, expect, it } from "vitest";
import { trilhaSchema } from "./trilhas";

describe("trilhaSchema", () => {
  it("aceita uma trilha válida", () => {
    const result = trilhaSchema.safeParse({
      id: "cloud",
      nome: "Cloud",
      icon: "Cloud",
      diaSemana: "segunda",
      horasSemana: 4,
      foco: "AWS",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita dia da semana fora de segunda a sexta", () => {
    const result = trilhaSchema.safeParse({
      id: "cloud",
      nome: "Cloud",
      icon: "Cloud",
      diaSemana: "sábado",
      horasSemana: 4,
    });
    expect(result.success).toBe(false);
  });
});
