---
"@usebutr/bitcoin": major
"@usebutr/evm": major
"@usebutr/ledger": major
"@usebutr/polkadot": major
"@usebutr/sui": major
"@usebutr/svm": major
"@usebutr/wallet-standard-shared": major
"@usebutr/walletconnect": major
---

Every adapter resolves the chain and account of a call through `@usebutr/core`'s chain targets, so the same refusal raises the same `ConnectionError` kind everywhere, before the wallet is asked.

- Wallet Standard and WalletConnect adapters reject a chain the wallet does not advertise or the session did not approve with `ChainMismatch`, instead of a plain `Error` that `toConnectionError` classified as `Unknown`. A chain from another namespace rejects with `ChainMismatch` on every adapter.
- An account the wallet does not expose rejects with `AccountNotExposed` on every adapter, and a wallet that exposes none with `NotConnected`.
- Ledger EVM matches addresses case-insensitively, so a lowercase address of an exposed account no longer rejects.
- Xverse treats its payment and ordinals addresses as one exposed set: `getAccounts()` lists both, payment first.
- `subscribe` forwards the wallet's account list as is. An empty list now arrives as `accountsChanged` with no accounts instead of `disconnected`; the wallet manager treats both as a disconnect. Wallet Standard unregistering, a deleted WalletConnect session and an EIP-1193 `disconnect` still emit `disconnected`.
