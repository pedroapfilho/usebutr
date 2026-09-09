# @usebutr/wallet-standard-shared

Shared Wallet Standard discovery primitives used by @usebutr/svm, @usebutr/sui, @usebutr/bitcoin.

Part of [butr](https://www.usebutr.com), a multi-chain wallet discovery and
connection-state library. Your application owns the picker UI and chain client.

## Install

```bash
npm install @usebutr/wallet-standard-shared @wallet-standard/app zustand
```

For adapter authors. The package supplies discovery, lifecycle, feature guards, and capability helpers. The default registry loader requires `@wallet-standard/app`; tests can inject a loader.

## Usage

```tsx
import { slugify } from "@usebutr/wallet-standard-shared";

// Namespace each adapter so a multi-chain wallet has one ID per platform.
export const solanaId = slugify("svm", "Phantom");
export const suiId = slugify("sui", "Phantom");
```

## Documentation

- [Package reference](https://docs.usebutr.com/api/wallet-standard-shared)
- [Getting started](https://docs.usebutr.com/getting-started/quickstart)
- [Examples and source](https://github.com/pedroapfilho/usebutr)
- [Report an issue](https://github.com/pedroapfilho/usebutr/issues)

## License

[MIT](./LICENSE), copyright 2026 Pedro Filho.
