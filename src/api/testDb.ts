import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

// Banco de teste: SQLite em memória (node:sqlite, embutido no Node) com as migrations reais,
// exposto com a forma mínima do D1 que o código usa (prepare, bind, all, run).
// Não é o D1: as migrations e os CHECKs foram confirmados no D1 local via wrangler.
const MIGRATIONS = ["0001_schema.sql", "0003_events_career.sql", "0005_pdi_gabriel.sql"];

class FakeStatement {
  private args: unknown[] = [];

  constructor(
    private readonly db: DatabaseSync,
    private readonly sql: string,
  ) {}

  bind(...args: unknown[]): FakeStatement {
    this.args = args;
    return this;
  }

  async all<T>(): Promise<{ results: T[]; success: true; meta: object }> {
    const results = this.db.prepare(this.sql).all(...(this.args as never[])) as T[];
    return { results, success: true, meta: {} };
  }

  async run(): Promise<{ success: true; meta: object }> {
    this.db.prepare(this.sql).run(...(this.args as never[]));
    return { success: true, meta: {} };
  }
}

export function criarDbDeTeste(): D1Database {
  const db = new DatabaseSync(":memory:");
  for (const arquivo of MIGRATIONS) {
    const caminho = fileURLToPath(new URL(`../../migrations/${arquivo}`, import.meta.url));
    db.exec(readFileSync(caminho, "utf8"));
  }
  return {
    prepare: (sql: string) => new FakeStatement(db, sql),
  } as unknown as D1Database;
}
