# @usebutr/react

React provider and hooks for butr. Depends on @usebutr/core, react, zustand.

Part of [butr](https://www.usebutr.com), a multi-chain wallet discovery and
connection-state library. Your application owns the picker UI and chain client.

## Install

```bash
npm install @usebutr/react @usebutr/wallets zustand
```

React 18+ is a peer dependency. Run this inside an existing React app; the picker UI belongs to your application.

## Usage

```tsx
import {
  WalletManagerProvider,
  useConnectWallet,
  useDiscoveredWallets,
  useIsHydrated,
} from "@usebutr/react";
import { autoDiscovery } from "@usebutr/wallets";

const discovery = autoDiscovery();
const WalletPicker = () => {
  const wallets = useDiscoveredWallets();
  const connect = useConnectWallet();
  const hydrated = useIsHydrated();
  if (!hydrated) return null;
  return wallets.map(({ id, name }) => (
    <button key={id} onClick={() => connect(id)} type="button">
      Connect {name}
    </button>
  ));
};
export const App = () => (
  <WalletManagerProvider discovery={discovery}>
    <WalletPicker />
  </WalletManagerProvider>
);
```

## Documentation

- [Package reference](https://docs.usebutr.com/api/react)
- [Getting started](https://docs.usebutr.com/getting-started/quickstart)
- [Examples and source](https://github.com/pedroapfilho/usebutr)
- [Report an issue](https://github.com/pedroapfilho/usebutr/issues)

## License

[MIT](./LICENSE), copyright 2026 Pedro Filho.
