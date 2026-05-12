# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Commands

```bash
# Development (runs all apps concurrently via Turborepo)
pnpm dev                                # all apps
pnpm dev --filter=demo-vite             # single app

# Build / Lint / Typecheck
pnpm build                              # all packages + apps
pnpm lint                               # oxlint
pnpm typecheck                          # tsc --noEmit
pnpm format                             # oxfmt (write)
pnpm format:check                       # oxfmt (check)

# Testing
pnpm test                               # vitest unit tests
pnpm test:e2e                           # playwright (placeholder, no current tests)
```

## Architecture

**Monorepo** managed by pnpm workspaces + Turborepo. Node 24, pnpm 10.

### Apps

| App                   | Framework                       | Dev URL                 |
| --------------------- | ------------------------------- | ----------------------- |
| `demo-vite`           | Vite 7 + React 19 (SPA)         | `http://localhost:5173` |
| `demo-next`           | Next.js 16 (App Router)         | `http://localhost:3000` |
| `demo-tanstack-start` | TanStack Start (Vite SSR)       | `http://localhost:3001` |
| `demo-expo`           | Expo (React Native, web target) | `http://localhost:8081` |

Every demo is a single-page kitchen-sink reference that imports and uses every public `butr` export.

### Packages

| Package                   | Purpose                                                                                                                           |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `butr`                    | The library — multi-chain wallet management primitives for React.                                                                 |
| `@repo/typescript-config` | Shared tsconfig bases: `base.json`, `library.json`, `nextjs.json`, `react-library.json`, `server.json`, `vite.json`, `expo.json`. |
| `@repo/config-vitest`     | Shared Vitest config. Exports `react.ts` and `node.ts`.                                                                           |

## Tooling

- **Linter:** oxlint. Config in `oxlint.config.ts`.
- **Formatter:** oxfmt.
- **Pre-commit:** Husky + lint-staged.
- **Testing:** Vitest for unit tests; Playwright is wired but `tests/e2e/` is currently empty.
- **Dead code:** `pnpm fallow:dead` to detect unused exports.

## Conventions

- Path aliases: `@/*` maps to `src/*` (and `app/*` for TanStack Start) in apps.
- Demo apps depend on `butr` via `"butr": "workspace:*"` and on `@repo/typescript-config` via the same.
- Each web demo binds a distinct localhost port so all four can run concurrently. `demo-expo`'s native target uses Metro/Expo Go on its own transport.
