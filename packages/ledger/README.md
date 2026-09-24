# @usebutr/ledger

Ledger hardware-wallet adapter for butr (EVM + SVM + Sui + Bitcoin).

Part of [butr](https://www.usebutr.com), a multi-chain wallet discovery and
connection-state library. Your application owns the picker UI and chain client.

## Install

```bash
npm install @usebutr/core @usebutr/ledger @ledgerhq/hw-transport-webusb @ledgerhq/hw-app-eth zustand
```

WebUSB needs a Chromium browser and a user gesture for device access. Each platform's Ledger app package is an optional peer loaded on first connect: `@ledgerhq/hw-app-eth` (EVM), `@ledgerhq/hw-app-solana` (SVM), `@ledgerhq/hw-app-sui` (Sui) or `@ledgerhq/hw-app-btc` (Bitcoin). Install the ones you use.

## Usage

Factories resolve an adapter, so hand them to the manager through `fromAdapters`:

```tsx
import { EVM_CHAINS, fromAdapters } from "@usebutr/core";
import type { WalletManagerConfig } from "@usebutr/core";
import { createLedgerAdapter } from "@usebutr/ledger";
import { autoDiscovery } from "@usebutr/wallets";

const config: WalletManagerConfig = {
  sources: [
    autoDiscovery(),
    fromAdapters(
      Promise.all([
        createLedgerAdapter({ chainId: EVM_CHAINS.sepolia.id, id: "ledger-evm", platform: "evm" }),
        createLedgerAdapter({ accountCount: 3, id: "ledger-svm", platform: "svm" }),
      ]),
    ),
  ],
};
```

`connect()` opens the WebUSB prompt and reads `accountCount` addresses from the device, active first. `chainId` is a CAIP-2 id and defaults to the platform's mainnet. Ledger apps have no network switch, so there is no `switchChain`: build one adapter per chain.

A Ledger signs; your chain client owns RPC and broadcast. There is no `sendTx`, `getBalance` or `subscribe`. What each adapter defines:

- EVM: `signMessage` (EIP-191 `r || s || v`).
- SVM: `signMessage` and `signTransaction`, which resolves the whole signed transaction (legacy or v0).
- Sui: `signTransaction` on BCS transaction bytes.
- Bitcoin: `signMessage` (BIP-137 compact signature) and `signTransaction` on PSBT bytes.

Pass `{ account }` to sign as another exposed account; an account the device did not expose rejects. For anything else, `getSigner()` hands back the device app:

```ts
const signer = await wallet.connector.getSigner();
if (signer.kind === "ledger-evm") {
  const { r, s, v } = await signer.app.signTransaction("44'/60'/0'/0/0", unsignedTxHex);
}
```

## Documentation

- [Package reference](https://docs.usebutr.com/api/ledger)
- [Getting started](https://docs.usebutr.com/getting-started/quickstart)
- [Examples and source](https://github.com/pedroapfilho/usebutr)
- [Report an issue](https://github.com/pedroapfilho/usebutr/issues)

## License

[MIT](./LICENSE), copyright 2026 Pedro Filho.
