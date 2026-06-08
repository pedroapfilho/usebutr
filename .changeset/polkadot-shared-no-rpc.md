---
"@usebutr/polkadot": patch
---

Share the no-RPC placeholders between the injectedWeb3 and Wallet Standard adapters (single `no-rpc` module), so the "butr ships no RPC on Polkadot" invariant lives in one place. `getBalance` now returns a neutral, chain-agnostic placeholder (`{ decimals: 0, symbol: "" }`) instead of a hardcoded `DOT`/10 that was wrong for Kusama/Westend/Paseo; it stays gated behind `capabilities.getBalance === false`. The injected `getSigner()` now throws `"No connected account"` instead of handing back an empty-string address.
