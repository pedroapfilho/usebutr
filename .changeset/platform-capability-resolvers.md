---
"@usebutr/bitcoin": patch
"@usebutr/polkadot": patch
"@usebutr/sui": patch
"@usebutr/svm": patch
---

Resolve capabilities through `buildWalletCapabilities` from `@usebutr/wallet-standard-shared` instead of a per-package copy of the same object literal. Resolver names, input types and returned flags are unchanged. The injected Polkadot profile now derives its chain count from `POLKADOT_CHAINS_LIST` rather than asserting `switchChain: true` directly; the result is the same.
