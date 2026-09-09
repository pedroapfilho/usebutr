# @usebutr/ledger

Ledger hardware-wallet adapter for butr (EVM + SVM + Sui + Bitcoin).

Part of [butr](https://www.usebutr.com), a multi-chain wallet discovery and
connection-state library. Your application owns the picker UI and chain client.

## Install

```bash
npm install @usebutr/ledger @ledgerhq/hw-app-eth @ledgerhq/hw-transport-webusb zustand
```

WebUSB requires a supported Chromium browser and a user gesture for device access. Register the returned adapter with butr. For Solana, Sui, or Bitcoin, install the corresponding Ledger app package instead of `hw-app-eth`. Ledger adapters sign; your chain client owns RPC and submission.

## Usage

```tsx
import { createLedgerAdapter } from "@usebutr/ledger";

// Call from your connect UI, with the Ethereum app open on the device.
export const makeLedger = () =>
  createLedgerAdapter({ accountCount: 1, chainId: 1, platform: "evm" });
```

## Documentation

- [Package reference](https://docs.usebutr.com/api/ledger)
- [Getting started](https://docs.usebutr.com/getting-started/quickstart)
- [Examples and source](https://github.com/pedroapfilho/usebutr)
- [Report an issue](https://github.com/pedroapfilho/usebutr/issues)

## License

[MIT](./LICENSE), copyright 2026 Pedro Filho.
