# @usebutr/walletconnect

## 0.2.8

### Patch Changes

- 7887cf0: Use `@usebutr/core`'s base58 and hex helpers instead of per-package copies. Encoded output is identical.
- Updated dependencies [7887cf0]
- Updated dependencies [7887cf0]
- Updated dependencies [f0a5116]
- Updated dependencies [f0a5116]
  - @usebutr/core@1.0.0
  - @usebutr/evm@1.0.0

## 0.2.7

### Patch Changes

- efe4550: Share the session plumbing behind the Wallet Standard and WalletConnect CAIP adapters. `@usebutr/wallet-standard-shared` now exports `createWalletStandardCore`, which the Bitcoin, Polkadot, Sui and SVM adapters build on; the WalletConnect Bitcoin, Sui and SVM namespaces share an equivalent CAIP core. Every package's public API is unchanged. The one visible difference is a dev-console warning: a failed SVM disconnect now logs `[butr] SVM Wallet Standard disconnect threw:` instead of `[butr] Wallet Standard disconnect threw:`.
- Updated dependencies [4467a5e]
  - @usebutr/core@0.5.0
  - @usebutr/evm@0.2.5

## 0.2.6

### Patch Changes

- 99eaef0: Restore guards that the type-aware lint pass narrowed away.

  - `@usebutr/bitcoin`: the sats-connect `getAccounts` reader dropped its optional
    chain on the RPC payload. The declared shape is an assertion over an untyped
    bridge, so a wallet answering without a `result` threw a `TypeError` instead
    of reporting no accounts.
  - `@usebutr/walletconnect`: the Sui and Solana signing paths treated an
    empty-string `transaction` / `transactionBytes` / `bytes` field as a real
    value and decoded it to zero bytes. They now fall through to the signature
    path (Sui `signPersonalMessage`) or the original message, matching the
    previous truthiness checks.
  - `@usebutr/ledger`: the unknown-platform rejection lost the platform name from
    its message, which is the only detail that made the error actionable.

- c1309ee: Validate persisted wallet data and WalletConnect responses with shared Zod schemas.
- Updated dependencies [c1309ee]
  - @usebutr/core@0.4.2
  - @usebutr/evm@0.2.4

## 0.2.5

### Patch Changes

- 937dfae: Bump runtime dependency floors (`@wallet-standard/app` 1.1.1, `@ledgerhq/*` latest minors, `@walletconnect/universal-provider` 2.23.10) and modernize public type declarations from method signatures to property function types (oxlint `method-signature-style`). Type-level only — no runtime behavior change.
- Updated dependencies [937dfae]
  - @usebutr/core@0.4.1
  - @usebutr/evm@0.2.3

## 0.2.4

### Patch Changes

- a46eecd: Ship unminified ESM so downstream bundlers (Vite/esbuild dep pre-bundling) process the package correctly; fixes a ReferenceError in consumer dev servers. The consuming app minifies once at its own build.
- b5322ae: Remove the leaked `display_uri` listener on disconnect to prevent listener
  accumulation and duplicate `onPairingUri` callbacks across reconnects.
- Updated dependencies [b5322ae]
- Updated dependencies [d5f32c7]
- Updated dependencies [a46eecd]
  - @usebutr/core@0.4.0
  - @usebutr/evm@0.2.2

## 0.2.3

### Patch Changes

- Updated dependencies [886ee1d]
  - @usebutr/core@0.3.0
  - @usebutr/evm@0.2.1

## 0.2.2

### Patch Changes

- Updated dependencies [db5d7e9]
- Updated dependencies [db5d7e9]
  - @usebutr/evm@0.2.0
  - @usebutr/core@0.2.2

## 0.2.1

### Patch Changes

- Updated dependencies [f846e77]
  - @usebutr/core@0.2.1
  - @usebutr/evm@0.1.2

## 0.2.0

### Minor Changes

- b77a477: Add WalletConnect v2 namespace builders for Solana, Sui, and Bitcoin alongside EVM. `createWalletConnectAdapters` takes a per-platform `namespaces` map and returns one adapter per namespace from a single paired session. The namespace builders (`evmNamespace`, `solanaNamespace`, `suiNamespace`, `bitcoinNamespace`) and the `KNOWN_NAMESPACES` registry are exported for custom composition.

### Patch Changes

- Updated dependencies [b77a477]
  - @usebutr/core@0.2.0
  - @usebutr/evm@0.1.1
