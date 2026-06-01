---
"@usebutr/core": patch
---

Fix intermittent wallet disconnect on page reload. Two storage-write bugs caused a remembered connection to be erased:

- An external `disconnected` event (EIP-1193 emits `accountsChanged: []`) fired on a simple wallet **auto-lock**, not just on permission revocation — and the store persisted the resulting empty pool, wiping the saved connection on every lock. The store now mirrors the disconnect into reducer state (so the UI hides the wallet) but leaves storage untouched; the next hydrate retries and self-heals once the wallet is unlocked. Explicit `disconnectWallet` still evicts via `removePoolEntry`.
- A transient `eth_accounts: []` during eager restore (a locked wallet) was treated as a permanent failure and the storage entry was deleted. Hydration now preserves storage on a failed restore and reports it as `dropped` for telemetry only, so a reload retries.

Additionally, `WalletStorage.setPool` is now **additive** and serialized through an internal mutation queue, so concurrent fire-and-forget writes can't interleave their read-modify-write phases and clobber each other's entries. `connectWallet` / `disconnectWallet` now await their storage writes so callers can trust persistence has landed on the next line.
