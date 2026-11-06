---
"@usebutr/core": major
"@usebutr/wallet-standard-shared": major
"@usebutr/bitcoin": patch
"@usebutr/evm": patch
"@usebutr/ledger": patch
"@usebutr/polkadot": patch
"@usebutr/sui": patch
"@usebutr/svm": patch
"@usebutr/testing": patch
"@usebutr/walletconnect": patch
"@usebutr/wallets": patch
---

Each platform's chain facts have one source. `CHAIN_NAMESPACES` maps a platform to its CAIP-2 namespace and `DEFAULT_CHAINS` maps it to its mainnet, and every adapter reads them instead of restating the namespace string and the default chain.

- The chain targets (`createAccountTarget`, `createRoutedChainTarget`, `createSwitchingChainTarget`, `createFixedChainTarget`) take `platform` instead of `namespace`: `createSwitchingChainTarget({ platform: "evm", … })`.
- `createWalletStandardCore` takes `platform` instead of `chains`, `namespace` and `label`, and `preferredChainIds` defaults to the platform's mainnet.
- `buildBalance(value, decimals, symbol)` builds a `Balance` with its `formatted` string, the rule EVM balances and the fake adapter already followed.
- `logWarn` adds the `[butr]` prefix itself, and `logError` is no longer exported.
- The chain targets resolve a chain named by an alias to its registry id, so a Solana cluster named by its genesis hash routes over WalletConnect as it already did over Wallet Standard.
- A key the default storage cannot read loads as empty and is never written for the rest of the session; before, the first save deleted it. After a custom `load` rejects, the manager saves nothing for the session instead of overwriting the storage with the empty state that stood in for it.
- `manager.requestAccounts` rejects with a `ConnectionError`, like `connect`.
