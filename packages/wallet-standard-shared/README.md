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
    id: slugify("svm", wallet.name),
    label: "Solana",
    namespace: "solana",
    preferredChainIds: ["solana:mainnet"],
    trackChainChanges: true,
    wallet,
  });
  return core === null ? null : { ...core.base, chainPlatform: "svm" };
};
```

`base.getAccounts()` exposes only accounts advertising the selected chain.
Platform signing methods use `core.resolveTarget(feature, options)` to obtain
`{ account, chain }` together, with the account advertising both the chain and
the operation feature. Chain aliases are normalized for matching; the wallet
receives its advertised chain id. Use `core.toAccount(rawAccount)` to validate
a sign-in result against the current chain.

## Documentation

- [Package reference](https://docs.usebutr.com/api/wallet-standard-shared)
- [Getting started](https://docs.usebutr.com/getting-started/quickstart)
- [Examples and source](https://github.com/pedroapfilho/usebutr)
- [Report an issue](https://github.com/pedroapfilho/usebutr/issues)

## License

[MIT](./LICENSE), copyright 2026 Pedro Filho.
