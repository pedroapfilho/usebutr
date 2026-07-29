---
"@usebutr/wallet-standard-shared": minor
"@usebutr/bitcoin": patch
"@usebutr/polkadot": patch
"@usebutr/sui": patch
"@usebutr/svm": patch
"@usebutr/walletconnect": patch
---

Share the session plumbing behind the Wallet Standard and WalletConnect CAIP adapters. `@usebutr/wallet-standard-shared` now exports `createWalletStandardCore`, which the Bitcoin, Polkadot, Sui and SVM adapters build on; the WalletConnect Bitcoin, Sui and SVM namespaces share an equivalent CAIP core. Every package's public API is unchanged. The one visible difference is a dev-console warning: a failed SVM disconnect now logs `[butr] SVM Wallet Standard disconnect threw:` instead of `[butr] Wallet Standard disconnect threw:`.
