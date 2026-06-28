import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { CaseScore, TaskMeta } from "../../../src/lib/eval/types";
import dataset from "./dataset.json" with { type: "json" };

const here = dirname(fileURLToPath(import.meta.url));
const schemaSql = readFileSync(join(here, "schema.sql"), "utf8");

export interface SqlCase {
  id: string;
  prompt: string;
  reference: string;
}

export const cases: SqlCase[] = dataset;

export const meta: TaskMeta = {
  slug: "sql-generation",
  title: "SQL Generation",
  summary:
    "Generate SQL for a natural-language question against a fixed schema. Graded by executing the SQL and comparing result rows to a reference query.",
  tier: "deterministic",
  tierDetail:
    "Deterministic: the generated SQL is run against an in-memory SQLite database seeded from a known schema, and its result set is compared (row-for-row) to the reference query's result. No LLM judges the answer.",
};

type Row = Record<string, unknown>;

/** Pull the SQL out of a model answer that may wrap it in prose or ```sql fences. */
function extractSql(output: string): string {
  const fenced = output.match(/```(?:sql)?\s*([\s\S]*?)```/i);
  const sql = (fenced ? fenced[1] : output).trim();
  // If multiple statements were returned, run only the first.
  const firstStmt = sql.split(";").find((s) => s.trim().length > 0);
  return (firstStmt ?? sql).trim();
}

function canonRow(row: Row): string {
  const vals = Object.values(row).map((v) =>
    typeof v === "number" ? Math.round(v * 10000) / 10000 : v,
  );
  return JSON.stringify(vals);
}

function signature(rows: Row[], ordered: boolean): string {
  const lines = rows.map(canonRow);
  if (!ordered) lines.sort();
  return JSON.stringify(lines);
}

/** Returns a scorer that executes generated SQL and compares rows to reference. */
export function makeScorer(): (c: SqlCase, output: string) => CaseScore {
  return (c, output) => {
    const ordered = /order\s+by/i.test(c.reference);
    const db = new DatabaseSync(":memory:");
    try {
      db.exec(schemaSql);
      const expected = signature(db.prepare(c.reference).all() as Row[], ordered);

      let got: string;
      try {
        got = signature(db.prepare(extractSql(output)).all() as Row[], ordered);
      } catch (err) {
        return {
          caseId: c.id,
          prompt: c.prompt,
          score: 0,
          passed: false,
          detail: `SQL failed to execute: ${(err as Error).message}`,
        };
      }

      const passed = got === expected;
      return {
        caseId: c.id,
        prompt: c.prompt,
        score: passed ? 1 : 0,
        passed,
        detail: passed
          ? "Result rows exactly match the reference query."
          : "Query executed but returned different rows than the reference.",
      };
    } finally {
      db.close();
    }
  };
}
