# butr-monorepo: cleanup and demo apps

**Date:** 2026-05-07
**Status:** Approved (design)

## Goal

Strip the acme product scaffolding out of this monorepo so it becomes a focused workspace around the `butr` package (a multi-chain wallet management library for React), then add four demo apps that each exercise the full public API of `butr` across different React frameworks.

The monorepo skeleton (Turborepo, pnpm workspaces, oxlint, oxfmt, husky + lint-staged, fallow, Playwright placeholder, shared `@repo/typescript-config` and `@repo/config-vitest`) stays — only the acme product code goes.

## Inventory

### Delete

- `apps/web` — Next.js main app, depends on auth/db
- `apps/landing` — Next.js marketing site
- `apps/api` — Hono backend with Better Auth
- `packages/auth` — Better Auth config
- `packages/db` — Prisma client + schema
- `packages/transactional` — transactional email package
- `packages/ui` — shared React components for the deleted apps
- `docker-compose.yml` — Postgres for the deleted db package
- `tests/e2e/*` contents — Playwright tests for the deleted apps (keep the empty `tests/e2e/` directory and `playwright.config.ts` as a placeholder)
- `db:generate` / `db:push` / `db:seed` scripts in root `package.json`
- `db:generate` / `db:push` / `db:seed` tasks in `turbo.json`
- These env vars in `turbo.json` `build` task: `API_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `CORS_ORIGINS`, `DATABASE_URL`, `NEXT_PUBLIC_API_URL`, `TRUSTED_ORIGINS`

### Keep

- `packages/butr` — the library (root of everything)
- `packages/config-typescript` — shared tsconfig bases
- `packages/config-vitest` — shared vitest configs
- Root tooling: Turborepo, pnpm workspaces, oxlint, oxfmt, husky + lint-staged, fallow, Playwright (placeholder), Vitest

### Add

- `apps/demo-vite` — Vite + React 19 SPA
- `apps/demo-next` — Next.js 16 App Router
- `apps/demo-tanstack-start` — TanStack Start (current latest)
- `apps/demo-expo` — Expo SDK (current latest), web + native
- `packages/config-typescript/vite.json` — shared tsconfig base for Vite-style apps
- `packages/config-typescript/expo.json` — shared tsconfig base for Expo apps (extends `expo/tsconfig.base`)

## Demo app structure

Each demo is a **single-page kitchen-sink reference** that imports and uses every public `butr` export. This is intentional: it both serves as documentation for users adopting `butr` and keeps fallow's dead-code detection green.

### Per-demo file layout

```
apps/demo-<framework>/
├── package.json
├── tsconfig.json
├── src/
│   ├── mock-connector.ts          # full UIConnector + ConnectorMeta implementation
│   ├── wallet-provider.tsx        # WalletManagerProvider + createWalletStore + storage driver
│   ├── sections/
│   │   ├── connection.tsx         # connection status hooks + connect/disconnect/refresh/reset mutations
│   │   ├── wallets.tsx            # wallet lookup hooks + update-account mutation
│   │   ├── mode.tsx               # useWalletMode + setter
│   │   └── internals.tsx          # useGetConnectorInstance + useWalletStore raw snapshot
│   └── app.tsx | page.tsx | +index.tsx   # composes all sections (entry varies by framework)
└── (framework-specific entry files)
```

### UI shape (identical across all four demos)

```
┌──────────────────────────────────────────────────────────┐
│  butr · <framework name>                                 │
├──────────────────────────────────────────────────────────┤
│  Connection                                              │
│    status, active connector, error                       │
│    [Connect] [Connect OIDC] [Disconnect]                 │
│    [Refresh] [Reset] [Reset status] [Set status…]        │
├──────────────────────────────────────────────────────────┤
│  Wallets                                                 │
│    has any, list, by chain, by platform,                 │
│    for operation, by-platform map                        │
│    [Update active account…]                              │
├──────────────────────────────────────────────────────────┤
│  Mode                                                    │
│    current mode, [Toggle]                                │
├──────────────────────────────────────────────────────────┤
│  Internals                                               │
│    connector instance, raw store snapshot                │
└──────────────────────────────────────────────────────────┘
```

### Mock connector

Each demo gets its own copy in `src/mock-connector.ts` (~50–80 lines). Duplicated on purpose — keeps demos self-contained and copyable. Surface:

- `connect()` resolves a fake `Account` after 500ms (so the `connecting` state is observable)
- `connectOIDC()` mocks an OIDC handshake; resolves a different fake account
- `getInstance()` returns `ConnectorMeta`
- Chain/platform metadata configured so `useGetWalletByChain("ethereum")`, `useGetWalletByPlatform("evm")`, `useGetWalletForOperation("sign")` return non-empty values when connected

### Type coverage

All exported types from `butr` are used as parameter or return-type annotations in `mock-connector.ts` or `wallet-provider.tsx` so fallow sees them as imported:

`ChainBase`, `Account`, `Balance`, `ChainPlatform`, `ConnectedWallet`, `ConnectorMeta`, `SignInInput`, `UIConnector`, `WalletManagerConfig`, `WalletMode`, `ConnectionStatus`, `WalletStore`, `WalletStoreState`, `BrowserStorageDrivers`, `ConnectedWalletsRecord`, `MaybePromise`, `StorageDriver`, `StoredWalletData`, `WalletPersistence`.

All exported hooks and factories are imported and used in the relevant `sections/*.tsx` or `wallet-provider.tsx`:

`createWalletStore`, `createBrowserStorageDriver`, `createMemoryStorageDriver`, `WalletStorage`, `WalletManagerProvider`, plus all 26 hooks listed in `packages/butr/src/index.ts:38-65`.

### Framework-specific notes

| Demo                | Entry                                   | Provider lives in                                         | tsconfig extends                      |
| ------------------- | --------------------------------------- | --------------------------------------------------------- | ------------------------------------- |
| demo-vite           | `src/main.tsx` mounts `<App />`         | `<WalletProvider>` in `App`                               | `@repo/typescript-config/vite.json`   |
| demo-next           | App Router (`app/layout.tsx`)           | `"use client"` provider in layout, page is `"use client"` | `@repo/typescript-config/nextjs.json` |
| demo-tanstack-start | `app/root.tsx` + `app/routes/index.tsx` | `<WalletProvider>` wraps in `root.tsx`                    | `@repo/typescript-config/vite.json`   |
| demo-expo           | `app/_layout.tsx` + `app/index.tsx`     | `<WalletProvider>` in `_layout.tsx`                       | `@repo/typescript-config/expo.json`   |

## Tooling rewires

### Root `package.json`

- Rename `"name": "acme"` → `"name": "butr-monorepo"`
- Drop scripts: `db:generate`, `db:push`, `db:seed`
- Keep everything else: `start`, `dev`, `lint`, `format`, `format:check`, `typecheck`, `build`, `clean`, `test`, `test:e2e`, `test:e2e:ui`, `fallow`, `fallow:dead`, `fallow:dupes`, `fallow:health`, `fallow:audit`, `prepare`
- Keep `lint-staged` config and all devDependencies

### `turbo.json`

- Drop tasks: `db:generate`, `db:push`, `db:seed`
- Drop env array on `build`: remove `API_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `CORS_ORIGINS`, `DATABASE_URL`, `NEXT_PUBLIC_API_URL`, `TRUSTED_ORIGINS`
- Keep all other tasks (`build`, `lint`, `typecheck`, `format:check`, `dev`, `start`, `test`, `test:watch`, `test:coverage`, `clean`)

### `packages/butr` migration

- `tsconfig.json` extends `@repo/typescript-config/react-library.json` (currently hand-rolled)
- `tsconfig.cjs.json` extends `@repo/typescript-config/react-library.json` and overrides `module: CommonJS`, `moduleResolution: node`, `outDir: ./dist/cjs` (the `moduleResolution: node` override is required because the shared base sets `bundler`, which is incompatible with `module: CommonJS`)
- Add `"@repo/typescript-config": "workspace:*"` to `devDependencies`
- Add `"@repo/config-vitest": "workspace:*"` to `devDependencies` for parity (do NOT migrate `vitest.config.ts` — current `node` environment works for current tests; migration is YAGNI until tests need DOM)

### `packages/config-typescript`

New file `vite.json`:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Vite",
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "module": "ESNext",
    "noEmit": true
  }
}
```

New file `expo.json`:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Expo",
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "jsx": "react-jsx"
  }
}
```

`packages/config-typescript/package.json` gains an `expo` dependency pinned to the same version installed in `apps/demo-expo`:

```json
{
  "dependencies": {
    "expo": "<same version as apps/demo-expo>"
  }
}
```

Adding `expo` as a dep here makes `extends: "expo/tsconfig.base"` resolve deterministically without relying on pnpm hoisting. The two versions stay in sync because they both come from the same Expo SDK release.

### Demo app `package.json` shape (uniform)

Each demo:

- Depends on `"butr": "workspace:*"`
- Depends on `"@repo/typescript-config": "workspace:*"`
- React version matches `butr`'s peer (React 19+); demo-vite/demo-next/demo-tanstack-start also include `react-dom`; demo-expo uses `react-native` instead
- `dev` script wraps the framework's dev command in `portless run --https <subdomain> -- <cmd>` (matching the acme convention; preserves worktree subdomain prefixing)
- `build` and `start` scripts use the framework's defaults

### Dev URLs

| Demo                | URL                                                  |
| ------------------- | ---------------------------------------------------- |
| demo-vite           | `https://demo-vite.butr.localhost`                   |
| demo-next           | `https://demo-next.butr.localhost`                   |
| demo-tanstack-start | `https://demo-tanstack-start.butr.localhost`         |
| demo-expo (web)     | `https://demo-expo.butr.localhost`                   |
| demo-expo (native)  | runs on Expo's own simulator transport, not portless |

### Documentation updates

- `README.md` — replace acme product blurb with butr-focused content: stack summary, demos table, scripts table, portless setup. Drop docker/Postgres/Prisma sections.
- `CLAUDE.md` — strip references to deleted apps/packages and Better Auth/Prisma/Postgres specifics. Replace with demo apps and butr-focused conventions.
- `AGENTS.md` — same content as `CLAUDE.md` (they're already mirrored).
- Per the user's "no docs unless asked" rule, only existing docs are edited — no new `*.md` files are created.

### Removed env files

- `apps/web/.env.example`, `apps/api/.env.example`, `packages/db/.env.example` deleted alongside their parent packages
- No new env files needed for demos (none of them require runtime config)

## Risks and open edges

1. **butr's CJS build** — `tsconfig.cjs.json` must explicitly set `moduleResolution: node` after migrating to the shared base, since the base uses `bundler` which is incompatible with `module: CommonJS`. Verified by running `pnpm --filter butr run build` after migration and checking both `dist/esm` and `dist/cjs` emit.
2. **butr's vitest** — kept on `node` environment with the existing `setup.ts`. Not migrated to `@repo/config-vitest/react` because current tests don't need DOM. The package gains a workspace dep on `@repo/config-vitest` for consistency only.
3. **TanStack Start** — pre-1.0 and changes shape often. Implementation pins the current latest version and uses the official `create-start-app` scaffold output as the baseline. The demo follows whatever conventions that scaffold produces.
4. **Expo + portless** — `expo start --web` runs through portless without issue. `expo start` for native (iOS/Android) bypasses portless entirely (Metro uses its own transport). Documented in README.
5. **fallow** — each demo individually imports every public `butr` export, so fallow stays green without suppressions. Verified by running `pnpm fallow:dead` after demos are wired up.
6. **`packages/butr/dist`** — checked into the working tree currently. `.gitignore` is expected to cover it; not touched by this work.
7. **portless cert** — dev URLs require `sudo portless proxy start --https` once per machine. Documented in updated README.

## Verification checklist (post-implementation)

- `pnpm install` succeeds
- `pnpm build` builds `butr` + all four demos with no errors
- `pnpm typecheck` passes across the workspace
- `pnpm lint` passes
- `pnpm format:check` passes
- `pnpm test` passes (butr's existing unit tests still run)
- `pnpm fallow:dead` reports zero unused exports in `butr`
- Each demo's dev URL serves a working page that visibly demonstrates connect → connecting → connected → disconnect

## Out of scope

- Real (non-mock) connectors — left for future work
- Polished demo UI / styling — sections are labeled but unstyled beyond minimal CSS
- E2E tests for the demos — `tests/e2e/` and `playwright.config.ts` are kept as placeholders only
- `packages/butr` source code changes — the library is consumed as-is
- Publishing `butr` to npm — packaging exists but registry publish is unrelated
