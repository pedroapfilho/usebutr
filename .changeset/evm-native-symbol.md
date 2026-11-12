---
"@usebutr/evm": patch
---

Label the native balance with its chain's own asset. `getBalance()` reported `"ETH"` on every EVM chain; it now reports `"POL"` on Polygon and `"BNB"` on BNB Smart Chain, and keeps `"ETH"` for the other chains.
