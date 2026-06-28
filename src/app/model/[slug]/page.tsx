import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ConfidenceBar, ModelDot, SiteHeader } from "@/components/eval";
import { failuresForModel, modelById, results, resultFor } from "@/lib/results";

export function generateStaticParams() {
  return results.models.map((m) => ({ slug: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const model = modelById(slug);
  return { title: model ? `${model.name} — AI Scoreboard` : "Model — AI Scoreboard" };
}

export default async function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = modelById(slug);
  if (!model) notFound();

  const failures = failuresForModel(slug);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <SiteHeader />

      <section className="mx-auto w-full max-w-5xl px-6 pt-14 pb-8">
        <Link href="/results" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← All results
        </Link>
        <div className="mt-3 flex items-center gap-4">
          <ModelDot accent={model.accent} className="h-12 w-12" />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{model.name}</h1>
            <p className="text-zinc-500 dark:text-zinc-400">{model.vendor}</p>
          </div>
        </div>
      </section>

      {/* Per-task scores */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-12">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Scores by task</h2>
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {results.tasks.map((task) => {
            const r = resultFor(slug, task.slug);
            if (!r) return null;
            return (
              <div
                key={task.slug}
                className="flex items-center gap-4 border-b border-zinc-100 px-5 py-4 last:border-0 dark:border-zinc-800/60"
              >
                <Link
                  href={`/task/${task.slug}`}
                  className="w-44 shrink-0 truncate text-sm font-medium hover:underline"
                >
                  {task.title}
                </Link>
                <div className="flex-1">
                  <ConfidenceBar mean={r.ci.mean} lo={r.ci.lo} hi={r.ci.hi} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Failure analysis */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-20">
        <h2 className="mb-1 text-xl font-semibold tracking-tight">Failure analysis</h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Concrete cases this model got wrong, with a note on <em>why</em> — the part automated
          scores can&apos;t tell you.
        </p>
        {failures.length === 0 ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-6 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            No failures on the current test set. (With this few cases, that&apos;s not proof of
            perfection — just no misses yet.)
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {failures.map((f) => (
              <div
                key={`${f.taskSlug}-${f.caseId}`}
                className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                  <Link
                    href={`/task/${f.taskSlug}`}
                    className="rounded-full bg-zinc-100 px-2.5 py-0.5 font-medium text-zinc-600 hover:underline dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {f.taskTitle}
                  </Link>
                  <span className="font-mono text-zinc-400">{f.caseId}</span>
                </div>
                <p className="text-sm font-medium">{f.prompt}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Expected
                    </p>
                    <pre className="overflow-x-auto rounded-lg bg-zinc-50 p-3 text-xs text-zinc-700 dark:bg-black/40 dark:text-zinc-300">
                      {f.expected}
                    </pre>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Model answer
                    </p>
                    <pre className="overflow-x-auto rounded-lg bg-zinc-50 p-3 text-xs text-zinc-700 dark:bg-black/40 dark:text-zinc-300">
                      {f.got}
                    </pre>
                  </div>
                </div>
                <p className="mt-3 border-l-2 border-rose-300 pl-3 text-sm text-zinc-700 dark:border-rose-800 dark:text-zinc-300">
                  {f.analysis}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
