/**
 * Sample benchmark data powering the homepage leaderboard preview.
 *
 * In the real app this comes from Neon (see NEON_URL) via Drizzle, but the
 * homepage ships static sample rows so it renders instantly with no DB round-trip.
 *
 * Each benchmark score is normalized to a 0–100 scale where higher is better.
 * `speed` is tokens/sec normalized the same way (faster = higher).
 */
export type ModelScores = {
  reasoning: number;
  coding: number;
  math: number;
  speed: number;
};

export type Model = {
  id: string;
  name: string;
  vendor: string;
  /** Tailwind gradient classes used for the vendor accent dot. */
  accent: string;
  scores: ModelScores;
};

export const MODELS: Model[] = [
  {
    id: "opus-4-8",
    name: "Claude Opus 4.8",
    vendor: "Anthropic",
    accent: "from-orange-400 to-rose-500",
    scores: { reasoning: 96, coding: 94, math: 91, speed: 78 },
  },
  {
    id: "gpt-frontier",
    name: "GPT Frontier",
    vendor: "OpenAI",
    accent: "from-emerald-400 to-teal-500",
    scores: { reasoning: 93, coding: 90, math: 95, speed: 82 },
  },
  {
    id: "gemini-ultra",
    name: "Gemini Ultra",
    vendor: "Google",
    accent: "from-sky-400 to-indigo-500",
    scores: { reasoning: 91, coding: 88, math: 92, speed: 88 },
  },
  {
    id: "llama-next",
    name: "Llama Next",
    vendor: "Meta",
    accent: "from-violet-400 to-purple-500",
    scores: { reasoning: 86, coding: 85, math: 84, speed: 94 },
  },
  {
    id: "mistral-large",
    name: "Mistral Large",
    vendor: "Mistral",
    accent: "from-amber-400 to-orange-500",
    scores: { reasoning: 84, coding: 83, math: 81, speed: 90 },
  },
];
