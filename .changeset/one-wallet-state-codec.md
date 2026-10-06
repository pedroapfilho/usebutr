---
"@usebutr/core": major
"@usebutr/testing": major
"@usebutr/react": patch
---

Persisted wallet state has one wire format, and the cookie persistence and its server reader come from one call.

- `createCookieWalletStorage({ keyPrefix, domain, path, sameSite, secure, maxAgeSeconds })` returns a `WalletPersistence` with `readInitialState(cookies)`. Build it in a module that both the Server Component and the client provider import, so the key prefix is set once. It replaces `readWalletSnapshot`, which is removed along with `SnapshotOptions` and `EMPTY_SNAPSHOT`.
- `createCookieStorageDriver`, `CookieDriverOptions`, the `initialCookies` option and `InitialCookies` are removed. The cookie driver no longer has a server branch.
- `WalletManagerConfig.storageKeyPrefix` is removed. Pass `keyPrefix` to `createWalletStorage` or `createCookieWalletStorage`. Storage keys are unchanged.
- The server read and the client load share one decoder. A snapshot's active id is now the stored one; the manager falls back to the first pool entry when it names none, as it does after a client-side load.
- `toStoredPoolEntry(wallet)` builds a `StoredPoolEntry` from a `ConnectedWallet`.
- `@usebutr/testing`'s `createFakePersistence` takes `{ wallets, active, isUserDisconnected }` instead of a `Partial<PersistedWalletState>`, so tests no longer build `StoredPoolEntry` values by hand.
