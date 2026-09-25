---
"@usebutr/bitcoin": patch
"@usebutr/core": patch
"@usebutr/evm": patch
"@usebutr/polkadot": patch
"@usebutr/react": patch
"@usebutr/sui": patch
"@usebutr/svm": patch
"@usebutr/testing": patch
"@usebutr/wallet-standard-shared": patch
"@usebutr/walletconnect": patch
---

Type `WalletStandardWallet.features` as a partial record, since a wallet advertises only the features it implements, and read first array entries through `.at(0)` so empty-array guards match their types.
