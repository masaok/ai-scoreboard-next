import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type {
  CaseScore,
  FailureCase,
  ModelMeta,
  ModelTaskResult,
  ResultsFile,
  TaskMeta,
} from "../src/lib/eval/types";
import { bootstrapCI } from "./stats/bootstrap";
import { loadFixture } from "./runners/replay";
import * as sql from "./tasks/sql-generation/scorer";
import * as code from "./tasks/code-explanation/scorer";
import * as doc from "./tasks/doc-extraction/scorer";

const MODELS: ModelMeta[] = [
  { id: "opus-4-8", name: "Claude Opus 4.8", vendor: "Anthropic", accent: "from-orange-400 to-rose-500" },
  { id: "gpt-frontier", name: "GPT Frontier", vendor: "OpenAI", accent: "from-emerald-400 to-teal-500" },
  { id: "gemini-ultra", name: "Gemini Ultra", vendor: "Google", accent: "from-sky-400 to-indigo-500" },
];

/**
 * One task, generically. Keeping this generic over the case type `C` lets each
 * task pass its own typed scorer/expectedFor without the orchestrator losing
 * type safety (the classic correlated-union problem if we looped over a mixed
 * array instead).
 */
interface Task<C extends { id: string; prompt: string }> {
  meta: TaskMeta;
  cases: C[];
  scorer: (c: C, output: string) => CaseScore;
  expectedFor: (c: C) => string;
}

function scoreTask<C extends { id: string; prompt: string }>(
  task: Task<C>,
  model: ModelMeta,
): { result: ModelTaskResult; failures: FailureCase[] } {
  const fixture = loadFixture(task.meta.slug, model.id);
  const cases = task.cases.map((c) => task.scorer(c, fixture[c.id]?.output ?? ""));
  const ci = bootstrapCI(cases.map((s) => s.score));

  const failures: FailureCase[] = [];
  for (const c of task.cases) {
    const score = cases.find((s) => s.caseId === c.id);
    if (score && !score.passed) {
      failures.push({
        taskSlug: task.meta.slug,
        taskTitle: task.meta.title,
        caseId: c.id,
        prompt: c.prompt,
        expected: task.expectedFor(c),
        got: (fixture[c.id]?.output ?? "").trim(),
        analysis: fixture[c.id]?.analysis ?? score.detail,
      });
    }
  }

  return {
    result: { modelId: model.id, taskSlug: task.meta.slug, ci, cases },
    failures,
  };
}

const sqlTask: Task<sql.SqlCase> = {
  meta: sql.meta,
  cases: sql.cases,
  scorer: sql.makeScorer(),
  expectedFor: (c) => c.reference,
};
const codeTask: Task<code.CodeCase> = {
  meta: code.meta,
  cases: code.cases,
  scorer: code.makeScorer(),
  expectedFor: (c) => `Must mention: ${c.keywords.join(", ")}`,
};
const docTask: Task<doc.DocCase> = {
  meta: doc.meta,
  cases: doc.cases,
  scorer: doc.makeScorer(),
  expectedFor: (c) => JSON.stringify(c.expected),
};

function main() {
  const results: ModelTaskResult[] = [];
  const failures: Record<string, FailureCase[]> = {};

  for (const model of MODELS) {
    failures[model.id] = [];
    for (const run of [
      scoreTask(sqlTask, model),
      scoreTask(codeTask, model),
      scoreTask(docTask, model),
    ]) {
      results.push(run.result);
      failures[model.id].push(...run.failures);
    }
  }

  const out: ResultsFile = {
    // Pinned (overridable) so committed results stay reproducible run-to-run.
    generatedAt: process.env.EVAL_RUN_DATE ?? "2026-06-28",
    outputsAreFixtures: true,
    models: MODELS,
    tasks: [sqlTask.meta, codeTask.meta, docTask.meta],
    results,
    failures,
  };

  const outPath = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "results.json");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");

  const totalCases = results.reduce((n, r) => n + r.cases.length, 0);
  const totalFailures = Object.values(failures).reduce((n, f) => n + f.length, 0);
  console.log(
    `Wrote ${outPath}\n  models: ${MODELS.length} · tasks: ${out.tasks.length} · graded cases: ${totalCases} · failures: ${totalFailures}`,
  );
}

main();
