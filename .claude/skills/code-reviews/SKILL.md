---
name: code-reviews
description: Reviews staged git changes against CLAUDE.md standards
disable-model-invocation: true
---

# Code Review

Review the staged git changes against this repo's CLAUDE.md standards and report
issues with file, line, severity, and a suggested fix.

## Steps

1. **Get the staged diff.** Run `git diff --staged`. If it's empty, tell the user
   there are no staged changes to review and stop.

2. **Load the relevant standards.** Read the root `CLAUDE.md`. For each changed
   file, also read the nearest package-level `CLAUDE.md`
   (`packages/api/CLAUDE.md`, `packages/web/CLAUDE.md`) so review uses the rules
   that actually apply to that path.

3. **Review each changed hunk** against those standards. Check at least:
   - **TypeScript:** no `any` (lint error in this repo), strict-mode safety, `.js`
     extensions on relative ESM imports, `_`-prefixed unused/catch bindings.
   - **No `console.*`** left in committed source.
   - **No hardcoded secrets** (API keys, tokens, credentials).
   - **Tests present** for new/changed behaviour; coverage not regressed below 80%.
   - **PR/commit hygiene:** changes scoped, ticket-referenced where relevant.
   - **API code:** kebab-case URLs, validate-in-`try-catch` on every handler,
     DB access only via the service layer with parameterized queries,
     `{ data, error, meta }` response envelope.
   - **Web code:** functional components only, Tailwind-only styling, custom hooks
     in `hooks/`, components under 150 lines.

4. **Report findings** as a list. For each issue include:
   - `file:line`
   - **severity** — `critical` / `high` / `medium` / `low`
   - what rule it violates and why
   - a concrete suggested fix (a diff or code snippet where useful)

5. **Summarize.** End with a verdict: counts per severity and whether the change
   is safe to commit. Order findings most-severe first. If nothing is wrong, say so.

Do not modify files — this skill reports only. The user decides what to act on.
