import type { Interval } from "../../src/lib/eval/types";

export function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function stdev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const variance = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(variance);
}

/**
 * Deterministic PRNG (mulberry32). We seed the bootstrap so committed results
 * are reproducible — re-running the harness yields byte-identical JSON instead
 * of churning the diff with resampling noise.
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))));
  return sorted[idx];
}

/**
 * Percentile bootstrap 95% CI for the mean of a set of per-case scores.
 *
 * With a small test set this interval is deliberately *wide* — that honesty
 * about uncertainty is the point, not a bug to paper over.
 */
export function bootstrapCI(
  scores: number[],
  { resamples = 2000, seed = 42 }: { resamples?: number; seed?: number } = {},
): Interval {
  const n = scores.length;
  if (n === 0) return { mean: 0, lo: 0, hi: 0, stdev: 0, n: 0 };

  const rng = mulberry32(seed);
  const means: number[] = [];
  for (let i = 0; i < resamples; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      sum += scores[Math.floor(rng() * n)];
    }
    means.push(sum / n);
  }
  means.sort((a, b) => a - b);

  return {
    mean: round(mean(scores)),
    lo: round(percentile(means, 0.025)),
    hi: round(percentile(means, 0.975)),
    stdev: round(stdev(scores)),
    n,
  };
}

function round(x: number): number {
  return Math.round(x * 1000) / 1000;
}
