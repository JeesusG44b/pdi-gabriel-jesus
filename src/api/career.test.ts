import { describe, expect, it } from "vitest";
import { careerGoalSchema, careerStepSchema } from "./career";

describe("careerStepSchema", () => {
  it("aceita uma etapa válida", () => {
    const result = careerStepSchema.safeParse({
      id: "estagiaria",
      title: "Estagiária",
      focus: "Java, Spring Boot",
      current: true,
    });
    expect(result.success).toBe(true);
  });

  it("aplica default current=false quando omitido", () => {
    const result = careerStepSchema.parse({
      id: "dev-junior",
      title: "Desenvolvedora Júnior",
      focus: "APIs REST",
    });
    expect(result.current).toBe(false);
  });

  it("rejeita título vazio", () => {
    const result = careerStepSchema.safeParse({
      id: "x",
      title: "   ",
      focus: "Foco",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita foco vazio", () => {
    const result = careerStepSchema.safeParse({
      id: "x",
      title: "Título",
      focus: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("careerGoalSchema", () => {
  it("aceita uma meta válida", () => {
    const result = careerGoalSchema.safeParse({ id: "goal-1", title: "Aprender AWS" });
    expect(result.success).toBe(true);
  });

  it("rejeita título vazio", () => {
    const result = careerGoalSchema.safeParse({ id: "goal-1", title: "" });
    expect(result.success).toBe(false);
  });

  it("rejeita id vazio", () => {
    const result = careerGoalSchema.safeParse({ id: "", title: "Aprender AWS" });
    expect(result.success).toBe(false);
  });
});
