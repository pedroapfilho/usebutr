---
"@usebutr/polkadot": patch
---

Keep silent injectedWeb3 reconnects out of the extension permission flow. Reuse an enabled in-memory session, or reject with `NotConnected` before calling `enable`. Persisted connections remain dormant for an explicit user retry.
