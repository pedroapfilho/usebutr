---
"@usebutr/wallet-standard-shared": patch
---

Warn (once) when `@wallet-standard/app` can't be loaded instead of silently disabling discovery. Wallet Standard discovery (used by the SVM, Sui, Bitcoin and Polkadot connectors) dynamically imports the optional peer dep `@wallet-standard/app`; when the import failed it was swallowed, so no wallets appeared with no hint why. It now logs a single actionable warning, forwarding the underlying error.
