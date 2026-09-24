# @usebutr/walletconnect

WalletConnect v2 adapter for butr.

Part of [butr](https://www.usebutr.com), a multi-chain wallet discovery and
connection-state library. Your application owns the picker UI and chain client.

## Install

```bash
npm install @usebutr/walletconnect @walletconnect/universal-provider zustand
```

Supply your Reown project ID and render the pairing URI with your own QR UI. One pairing serves every requested namespace (EVM, Solana, Sui, Bitcoin), with one adapter per namespace. `createWalletConnectAdapters` resolves an array, so `fromAdapters` turns it into a wallet source.

## Usage

```tsx
import type { ReactNode } from "react";
import type { WalletManagerConfig } from "@usebutr/core";
import { fromAdapters } from "@usebutr/core";
import { WalletManagerProvider } from "@usebutr/react";
import { autoDiscovery } from "@usebutr/wallets";
import { createWalletConnectAdapters } from "@usebutr/walletconnect";

const config: WalletManagerConfig = {
  sources: [
    autoDiscovery(),
    fromAdapters(
      createWalletConnectAdapters({
        metadata: { name: "My dapp", url: "https://my-dapp.example" },
        namespaces: {
          evm: ["eip155:1", "eip155:137"],
          svm: ["solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"],
        },
        onPairingUri: (uri) => showQr(uri),
        projectId: "<your Reown project id>",
      }),
    ),
  ],
};

export const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider config={config}>{children}</WalletManagerProvider>
);
```

Without React, pass the same `sources` to `createWalletManager` from `@usebutr/core`.

## What each namespace does

Every call names its CAIP-2 chain, so a Solana request never reaches the EVM side of a shared session. `options.chain` routes one call; it must be a chain the session approved. `options.account` must be an account the session exposes.

- **EVM** is the injected EVM adapter over the session: `getSigner()` resolves `{ kind: "eip1193", provider }`, `sendTx({ chain })` switches the wallet first, and `getBalance`, `getTransactionReceipt` and `subscribe` work as usual; `subscribe` ignores the other namespaces' account and chain events. There is no `requestAccounts`: more accounts means re-pairing.
- **Solana, Sui and Bitcoin** define `signMessage`, `sendTx`, `signTransaction` and `subscribe`, plus `switchChain` when more than one chain is configured. `subscribe` reports the new chain's accounts after `switchChain`, and `disconnected` when the wallet ends the session. `getSigner()` resolves `{ kind: "walletconnect", chainId, provider }`; pass `chainId` as `provider.request`'s second argument.
- Solana chains are CAIP-2 genesis-hash ids (`solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` is mainnet, the default), which is what WalletConnect wallets approve. Solana `signTransaction` resolves the full signed transaction, splicing in the signature when the wallet returns only that. Sui accepts a `Transaction` (anything with `toJSON()`), its JSON string or BCS bytes.
- Bitcoin `sendTx({ amount, recipient })` is WalletConnect's `sendTransfer` (`amount` in satoshis). `signTransaction(psbt)` returns the signed PSBT without broadcasting it.

## Documentation

- [Package reference](https://docs.usebutr.com/api/walletconnect)
- [Getting started](https://docs.usebutr.com/getting-started/quickstart)
- [Examples and source](https://github.com/pedroapfilho/usebutr)
- [Report an issue](https://github.com/pedroapfilho/usebutr/issues)

## License

[MIT](./LICENSE), copyright 2026 Pedro Filho.
