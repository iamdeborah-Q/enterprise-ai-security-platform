# TeamPulse

Internal Team Health & Standup Tracking API with a React dashboard.

## Project Architecture

npm workspaces monorepo (`packages/*`):

| Package | Name | Role |
|---------|------|------|
| `packages/shared` | `@teampulse/shared` | Shared TypeScript types & constants. Build this **first** — others depend on it. |
| `packages/api` | `@teampulse/api` | Express 4 API server, SQLite via `better-sqlite3`. |
| `packages/web` | `@teampulse/web` | React 18 + Vite dashboard. |

**Tech stack:** Node 20+, TypeScript (strict), Express 4, better-sqlite3 (SQLite), React 18 + Vite + Tailwind CSS, Vitest + supertest. ES modules throughout (`"type": "module"`).

API runs on `:3001`, web on `:5173`. All `/api/*` routes require `Authorization: Bearer <API_KEY>`.

Key commands: `npm run dev`, `npm run build`, `npm test`, `npm run lint`, `npm run db:migrate`, `npm run db:seed`.

## Coding Standards

- **TypeScript strict mode** is on (`tsconfig.base.json`). Do not weaken it.
- **No `any`.** `@typescript-eslint/no-explicit-any` is an **error**. Use `unknown` + narrowing, generics, or precise types.
- **No `console.log` in production code.** Use the existing middleware/logger or a proper logger; never leave debug `console.*` in committed source.
- Prefix intentionally unused vars/catch bindings with `_` (e.g. `catch (_err)`).
- Use `.js` extensions on relative imports (required by ESM + bundler resolution).
- Run `npm run lint` before committing; `npm run lint:fix` for autofixes.

## Testing Requirements

- **Every PR must include tests** for new or changed behaviour.
- **Minimum 80% coverage.** Do not merge below this threshold.
- API tests use Vitest + supertest against `createApp(db)` with an in-memory/test DB; gate server startup on `NODE_ENV !== 'test'`.
- CI runs build → lint → test on every PR (`.github/workflows/ci.yml`). All must pass.

## PR Format

- PR titles **must** follow `[TEAM-xxx] Description` (e.g. `[TEAM-014] Add blocker alerts endpoint`).
- Reference the ticket number; keep the description imperative and concise.
- A Claude Code security review runs automatically on every PR — address its findings before merge.

## Common Mistakes to Avoid

Patterns already present in the codebase — do not repeat or spread them:

- **`console.log` in `index.ts` / `middleware/logger.ts`.** Route through a logger; strip debug logging from new code.
- **`any` slips through** (e.g. `createApp(database: any = db)`). Type DB params as `Database.Database`.
- **Inconsistent route error handling** — some routes wrap `try-catch`, others rely on the error middleware. Be consistent (see `packages/api/CLAUDE.md`).
- **Inline validation in handlers** (`routes/standups.ts`) instead of the `utils/validation` helpers used by `routes/teams.ts`. Validate in one place.
- **Hardcoded secrets** — `useApi.ts` embeds the API key in source. Never commit secrets; read from env/config.
- **Missing web tests** — `packages/web` currently stubs `test`. New web code still needs real tests toward the 80% bar.

## Deployment Rules

- **Staging auto-deploys** from `main` after CI passes — keep `main` green and deployable.
- **Production requires explicit approval.** No direct-to-prod pushes; promote a vetted staging build through the approval gate.
- Run `npm run db:migrate` as part of any deploy that changes schema; migrations must be backward-compatible during rollout.
