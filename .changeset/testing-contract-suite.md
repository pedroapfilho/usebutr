---
"@usebutr/testing": major
---

Add `@usebutr/testing/contract`: `describeAdapterContract` is the Vitest suite every butr adapter package runs, and adapter authors can run it against their own adapters. It checks account matching, chain routing per transport, each refusal's `ConnectionError` kind, empty account lists and `subscribe`. Install `vitest` to use it; it is an optional peer dependency.

`createFakeAdapter` runs on the same chain targets as the real adapters. An unexposed account rejects with `AccountNotExposed`, and a chain outside the platform's registry rejects with `ChainMismatch`. EVM addresses match case-insensitively, and an empty `accountsChanged` exposes no accounts until the next `connect()`. The new `requests()` control lists every signing or sending request the fake accepted, as `FakeRequest`.
