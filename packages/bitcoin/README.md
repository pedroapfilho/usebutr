# @usebutr/bitcoin

Wallet Standard + injected (sats-connect / Unisat / OKX) wallet discovery and adapters for butr (Bitcoin).

Part of [butr](https://www.usebutr.com), a multi-chain wallet discovery and
connection-state library. Your application owns the picker UI and chain client.

## Install

```bash
npm install @usebutr/react @usebutr/core @usebutr/bitcoin zustand @wallet-standard/app
```

React 19 is a peer dependency of the provider. Discovery does not render a connect modal; add your picker as the provider child. `@wallet-standard/app` is required for Wallet Standard discovery.

## Usage

```tsx
import type { ReactNode } from "react";
import type { WalletManagerConfig } from "@usebutr/core";
import { discoverBitcoinAdapters } from "@usebutr/bitcoin";
import { WalletManagerProvider } from "@usebutr/react";

const config: WalletManagerConfig = { sources: [discoverBitcoinAdapters] };

export const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider config={config}>{children}</WalletManagerProvider>
);
```

`discoverInjectedBitcoinAdapter` covers wallets that never announce through
Wallet Standard (`window.unisat`, `window.okxwallet.bitcoin`, Xverse's
sats-connect provider, `window.btc`). `bitcoinDiscoverer` pairs both channels
so the injected one stays quiet once Wallet Standard found a Bitcoin wallet;
`autoDiscovery(["bitcoin"])` from `@usebutr/wallets` wires it for you.

## Transactions

A method exists only when the wallet can back it, so check before calling:

```ts
import { BITCOIN_CHAINS } from "@usebutr/core";

if (wallet.connector.sendTx) {
  const txid = await wallet.connector.sendTx(
    { amount: 10_000n, recipient: "tb1q…" }, // satoshis
    { account: wallet.account, chain: BITCOIN_CHAINS.testnet },
  );
}
```

- `sendTx(transfer, { account?, chain? })` asks the wallet to build, sign and
  broadcast a transfer and resolves the txid.
- `signTransaction(psbt, { account?, chain? })` signs PSBT bytes
  (`psbt.toBuffer()`) without broadcasting them.
- `signMessage(message, { account? })` signs a UTF-8 message.

Wallet Standard wallets route `chain` per call and gain `switchChain` when they
advertise more than one Bitcoin network. Injected wallets have one network for
the whole wallet: they switch it before acting (Unisat through
`switchNetwork`, Xverse through `wallet_changeNetwork`), or reject with a
`ChainMismatch` `ConnectionError` when the provider cannot switch (OKX,
`window.btc`). Unisat-style wallets sign with their active account only, and
Xverse sends from its payment address only; any other `account` rejects.

Balances and receipts need an Esplora or Electrum client, which butr does not
ship, so these adapters define neither.

## Signers

`getSigner()` resolves the object the adapter drives, tagged by transport:

```ts
const signer = await wallet.connector.getSigner();
switch (signer.kind) {
  case "wallet-standard": // signer.wallet
  case "unisat": // signer.provider, the UniSat-style provider
  case "sats-connect": // signer.provider, Xverse's BitcoinProvider
}
```

## Documentation

- [Package reference](https://docs.usebutr.com/api/bitcoin)
- [Getting started](https://docs.usebutr.com/getting-started/quickstart)
- [Examples and source](https://github.com/pedroapfilho/usebutr)
- [Report an issue](https://github.com/pedroapfilho/usebutr/issues)

## License

[MIT](./LICENSE), copyright 2026 Pedro Filho.
