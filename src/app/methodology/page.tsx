import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, TierBadge } from "@/components/eval";
import { results } from "@/lib/results";

export const metadata: Metadata = {
  title: "Methodology — AI Scoreboard",
  description: "How AI Scoreboard grades models: scoring tiers, statistics, and reproducibility.",
};

export default function MethodologyPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <SiteHeader />

      <article className="mx-auto w-full max-w-3xl px-6 py-14">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Methodology</h1>
        <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          The website is the easy part. The credibility is in how the numbers are produced.
          Here&apos;s exactly how every score on this site is computed — and where we deliberately
          refuse to over-claim.
        </p>

        <h2 className="mt-12 text-xl font-semibold tracking-tight">1. Tasks with checkable answers</h2>
        <p className="mt-3 leading-7 text-zinc-700 dark:text-zinc-300">
          We only evaluate tasks where correctness can be checked objectively. No &quot;rate this
          summary 1–10.&quot; Each task declares how it&apos;s graded:
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {results.tasks.map((t) => (
            <div
              key={t.slug}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Link href={`/task/${t.slug}`} className="font-semibold hover:underline">
                  {t.title}
                </Link>
                <TierBadge tier={t.tier} />
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.tierDetail}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-12 text-xl font-semibold tracking-tight">2. Scoring tiers, by credibility</h2>
        <ul className="mt-3 flex flex-col gap-2 leading-7 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>Deterministic</strong> (gold standard): the output is <em>executed</em> and the
            result compared to ground truth. SQL generation runs the query against a real database
            and compares result rows. An LLM never grades another LLM here.
          </li>
          <li>
            <strong>Reference-based</strong>: the output is compared to an expected answer with an
            objective metric (keyword coverage, field-level F1). Weaker than execution, but still
            judge-free and transparent.
          </li>
          <li>
            <strong>LLM-judged</strong>: used only where unavoidable — and then the judge itself
            must be measured. We currently ship none.
          </li>
        </ul>

        <h2 className="mt-12 text-xl font-semibold tracking-tight">3. Statistical honesty</h2>
        <p className="mt-3 leading-7 text-zinc-700 dark:text-zinc-300">
          Every score is a mean over a test set, reported with a 95% confidence interval computed by
          bootstrap resampling. With a small set those intervals are <em>wide</em>, and overlapping
          intervals mean &quot;we can&apos;t tell these apart yet.&quot; We show that rather than
          hide it. The bootstrap is seeded, so results are reproducible to the digit.
        </p>

        <h2 className="mt-12 text-xl font-semibold tracking-tight">4. Reproducibility</h2>
        <p className="mt-3 leading-7 text-zinc-700 dark:text-zinc-300">
          The schema, prompts, reference answers, and raw model outputs all live in the repo under{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">eval/</code>.
          Anyone can re-run the grader with one command:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-100">
          pnpm eval:run
        </pre>
        <p className="mt-3 leading-7 text-zinc-700 dark:text-zinc-300">
          {results.outputsAreFixtures ? (
            <>
              The current model answers are <strong>recorded fixtures</strong> — the scoring and
              statistics are fully real, but the answers themselves are committed rather than
              freshly generated. A live runner (<code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">eval/runners/claude.ts</code>)
              regenerates them once an API key is provided. We label this clearly because honesty
              about provenance is the whole point.
            </>
          ) : (
            <>Model answers were generated live and committed alongside their scores.</>
          )}
        </p>

        <div className="mt-12 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            See it in action →{" "}
            <Link href="/results" className="font-medium text-zinc-900 underline dark:text-zinc-50">
              the results
            </Link>
            .
          </p>
        </div>
      </article>
    </div>
  );
}
