---
"@usebutr/core": patch
---

Split the 497-line `types/wallet.ts` into focused modules (platform, account, capabilities, connector, wallet, manager) behind the same barrel. Pure file motion: every exported name and type is unchanged.
