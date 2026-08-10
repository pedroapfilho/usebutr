# @usebutr/testing

## 0.2.0

### Minor Changes

- 8ecaf89: Close five gaps that made multi-chain integration harder than it needed to be.

  **Group wallets by platform without writing the loop yourself.**
  `groupByPlatform(items, getPlatform)` in `@usebutr/core` buckets any list into
  a `Map<ChainPlatform, T[]>` keyed in `CHAIN_PLATFORMS` order with empty
  platforms omitted, and `@usebutr/react` adds
  `useDiscoveredWalletsByPlatform()` / `useConnectedWalletsByPlatform()` on top.
  A multi-chain wallet announces one adapter per platform, so every app hitting
  more than one chain was writing this bucketing by hand.

  **`autoDiscovery` takes an allowlist array, and says something when it's empty.**
  `autoDiscovery(["evm", "svm"])` now works alongside the object form and reads
  as the allowlist it is. An options value that enables no platforms logs a
  warning instead of silently discovering nothing: a list built at runtime that
  comes back empty was otherwise indistinguishable from "no wallets installed".
  The bare `autoDiscovery()` everything-path is unchanged and stays silent.

  **`createFakeConnectedWallet` in `@usebutr/testing`.** Builds the
  `{ account, accounts, connector }` pool entry that UI tests actually render,
  with accounts constructed through `buildAccount` so the `<chain>:<address>` id
  format is never restated in a fixture. Defaults to the platform's mainnet chain
  and a deterministic address; pass `adapter` to wrap a connector you already
  built.

  **The icon sanitization contract is now on the type.** `Connector.icon` is
  already run through `sanitizeIcon` at discovery, so it is a trimmed non-empty
  string or `undefined`, safe to hand to `next/image` with no second call and no
  `icon !== ""` guard. `ConnectorMeta.icon` documents the opposite: it is
  consumer-supplied and not sanitized.

  **`createSignInFlow` in `@usebutr/core`.** Wraps the nonce, capability gate,
  signature, base64 encoding, and verification handshake that every wallet-auth
  app writes identically. Solana wallets advertising `solana:signIn` take the
  SIWS path automatically. It deliberately does not define a message format: pass
  `buildMessage` to match your backend. Also re-exports the SVM SIWS types
  (`SolanaSignInFeature`, `SolanaSignInInput`, `SolanaSignInOutput`) from
  `@usebutr/svm`, which were defined but not exported.

### Patch Changes

- Updated dependencies [8ecaf89]
  - @usebutr/core@1.1.0

## 0.1.9

### Patch Changes

- Updated dependencies [7887cf0]
- Updated dependencies [7887cf0]
- Updated dependencies [f0a5116]
- Updated dependencies [f0a5116]
  - @usebutr/core@1.0.0

## 0.1.8

### Patch Changes

- Updated dependencies [4467a5e]
  - @usebutr/core@0.5.0

## 0.1.7

### Patch Changes

- Updated dependencies [c1309ee]
  - @usebutr/core@0.4.2

## 0.1.6

### Patch Changes

- Updated dependencies [937dfae]
  - @usebutr/core@0.4.1

## 0.1.5

### Patch Changes

- a46eecd: Ship unminified ESM so downstream bundlers (Vite/esbuild dep pre-bundling) process the package correctly; fixes a ReferenceError in consumer dev servers. The consuming app minifies once at its own build.
- Updated dependencies [b5322ae]
- Updated dependencies [d5f32c7]
- Updated dependencies [a46eecd]
  - @usebutr/core@0.4.0

## 0.1.4

### Patch Changes

- Updated dependencies [886ee1d]
  - @usebutr/core@0.3.0

## 0.1.3

### Patch Changes

- Updated dependencies [db5d7e9]
  - @usebutr/core@0.2.2

## 0.1.2

### Patch Changes

- Updated dependencies [f846e77]
  - @usebutr/core@0.2.1

## 0.1.1

### Patch Changes

- Updated dependencies [b77a477]
  - @usebutr/core@0.2.0
