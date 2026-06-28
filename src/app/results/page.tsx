import Link from "next/link";
import type { Metadata } from "next";
import { ConfidenceBar, ModelDot, SiteHeader, TierBadge } from "@/components/eval";
import { overall, results, resultsForTask, modelById } from "@/lib/results";

export const metadata: Metadata = {
  title: "Results — AI Scoreboard",
  description: "Model evaluation results across tasks, reported with confidence intervals.",
};

export default function ResultsPage() {
  const standing = overall();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <SiteHeader />

      <section className="mx-auto w-full max-w-5xl px-6 pt-14 pb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Evaluation results</h1>
        <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Every score is a mean over a small test set, shown with its 95% bootstrap
          confidence interval. The intervals are wide on purpose — with few cases we
          don&apos;t pretend to more precision than the data supports.
        </p>
        {results.outputsAreFixtures && (
          <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
            <strong>Note:</strong> model outputs here are recorded fixtures (illustrative).
            The <em>scoring and statistics are real</em> — see the{" "}
            <Link href="/methodology" className="underline">
              methodology
            </Link>
            . Re-run with live API keys to refresh the answers.
          </p>
        )}
      </section>

      {/* Overall standing */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-12">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Overall standing</h2>
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {standing.map((row, i) => (
            <div
              key={row.model.id}
              className="flex items-center gap-4 border-b border-zinc-100 px-5 py-4 last:border-0 dark:border-zinc-800/60"
            >
              <span className="w-5 text-sm font-semibold tabular-nums text-zinc-400">{i + 1}</span>
              <ModelDot accent={row.model.accent} />
              <Link href={`/model/${row.model.id}`} className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold hover:underline">{row.model.name}</p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{row.model.vendor}</p>
              </Link>
              <div className="w-1/2 max-w-xs">
                <ConfidenceBar mean={row.mean} lo={row.lo} hi={row.hi} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Overall = mean of per-task scores (tasks weighted equally). Click a model for its
          failure analysis.
        </p>
      </section>

      {/* Per-task breakdown */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-20">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">By task</h2>
        <div className="flex flex-col gap-6">
          {results.tasks.map((task) => (
            <div
              key={task.slug}
              className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <Link href={`/task/${task.slug}`} className="text-base font-semibold hover:underline">
                  {task.title}
                </Link>
                <TierBadge tier={task.tier} />
              </div>
              <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">{task.summary}</p>
              <div className="flex flex-col gap-3">
                {resultsForTask(task.slug).map((r) => {
                  const m = modelById(r.modelId)!;
                  return (
                    <div key={r.modelId} className="flex items-center gap-3">
                      <ModelDot accent={m.accent} className="h-5 w-5" />
                      <span className="w-40 shrink-0 truncate text-sm">{m.name}</span>
                      <div className="flex-1">
                        <ConfidenceBar mean={r.ci.mean} lo={r.ci.lo} hi={r.ci.hi} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
