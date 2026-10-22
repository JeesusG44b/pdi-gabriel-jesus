import { describe, expect, it } from "vitest";
import { buildCareerStepStatements } from "./career";

describe("buildCareerStepStatements - regra de única etapa atual", () => {
  it("inclui um UPDATE para desmarcar as demais etapas quando current=true", () => {
    const statements = buildCareerStepStatements({
      id: "estagiaria",
      title: "Estagiária",
      focus: "Java",
      current: true,
    });

    const resetStatement = statements.find((s) =>
      s.sql.includes("UPDATE career_steps SET is_current = 0"),
    );
    expect(resetStatement).toBeDefined();
    expect(resetStatement?.args).toEqual(["estagiaria"]);

    const insertStatement = statements.find((s) => s.sql.includes("INSERT INTO career_steps"));
    expect(insertStatement?.args).toEqual(["estagiaria", "Estagiária", "Java", 1]);
  });

  it("não inclui o UPDATE de reset quando current=false", () => {
    const statements = buildCareerStepStatements({
      id: "dev-junior",
      title: "Dev Júnior",
      focus: "APIs",
      current: false,
    });

    const resetStatement = statements.find((s) =>
      s.sql.includes("UPDATE career_steps SET is_current = 0"),
    );
    expect(resetStatement).toBeUndefined();
    expect(statements).toHaveLength(1);

    const insertStatement = statements.find((s) => s.sql.includes("INSERT INTO career_steps"));
    expect(insertStatement?.args).toEqual(["dev-junior", "Dev Júnior", "APIs", 0]);
  });
});
