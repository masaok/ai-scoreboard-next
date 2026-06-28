import type { CaseScore, TaskMeta } from "../../../src/lib/eval/types";
import dataset from "./dataset.json" with { type: "json" };

export interface DocCase {
  id: string;
  prompt: string;
  document: string;
  expected: Record<string, string>;
}

// JSON inference widens each object's `expected` to a union with optional keys;
// the dataset is authored to match DocCase, so assert it.
export const cases = dataset as unknown as DocCase[];

export const meta: TaskMeta = {
  slug: "doc-extraction",
  title: "Document Extraction",
  summary:
    "Extract named fields from a short document as JSON. Graded by field-level F1 against an exact expected object.",
  tier: "reference",
  tierDetail:
    "Reference-based: the returned JSON is compared field-by-field to an expected object (case-insensitive, trimmed). Score is the F1 of correctly extracted fields; it passes only at a perfect F1 of 1.0.",
};

const norm = (s: string) => s.trim().toLowerCase();

/** Pull a JSON object out of an answer that may wrap it in prose or fences. */
function parseJson(output: string): Record<string, string> | null {
  const fenced = output.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : output;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    const obj = JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) out[k] = String(v);
    return out;
  } catch {
    return null;
  }
}

/** Scores extracted JSON by field-level F1 against the expected object. */
export function makeScorer(): (c: DocCase, output: string) => CaseScore {
  return (c, output) => {
    const got = parseJson(output);
    if (!got) {
      return {
        caseId: c.id,
        prompt: c.prompt,
        score: 0,
        passed: false,
        detail: "Output was not parseable JSON.",
      };
    }

    const expectedKeys = Object.keys(c.expected);
    const gotKeys = Object.keys(got);
    let correct = 0;
    const wrong: string[] = [];
    for (const k of expectedKeys) {
      if (k in got && norm(got[k]) === norm(c.expected[k])) correct++;
      else wrong.push(k);
    }

    const precision = gotKeys.length === 0 ? 0 : correct / gotKeys.length;
    const recall = expectedKeys.length === 0 ? 1 : correct / expectedKeys.length;
    const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
    const passed = f1 >= 0.999;

    return {
      caseId: c.id,
      prompt: c.prompt,
      score: Math.round(f1 * 1000) / 1000,
      passed,
      detail: passed
        ? `All ${expectedKeys.length} fields extracted correctly.`
        : `Incorrect/missing fields: ${wrong.join(", ") || "none"} (F1 ${f1.toFixed(2)}).`,
    };
  };
}
