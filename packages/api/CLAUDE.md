# @teampulse/api

Express 4 API server (ESM). SQLite via `better-sqlite3`. See the root `CLAUDE.md` for monorepo-wide standards.

## Structure

```
src/
├── index.ts          # createApp() + server bootstrap
├── routes/           # Express routers (one per resource)
├── services/         # Data access + business logic
├── middleware/       # auth, errorHandler, logger
├── utils/            # validation, dateUtils
├── db/               # schema, migrate, seed
└── types/            # API-local types
```

Routers are factories that take the DB: `createTeamsRouter(db)`. Mounted under `/api/<resource>` with `authMiddleware` in `index.ts`.

## URL Conventions

- Route paths use **kebab-case** (e.g. `/api/team-metrics`, `/api/standup-entries`) — never camelCase or snake_case in URLs.
- Resource collections are plural (`/api/teams`, `/api/standups`).
- Use path params for identity (`/:id`) and query params for filtering (`?teamId=&date=`).

## Input Validation

- **Every route handler must validate input and run inside `try-catch`.** This applies to all verbs — `GET /:id`, `PUT`, and `DELETE` included (today some skip the wrapper; fix that, don't copy it).
- Validate via the shared helpers in `utils/validation` (e.g. `validateTeamInput`) — return early with `400` and a clear message. Do **not** inline ad-hoc field checks in the handler (as `routes/standups.ts` currently does). Centralize new rules in `utils/validation`.
- On unexpected failure, return `500` with a generic message; let `errorHandler` catch anything uncaught. Catch bindings you don't use: `catch (_err)`.

```ts
router.post('/', (req: Request, res: Response) => {
  try {
    const validation = validateThingInput(req.body);
    if (!validation.valid) {
      res.status(400).json({ data: null, error: validation.error, meta: {} });
      return;
    }
    const thing = service.create(validation.data);
    res.status(201).json({ data: thing, error: null, meta: {} });
  } catch (_err) {
    res.status(500).json({ data: null, error: 'Failed to create thing', meta: {} });
  }
});
```

## Database Access

- **All DB access goes through the service layer** (`services/*`). Routes call services; routes never hold `db.prepare(...)` directly.
- Services receive the `better-sqlite3` `Database.Database` instance via constructor — type it precisely, never `any`.
- **Always use parameterized queries** (`?` placeholders). Never interpolate user input into SQL — the CI security review fails on injection risk.
- Map DB rows to typed domain objects in the service (see `rowToTeam`); don't leak raw `Record<string, unknown>` rows out of the service.

## Response Format

- Wrap **all** JSON responses in the standard envelope:

  ```ts
  { data: T | null, error: string | null, meta: Record<string, unknown> }
  ```

- Success: `{ data, error: null, meta }`. Failure: `{ data: null, error, meta }`. Put pagination/counts in `meta`.
- `204 No Content` responses send no body (e.g. `DELETE`).
- Migrate legacy handlers that return bare payloads (`res.json(teams)`) to the envelope as you touch them.
