# @usebutr/wallets

Batteries-included EVM + SVM + Sui + Bitcoin + Polkadot discovery: `autoDiscovery()`, one `WalletSource` for every platform.

Part of [butr](https://www.usebutr.com), a multi-chain wallet discovery and
connection-state library. Your application owns the picker UI and chain client.

## Install

```bash
npm install @usebutr/react @usebutr/wallets zustand
```

`autoDiscovery()` discovers all five platforms by default and installs `@wallet-standard/app` for Wallet Standard discovery.

## Usage

```tsx
import type { WalletManagerConfig } from "@usebutr/core";
import {
  WalletManagerProvider,
  useConnect,
  useDiscoveredWallets,
  useIsHydrated,
} from "@usebutr/react";
import { autoDiscovery } from "@usebutr/wallets";

const config: WalletManagerConfig = { sources: [autoDiscovery()] };

const WalletPicker = () => {
  const wallets = useDiscoveredWallets();
  const { connect } = useConnect();
  const hydrated = useIsHydrated();
  if (!hydrated) return null;
  return wallets.map(({ id, name }) => (
    <button key={id} onClick={() => void connect(id)} type="button">
      Connect {name}
    </button>
  ));
};

export const App = () => (
  <WalletManagerProvider config={config}>
    <WalletPicker />
  </WalletManagerProvider>
);
```

Pass a platform list to discover only those, e.g. `autoDiscovery(["evm", "svm"])`.
`autoDiscovery(undefined, { fallbacks: false })` skips the secondary channels
(`window.ethereum`, injected Bitcoin wallets, Polkadot Wallet Standard).
Chain registries (`EVM_CHAINS`, `CHAINS_BY_PLATFORM`, …) live in `@usebutr/core`.

## Documentation

- [Package reference](https://docs.usebutr.com/api/wallets)
- [Getting started](https://docs.usebutr.com/getting-started/quickstart)
- [Examples and source](https://github.com/pedroapfilho/usebutr)
- [Report an issue](https://github.com/pedroapfilho/usebutr/issues)

## License

[MIT](./LICENSE), copyright 2026 Pedro Filho.
