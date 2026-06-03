# @teampulse/web

React 18 + Vite + Tailwind dashboard for TeamPulse. See the root `CLAUDE.md` for monorepo-wide standards.

## Structure

```
src/
├── main.tsx          # entry
├── App.tsx           # root component
├── components/       # presentational + feature components
├── hooks/            # custom React hooks (useApi, ...)
├── types.ts          # local view types
└── index.css         # Tailwind layers
```

## Component Rules

- **Functional components only.** No class components. Use hooks for state and effects (`useState`, `useEffect`, `useCallback`).
- **Keep components under 150 lines.** If a component grows past that (e.g. `App.tsx` today), extract sections into child components or custom hooks. One responsibility per component.
- Type props with an explicit `interface XxxProps`; no `any` (lint error). Destructure props in the signature.
- Co-locate small presentational components in `components/`; lift shared/stateful logic into `hooks/`.

## Styling

- **Tailwind CSS utility classes only** — style via `className`. No inline `style={}` objects, no CSS-in-JS, no per-component `.css` files.
- Reuse the existing design language (`bg-white rounded-lg shadow p-6 border border-gray-200`, `max-w-7xl mx-auto`, gray/blue palette).
- For conditional styling use template literals / a `clsx`-style pattern, keeping class strings readable.

## Hooks

- **Custom hooks live in `hooks/`** and are named `useXxx`.
- Data fetching goes through `useApi<T>(path)` / `apiFetch<T>` — don't call `fetch` directly in components.
- Respect the rules of hooks: top-level only, stable dependency arrays, wrap callbacks passed as deps in `useCallback`.
- **Do not hardcode secrets.** `useApi.ts` currently embeds the API key in source — new code must read it from Vite env (`import.meta.env.VITE_*`), never literals.

## Testing

- The package `test` script is currently a stub. New components/hooks still need real tests counting toward the repo-wide **80% coverage** minimum (root `CLAUDE.md`). Prefer Vitest + React Testing Library.
