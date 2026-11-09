---
"@usebutr/evm": major
"@usebutr/wallet-standard-shared": major
"@usebutr/walletconnect": patch
"@usebutr/ledger": patch
"@usebutr/bitcoin": patch
"@usebutr/polkadot": patch
"@usebutr/svm": patch
"@usebutr/sui": patch
---

- `buildEvmAdapter` takes an identity `{ icon?, id, name }` instead of EIP-6963 info, and `createEip1193Core` is every member it builds except `connect`, `disconnect` and `requestAccounts`. WalletConnect's EVM namespace builds on the core instead of stripping members off the injected adapter.
- `createWalletStandardCore` returns `feature(name, method)`, which binds a feature and its call target to one name, in place of `resolveTarget(feature, options)`. A Wallet Standard adapter's `disconnect` and the WalletConnect session's now reject when the wallet's own disconnect fails; the manager already logs that.
- Ledger Bitcoin's default derivation path follows `addressFormat` and the chain: `86'/1'/0'/0` for bech32m on testnet instead of `84'/0'/0'/0`, which the device refused.
- sats-connect errors keep the wallet's error as `cause`, and injected Polkadot reports a connect that exposes no account as `NotConnected`.
