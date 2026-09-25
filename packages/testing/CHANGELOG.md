# @usebutr/testing

## 2.0.0

### Major Changes

- [#203](https://github.com/pedroapfilho/usebutr/pull/203) [`1263f86`](https://github.com/pedroapfilho/usebutr/commit/1263f8666afd43b4f7dbf8df1763709c3edf09d9) Thanks [@pedroapfilho](https://github.com/pedroapfilho)! - Adapters now say what they can do by having the method: `capabilities` is gone, and an optional method (`sendTx`, `signMessage`, `getBalance`, `switchChain`, …) exists only when it works for that wallet. No adapter returns a placeholder balance or a receipt that stays pending anymore.

  - `sendTx(tx, { account, chain })` replaces `sendTx` and `sendTxToChain`, and `signMessage`, `signTransaction` and `getBalance` take options objects. `chain` is a `ChainBase`. An adapter either routes the call to that chain, switches the wallet to it, or rejects; none ignores it.
  - An `account` the wallet does not expose now rejects instead of signing with the first account. `chain.name` is the chain's name, never the wallet's.
  - `getAccounts()` resolves the active account first. `getAccount` and `switchAccount` are removed.
  - `getSigner()` resolves a tagged `WalletSigner` (`eip1193`, `wallet-standard`, `walletconnect`, `ledger-*`, …), so it can be narrowed with `switch (signer.kind)` instead of cast.
  - `createWalletManager(config, { initialState })` owns discovery, hydration and persistence, and works without React. `config.sources` replaces the `discovery`, `connectors` and `createConnector` props. `fromAdapters` registers WalletConnect, Ledger and hand-built adapters, which now also appear in `useDiscoveredWallets()`.
  - `WalletManagerProvider` takes `config` and `initialState`. `useSigner(wallet)` and `useBalance(wallet, { token, account })` take the wallet entry itself, and id-taking hooks read the active wallet only when the id is omitted (`null` reads none). The hooks are `useWalletManager`, `useWalletState`, `useConnect`, `useWallet`, `useSelectedWallet` (now typed per platform), `useAccounts`, `useConnectionStatus`, `useIsHydrated`, `useIsReconnecting`, `useDiscoveredWallets`, `useConnectedWallets`, the `…ByPlatform` groupings, `useBalance` and `useSigner`.
  - `manager.connect()` and `useConnect().connectAsync()` resolve the `ConnectedWallet` and reject with a `ConnectionError`, now an `Error` subclass with a `kind` and a new `WalletNotFound` kind. `useConnect().connect()` never rejects: the failure lands in its `error`.
  - `WalletPersistence` is `load()` / `save(state)`, and `createWalletStorage` replaces `new WalletStorage`. Storage keys are unchanged.
  - Chain registries (`EVM_CHAINS`, `SVM_CHAINS`, …, `CHAINS_BY_PLATFORM`) move to `@usebutr/core`, and `BITCOIN_CHAINS` gains `testnet4`. `@usebutr/wallets` loads every platform's signer kinds, so an app that imports only it can narrow `signer.kind`.
  - `@usebutr/react` requires React 19, which its `use()` call already needed.
  - WalletConnect requests on Solana, Sui and Bitcoin now carry their chain, so they no longer fall through to the first namespace in a multi-namespace session. Solana takes `SVM_CHAINS` chains and maps them to the genesis-hash ids WalletConnect sessions use.
  - Ledger's Solana `signTransaction` returns the full signed transaction, Sui signs the intent message, and Bitcoin `signMessage` returns a BIP-137 signature.
  - `@usebutr/testing`'s fake adapter resolves a `signer` you pass instead of registering a test-only signer kind.
  - `setAccount` selects an exposed account without changing any account's chain. Unknown accounts are ignored; chain changes come from the adapter.
  - WalletConnect EVM events use the namespace in `session_event`, including empty account lists that end the connection. Local chain switches still update the manager.
  - Failed persistence saves wait for every key write to finish before reporting failure, so delayed writes cannot overwrite a later disconnect.
  - `@usebutr/svm/transaction` provides the shared legacy/v0 signing codec used by Ledger and WalletConnect, with consistent layout and signature validation.

  See the migration guide at https://docs.usebutr.com/migration.

### Patch Changes

- Updated dependencies [[`1263f86`](https://github.com/pedroapfilho/usebutr/commit/1263f8666afd43b4f7dbf8df1763709c3edf09d9), [`5d1f234`](https://github.com/pedroapfilho/usebutr/commit/5d1f23403263f7a1f8a48be061727972fe749b5f)]:
  - @usebutr/core@3.0.0

## 1.0.0

### Major Changes

- [#179](https://github.com/pedroapfilho/usebutr/pull/179) [`bc5b58c`](https://github.com/pedroapfilho/usebutr/commit/bc5b58cd87601be38dbb77a14e16eaaa36e8f012) Thanks [@pedroapfilho](https://github.com/pedroapfilho)! - Promote to 1.0.0 for the public launch. No API changes in this promotion; the bump marks the hook and adapter surface as stable under semver. Include package documentation, licensing, and npm metadata.

### Patch Changes

- Updated dependencies [[`bc5b58c`](https://github.com/pedroapfilho/usebutr/commit/bc5b58cd87601be38dbb77a14e16eaaa36e8f012)]:
  - @usebutr/core@2.0.1

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
