# ADR 0001 — Demos stay standalone; we accept the duplication

## Status

Accepted · 2026-05-21

## Context

butr ships 12+ demo apps under `apps/demo-*/`. Each demo's `Connected` (or
equivalent) component is structurally similar across demos: list connected
wallets, show accounts, allow signing, switch chains. The boilerplate is
duplicated by hand-rolled implementation in every demo (~80-300 lines of
UI scaffolding per demo).

A periodic architecture review (the `improve-codebase-architecture`
skill) is likely to surface this duplication as a candidate for extraction
into a shared `@usebutr/demo-ui` package (or a sub-path of
`@usebutr/testing`).

## Decision

**Demos remain standalone, self-contained reference implementations.**

The duplication is intentional and serves a real purpose:

1. **Pedagogical clarity.** A reader landing on `apps/demo-with-viem`
   should be able to understand the entire wallet-connection +
   transaction flow by reading one file top-to-bottom, without chasing
   imports into a shared scaffolding package.
2. **Integration honesty.** Each demo's role is to exercise _one_ third-
   party integration (`viem`, `wagmi`, `@solana/kit`, `@mysten/sui`,
   etc.). A shared `Connected` scaffold would obscure where the
   integration-specific code begins and ends.
3. **Standalone status.** The demos function as templates a downstream
   consumer might copy. A copy with no external scaffolding dependency
   is a meaningfully better starting point than one that requires
   installing `@usebutr/demo-ui`.

We accept the maintenance cost: design / accessibility / wording changes
touch N files. The cost is real but the value of standalone clarity is
real too, and demos rarely need cross-cutting changes.

## Consequences

- Some lint rules don't apply to demos. `max-lines` is disabled for
  `apps/demo-*/src/**/*.tsx` via the per-file override in
  `oxlint.config.ts`. Other rules can be added there if the standalone
  posture justifies it.
- A future architecture review will see the duplication and may
  re-surface this as a candidate. This ADR is the rejection record.
- If we ever ship a `@usebutr/components` package as a _product_ (not
  internal scaffolding), the calculus changes — that would be a UI
  library, not extracted demo scaffolding.

## Alternatives considered

1. **Extract `@usebutr/demo-ui` package with `ConnectedWalletCard`,
   `AccountRow`, `ChainPicker`.** Rejected — see Decision §1 and §2.
2. **Extract via `@usebutr/testing` sub-path.** Rejected for the same
   reason; mixing test helpers with demo UI muddles the package.
3. **Pick one canonical demo (`demo-vite`) and have others import from
   it.** Rejected — cross-app imports inside the monorepo entangle the
   demos and break the standalone copy story.
