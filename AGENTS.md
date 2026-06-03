# AGENTS.md

Guidance for AI coding agents working in the **usebutr** monorepo — a multi-chain browser-wallet management library for React (`@usebutr/*`), plus thirteen demo apps and a Fumadocs site.

## Stack

- **Runtime:** Node ≥24, pnpm 11.1.3.
- **Monorepo:** pnpm workspaces + Turborepo (`turbo.json`).
- **Library packages:** built with [`tsdown`](https://tsdown.dev), published to npm under `@usebutr/*` via Changesets (`access: public`, `baseBranch: main`).
- **Lint / format:** `oxlint` (config in `oxlint.config.ts`, presets from `oxlint-config-awesomeness`) + `oxfmt`.
- **Tests:** Vitest, shared config in `@repo/config-vitest` (`react.ts`, `node.ts`).
- **Dead code / dupes / health:** [`fallow`](https://www.npmjs.com/package/fallow) (config in `.fallowrc.json`).
- **Pre-commit:** Husky + lint-staged → oxlint on changed source, oxfmt on `*.{ts,tsx,…,json,md}`.
- **Docs site:** Fumadocs (Next.js 16 + Tailwind 4) under `apps/docs`, deployed to `docs.usebutr.com`.

## Layout

```
apps/                 # 14 apps: 4 framework demos + 10 integration demos + docs
packages/             # @usebutr/* library packages + 2 @repo/* configs + 1 @repo/* internal
.changeset/           # Changesets — version bumps + release notes
.github/workflows/    # CI: test, lint, format, fallow, release (Changesets publish)
.fallow/              # Fallow cache + reports
.husky/               # Pre-commit hooks (lint-staged)
oxlint.config.ts      # Repo-wide oxlint config (TS-based)
turbo.json            # Task graph: build → lint/typecheck/test depend on ^build
assets/               # Brand SVGs (light + dark butr logo)
docs/                 # Repo-level design notes (not the Fumadocs site)
```

### Apps

**Framework demos** (kitchen-sink references for one React framework each):

| App                   | Framework                       | Dev URL                 |
| --------------------- | ------------------------------- | ----------------------- |
| `demo-vite`           | Vite 7 + React 19 (SPA)         | `http://localhost:5173` |
| `demo-next`           | Next.js 16 (App Router)         | `http://localhost:3000` |
| `demo-tanstack-start` | TanStack Start (Vite SSR)       | `http://localhost:3001` |
| `demo-expo-web`       | Expo (React Native, web target) | `http://localhost:8081` |

**Integration demos** (one library each, on the chain's testnet):

| App                               | Library                      | Dev URL                 |
| --------------------------------- | ---------------------------- | ----------------------- |
| `demo-with-viem`                  | viem                         | `http://localhost:5175` |
| `demo-with-wagmi`                 | wagmi (`@wagmi/core`)        | `http://localhost:5176` |
| `demo-with-solana-web3js`         | `@solana/web3.js`            | `http://localhost:5177` |
| `demo-with-solana-wallet-adapter` | `@solana/wallet-adapter-react` | `http://localhost:5178` |
| `demo-with-solana-kit`            | `@solana/kit`                | `http://localhost:5179` |
| `demo-with-sui`                   | `@mysten/sui`                | `http://localhost:5180` |
| `demo-with-bitcoin`               | `bitcoinjs-lib`              | `http://localhost:5181` |
| `demo-with-gill`                  | gill                         | `http://localhost:5182` |
| `demo-with-solana-framework-kit`  | `@solana/react-hooks`        | `http://localhost:5183` |
| `demo-wormhole-usdc`              | `@wormhole-foundation/sdk`   | `http://localhost:5184` |

**Docs:** `apps/docs` — Fumadocs (Next.js 16 + Turbopack) on `http://localhost:4000`.

### Packages

| Package                        | Published? | Purpose                                                                            |
| ------------------------------ | ---------- | ---------------------------------------------------------------------------------- |
| `@usebutr/core`                | yes        | Types, store, storage, discovery seam. No React, no protocols.                     |
| `@usebutr/react`               | yes        | `WalletManagerProvider`, hooks, persisted connections.                             |
| `@usebutr/evm`                 | yes        | EIP-6963 discovery + EVM connector.                                                |
| `@usebutr/svm`                 | yes        | Wallet Standard discovery + Solana connector.                                      |
| `@usebutr/sui`                 | yes        | Wallet Standard discovery + Sui connector.                                         |
| `@usebutr/bitcoin`             | yes        | Injected fallbacks (Unisat, Xverse, `window.btc`) + Bitcoin connector.             |
| `@usebutr/wallets`             | yes        | `autoDiscovery()` — the one-call discovery source.                                 |
| `@usebutr/walletconnect`       | yes        | WalletConnect connector.                                                           |
| `@usebutr/ledger`              | yes        | Ledger connector.                                                                  |
| `@usebutr/wallet-standard-shared` | yes     | Shared Wallet Standard helpers.                                                    |
| `@usebutr/testing`             | yes        | Testing helpers for consumer apps.                                                 |
| `@repo/typescript-config`      | no         | Shared tsconfig bases: `base/library/nextjs/react-library/server/vite/expo.json`. |
| `@repo/config-vitest`          | no         | Shared Vitest config (`react.ts`, `node.ts`).                                      |
| `@repo/wallet-extensions`      | no         | Internal registry + Playwright helpers for extension fixtures (not for e2e here).  |

## Dev workflow

All scripts are pnpm via Turbo:

```bash
pnpm dev                                # all apps (Turbo TUI)
pnpm dev --filter=demo-vite             # one app
pnpm build                              # packages + apps (^build chain)
pnpm lint                               # oxlint everywhere
pnpm typecheck                          # tsc --noEmit per package
pnpm format                             # oxfmt (write)
pnpm format:check                       # oxfmt (check)
pnpm test                               # vitest (Turbo, uncached)
pnpm test:coverage                      # with coverage outputs
pnpm fallow:dead                        # unused exports
pnpm fallow:dupes                       # duplicate deps
pnpm fallow:health --score              # repo health score
pnpm fallow:audit --base main           # diff-scoped audit
pnpm changeset                          # author a release note
pnpm version-packages                   # bump versions from changesets
pnpm release                            # build + changeset publish (CI runs this)
```

There is no Docker, no Prisma, no Playwright, no e2e suite — this is a pure library + demo repo.

## Conventions & gotchas

- **Library profile.** This repo is `library` in orchestrator. Many SaaS verifiers (auth-config, prisma-config, e2e, i18n, theme, primitives, dev/portless, base-styles) intentionally skip here. The canonical set is: versions, lint, naming, gitignore, no-tracked-ignored, no-pointless-async, agents-md, ci, root-scripts, tsconfig — all profile-aware against `usebutr` as the `LIBRARY_SOURCE_OF_TRUTH`.
- **CI shape.** 4 workflows + `release.yml`: `test`, `lint`, `format`, `fallow`. No `e2e.yml`.
- **Per-app gitignores allowed.** Unlike SaaS repos, library demos may carry their own `.gitignore` files (verifier is lenient).
- **Path aliases.** `@/*` → `src/*` in most apps; TanStack Start also maps `app/*`. Demo apps consume the library via workspace deps (`"@usebutr/core": "workspace:*"`) and tsconfig via `@repo/typescript-config`.
- **Distinct ports.** Each web demo binds a unique localhost port so all framework demos can run concurrently. Expo web uses `expo start --web` on `:8081`; native iOS/Android go through Metro/Expo Go on their own transport.
- **Wallet discovery, not connect-modal UI.** The library only handles discovery + connection state; consumer apps own the modal/picker. Demos exercise that boundary on each framework.
- **Releases via Changesets.** `release.yml` publishes from `main` after `version-packages` opens a release PR. Don't bump versions manually in `package.json` — author a changeset instead.
- **pnpm `allowBuilds` matters.** The native crypto deps (`keccak`, `bufferutil`, `bigint-buffer`, etc.) gate on `pnpm-workspace.yaml`'s `allowBuilds` and `onlyBuiltDependencies`. When adding a chain or wallet that pulls in new native deps, list them there or `pnpm install` will silently skip the build step.
- **No App Router server-component verifier surface here.** Only `apps/docs` and `demo-next` are App Router; the rest are SPA / SSR-via-Vite. The orchestrator's `no-pointless-async` AST scan still applies.

## Notable decisions

- **No auth, no DB, no e2e.** Deliberately — this is a client-side library. The SaaS standards stack (Better Auth, Prisma, Playwright, portless `*.localhost`) is N/A here. If you're applying a cross-repo change from `acme`, check whether it's library-relevant before propagating.
- **`@usebutr/*` published, `@repo/*` private.** The `@repo/*` namespace is a workspace-internal convention shared with the SaaS repos; only the public connector packages live under `@usebutr/*`.
- **`tsdown` over `tsup`/`unbuild`.** Faster builds, ESM-first, matches the React 19 + Node 24 baseline.
- **Fumadocs over plain Next.js content.** `apps/docs` is the source of `docs.usebutr.com`; content lives as MDX under that app.
- **`@repo/wallet-extensions`** ships Playwright + registry helpers for *consumer* apps that want to drive real wallet extensions in their own e2e suites. This repo doesn't run those e2e tests itself.

## References

- Library docs: `https://docs.usebutr.com` (built from `apps/docs`)
- Repo: `https://github.com/pedroapfilho/usebutr`
- Orchestrator (shared standards across sibling repos): `~/dev/orchestrator`
- Sibling library repo: `astro-awesomeness` (`~/dev/astro-awesomeness-monorepo`)
- SaaS source of truth: `acme` (`~/dev/acme-monorepo`) — most SaaS-only patterns there do not apply here
