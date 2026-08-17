---
"@usebutr/wallet-standard-shared": minor
"@usebutr/walletconnect": minor
"@usebutr/testing": minor
"@usebutr/polkadot": minor
"@usebutr/bitcoin": minor
"@usebutr/ledger": minor
"@usebutr/react": minor
"@usebutr/core": major
"@usebutr/evm": minor
"@usebutr/sui": major
"@usebutr/svm": major
---

Correctness pass across the storage, hydration and connector layers. Several of
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
