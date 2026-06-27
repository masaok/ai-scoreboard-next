import { db } from "./index";
import { models } from "./schema";
import { MODELS, type Model } from "../models";
import { compositeScore } from "../score";

export type RankedModel = Model & { total: number };

/**
 * Fetch every model, attach its composite rating, and sort the leaderboard.
 *
 * Resilience: this powers the public homepage, so a transient DB error must not
 * blank the page. On failure (or before the table is seeded) it logs loudly and
 * falls back to the bundled sample data. This is graceful degradation, not a
 * silent swallow — the error is always surfaced to logs.
 */
export async function getRankedModels(): Promise<RankedModel[]> {
  let source: Model[];

  try {
    const rows = await db.select().from(models);
    source = rows.map((r) => ({
      id: r.id,
      name: r.name,
      vendor: r.vendor,
      accent: r.accent,
      scores: {
        reasoning: r.reasoning,
        coding: r.coding,
        math: r.math,
        speed: r.speed,
      },
    }));
    if (source.length === 0) {
      console.warn("[leaderboard] models table is empty — run `pnpm db:seed`. Using sample data.");
      source = MODELS;
    }
  } catch (err) {
    console.error("[leaderboard] Neon query failed, falling back to sample data:", err);
    source = MODELS;
  }

  return source
    .map((m) => ({ ...m, total: compositeScore(m.scores) }))
    .sort((a, b) => b.total - a.total);
}
