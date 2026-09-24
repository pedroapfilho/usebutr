# @usebutr/core

Core types, store, storage, and discovery seam for butr. No React, no protocols.

Part of [butr](https://www.usebutr.com), a multi-chain wallet discovery and
connection-state library. Your application owns the picker UI and chain client.

## Install

```bash
npm install @usebutr/core zustand
```

The wallet manager works outside React. Pair it with `@usebutr/wallets` (or one
platform's `discover*Adapters`) to find real wallets, or use `@usebutr/react`
for the provider and hooks.

## Usage

```ts
import { createWalletManager, fromAdapters } from "@usebutr/core";
import { autoDiscovery } from "@usebutr/wallets";

const manager = createWalletManager({
  onConnectError: (error, connectorId) => console.warn(connectorId, error.kind),
  sources: [autoDiscovery()],
});

// Creating a manager has no side effects; start() subscribes the sources,
// restores persisted connections once, and bridges wallet events.
const stop = manager.start();

const wallet = await manager.connect("io.metamask");

// A method exists only when it works for this wallet.
if (wallet.connector.signMessage) {
  await wallet.connector.signMessage(new TextEncoder().encode("hello"), {
    account: wallet.account,
  });
}

manager.subscribe((state) => console.log(state.pool.size, state.activeConnectorId));
```

- **Sources.** A `WalletSource` is `(onAdapter) => unsubscribe`, so every
  `discover*Adapters` export goes into `sources` as-is. `fromAdapters(adapters)`
  wraps an array or a promise of built adapters (WalletConnect, Ledger,
  hand-rolled ones). The first adapter announced for an id wins.
- **State.** `getState()` holds the discovered `adapters`, the live `pool`,
  the `selection` per platform, `activeConnectorId`, `reconnectingIds`, and the
  latest attempt's `connectionStatus` / `connectionError`.
- **Actions.** `connect`, `disconnect`, `disconnectAll`, `requestAccounts`,
  `setAccount`, `setActive`, `setSelection`, `clearConnectionError`. `connect`
  resolves the `ConnectedWallet` and rejects with a `ConnectionError` whose
  `kind` is `UserRejected`, `RequestPending`, `WalletLocked`, `ChainMismatch`,
  `NotConnected`, `Timeout`, `WalletNotFound` or `Unknown`.
- **Signers.** `connector.getSigner()` resolves a tagged `WalletSigner`; narrow
  it with `switch (signer.kind)`. Each transport package registers its kind.
- **Chains and accounts.** Every registry lives here (`EVM_CHAINS`,
  `SVM_CHAINS`, `SUI_CHAINS`, `BITCOIN_CHAINS`, `POLKADOT_CHAINS`, their
  `*_LIST`, `CHAINS_BY_PLATFORM`). Adapters build chains with
  `resolveChain(id, list)` and accounts with `buildAccount(address, chain)`.

## Persistence

Connections persist to localStorage and sessionStorage by default, written
after every change once start-up hydration has read what was there. Swap the
drivers with `createWalletStorage({ persistent, session })` (for example
`createCookieStorageDriver()` so a server can read them), or pass any
`WalletPersistence`: an object with `load()` and `save(state)`.

To render connections on the server, read the cookies with
`readWalletSnapshot(cookies)` and pass the snapshot as
`createWalletManager(config, { initialState })`. Seeded wallets render at
once and stay in `reconnectingIds` until their silent reconnect lands.

## Documentation

- [Package reference](https://docs.usebutr.com/api/core)
- [Getting started](https://docs.usebutr.com/getting-started/quickstart)
- [Examples and source](https://github.com/pedroapfilho/usebutr)
- [Report an issue](https://github.com/pedroapfilho/usebutr/issues)

## License

[MIT](./LICENSE), copyright 2026 Pedro Filho.
