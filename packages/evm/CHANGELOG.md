# @usebutr/evm

## 1.0.1

### Patch Changes

- Updated dependencies [8ecaf89]
  - @usebutr/core@1.1.0

## 1.0.0

### Major Changes

- f0a5116: **Breaking:** the `platform` field is gone from the `PlatformDiscoverer` type in `@usebutr/core`, and from the `evmDiscoverer`, `svmDiscoverer`, `suiDiscoverer`, `bitcoinDiscoverer` and `polkadotDiscoverer` objects that implement it. Nothing read it: the aggregator keys discoverers by `ChainPlatform` in its own registry, so the field only restated the key.

  Migration: read the platform from the `KNOWN_DISCOVERERS` key in `@usebutr/wallets` (`Object.entries(KNOWN_DISCOVERERS)`), or from `adapter.chainPlatform` on a discovered adapter. Custom `PlatformDiscoverer` implementations must drop the `platform` property; keeping it is now an excess-property error.

### Patch Changes

- Updated dependencies [7887cf0]
- Updated dependencies [7887cf0]
- Updated dependencies [f0a5116]
- Updated dependencies [f0a5116]
  - @usebutr/core@1.0.0

## 0.2.5

### Patch Changes

- Updated dependencies [4467a5e]
  - @usebutr/core@0.5.0

## 0.2.4

### Patch Changes

- Updated dependencies [c1309ee]
  - @usebutr/core@0.4.2

## 0.2.3

### Patch Changes

- 937dfae: Bump runtime dependency floors (`@wallet-standard/app` 1.1.1, `@ledgerhq/*` latest minors, `@walletconnect/universal-provider` 2.23.10) and modernize public type declarations from method signatures to property function types (oxlint `method-signature-style`). Type-level only — no runtime behavior change.
- Updated dependencies [937dfae]
  - @usebutr/core@0.4.1

## 0.2.2

### Patch Changes

- a46eecd: Ship unminified ESM so downstream bundlers (Vite/esbuild dep pre-bundling) process the package correctly; fixes a ReferenceError in consumer dev servers. The consuming app minifies once at its own build.
- Updated dependencies [b5322ae]
- Updated dependencies [d5f32c7]
- Updated dependencies [a46eecd]
  - @usebutr/core@0.4.0

## 0.2.1

### Patch Changes

- Updated dependencies [886ee1d]
  - @usebutr/core@0.3.0

## 0.2.0

### Minor Changes

- db5d7e9: The EIP-6963 adapter's `getBalance` now reads ERC20 balances. Called with no argument it returns the native ETH balance as before; called with a token address (`getBalance(tokenAddress)`) it reads `balanceOf` / `decimals` / `symbol` for the active account on the currently-connected chain via parallel `eth_call`s on the wallet's own provider (no separate RPC needed). Non-standard `bytes32` symbols are decoded best-effort.

### Patch Changes

- Updated dependencies [db5d7e9]
  - @usebutr/core@0.2.2

## 0.1.2

### Patch Changes

- f846e77: Wallet-announced icons are trimmed of surrounding whitespace on ingestion. Some wallets ship data-URI icons with a leading newline, which strict consumers reject — Next.js's `<Image>` throws because `src` must not start with a control character. `@usebutr/core` exports a `sanitizeIcon` helper; the EIP-6963 and Wallet Standard adapters apply it, and an all-whitespace icon now resolves to `undefined` rather than a blank string.
- Updated dependencies [f846e77]
  - @usebutr/core@0.2.1

## 0.1.1

### Patch Changes

- Updated dependencies [b77a477]
  - @usebutr/core@0.2.0
