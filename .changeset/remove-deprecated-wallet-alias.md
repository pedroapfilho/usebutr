---
"@usebutr/core": major
---

**Breaking:** the deprecated `Wallet` type alias is removed from `@usebutr/core`.

Migration: import `WalletBase` instead (`type Wallet = WalletBase` was all the alias ever was), or the per-platform surface you actually mean: `EvmWallet`, `SvmWallet`, `SuiWallet`, `BitcoinWallet`, `PolkadotWallet`.
