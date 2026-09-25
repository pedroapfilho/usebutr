# @usebutr/wallet-standard-shared

Shared Wallet Standard discovery primitives used by @usebutr/svm, @usebutr/sui, @usebutr/bitcoin.

Part of [butr](https://www.usebutr.com), a multi-chain wallet discovery and
connection-state library. Your application owns the picker UI and chain client.

## Install

```bash
npm install @usebutr/wallet-standard-shared @wallet-standard/app zustand
```

For adapter authors. The package supplies discovery, the session plumbing every Wallet Standard adapter shares, and `getFeature`. The default registry loader requires `@wallet-standard/app`; tests can inject a loader. Importing it registers the `wallet-standard` signer kind, so every adapter built on it resolves `getSigner()` to `{ kind: "wallet-standard", wallet }`.

## Usage

```ts
import type { SvmAdapter } from "@usebutr/core";
import { SVM_CHAINS_LIST } from "@usebutr/core";
import type { WalletStandardWallet } from "@usebutr/wallet-standard-shared";
import { createWalletStandardCore, slugify } from "@usebutr/wallet-standard-shared";

export const buildAdapter = (wallet: WalletStandardWallet): SvmAdapter | null => {
  const core = createWalletStandardCore({
    chains: SVM_CHAINS_LIST,
    // Namespace the id so a multi-chain wallet has one adapter per platform.
    id: slugify("svm", wallet.name),
    label: "Solana",
    namespace: "solana",
    preferredChainIds: ["solana:mainnet"],
    trackChainChanges: true,
    wallet,
  });
  // `base` defines `disconnect`, `subscribe` and `switchChain` only when the
  // wallet supports them. Add platform methods the same way: only when the
  // wallet advertises the feature, routing `options.account` through
  // `core.resolveAccount` and `options.chain` through `core.resolveChainId`.
  return core === null ? null : { ...core.base, chainPlatform: "svm" };
};
```

## Documentation

- [Package reference](https://docs.usebutr.com/api/wallet-standard-shared)
- [Getting started](https://docs.usebutr.com/getting-started/quickstart)
- [Examples and source](https://github.com/pedroapfilho/usebutr)
- [Report an issue](https://github.com/pedroapfilho/usebutr/issues)

## License

[MIT](./LICENSE), copyright 2026 Pedro Filho.
