---
"@usebutr/core": major
---

Add chain targets, the one place adapters resolve the chain and the account of a call. `createRoutedChainTarget` (Wallet Standard, WalletConnect), `createSwitchingChainTarget` (injected EVM, UniSat, Xverse), `createFixedChainTarget` (Ledger) and `createAccountTarget` (Polkadot injectedWeb3) check the chain's namespace, whether the transport can reach it, and whether the wallet exposes the requested account. EVM addresses match case-insensitively; every other namespace matches exactly.

- A chain the transport cannot reach throws a `ConnectionError` of kind `ChainMismatch`, an account the wallet does not expose throws the new `AccountNotExposed` kind, and a wallet that exposes nothing throws `NotConnected`. A `switch` over `ConnectionErrorKind` needs a case for `AccountNotExposed`.
- `createConnectorEmitter` is the listener set behind an adapter's `subscribe`.
- The connector contract now says it outright: adapters forward the wallet's account list as is, `accountsChanged` with an empty list means disconnected, and `disconnected` is for signals that end the session itself.
