---
"@usebutr/wallet-standard-shared": major
"@usebutr/svm": patch
"@usebutr/sui": patch
"@usebutr/bitcoin": patch
"@usebutr/polkadot": patch
---

Scope Wallet Standard account reads, events, and signing to each account's advertised chains and operation features. Mixed-platform wallets no longer expose foreign accounts through another platform's adapter, and unsupported account/chain pairs fail before reaching a signing feature.

Adapter authors must replace separate `resolveAccount` and `resolveChainId` calls with `resolveTarget(feature, options)`, which returns `{ account, chain }` together. Use `toAccount(rawAccount)` to validate sign-in results on the current chain. Registry chain aliases remain supported.
