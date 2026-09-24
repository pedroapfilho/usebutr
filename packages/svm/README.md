# @usebutr/svm

Wallet Standard adapter for butr (Solana / SVM).

Part of [butr](https://www.usebutr.com), a multi-chain wallet discovery and
connection-state library. Your application owns the picker UI and chain client.

## Install

```bash
npm install @usebutr/react @usebutr/core @usebutr/svm zustand @wallet-standard/app
```

React 19 is a peer dependency of the provider. Discovery does not render a connect modal; add your picker as the provider child. `@wallet-standard/app` is required for Wallet Standard discovery.

## Usage

```tsx
import type { ReactNode } from "react";
import type { WalletManagerConfig } from "@usebutr/core";
import { discoverSvmAdapters } from "@usebutr/svm";
import { WalletManagerProvider } from "@usebutr/react";

// Every `discover*Adapters` export is a wallet source as-is.
const config: WalletManagerConfig = { sources: [discoverSvmAdapters] };

export const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider config={config}>{children}</WalletManagerProvider>
);
```

Each adapter defines `sendTx` (`solana:signAndSendTransaction`, resolves the base58 signature), `signMessage`, `signTransaction` (resolves the signed transaction bytes) and `signIn` (Sign In With Solana) only when the wallet advertises the matching feature, and `switchChain` only when it advertises more than one Solana cluster. Wallet Standard carries the chain per call, so `options.chain` routes one transaction without moving the wallet. Balances and receipts need your own RPC client. Check a method's presence before calling it:

```ts
import type { ConnectedWallet } from "@usebutr/core";
import { SVM_CHAINS } from "@usebutr/core";

export const send = async (wallet: ConnectedWallet<"svm">, serializedTx: Uint8Array) => {
  if (!wallet.connector.sendTx) {
    throw new Error(`${wallet.connector.name} cannot send Solana transactions`);
  }
  return wallet.connector.sendTx(serializedTx, {
    account: wallet.account,
    chain: SVM_CHAINS.devnet,
  });
};
```

An `account` the wallet does not expose, or a chain it does not advertise, rejects. `getSigner()` resolves `{ kind: "wallet-standard", wallet }`: reach any other feature with `getFeature` from `@usebutr/wallet-standard-shared` and the feature types this package exports. Chain registries (`SVM_CHAINS`, `SVM_CHAINS_LIST`) come from `@usebutr/core`.

## Documentation

- [Package reference](https://docs.usebutr.com/api/svm)
- [Getting started](https://docs.usebutr.com/getting-started/quickstart)
- [Examples and source](https://github.com/pedroapfilho/usebutr)
- [Report an issue](https://github.com/pedroapfilho/usebutr/issues)

## License

[MIT](./LICENSE), copyright 2026 Pedro Filho.
