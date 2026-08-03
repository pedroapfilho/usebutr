---
"@usebutr/wallet-standard-shared": minor
---

Export `buildWalletCapabilities`, the Wallet Standard capability mapping that `@usebutr/svm`, `@usebutr/sui`, `@usebutr/bitcoin` and `@usebutr/polkadot` each re-implemented. It takes a flat feature profile and owns the flags that are constant across every namespace, so only the feature-name mapping stays per-package.
