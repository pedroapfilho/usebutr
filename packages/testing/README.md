# @usebutr/testing

Test helpers for butr: fake adapters, fake persistence, mock storage.

Part of [butr](https://www.usebutr.com), a multi-chain wallet discovery and
connection-state library. Your application owns the picker UI and chain client.

## Install

```bash
npm install --save-dev @usebutr/testing zustand
```

Use these fixtures with your existing test runner. They avoid real wallets and browser persistence; override adapter methods to exercise rejection and error states.

## Usage

```tsx
import {
  createFakeAdapter,
  createFakeConnectedWallet,
  createFakePersistence,
} from "@usebutr/testing";

export const adapter = createFakeAdapter({ id: "metamask" });
adapter.connect = () => Promise.reject(new Error("user rejected"));
export const wallet = createFakeConnectedWallet({ adapter });
export const storage = createFakePersistence();
```

## Documentation

- [Package reference](https://docs.usebutr.com/testing)
- [Getting started](https://docs.usebutr.com/getting-started/quickstart)
- [Examples and source](https://github.com/pedroapfilho/usebutr)
- [Report an issue](https://github.com/pedroapfilho/usebutr/issues)

## License

[MIT](./LICENSE), copyright 2026 Pedro Filho.
