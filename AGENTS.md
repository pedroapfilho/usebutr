# AGENTS.md

Guidance for AI coding agents working in the **usebutr** monorepo — a multi-chain browser-wallet management library for React (`@usebutr/*`), plus fifteen demo apps, a marketing landing page and a Fumadocs site.

## Stack

- **Runtime:** Node ≥24, pnpm 11.13.1.
- **Monorepo:** pnpm workspaces + Turborepo (`turbo.json`).
- **Library packages:** built with [`tsdown`](https://tsdown.dev), published to npm under `@usebutr/*` via Changesets (`access: public`, `baseBranch: main`).
- **Lint / format:** `oxlint` (config in `oxlint.config.ts`, presets from `oxlint-config-awesomeness`) + `oxfmt`.
- **Tests:** Vitest, shared config in `@repo/config-vitest` (`react.ts`, `node.ts`).
- **Dead code / dupes / health:** [`fallow`](https://www.npmjs.com/package/fallow) (config in `.fallowrc.json`).
- **Pre-commit:** Husky + lint-staged → oxlint on changed source, oxfmt on `*.{ts,tsx,…,json,md}`.
- **Docs site:** Fumadocs (Next.js 16 + Tailwind 4) under `apps/docs`, deployed to `docs.usebutr.com`.

## Layout

```
apps/                 # 17 apps: 4 framework demos + 11 integration demos + docs + landing
packages/             # @usebutr/* library packages + 2 @repo/* configs + 1 @repo/* internal
.changeset/           # Changesets — version bumps + release notes
.github/workflows/    # 7 workflows: build, lint, typecheck, test, publish-checks, react-doctor, release
.fallow/              # Fallow cache + reports
.husky/               # Pre-commit hooks (lint-staged)
oxlint.config.ts      # Repo-wide oxlint config (TS-based)
turbo.json            # Task graph: build → lint/typecheck/test depend on ^build
assets/               # Brand SVGs (light + dark butr logo)
docs/                 # Repo-level design notes (not the Fumadocs site)
```

### Apps

**Framework demos** (kitchen-sink references for one React framework each):

| App                   | Framework                       | Dev URL                                         |
| --------------------- | ------------------------------- | ----------------------------------------------- |
| `demo-vite`           | Vite 7 + React 19 (SPA)         | `https://usebutr.demo-vite.localhost`           |
| `demo-next`           | Next.js 16 (App Router)         | `https://usebutr.demo-next.localhost`           |
| `demo-tanstack-start` | TanStack Start (Vite SSR)       | `https://usebutr.demo-tanstack-start.localhost` |
| `demo-expo-web`       | Expo (React Native, web target) | `https://usebutr.demo-expo-web.localhost`       |

**Integration demos** (one library each, on the chain's testnet):

| App                               | Library                        | Dev URL                                                     |
| --------------------------------- | ------------------------------ | ----------------------------------------------------------- |
| `demo-with-viem`                  | viem                           | `https://usebutr.demo-with-viem.localhost`                  |
| `demo-with-wagmi`                 | wagmi (`@wagmi/core`)          | `https://usebutr.demo-with-wagmi.localhost`                 |
| `demo-with-solana-web3js`         | `@solana/web3.js`              | `https://usebutr.demo-with-solana-web3js.localhost`         |
| `demo-with-solana-wallet-adapter` | `@solana/wallet-adapter-react` | `https://usebutr.demo-with-solana-wallet-adapter.localhost` |
| `demo-with-solana-kit`            | `@solana/kit`                  | `https://usebutr.demo-with-solana-kit.localhost`            |
| `demo-with-sui`                   | `@mysten/sui`                  | `https://usebutr.demo-with-sui.localhost`                   |
| `demo-with-bitcoin`               | `bitcoinjs-lib`                | `https://usebutr.demo-with-bitcoin.localhost`               |
| `demo-with-gill`                  | gill                           | `https://usebutr.demo-with-gill.localhost`                  |
| `demo-with-solana-framework-kit`  | `@solana/react-hooks`          | `https://usebutr.demo-with-solana-framework-kit.localhost`  |
| `demo-wormhole-usdc`              | `@wormhole-foundation/sdk`     | `https://usebutr.demo-wormhole-usdc.localhost`              |
| `demo-with-polkadot`              | `polkadot-api`                 | `https://usebutr.demo-with-polkadot.localhost`              |

**Docs:** `apps/docs` — Fumadocs (Next.js 16 + Turbopack) on `https://usebutr.docs.localhost`.

**Landing:** `apps/landing` — Next.js 16 marketing site on `https://usebutr.landing.localhost` (portless).

### Packages

| Package                           | Published? | Purpose                                                                           |
| --------------------------------- | ---------- | --------------------------------------------------------------------------------- |
| `@usebutr/core`                   | yes        | Types, store, storage, discovery seam. No React, no protocols.                    |
| `@usebutr/react`                  | yes        | `WalletManagerProvider`, hooks, persisted connections.                            |
| `@usebutr/evm`                    | yes        | EIP-6963 discovery + EVM connector.                                               |
| `@usebutr/svm`                    | yes        | Wallet Standard discovery + Solana connector.                                     |
| `@usebutr/sui`                    | yes        | Wallet Standard discovery + Sui connector.                                        |
| `@usebutr/bitcoin`                | yes        | Injected fallbacks (Unisat, Xverse, `window.btc`) + Bitcoin connector.            |
| `@usebutr/polkadot`               | yes        | injectedWeb3 + Wallet Standard discovery + Polkadot connector.                    |
| `@usebutr/wallets`                | yes        | `autoDiscovery()` — the one-call discovery source.                                |
| `@usebutr/walletconnect`          | yes        | WalletConnect connector.                                                          |
| `@usebutr/ledger`                 | yes        | Ledger connector.                                                                 |
| `@usebutr/wallet-standard-shared` | yes        | Shared Wallet Standard helpers.                                                   |
| `@usebutr/testing`                | yes        | Testing helpers for consumer apps.                                                |
| `@repo/typescript-config`         | no         | Shared tsconfig bases: `base/nextjs/react-library/vite/expo.json`.                |
| `@repo/config-vitest`             | no         | Shared Vitest config (`react.ts`, `node.ts`).                                     |
| `@repo/wallet-extensions`         | no         | Internal registry + Playwright helpers for extension fixtures (not for e2e here). |

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

This is a library + demo repo, with no Docker or Prisma. Vitest covers the library; existing Playwright checks cover docs navigation and selected demos. Browser checks do not run in unit-test CI.

## Conventions & gotchas

- **Library profile.** This repo is `library` in orchestrator. SaaS checks (auth-config, prisma-config, e2e, i18n-leak, theme, primitives, dev, base-styles) intentionally skip here. The applicable set is profile-aware and compared against the `library` base, `acme-package`; run `orchestrator verify --repo usebutr` for the current list.
- **CI shape.** Seven workflows: `test`, `lint` (includes format and fallow jobs), `typecheck`, `build`, `publish-checks`, `react-doctor` (advisory), and `release`. No `e2e.yml`.
- **Per-app gitignores allowed.** Unlike SaaS repos, library demos may carry their own `.gitignore` files (the `gitignore` check is lenient here).
- **Path aliases.** `@/*` → `src/*` in most apps; TanStack Start also maps `app/*`. Demo apps consume the library via workspace deps (`"@usebutr/core": "workspace:*"`) and tsconfig via `@repo/typescript-config`.
- **Stable portless URLs.** `scripts/dev.mjs` resolves app links through Portless and forwards CLI arguments to Turbo. `pnpm dev --filter=<app>` includes dependency builds; direct `pnpm --filter=<app> dev` does not. Worktrees add a branch prefix to the listed URLs. Expo native iOS/Android use Metro/Expo Go on their own transport.
- **Wallet discovery, not connect-modal UI.** The library only handles discovery + connection state; consumer apps own the modal/picker. Demos exercise that boundary on each framework.
- **Releases via Changesets.** `release.yml` publishes from `main` after `version-packages` opens a release PR. Don't bump versions manually in `package.json` — author a changeset instead.
- **pnpm `allowBuilds` matters.** The native crypto deps (`keccak`, `bufferutil`, `bigint-buffer`, etc.) gate on `pnpm-workspace.yaml`'s `allowBuilds` and `onlyBuiltDependencies`. When adding a chain or wallet that pulls in new native deps, list them there or `pnpm install` will silently skip the build step.
- **No App Router server-component check surface here.** Only `apps/docs` and `demo-next` are App Router; the rest are SPA / SSR-via-Vite. The orchestrator's `no-pointless-async` AST scan still applies.

## Notable decisions

- **No auth or DB.** Deliberately — this is a client-side library. SaaS-only standards (Better Auth, Prisma) are N/A here. Existing browser tests are limited to docs and selected demo behavior. If you're applying a cross-repo change from `acme`, check whether it's library-relevant before propagating.
- **`@usebutr/*` published, `@repo/*` private.** The `@repo/*` namespace is a workspace-internal convention shared with the SaaS repos; only the public connector packages live under `@usebutr/*`.
- **`tsdown` over `tsup`/`unbuild`.** Faster builds, ESM-first, matches the React 19 + Node 24 baseline.
- **Fumadocs over plain Next.js content.** `apps/docs` is the source of `docs.usebutr.com`; content lives as MDX under that app.
- **`@repo/wallet-extensions`** ships Playwright + registry helpers for _consumer_ apps that want to drive real wallet extensions in their own e2e suites. This repo doesn't run those e2e tests itself.

## References

- Library docs: `https://docs.usebutr.com` (built from `apps/docs`)
- Repo: `https://github.com/pedroapfilho/usebutr`
- Orchestrator (shared standards across sibling repos): `~/dev/orchestrator`
- Sibling library repo: `astro-awesomeness` (`~/dev/astro-theme-awesomeness`)
- SaaS source of truth: `acme` (`~/dev/acme-monorepo`) — most SaaS-only patterns there do not apply here
