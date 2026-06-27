---
name: setup-husky-hooks
description: Configure this repo's Husky git hooks. Use when asked to set up, change, or restore the pre-commit / pre-push hooks. Convention — pre-commit runs `pnpm run ci`, pre-push runs `pnpm run build`.
---

# Set up Husky git hooks

This project uses [Husky](https://typicode.github.io/husky/) (v9+) to run quality gates on commit and push.

## Convention

- **pre-commit** runs `pnpm run ci` (type-check + lint + tests) — fast feedback before a commit lands.
- **pre-push** runs `pnpm run build` — catch build breakage before it reaches the remote.

`ci` runs its steps in cheapest-first order (`tsc` → `lint` → `test`) so the fastest failure short-circuits the rest.

## Steps

1. Ensure Husky is installed and the `prepare` script exists in `package.json`:
   ```bash
   pnpm add -D husky
   ```
   ```json
   "scripts": { "prepare": "husky" }
   ```
   Run `pnpm install` (or `pnpm exec husky init`) once so the `.husky/_/` runtime is generated and git's `core.hooksPath` is set.

2. Ensure the scripts the hooks call exist in `package.json`:
   ```json
   "tsc": "tsc --noEmit",
   "ci": "pnpm run tsc && pnpm run lint && pnpm run test",
   "build": "next build"
   ```
   `tsc --noEmit` type-checks the whole project (Jest/SWC and `next build` only transpile per-file and skip cross-file type errors).

3. Write `.husky/pre-commit`:
   ```sh
   pnpm run ci
   ```

4. Write `.husky/pre-push`:
   ```sh
   pnpm run build
   ```

   > Husky v9 hook files are plain shell snippets — no `#!/bin/sh` shebang or `husky.sh` source line needed (those were removed in v9 and emit a deprecation warning if present).

## Verify

```bash
pnpm run ci      # what pre-commit will run
pnpm run build   # what pre-push will run
```

Both should pass. To exercise a hook directly: `sh .husky/pre-commit`.

## Bypass (use sparingly)

```bash
git commit --no-verify   # skip pre-commit
git push --no-verify     # skip pre-push
```
