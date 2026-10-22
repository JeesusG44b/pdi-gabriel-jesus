declare interface D1Database {
  prepare(query: string): {
    bind(...args: unknown[]): {
      all<T = unknown>(): Promise<{ results: T[] }>;
      run(): Promise<unknown>;
    };
    all<T = unknown>(): Promise<{ results: T[] }>;
  };
  batch(statements: unknown[]): Promise<unknown>;
}

declare module "cloudflare:workers" {
  export const env: Record<string, unknown>;
}
