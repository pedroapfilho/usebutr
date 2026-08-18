# @usebutr/walletconnect

## 0.3.0

### Minor Changes

- 9b1caa2: Correctness pass across the storage, hydration and connector layers. Several of
  these change observable behaviour; the ones worth knowing about before upgrading:

  **Breaking**

  - `SuiWallet.signTransaction` now returns `{ bytes, signature }` instead of
    `Uint8Array`. Sui's `executeTransactionBlock` needs both, and each connector
    previously returned a different half, so the old value could not be broadcast
    and a consumer could not tell which half they held. SVM and Bitcoin keep their
    single-`Uint8Array` shape.
  - `@usebutr/svm`'s `sendTx` returns the signature base58-encoded, matching the
    WalletConnect namespace, the Ledger app, Solana explorers and
    `getSignatureStatuses`. It previously returned base64.
  - `@usebutr/sui`'s feature input types drop the `string` arm from
    `transaction`; wallets only ever accepted the `toJSON()` form. Strings and BCS
    bytes are now wrapped for you, so `sendTx` accepts strictly more than before.

  **Behaviour fixes**

  - `WalletStorage.setPool` and `removePoolEntry` could self-deadlock on a corrupt
    pool payload, leaving `connectWallet` unresolved and every later pool write
    jammed for the page's life. Both are fixed, and `readWalletSnapshot` now shares
    one codec with `WalletStorage` so the server and client decodes cannot drift.
  - A seeded (SSR) entry whose silent reconnect failed used to stay in the pool
    backed by a placeholder connector forever, so `useSigner`/`useBalance`
    reported an error and `useConnectionStatus` reported `"reconnecting"`
    permanently. Those entries are now dropped.
  - `useSigner` and `useBalance` stay `idle` for a wallet that is still
    reconnecting instead of surfacing a placeholder rejection as `status: "error"`.
  - `useConnectionStatus` lets a live `"connecting"`/`"error"` take precedence over
    the derived `"reconnecting"`, so an in-flight attempt and a connection error
    are no longer hidden. New `useIsReconnecting(connectorId?)` answers the
    per-wallet question directly.
  - A background restore no longer writes the connect-attempt status or steals
    `activeConnectorId`, and a superseded `CONNECT_FAILED` no longer overwrites the
    current attempt.
  - An externally-disconnected connector is now torn down, not just dropped from
    the pool, so a cached adapter is not reused while still holding a session.
  - EVM: a malformed provider response is treated as absent rather than `""`, which
    previously produced chain `eip155:0`, zero-length signatures, empty transaction
    hashes and a confident `0 ETH`. `switchChain` gained the same-chain
    short-circuit `sendTxToChain` already had.
  - WalletConnect: accounts carry their own chain instead of all being stamped with
    the active one, so a multi-chain session no longer returns a wrong-chain
    address. One pairing now covers every configured namespace, the pairing URI
    survives a reconnect, and concurrent connects share one pairing.
  - Bitcoin: the sats-connect (Xverse) adapter honours `silent`, so a reload no
    longer triggers an unsolicited approval prompt, and exposes the payment address
    as its single account instead of also presenting the ordinals address as
    spendable.
  - Polkadot: the injected adapter actually delivers events to subscribers,
    `switchChain` notifies like its Wallet Standard sibling, and chain resolution
    prefers the mainnets rather than whatever the wallet listed first.
  - Ledger: the device session is committed atomically, so a locked device no
    longer leaves an open transport that reports itself connected, and concurrent
    connects open one transport.
  - SVM: `sendTxToChain` submits to the chain you asked for instead of the
    adapter's current one, and rejects a chain the wallet does not advertise.
  - `@usebutr/svm`'s `switchChain` capability now counts only `solana:` chains, so
    a multi-namespace wallet no longer advertises a method that always throws.

  **Testing**

  - `createFakePersistence` is now the real `WalletStorage` over memory drivers
    rather than a parallel implementation, so it inherits upsert semantics,
    validation and JSON round-tripping. Two divergences are fixed as a result:
    `setPool` upserts rather than replaces, and `clearAll` leaves the
    user-disconnected flag alone.
  - `createFakeConnectedWallet` rejects being given both an `adapter` and explicit
    `addresses`/`accounts`, a combination whose halves could disagree.

### Patch Changes

- Updated dependencies [9b1caa2]
  - @usebutr/core@2.0.0
  - @usebutr/evm@1.1.0

## 0.2.9

### Patch Changes

- Updated dependencies [8ecaf89]
  - @usebutr/core@1.1.0
  - @usebutr/evm@1.0.1

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
