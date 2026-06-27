import { MODELS } from "@/lib/models";
import { compositeScore } from "@/lib/score";

const DIMENSIONS = [
  { key: "reasoning", label: "Reasoning" },
  { key: "coding", label: "Coding" },
  { key: "math", label: "Math" },
  { key: "speed", label: "Speed" },
] as const;

const FEATURES = [
  {
    title: "One number that means something",
    body: "Every model gets a single composite Scoreboard Rating, blended from reasoning, coding, math, and speed benchmarks — so you can compare at a glance instead of squinting at a dozen tables.",
  },
  {
    title: "Frontier models, side by side",
    body: "Anthropic, OpenAI, Google, Meta, Mistral and more, normalized onto the same 0–100 scale. No cherry-picked vendor charts — the same yardstick for everyone.",
  },
  {
    title: "Always current",
    body: "Scores live in Postgres (Neon) and update as new models ship and new benchmark runs land. The board you see is the board as it stands today.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Collect",
    body: "Benchmark results for each model are gathered and stored in Neon Postgres via Drizzle.",
  },
  {
    n: "02",
    title: "Normalize",
    body: "Raw scores are mapped onto a shared 0–100 scale so every dimension is directly comparable.",
  },
  {
    n: "03",
    title: "Rank",
    body: "A weighted composite score collapses the dimensions into one rating and orders the board.",
  },
];

function Bar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
      <div
        className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default function Home() {
  const ranked = MODELS.map((m) => ({ ...m, total: compositeScore(m.scores) }))
    .sort((a, b) => b.total - a.total);
  const leader = ranked[0];

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-zinc-50/80 backdrop-blur dark:border-zinc-800/70 dark:bg-black/70">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-rose-500 text-sm font-bold text-white">
              ▲
            </span>
            <span className="text-sm font-semibold tracking-tight">AI Scoreboard</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
            <a href="#leaderboard" className="hidden hover:text-zinc-900 sm:inline dark:hover:text-zinc-50">
              Leaderboard
            </a>
            <a href="#how" className="hidden hover:text-zinc-900 sm:inline dark:hover:text-zinc-50">
              How it works
            </a>
            <a
              href="#leaderboard"
              className="rounded-full bg-zinc-900 px-4 py-1.5 font-medium text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              View the board
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-orange-300/40 via-rose-300/30 to-transparent blur-3xl dark:from-orange-500/20 dark:via-rose-500/10"
        />
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 pt-20 pb-16 text-center sm:pt-28">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live rankings, updated as models ship
          </span>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Track, compare &amp; rank the world&apos;s AI models.
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            AI Scoreboard is a living leaderboard that puts frontier models on a
            single scale — reasoning, coding, math, and speed — so you can see
            who&apos;s actually ahead, not who has the best marketing chart.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#leaderboard"
              className="flex h-12 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Explore the leaderboard
            </a>
            <a
              href="#how"
              className="flex h-12 items-center justify-center rounded-full border border-zinc-300 px-6 text-sm font-medium transition-colors hover:bg-white dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              How scoring works
            </a>
          </div>

          {/* Leader callout */}
          <div className="mt-14 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-left shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <span className={`h-9 w-9 shrink-0 rounded-full bg-gradient-to-br ${leader.accent}`} />
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Current #1</p>
              <p className="text-sm font-semibold">
                {leader.name}{" "}
                <span className="font-normal text-zinc-500 dark:text-zinc-400">
                  · {leader.total} rating
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section id="leaderboard" className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="mb-8 flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">The Scoreboard</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Ranked by composite rating. Sample data shown — wired to live Neon
            Postgres in the full app.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {/* header row */}
          <div className="hidden grid-cols-[2.5rem_1.6fr_repeat(4,1fr)_5rem] items-center gap-4 border-b border-zinc-200 px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 sm:grid dark:border-zinc-800 dark:text-zinc-400">
            <span>#</span>
            <span>Model</span>
            {DIMENSIONS.map((d) => (
              <span key={d.key}>{d.label}</span>
            ))}
            <span className="text-right">Rating</span>
          </div>

          {ranked.map((m, i) => (
            <div
              key={m.id}
              className="grid grid-cols-[2rem_1fr_auto] items-center gap-4 border-b border-zinc-100 px-5 py-4 last:border-0 sm:grid-cols-[2.5rem_1.6fr_repeat(4,1fr)_5rem] dark:border-zinc-800/60"
            >
              <span className="text-sm font-semibold tabular-nums text-zinc-400">
                {i + 1}
              </span>
              <div className="flex items-center gap-3">
                <span className={`h-8 w-8 shrink-0 rounded-full bg-gradient-to-br ${m.accent}`} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{m.name}</p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {m.vendor}
                  </p>
                </div>
              </div>
              {DIMENSIONS.map((d) => (
                <div key={d.key} className="hidden flex-col gap-1.5 sm:flex">
                  <span className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                    {m.scores[d.key]}
                  </span>
                  <Bar value={m.scores[d.key]} />
                </div>
              ))}
              <span className="text-right text-lg font-semibold tabular-nums">
                {m.total}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto w-full max-w-5xl px-6 py-16">
        <h2 className="mb-10 text-2xl font-semibold tracking-tight">How it works</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="flex flex-col gap-3">
              <span className="text-sm font-semibold tabular-nums text-orange-500">
                {s.n}
              </span>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-20">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-100 px-8 py-14 text-center dark:border-zinc-800 dark:from-zinc-900 dark:to-black">
          <h2 className="max-w-xl text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Stop guessing which model is best. See the scoreboard.
          </h2>
          <p className="max-w-md text-zinc-600 dark:text-zinc-400">
            One scale, every frontier model, updated as the field moves.
          </p>
          <a
            href="#leaderboard"
            className="mt-2 flex h-12 items-center justify-center rounded-full bg-zinc-900 px-7 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            View the board
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-zinc-500 sm:flex-row dark:text-zinc-400">
          <span>AI Scoreboard · Built with Next.js, Tailwind &amp; Neon</span>
          <span>© 2026 AI Scoreboard</span>
        </div>
      </footer>
    </div>
  );
}
