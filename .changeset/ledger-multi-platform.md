---
"@usebutr/ledger": minor
---

Add Ledger hardware-wallet app factories for Solana, Sui, and Bitcoin alongside EVM. `createLedgerAdapter` dispatches on a required `platform` field; the per-platform factories `createEvmLedgerAdapter`, `createSvmLedgerAdapter`, `createSuiLedgerAdapter`, and `createBitcoinLedgerAdapter` are also exported. Each loads its Ledger app module (`@ledgerhq/hw-app-eth` / `-solana` / `-sui` / `-btc`) on demand.
