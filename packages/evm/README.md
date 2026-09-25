# @usebutr/evm

EIP-1193 / EIP-6963 / injected wallet discovery + adapters for butr.

Part of [butr](https://www.usebutr.com), a multi-chain wallet discovery and
connection-state library. Your application owns the picker UI and chain client.

## Install

```bash
npm install @usebutr/react @usebutr/core @usebutr/evm zustand
```

React 19 is a peer dependency of the provider. Discovery does not render a connect modal; add your picker as the provider child. `discoverEvmAdapters` (EIP-6963) and `discoverInjectedAdapter` (the legacy `window.ethereum` fallback) are wallet sources as-is; `autoDiscovery()` from `@usebutr/wallets` combines both with the other platforms.

## Usage

```tsx
import type { ReactNode } from "react";
import type { WalletManagerConfig } from "@usebutr/core";
import { discoverEvmAdapters } from "@usebutr/evm";
import { WalletManagerProvider } from "@usebutr/react";

const config: WalletManagerConfig = { sources: [discoverEvmAdapters] };

export const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider config={config}>{children}</WalletManagerProvider>
);
```

Every EVM adapter defines `requestAccounts`, `switchChain`, `signMessage`, `sendTx`, `getBalance`, `getTransactionReceipt` and `subscribe`. `getSigner()` resolves `{ kind: "eip1193", provider }` for your own viem or ethers client. Chain registries (`EVM_CHAINS`, `EVM_CHAINS_LIST`) live in `@usebutr/core`.

```ts
import type { ConnectedWallet } from "@usebutr/core";
import { EVM_CHAINS } from "@usebutr/core";

// `sendTx` switches the wallet to `chain` first when it is elsewhere, and
// sends from `account`, which must be one the wallet exposes.
export const pay = (wallet: ConnectedWallet<"evm">, to: string) =>
  wallet.connector.sendTx?.(
    { to, value: 10_000_000_000_000_000n },
    { account: wallet.account, chain: EVM_CHAINS.base },
  );
```

## Documentation

- [Package reference](https://docs.usebutr.com/api/evm)
- [Getting started](https://docs.usebutr.com/getting-started/quickstart)
- [Examples and source](https://github.com/pedroapfilho/usebutr)
- [Report an issue](https://github.com/pedroapfilho/usebutr/issues)

## License

[MIT](./LICENSE), copyright 2026 Pedro Filho.
