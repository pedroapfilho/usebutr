# @usebutr/sui

Wallet Standard adapter for butr (Sui).

Part of [butr](https://www.usebutr.com), a multi-chain wallet discovery and
connection-state library. Your application owns the picker UI and chain client.

## Install

```bash
npm install @usebutr/react @usebutr/core @usebutr/sui zustand @wallet-standard/app
```

React 18+ is a peer dependency of the provider. Discovery does not render a connect modal; add your picker as the provider child. `@wallet-standard/app` is required for Wallet Standard discovery.

## Usage

```tsx
import type { ReactNode } from "react";
import { createWalletSource } from "@usebutr/core";
import { discoverSuiAdapters } from "@usebutr/sui";
import { WalletManagerProvider } from "@usebutr/react";

const discovery = createWalletSource(discoverSuiAdapters);
export const WalletProvider = ({ children }: { children: ReactNode }) => (
  <WalletManagerProvider discovery={discovery}>{children}</WalletManagerProvider>
);
```

## Documentation

- [Package reference](https://docs.usebutr.com/api/sui)
- [Getting started](https://docs.usebutr.com/getting-started/quickstart)
- [Examples and source](https://github.com/pedroapfilho/usebutr)
- [Report an issue](https://github.com/pedroapfilho/usebutr/issues)

## License

[MIT](./LICENSE), copyright 2026 Pedro Filho.
