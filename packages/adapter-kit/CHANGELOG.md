# @usebutr/adapter-kit

## 1.0.0

### Major Changes

- [#263](https://github.com/pedroapfilho/usebutr/pull/263) [`f0cde59`](https://github.com/pedroapfilho/usebutr/commit/f0cde595762c4f942171334408fb115c42949c25) Thanks [@pedroapfilho](https://github.com/pedroapfilho)! - Adapter building blocks get their own package, the routed chain target owns the current chain, `restore()` replaces `connect({ silent })`, and every adapter carries the key of the wallet it belongs to.

  **`@usebutr/adapter-kit` is new.** It holds what adapters are built from, so an app that only connects wallets no longer takes a major when those change.

  - `createAccountTarget`, `createRoutedChainTarget`, `createSwitchingChainTarget`, `createFixedChainTarget`, `createConnectorEmitter`, `sanitizeIcon` and `logWarn` moved from `@usebutr/core` to `@usebutr/adapter-kit`. Change the import; the names are the same.
  - `createRoutedChainTarget` takes `{ accounts, chains, chainsOf, emit, start, platform, wallet }` instead of `{ advertised, current, platform, wallet }`. It now holds the chain a call without `chain` goes to, translates between registry ids and the ids the transport names its chains by, and defines `switchChain` when more than one chain is reachable. `resolve(options)` returns the account and chain of one call, `accounts()` the accounts on the current chain, and `chain()` returns the transport's id for the chain, not the registry id.
  - Before a WalletConnect session exists, a call naming a configured chain rejects with `NotConnected` instead of `ChainMismatch`.

  **`restore()` replaces `connect({ silent: true })`.**

  - `Connector.connect` takes no options. `Connector.restore?: () => Promise<void>` is hydration's silent reconnect, defined only where a reconnect can succeed without a prompt.
  - Ledger and injected Polkadot adapters define no `restore`. Hydration reports their wallets in `dropped` with a `NotConnected` reason; before, a Ledger was reported as `Unknown`.
  - A hand-rolled adapter that read `options.silent` moves that branch into `restore`. One that rejected a silent connect deletes the branch.
  - `createFakeAdapter` fakes define `restore`. A test that overrode `connect` to fail a silent reconnect overrides `restore` instead.

  **Every adapter has a `walletKey`.**

  - `Connector.walletKey: string` is the same on every adapter of one wallet, across platforms and channels: `phantom` on its EIP-6963, Solana and Sui adapters. A hand-rolled adapter must set it: `toWalletKey(name)` from `@usebutr/adapter-kit`, or a literal.
  - `groupByWallet(adapters)` in `@usebutr/core` lists each wallet once as `{ adapters, icon, name, walletKey }`. It replaces grouping by name in your picker.
  - `autoDiscovery()` lists a wallet once per platform by its key, not by a normalized name.
  - butr no longer adds a platform to a wallet's name. The injected OKX Bitcoin adapter is named `OKX Wallet` (was `OKX Wallet (Bitcoin)`), and every adapter of a multi-namespace `createWalletConnectAdapters` call is named `WalletConnect` (was `WalletConnect (EVM)` and so on). Their ids are unchanged. Tell platforms apart by `chainPlatform`.
  - `EvmIdentity`, the first argument of `buildEvmAdapter` and `createEip1193Core`, requires `walletKey`.
  - `StoredPoolEntry` carries `walletKey`. Connections persisted by an earlier version lack it and are dropped on the first load, so each user reconnects once. A cookie or custom snapshot you build by hand needs the field.

  **The chain registry.**

  - `EVM_CHAINS_LIST`, `SVM_CHAINS_LIST`, `SUI_CHAINS_LIST`, `BITCOIN_CHAINS_LIST` and `POLKADOT_CHAINS_LIST` are removed. Use `CHAINS_BY_PLATFORM.evm` and so on.
  - `ChainBase` has an optional `nativeCurrency: { decimals, symbol }`, set on every registry chain. EVM `getBalance()` labels the native balance from it.

### Patch Changes

- Updated dependencies [[`f0cde59`](https://github.com/pedroapfilho/usebutr/commit/f0cde595762c4f942171334408fb115c42949c25), [`0a72f02`](https://github.com/pedroapfilho/usebutr/commit/0a72f02b2f0373687c703146b905e06e13b9df68), [`d373ef9`](https://github.com/pedroapfilho/usebutr/commit/d373ef9056e9aaad3e12b92732f4c5fe8c839d55)]:
  - @usebutr/core@6.0.0
