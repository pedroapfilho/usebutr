---
"@usebutr/bitcoin": patch
"@usebutr/core": patch
"@usebutr/evm": patch
"@usebutr/ledger": patch
"@usebutr/polkadot": patch
"@usebutr/sui": patch
"@usebutr/svm": patch
"@usebutr/wallet-standard-shared": patch
"@usebutr/walletconnect": patch
---

Bump runtime dependency floors (`@wallet-standard/app` 1.1.1, `@ledgerhq/*` latest minors, `@walletconnect/universal-provider` 2.23.10) and modernize public type declarations from method signatures to property function types (oxlint `method-signature-style`). Type-level only — no runtime behavior change.
