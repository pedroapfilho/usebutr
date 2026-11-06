---
"@usebutr/ledger": major
---

`createLedgerAdapter` and the four per-app factories return the adapter instead of a promise of it. Nothing touches the device before `connect()`, so there was nothing to await; `fromAdapters(createLedgerAdapter(…))` works as before. A `chainId` outside the platform's namespace now throws the `ChainMismatch` `ConnectionError` at creation instead of rejecting.
