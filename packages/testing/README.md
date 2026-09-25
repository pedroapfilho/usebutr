# @usebutr/testing

Test helpers for butr: fake adapters, fake persistence, mock storage.

Part of [butr](https://www.usebutr.com), a multi-chain wallet discovery and
connection-state library. Your application owns the picker UI and chain client.

## Install

```bash
npm install --save-dev @usebutr/testing zustand
```

Use these fixtures with your existing test runner. They need no real wallet
and no browser storage.

## Usage

```ts
import { createWalletManager, fromAdapters } from "@usebutr/core";
import {
  createFakeAdapter,
  createFakeConnectedWallet,
  createFakePersistence,
} from "@usebutr/testing";

const metamask = createFakeAdapter({ id: "io.metamask", name: "MetaMask" });
const phantom = createFakeAdapter({ chainPlatform: "svm", id: "phantom", omit: ["signIn"] });
const locked = createFakeAdapter({
  id: "locked",
  overrides: { connect: () => Promise.reject(new Error("wallet is locked")) },
});

const storage = createFakePersistence();
const manager = createWalletManager({
  sources: [fromAdapters([metamask, phantom, locked])],
  storage,
});
manager.start();

await manager.connect("io.metamask");
metamask.emit({ type: "disconnected" }); // the wallet ends the session
console.log(storage.saves.at(-1)); // what the manager persisted
```

### `createFakeAdapter(options?)`

An EVM adapter unless `chainPlatform` says otherwise, with the members a real
wallet on that platform has:

| Platform   | Optional members                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| `evm`      | `getBalance`, `getTransactionReceipt`, `requestAccounts`, `sendTx`, `signMessage`, `subscribe`, `switchChain` |
| `svm`      | `sendTx`, `signIn`, `signMessage`, `signTransaction`, `subscribe`                                             |
| `sui`      | `sendTx`, `signMessage`, `signTransaction`, `subscribe`                                                       |
| `bitcoin`  | `sendTx`, `signMessage`, `signTransaction`, `subscribe`                                                       |
| `polkadot` | `signMessage`, `subscribe`                                                                                    |

It follows the contract: it rejects an `account` it does not expose and a
`chain` from another namespace, switches an EVM wallet before sending to
another chain, and resolves distinct hashes and signatures. `getSigner()`
resolves the `signer` option and rejects without one: the package registers no
signer kind, so your exhaustive `switch (signer.kind)` never grows a test-only
case. Pass `balance` (base units) to set the native balance, which also adds
`getBalance` on non-EVM platforms.

- `accounts`: exposed accounts, active first.
- `omit: ["signMessage"]`: leave members off to test the unsupported path.
- `overrides: { connect }`: replace members, for example with rejections.
- `signer`: the `WalletSigner` that `getSigner()` resolves.
- `emit(event)`: deliver a `ConnectorEvent` to the manager;
  `listenerCount()` shows whether it is still subscribed.

### `createFakeConnectedWallet(options?)`

A `ConnectedWallet` for components and helpers that take one: a fake adapter
plus the accounts it exposes. Takes the adapter options plus `addresses` and
`chain`.

### `createFakePersistence(seed?)`

A `WalletPersistence` over the real `createWalletStorage` with in-memory
drivers. `seed` is what the first `load()` finds; `saves` lists every state
the manager saved.

## Documentation

- [Package reference](https://docs.usebutr.com/testing)
- [Getting started](https://docs.usebutr.com/getting-started/quickstart)
- [Examples and source](https://github.com/pedroapfilho/usebutr)
- [Report an issue](https://github.com/pedroapfilho/usebutr/issues)

## License

[MIT](./LICENSE), copyright 2026 Pedro Filho.
