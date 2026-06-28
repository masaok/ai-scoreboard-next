import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ConfidenceBar, ModelDot, SiteHeader, TierBadge } from "@/components/eval";
import { modelById, resultFor, resultsForTask, results, taskBySlug } from "@/lib/results";

export function generateStaticParams() {
  return results.tasks.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const task = taskBySlug(slug);
  return { title: task ? `${task.title} — AI Scoreboard` : "Task — AI Scoreboard" };
}

export default async function TaskPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const task = taskBySlug(slug);
  if (!task) notFound();

  const ranked = resultsForTask(slug);
  // Use the first model's cases for the prompt list (all models share cases).
  const caseList = ranked[0] ? ranked[0].cases.map((c) => ({ id: c.caseId, prompt: c.prompt })) : [];

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <SiteHeader />

      <section className="mx-auto w-full max-w-5xl px-6 pt-14 pb-8">
        <Link href="/results" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← All results
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{task.title}</h1>
          <TierBadge tier={task.tier} />
        </div>
        <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">{task.summary}</p>
        <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          <span className="font-semibold">How it&apos;s scored: </span>
          {task.tierDetail}
        </div>
      </section>

      {/* Scores */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-10">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Scores</h2>
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {ranked.map((r, i) => {
            const m = modelById(r.modelId)!;
            return (
              <div
                key={r.modelId}
                className="flex items-center gap-4 border-b border-zinc-100 px-5 py-4 last:border-0 dark:border-zinc-800/60"
              >
                <span className="w-5 text-sm font-semibold tabular-nums text-zinc-400">{i + 1}</span>
                <ModelDot accent={m.accent} className="h-6 w-6" />
                <Link href={`/model/${m.id}`} className="w-40 shrink-0 truncate text-sm font-medium hover:underline">
                  {m.name}
                </Link>
                <div className="flex-1">
                  <ConfidenceBar mean={r.ci.mean} lo={r.ci.lo} hi={r.ci.hi} />
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          n = {ranked[0]?.ci.n ?? 0} cases. Bars show the mean; the band is the 95% bootstrap CI.
        </p>
      </section>

      {/* Per-case matrix */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-20">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Per-case breakdown</h2>
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="px-5 py-3 font-medium">Case</th>
                {ranked.map((r) => (
                  <th key={r.modelId} className="px-3 py-3 text-center font-medium">
                    {modelById(r.modelId)!.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {caseList.map((c) => (
                <tr key={c.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60">
                  <td className="max-w-md px-5 py-3 align-top text-zinc-700 dark:text-zinc-300">
                    <span className="text-xs font-mono text-zinc-400">{c.id}</span>
                    <p className="mt-0.5 line-clamp-2">{c.prompt}</p>
                  </td>
                  {ranked.map((r) => {
                    const cell = resultFor(r.modelId, slug)?.cases.find((x) => x.caseId === c.id);
                    const ok = cell?.passed;
                    return (
                      <td key={r.modelId} className="px-3 py-3 text-center align-middle" title={cell?.detail}>
                        <span
                          className={
                            ok
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-500 dark:text-rose-400"
                          }
                        >
                          {ok ? "✓" : "✗"}
                        </span>
                        <span className="ml-1 text-xs tabular-nums text-zinc-400">
                          {cell ? cell.score.toFixed(2) : "—"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
