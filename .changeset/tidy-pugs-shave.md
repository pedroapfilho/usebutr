---
"@usebutr/core": minor
"@usebutr/react": minor
"@usebutr/testing": minor
"@usebutr/wallets": minor
"@usebutr/svm": patch
---

Close five gaps that made multi-chain integration harder than it needed to be.

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
