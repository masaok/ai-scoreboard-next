/**
 * Shared types for the eval harness and the website that renders its output.
 *
 * The harness (in `eval/`) produces a ResultsFile committed to
 * `src/data/results.json`; the site imports that JSON at build time. Keeping the
 * contract here means a schema change is a single typed edit both sides see.
 */

/** How a task is graded. Deterministic > reference > judge, in credibility. */
export type ScoringTier = "deterministic" | "reference" | "judge";

export interface TaskMeta {
  slug: string;
  title: string;
  summary: string;
  tier: ScoringTier;
  /** Human-readable description of exactly how scoring works for this task. */
  tierDetail: string;
}

export interface ModelMeta {
  id: string;
  name: string;
  vendor: string;
  /** Tailwind gradient classes for the vendor accent dot. */
  accent: string;
}

/** Result of grading one model's answer to one case. score is 0..1. */
export interface CaseScore {
  caseId: string;
  prompt: string;
  score: number;
  passed: boolean;
  detail: string;
}

/** A point estimate plus a bootstrap confidence interval. All on 0..1. */
export interface Interval {
  mean: number;
  lo: number;
  hi: number;
  stdev: number;
  n: number;
}

export interface ModelTaskResult {
  modelId: string;
  taskSlug: string;
  ci: Interval;
  cases: CaseScore[];
}

/** A concrete failure with authored "why it failed" analysis. */
export interface FailureCase {
  taskSlug: string;
  taskTitle: string;
  caseId: string;
  prompt: string;
  expected: string;
  got: string;
  analysis: string;
}

export interface ResultsFile {
  generatedAt: string;
  /** True while model outputs are recorded fixtures (not a live-key run). */
  outputsAreFixtures: boolean;
  models: ModelMeta[];
  tasks: TaskMeta[];
  results: ModelTaskResult[];
  /** modelId -> its failure cases across all tasks. */
  failures: Record<string, FailureCase[]>;
}
