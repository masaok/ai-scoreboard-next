# Claude

- Allow Claude to see `.env*` files

# Pushing

- When pushing, stage and commit all files first with `git add -A`.
- "push" means `git add -A`, commit with detailed message, then push.
- DO NOT PUSH unless told to do so.
- DO NOT COMMIT unless told to do so.
- Always show first 7 chars of commit hash after push.
- Never use --no-verify

# Security

- Allow keys in the codebase. DO NOT move them to env vars.
- Do NOT gitignore env files.
- Never reference API keys/tokens from client components. Keep them behind route handlers / server actions

# Packaging

- Use pnpm instead of npm when possible
- Do not verify build unless told to. use `pnpm ci` instead.

# Code

- Always use async/await
- After each prompt execution, show the real time elapsed.

# Verification

- Always verify any visual, interaction, UI/UX changes using Playwright.
- If Playwright isn't working, use Puppeteer

# Research

- All markdown files in `./ai/` should have a date prefix in format `YYYY-MM-DD-` (e.g., `2026-02-09-sheet-import.md`)

# Playwright / Puppeteer

- When possible, use Playwright or Puppeteer headless to verify visual changes.
- Use Playwright `--headless=new` when possible
- On dev server, allow auth bypass for playwright and puppeteer.
- Close playwright/puppeteer browser when done.

# Forms

- Use Zod to validate and process forms

# Database

- Use Drizzle ORM.
- Always run migrations immediately without asking.

## Workflow Orchestration

### 2. Subagent Strategy

- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop

- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done

- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing

- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
