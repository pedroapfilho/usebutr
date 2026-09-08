# @usebutr/polkadot

injectedWeb3 + Wallet Standard adapter for butr (Polkadot/Substrate).

Part of [butr](https://www.usebutr.com), a multi-chain wallet discovery and
connection-state library. Your application owns the picker UI and chain client.

## Install

```bash
npm install @usebutr/react @usebutr/core @usebutr/polkadot zustand
```

React 18+ is a peer dependency of the provider. Discovery does not render a connect modal; add your picker as the provider child. This example uses injectedWeb3. Use `@usebutr/wallets` to also compose the Wallet Standard fallback.

## Usage

```tsx
import type { ReactNode } from "react";
import { createWalletSource } from "@usebutr/core";
import { discoverInjectedPolkadotAdapters } from "@usebutr/polkadot";
import { WalletManagerProvider } from "@usebutr/react";

const discovery = createWalletSource(discoverInjectedPolkadotAdapters);
export const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider discovery={discovery}>{children}</WalletManagerProvider>
);
```

## Documentation

- [Package reference](https://docs.usebutr.com/api/polkadot)
- [Getting started](https://docs.usebutr.com/getting-started/quickstart)
- [Examples and source](https://github.com/pedroapfilho/usebutr)
- [Report an issue](https://github.com/pedroapfilho/usebutr/issues)

## License

[MIT](./LICENSE), copyright 2026 Pedro Filho.
