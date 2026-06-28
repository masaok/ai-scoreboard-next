# AI Scoreboard

A living leaderboard that ranks AI models on tasks with **checkable answers**,
and reports every score with a **confidence interval** instead of a single
over-confident number.

The website is the easy part. The credibility is in how the numbers are
produced — so that's what this README leads with.

## What makes it trustworthy

- **Deterministic scoring where possible.** The SQL-generation task *executes*
  each generated query against a real in-memory SQLite database and compares the
  result rows to a reference query. No LLM grades another LLM.
- **Reference-based scoring otherwise.** Code-explanation uses keyword coverage;
  document-extraction uses field-level F1 against an exact expected object. Both
  are objective and judge-free.
- **Statistical honesty.** Every score is a mean over a test set with a 95%
  bootstrap confidence interval. With small sets the intervals are *wide* — and
  overlapping intervals mean "we can't tell these apart yet." We show that.
- **Reproducibility.** Schema, prompts, reference answers, and raw model outputs
  all live in `eval/`. Re-run the grader with one command and get identical
  numbers (the bootstrap is seeded).

## One-command reproduction

```bash
pnpm install
pnpm eval:run     # scores committed model outputs -> src/data/results.json
pnpm dev          # view the board at http://localhost:3000/results
```

`pnpm eval:run` is deterministic and needs **no API keys** — it replays the
committed model outputs in `eval/fixtures/`. Scoring and statistics are fully
real; the model answers themselves are recorded fixtures (clearly labeled in the
UI) until regenerated with live keys via `eval/runners/claude.ts`.

## Repository layout

```
eval/                         # the harness (runs locally, not in the Next build)
├── tasks/
│   ├── sql-generation/       # schema.sql + dataset.json + executing scorer
│   ├── code-explanation/     # dataset.json + keyword-coverage scorer
│   └── doc-extraction/       # dataset.json + field-F1 scorer
├── runners/                  # replay (fixtures) + claude (live, needs key)
├── stats/bootstrap.ts        # seeded bootstrap confidence intervals
├── fixtures/                 # committed raw model outputs
└── run.ts                    # pnpm eval:run -> src/data/results.json

src/
├── app/
│   ├── page.tsx              # marketing homepage (Neon-backed sample board)
│   ├── results/             # real eval scoreboard (from committed JSON)
│   ├── task/[slug]/         # per-task scores + per-case pass/fail matrix
│   ├── model/[slug]/        # per-model scores + written failure analysis
│   ├── methodology/         # how scoring works
│   └── api/submit/          # Phase 5: community submissions (Zod + Neon)
├── lib/db/                   # Drizzle schema, client, migrations, seed
└── lib/results.ts           # build-time loader for committed results
```

## Failure analysis

Automated scores tell you *that* a model failed, not *why*. Each `/model/<id>`
page surfaces concrete failures with a written explanation — e.g. a model that
sorted `ORDER BY revenue ASC` instead of `DESC`, or extracted only `"Seattle"`
when the expected value was `"Harbor Center, Seattle"`.

## Scripts

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Run the site locally |
| `pnpm eval:run` | Re-score model outputs into `src/data/results.json` |
| `pnpm ci` | Typecheck + lint + tests |
| `pnpm db:generate` / `pnpm db:migrate` | Drizzle migrations |
| `pnpm db:seed` | Seed the sample leaderboard table |

## Stack

Next.js (App Router) · React · Tailwind v4 · Drizzle ORM + Neon Postgres ·
`node:sqlite` for deterministic SQL execution · Zod for input validation.
