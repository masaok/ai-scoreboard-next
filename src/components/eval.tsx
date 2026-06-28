import Link from "next/link";
import type { ScoringTier } from "@/lib/eval/types";
import { pct } from "@/lib/results";

export function ModelDot({ accent, className = "h-8 w-8" }: { accent: string; className?: string }) {
  return <span className={`shrink-0 rounded-full bg-gradient-to-br ${accent} ${className}`} />;
}

const TIER_STYLES: Record<ScoringTier, { label: string; cls: string }> = {
  deterministic: {
    label: "Deterministic",
    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  reference: {
    label: "Reference-based",
    cls: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  },
  judge: {
    label: "LLM-judged",
    cls: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
};

export function TierBadge({ tier }: { tier: ScoringTier }) {
  const t = TIER_STYLES[tier];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${t.cls}`}>
      {t.label}
    </span>
  );
}

/**
 * A score bar that shows the 95% confidence interval as a band and the mean as
 * a tick — the point of the project is to show uncertainty, not hide it behind
 * a single number.
 */
export function ConfidenceBar({ mean, lo, hi }: { mean: number; lo: number; hi: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className="absolute top-0 h-full rounded-full bg-zinc-300 dark:bg-zinc-600"
          style={{ left: `${lo * 100}%`, width: `${Math.max(0, (hi - lo) * 100)}%` }}
          title={`95% CI: ${pct(lo)}–${pct(hi)}`}
        />
        <div
          className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded bg-zinc-900 dark:bg-zinc-100"
          style={{ left: `${mean * 100}%` }}
          title={`mean: ${pct(mean)}`}
        />
      </div>
      <span className="w-24 shrink-0 text-right text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
        {pct(mean)}{" "}
        <span className="text-zinc-400 dark:text-zinc-500">
          [{pct(lo)}–{pct(hi)}]
        </span>
      </span>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-zinc-50/80 backdrop-blur dark:border-zinc-800/70 dark:bg-black/70">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-rose-500 text-sm font-bold text-white">
            ▲
          </span>
          <span className="text-sm font-semibold tracking-tight">AI Scoreboard</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/results" className="hover:text-zinc-900 dark:hover:text-zinc-50">
            Results
          </Link>
          <Link href="/methodology" className="hover:text-zinc-900 dark:hover:text-zinc-50">
            Methodology
          </Link>
        </nav>
      </div>
    </header>
  );
}
