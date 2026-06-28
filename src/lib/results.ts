import data from "@/data/results.json";
import type {
  FailureCase,
  ModelMeta,
  ModelTaskResult,
  ResultsFile,
  TaskMeta,
} from "./eval/types";

export const results = data as ResultsFile;

export function taskBySlug(slug: string): TaskMeta | undefined {
  return results.tasks.find((t) => t.slug === slug);
}

export function modelById(id: string): ModelMeta | undefined {
  return results.models.find((m) => m.id === id);
}

export function resultFor(modelId: string, taskSlug: string): ModelTaskResult | undefined {
  return results.results.find((r) => r.modelId === modelId && r.taskSlug === taskSlug);
}

/** All models' results for a task, ranked by mean (highest first). */
export function resultsForTask(taskSlug: string): ModelTaskResult[] {
  return results.results
    .filter((r) => r.taskSlug === taskSlug)
    .sort((a, b) => b.ci.mean - a.ci.mean);
}

export function failuresForModel(modelId: string): FailureCase[] {
  return results.failures[modelId] ?? [];
}

export interface OverallRow {
  model: ModelMeta;
  mean: number;
  lo: number;
  hi: number;
  perTask: { slug: string; mean: number }[];
}

/** Overall standing: each model's mean across tasks (tasks weighted equally). */
export function overall(): OverallRow[] {
  const rows = results.models.map((model) => {
    const rs = results.results.filter((r) => r.modelId === model.id);
    const avg = (sel: (r: ModelTaskResult) => number) =>
      rs.length === 0 ? 0 : rs.reduce((s, r) => s + sel(r), 0) / rs.length;
    return {
      model,
      mean: round(avg((r) => r.ci.mean)),
      lo: round(avg((r) => r.ci.lo)),
      hi: round(avg((r) => r.ci.hi)),
      perTask: rs.map((r) => ({ slug: r.taskSlug, mean: r.ci.mean })),
    };
  });
  return rows.sort((a, b) => b.mean - a.mean);
}

export function pct(x: number): string {
  return `${Math.round(x * 100)}%`;
}

function round(x: number): number {
  return Math.round(x * 1000) / 1000;
}
