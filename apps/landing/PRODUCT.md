# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

React developers evaluating or integrating a browser-wallet layer for a dapp. They arrive from GitHub, npm, or a search for "multi-chain wallet React", usually mid-build with a chain library (viem, wagmi, @solana/kit, gill) already chosen. Their job: decide within minutes whether butr handles wallet discovery and connection state well enough to replace hand-rolled or single-chain wallet code.

## Product Purpose

butr (`@usebutr/*`) discovers browser wallets across EVM, Solana, Sui, Bitcoin, and Polkadot, manages their connection state across reloads, and hands the app a raw signer. The landing page (`apps/landing`, usebutr.com) exists to move that developer into the docs and an `npm i @usebutr/wallets` — adoption-first, confirmed by the user as the single most important visitor action.

## Positioning

One hook surface for wallets on any chain, without owning the stack: butr runs _under_ the developer's chain library rather than replacing it. `getSigner()` returns the wallet's raw provider to bridge into viem, wagmi, gill, or @solana/kit. Neighboring libraries either bind to one ecosystem or bundle their own RPC/UI layer; butr's claim is discovery + connection state only, bring your own everything else.

## Operating Context

- Developer evaluates in an editor/browser split: landing → quickstart → local install.
- Docs live at docs.usebutr.com (Fumadocs); live demo at demo.usebutr.com; source at github.com/pedroapfilho/usebutr; packages on npm under @usebutr.
- The library ships no connect-modal UI — consumer apps own the picker. The landing must not imply a bundled modal.
- Monorepo also ships 15 demo apps proving each integration on testnets.

## Capabilities and Constraints

- Confirmed capabilities: multi-chain discovery (EIP-6963, Wallet Standard, injected fallbacks, injectedWeb3), simultaneous connections across platforms (e.g. MetaMask + Phantom at once), persisted connection state, WalletAdapter seam for custom/WalletConnect/Ledger connectors, modular packages (core has no React and no protocol code).
- Supported chains shown today: Ethereum, Solana, Bitcoin, Base, Arbitrum, Optimism, Polygon, BNB Chain, Sui, Polkadot.
- Uninventable: no customer logos, testimonials, benchmarks, pricing, or adoption numbers exist. Do not fabricate any.
- Real code samples must stay accurate to the published API (`WalletManagerProvider`, `useDiscoveredWallets`, `useConnectWallet`, `useSelectedWallet`, `useSigner`, `autoDiscovery`).

## Brand Commitments

- Name: **butr** (lowercase), packages under `@usebutr/*`, domain usebutr.com. Install command: `npm i @usebutr/wallets`.
- Wordmark + amber/butter gradient mark exist (`src/components/brand-logo.tsx`, `assets/`).
- User-confirmed (2026-09-01): **total freedom** for alternative explorations — palette is free and the logo treatment itself may be restyled (e.g. monochrome mark). No color is binding.
- Voice in current copy: plain, factual, developer-to-developer ("Bring your own chain library"). No confirmed constraint beyond staying truthful.

## Evidence on Hand

- Real, runnable code samples (quickstart and viem signer bridge) in `apps/landing/src/components/hero.tsx` and `code-example.tsx`.
- Chain support list with official network icons via `@web3icons/react`.
- Live demo (demo.usebutr.com) and public GitHub repo as proof surfaces.
- Absent (must not be fabricated): testimonials, customers, stars/download counts, benchmarks.

## Product Principles

- Adoption is the goal: every surface should shorten the path to install + quickstart.
- Prove with real material: actual API code and the live demo outrank adjectives.
- Honesty about scope: discovery + connection state, not a UI kit and not an RPC stack.
- Developer-grade precision: accessibility, light/dark, performance are table stakes, not features.
