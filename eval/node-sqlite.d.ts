// Minimal ambient types for Node's built-in SQLite (node:sqlite), which isn't
// covered by @types/node@20. Only the surface the scorer uses is declared.
declare module "node:sqlite" {
  export class DatabaseSync {
    constructor(path: string);
    exec(sql: string): void;
    prepare(sql: string): {
      all(...params: unknown[]): unknown[];
      get(...params: unknown[]): unknown;
    };
    close(): void;
  }
}
