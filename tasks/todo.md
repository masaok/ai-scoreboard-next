# AI Scoreboard — MVP build plan

Goal: complete the MVP from `ai-scoreboard-private/ai/mvp/claude_mvp.md`. Single
Next.js app (no monorepo restructure — keep the live Vercel deploy intact) with a
top-level `eval/` harness whose committed JSON output the site renders statically.

## Architecture decision
- [x] Keep single app; harness in `eval/`, output committed to `src/data/results.json`
- [x] Deterministic SQL scoring via built-in `node:sqlite` (zero-dep, no API key)
- [x] Model outputs are recorded fixtures (labeled); scoring + stats are real

## Phase 1 — Eval harness (the proof)
- [ ] Shared eval types (`src/lib/eval/types.ts`)
- [ ] SQL-generation task: schema + dataset + executing scorer
- [ ] code-explanation task: dataset + reference-F1 scorer
- [ ] doc-extraction task: dataset + field exact-match-F1 scorer
- [ ] Bootstrap stats (confidence intervals + variance)
- [ ] Runners: Claude (live, needs key) + replay (committed fixtures)
- [ ] `eval/run.ts` -> writes `src/data/results.json`
- [ ] Tests: bootstrap + scorers
- [ ] Run pipeline, commit results

## Phase 2 — Website displays results (static)
- [ ] `src/lib/results.ts` build-time loader
- [ ] `/results` scoreboard from committed JSON
- [ ] `/task/[slug]` per-task detail with honest confidence intervals
- [ ] `/methodology` page
- [ ] Link real results from homepage; relabel sample leaderboard

## Phase 3 — Failure analysis
- [ ] Per-model failure cards (committed analysis) on `/model/[slug]`

## Phase 5 — Community submissions (Neon already wired)
- [ ] `/api/submit` route with Zod validation + rate limiting
- [ ] `submissions` table + migration

## Wrap-up
- [ ] README: methodology + one-command repro
- [ ] Update status table in the MVP doc
- [ ] Verify (tsc/lint/test/build + Playwright), push to main

## Review

All phases complete and verified.

- **Phase 1** — `eval/` harness: 3 tasks, deterministic SQL execution via
  `node:sqlite`, seeded bootstrap CIs, replay + Claude runners. `pnpm eval:run`
  produces `src/data/results.json`. 14 unit tests pass.
- **Phase 2** — Static `/results`, `/task/[slug]`, `/methodology` render the
  committed JSON with honest confidence-interval bars. Verified via Playwright.
- **Phase 3** — `/model/[slug]` failure-analysis cards (expected vs answer +
  written "why").
- **Phase 4** — code-explanation + doc-extraction tasks added; harness is
  task-agnostic.
- **Phase 5** — `POST/GET /api/submit` (Zod + best-effort rate limit) +
  `submissions` table/migration. Tested via curl (201 / 422 / 200).

Verified: `pnpm run ci` (tsc + lint + 14 tests) ✅, all pages rendered in a real
browser, API exercised with valid/invalid/list requests.

**Honest gaps:** model outputs are recorded fixtures (scoring/stats are real);
no submission UI form yet; rate limiter is in-memory (best-effort).
