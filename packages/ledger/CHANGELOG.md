# @usebutr/ledger

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
