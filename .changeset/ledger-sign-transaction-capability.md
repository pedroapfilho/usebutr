---
"@usebutr/ledger": minor
---

Fix `capabilities.signTransaction` on the Solana, Sui and Bitcoin Ledger adapters. All three implement `signTransaction` but advertised `signTransaction: false`, so consumers gating their UI on the capability flag hid a working sign-only path.

This changes what a capability query returns: `createLedgerAdapter({ platform: "svm" | "sui" | "bitcoin" })` now reports `signTransaction: true`. Code that branches on the flag will start taking the sign-only branch on those three platforms. The EVM adapter has no `signTransaction` method and keeps `signTransaction: false`, and the exported `LEDGER_CAPABILITIES` constant is unchanged.
