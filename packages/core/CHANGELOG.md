# @usebutr/core

## 0.3.0

### Minor Changes

- 886ee1d: Add Polkadot/Substrate support. New `@usebutr/polkadot` package discovers wallets via injectedWeb3 (polkadot-js, Talisman, SubWallet, Nova, Enkrypt) with a Wallet Standard `polkadot:*` fallback. `ChainPlatform` widens to include `"polkadot"`; `autoDiscovery({ polkadot: true })` and `CHAINS_BY_PLATFORM` now cover it. Message signing works via the injected `signer.signRaw`; transaction signing is delegated to the consumer through `getSigner()` (e.g. polkadot-api), matching butr's no-RPC posture.

## 0.2.2

### Patch Changes

- db5d7e9: Fix intermittent wallet disconnect on page reload. Two storage-write bugs caused a remembered connection to be erased:
  - An external `disconnected` event (EIP-1193 emits `accountsChanged: []`) fired on a simple wallet **auto-lock**, not just on permission revocation — and the store persisted the resulting empty pool, wiping the saved connection on every lock. The store now mirrors the disconnect into reducer state (so the UI hides the wallet) but leaves storage untouched; the next hydrate retries and self-heals once the wallet is unlocked. Explicit `disconnectWallet` still evicts via `removePoolEntry`.
  - A transient `eth_accounts: []` during eager restore (a locked wallet) was treated as a permanent failure and the storage entry was deleted. Hydration now preserves storage on a failed restore and reports it as `dropped` for telemetry only, so a reload retries.

  Additionally, `WalletStorage.setPool` is now **additive** and serialized through an internal mutation queue, so concurrent fire-and-forget writes can't interleave their read-modify-write phases and clobber each other's entries. `connectWallet` / `disconnectWallet` now await their storage writes so callers can trust persistence has landed on the next line.

## 0.2.1

### Patch Changes

- f846e77: Wallet-announced icons are trimmed of surrounding whitespace on ingestion. Some wallets ship data-URI icons with a leading newline, which strict consumers reject — Next.js's `<Image>` throws because `src` must not start with a control character. `@usebutr/core` exports a `sanitizeIcon` helper; the EIP-6963 and Wallet Standard adapters apply it, and an all-whitespace icon now resolves to `undefined` rather than a blank string.

## 0.2.0

### Minor Changes

- b77a477: Persisted pool entries now require the `accounts` field. Entries written by older versions without it are dropped on read with a warning.
