import type { ModelScores } from "./models";

/**
 * Relative importance of each benchmark dimension when computing a model's
 * single composite "Scoreboard Rating". Weights are normalized internally, so
 * they don't need to sum to 1 — tune the ratios to match what you think matters.
 *
 * The default leans toward reasoning + coding (what most people pick a frontier
 * model for) while keeping math and speed meaningful but secondary.
 */
export const WEIGHTS: ModelScores = {
  reasoning: 0.35,
  coding: 0.3,
  math: 0.2,
  speed: 0.15,
};

/**
 * Collapse a model's four benchmark scores into one 0–100 composite rating
 * used to rank the leaderboard.
 *
 * TODO(you): This is the heart of how the scoreboard ranks models, and it's a
 * genuine design decision. The default below is a weighted average. Consider:
 *   - A plain weighted average rewards all-rounders.
 *   - You could instead penalize weak spots (e.g. blend in the *minimum*
 *     dimension) so a model that's elite at coding but terrible at math
 *     doesn't top the board.
 *   - Or reward specialists by weighting a model's single best dimension higher.
 * Reshape this function to encode the ranking philosophy you want.
 */
export function compositeScore(scores: ModelScores): number {
  const total = WEIGHTS.reasoning + WEIGHTS.coding + WEIGHTS.math + WEIGHTS.speed;
  const weighted =
    scores.reasoning * WEIGHTS.reasoning +
    scores.coding * WEIGHTS.coding +
    scores.math * WEIGHTS.math +
    scores.speed * WEIGHTS.speed;
  return Math.round((weighted / total) * 10) / 10;
}
