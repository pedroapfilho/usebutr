# @usebutr/core

Core types, store, storage, and discovery seam for butr. No React, no protocols.

Part of [butr](https://www.usebutr.com), a multi-chain wallet discovery and
connection-state library. Your application owns the picker UI and chain client.

## Install

```bash
npm install @usebutr/core zustand
```

The store works outside React. Add a discovery source or your own connector factory when wiring real wallets.

## Usage

```tsx
import { createWalletStore } from "@usebutr/core";

export const store = createWalletStore({
  connectors: [],
  createConnector: () => null,
});

// Read state from a non-React host.
const wallets = store.getState().pool;
console.log(wallets.size);
```

## Documentation

- [Package reference](https://docs.usebutr.com/api/core)
- [Getting started](https://docs.usebutr.com/getting-started/quickstart)
- [Examples and source](https://github.com/pedroapfilho/usebutr)
- [Report an issue](https://github.com/pedroapfilho/usebutr/issues)

## License

[MIT](./LICENSE), copyright 2026 Pedro Filho.
