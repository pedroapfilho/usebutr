# @usebutr/ledger

## 0.2.5

### Patch Changes

- 937dfae: Bump runtime dependency floors (`@wallet-standard/app` 1.1.1, `@ledgerhq/*` latest minors, `@walletconnect/universal-provider` 2.23.10) and modernize public type declarations from method signatures to property function types (oxlint `method-signature-style`). Type-level only — no runtime behavior change.
- Updated dependencies [937dfae]
  - @usebutr/core@0.4.1

## 0.2.4

### Patch Changes

- a46eecd: Ship unminified ESM so downstream bundlers (Vite/esbuild dep pre-bundling) process the package correctly; fixes a ReferenceError in consumer dev servers. The consuming app minifies once at its own build.
- Updated dependencies [b5322ae]
- Updated dependencies [d5f32c7]
- Updated dependencies [a46eecd]
  - @usebutr/core@0.4.0

## 0.2.3

### Patch Changes

- Updated dependencies [886ee1d]
  - @usebutr/core@0.3.0

## 0.2.2

### Patch Changes

- Updated dependencies [db5d7e9]
  - @usebutr/core@0.2.2

## 0.2.1

### Patch Changes

- Updated dependencies [f846e77]
  - @usebutr/core@0.2.1

## 0.2.0

### Minor Changes

- b77a477: Add Ledger hardware-wallet app factories for Solana, Sui, and Bitcoin alongside EVM. `createLedgerAdapter` dispatches on a required `platform` field; the per-platform factories `createEvmLedgerAdapter`, `createSvmLedgerAdapter`, `createSuiLedgerAdapter`, and `createBitcoinLedgerAdapter` are also exported. Each loads its Ledger app module (`@ledgerhq/hw-app-eth` / `-solana` / `-sui` / `-btc`) on demand.

### Patch Changes

- Updated dependencies [b77a477]
  - @usebutr/core@0.2.0
