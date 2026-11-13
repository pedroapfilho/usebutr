# @usebutr/adapter-kit

Building blocks for butr wallet adapters: chain targets, the connector emitter and adapter helpers.

Part of [butr](https://www.usebutr.com), a multi-chain wallet discovery and
connection-state library. Your application owns the picker UI and chain client.

## Install

```bash
npm install @usebutr/adapter-kit @usebutr/core zustand
```

For adapter authors. Every built-in transport is built on this package; an app that only connects wallets never imports it.

## Usage

```ts
import { createConnectorEmitter, createRoutedChainTarget, toWalletKey } from "@usebutr/adapter-kit";
import type { SvmAdapter } from "@usebutr/core";

const emitter = createConnectorEmitter();

const target = createRoutedChainTarget({
  accounts: () => wallet.accounts,
  chains: () => wallet.chains,
  chainsOf: (account) => account.chains,
  emit: emitter.emit,
  platform: "svm",
  start: wallet.chains[0],
  wallet: wallet.name,
});

export const adapter: SvmAdapter = {
  chainPlatform: "svm",
  connect: () => wallet.connect(),
  getAccounts: () => Promise.resolve(target.accounts()),
  getSigner: () => Promise.resolve({ kind: "wallet-standard", wallet }),
  id: "my-wallet",
  name: wallet.name,
  subscribe: emitter.subscribe,
  walletKey: toWalletKey(wallet.name),
  ...(target.switchChain !== undefined && { switchChain: target.switchChain }),
};
```

- **Chain targets** resolve the chain and account of each call, and raise the same `ConnectionError` kind for the same refusal on every transport: `createRoutedChainTarget` (Wallet Standard, WalletConnect), `createSwitchingChainTarget` (injected EVM, Unisat, Xverse), `createFixedChainTarget` (Ledger) and `createAccountTarget` (Polkadot injectedWeb3).
- **The routed target** holds the chain a call without `chain` goes to, translates between registry ids and the ids the transport names its chains by, and owns `switchChain`.
- **`createConnectorEmitter`** is the listener set behind an adapter's `subscribe`.
- **`toWalletKey(name)`** gives every adapter of one wallet the same `walletKey`.
- **`sanitizeIcon`** and **`logWarn`** are what the built-in adapters use for icons and warnings.

Run `describeAdapterContract` from `@usebutr/testing/contract` against an adapter you build.

## Documentation

- [Package reference](https://docs.usebutr.com/api/adapter-kit)
- [Getting started](https://docs.usebutr.com/getting-started/quickstart)
- [Examples and source](https://github.com/pedroapfilho/usebutr)
- [Report an issue](https://github.com/pedroapfilho/usebutr/issues)

## License

[MIT](./LICENSE), copyright 2026 Pedro Filho.
