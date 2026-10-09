---
"@usebutr/polkadot": major
---

Wallet Standard `signMessage` now hands the wallet the message wrapped in `<Bytes>…</Bytes>`, as injectedWeb3 `signRaw` already did, and resolves those wrapped bytes as `signedMessage` when the wallet reports none. Both transports now sign the same bytes for the same message, and `signedMessage` is always the bytes the signature covers. Verify against `signedMessage`, not your input.
