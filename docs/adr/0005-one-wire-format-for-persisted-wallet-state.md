# ADR 0005 — One wire format for persisted wallet state

## Status

Accepted · 2026-10-06 · supersedes the `readWalletSnapshot` form of
[ADR 0003](./0003-wagmi-style-synchronous-seeding.md)

## Context

ADR 0003 seeds the store on the server from cookies, then lets the client
rehydrate from the same storage. That only works if the server read and the
client load decode the same bytes the same way. Four things let them drift:

1. **Two decoders.** `createWalletStorage().load()` returned the stored active
   id as it was. `readWalletSnapshot` replaced an active id missing from the
   pool with the first pool entry. A parity test was all that kept their pool
   and selection decoding aligned.
2. **The layout was split.** The keys came from a shared helper, the encode
   lived inline in `save`, and `readWalletSnapshot` hard-coded
   `createWalletStorage`'s layout. An app with its own `WalletPersistence` got
   a reader that matched no cookie, so seeding silently did nothing.
3. **The prefix was set twice.** Once on the client (`storageKeyPrefix`, or
   `createWalletStorage({ keyPrefix })`), once on the server
   (`readWalletSnapshot(cookies, { keyPrefix })`). In Next.js, a prefix
   imported from a `"use client"` module into a Server Component is a client
   reference, not the string, which again matched no cookie.
   `storageKeyPrefix` was also ignored whenever `storage` was set.
4. **The cookie driver had a server branch** that read an `initialCookies`
   snapshot. The manager touches storage only from `start()`, inside an
   effect, so nothing on the server ever called it.

## Decision

### 1. One codec owns the wire format

`packages/core/src/storage/wallet-state-codec.ts` owns the key layout, the
encode and the decode of `PersistedWalletState`:

| Key                          | Slot         | Holds                 |
| ---------------------------- | ------------ | --------------------- |
| `{prefix}-pool`              | `persistent` | the pool entries      |
| `{prefix}-selection`         | `persistent` | the selection         |
| `{prefix}-active`            | `persistent` | the active id         |
| `{prefix}-user-disconnected` | `session`    | the disconnect intent |

`decodeSnapshot(read)` decodes the persistent slot, and `decode(read)` adds the
session slot to it. `createWalletStorage().load()` and the server reader both
call it, so there is one decoder. It validates and drops, never repairs or
throws.

The active id decodes as the stored non-empty string. Falling back to the
first pool entry is the store's reconcile pass (ADR 0004 §7), which runs on the
seeded path and the loaded path alike.

`toStoredPoolEntry(wallet)` is the one mapping from a `ConnectedWallet` to a
`StoredPoolEntry`.

### 2. One cookie factory returns the writer and the reader

```ts
// wallet-storage.ts, imported by the Server Component and the client provider
export const walletStorage = createCookieWalletStorage({
  keyPrefix: "my-app",
  secure: process.env.NODE_ENV === "production",
});

// wallet-provider.tsx ("use client")
const config = { sources: [discoverEvmAdapters], storage: walletStorage };

// app/layout.tsx (Server Component)
const initialState = walletStorage.readInitialState((await cookies()).getAll());
```

The result is a `WalletPersistence` with `readInitialState(cookies)`. Both
halves are built from one prefix over one codec. Creating it touches no browser
global: the cookie driver reads `document.cookie` only inside its methods, so
the shared module evaluates safely during a server render.

Removed: `readWalletSnapshot`, `SnapshotOptions`, `EMPTY_SNAPSHOT`, the public
`createCookieStorageDriver` and `CookieDriverOptions`, the `initialCookies`
option and the `InitialCookies` type.

### 3. The prefix belongs to the storage factory

`WalletManagerConfig.storageKeyPrefix` is removed. `createWalletStorage` and
`createCookieWalletStorage` take `keyPrefix`.

## Consequences

- Breaking release for `@usebutr/core` and `@usebutr/testing`.
- An SSR app sets its prefix in one module. A Server Component that imports it
  gets the object, so the client-reference trap is gone.
- A custom `WalletPersistence` has no server reader. Seeding from a custom
  layout means building the `WalletSnapshot` yourself.
- A snapshot can name an active id the pool does not hold; the seeded store
  resolves it exactly as a client-side load does.
- `createFakePersistence` takes connected wallets instead of hand-built
  `StoredPoolEntry` values, so tests no longer depend on the wire shape.

## Alternatives considered

1. **Keep `readWalletSnapshot` standalone over the shared codec.** Rejected:
   the prefix is still set twice, and a custom persistence still loses
   seeding without an error.
2. **An optional `readInitialState` on `WalletPersistence`.** Rejected:
   localStorage, AsyncStorage and IndexedDB never reach a server, so every
   implementation but one would carry a method it cannot implement.
3. **Keep the cookie driver's server branch.** Rejected: the manager never
   loads on the server, and synchronous seeding already covers the first
   render.
