import type { CaseScore, TaskMeta } from "../../../src/lib/eval/types";
import dataset from "./dataset.json" with { type: "json" };

export interface CodeCase {
  id: string;
  prompt: string;
  keywords: string[];
}

export const cases: CodeCase[] = dataset;

export const meta: TaskMeta = {
  slug: "code-explanation",
  title: "Code Explanation",
  summary:
    "Explain what a short function does. Graded by keyword coverage against a reference set of concepts the explanation must mention.",
  tier: "reference",
  tierDetail:
    "Reference-based: the explanation is scored on the fraction of required concept keywords it mentions (case-insensitive). It passes at ≥70% coverage. Weaker than execution, but objective and judge-free.",
};

const PASS_THRESHOLD = 0.7;

/** Scores an explanation by the fraction of required keywords it contains. */
export function makeScorer(): (c: CodeCase, output: string) => CaseScore {
  return (c, output) => {
    const text = output.toLowerCase();
    const hits = c.keywords.filter((k) => text.includes(k.toLowerCase()));
    const missing = c.keywords.filter((k) => !text.includes(k.toLowerCase()));
    const score = c.keywords.length === 0 ? 1 : hits.length / c.keywords.length;
    const passed = score >= PASS_THRESHOLD;
    return {
      caseId: c.id,
      prompt: c.prompt,
      score: Math.round(score * 1000) / 1000,
      passed,
      detail: passed
        ? `Covered ${hits.length}/${c.keywords.length} key concepts.`
        : `Missing key concepts: ${missing.join(", ") || "none"} (covered ${hits.length}/${c.keywords.length}).`,
    };
  };
}
