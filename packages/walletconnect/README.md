# @usebutr/walletconnect

WalletConnect v2 adapter for butr.

Part of [butr](https://www.usebutr.com), a multi-chain wallet discovery and
connection-state library. Your application owns the picker UI and chain client.

## Install

```bash
npm install @usebutr/walletconnect @walletconnect/universal-provider zustand
```

Supply your Reown project ID and render the pairing URI with your own QR UI. Register the returned adapters with butr. Each namespace shares the paired session; Sui and Bitcoin are also supported.

## Usage

```tsx
import { createWalletConnectAdapters } from "@usebutr/walletconnect";

export const makeAdapters = (projectId: string, showQr: (uri: string) => void) =>
  createWalletConnectAdapters({
    namespaces: { evm: ["eip155:1"], svm: ["solana:mainnet"] },
    onPairingUri: showQr,
    projectId,
  });
```

## Documentation

- [Package reference](https://docs.usebutr.com/api/walletconnect)
- [Getting started](https://docs.usebutr.com/getting-started/quickstart)
- [Examples and source](https://github.com/pedroapfilho/usebutr)
- [Report an issue](https://github.com/pedroapfilho/usebutr/issues)

## License

[MIT](./LICENSE), copyright 2026 Pedro Filho.
