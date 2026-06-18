---
"@usebutr/wallet-standard-shared": patch
---

Warn (once) when `@wallet-standard/app` is missing instead of silently disabling discovery. SVM/Sui/Bitcoin Wallet Standard discovery dynamically imports the optional peer dep `@wallet-standard/app`; when it isn't installed the import was swallowed, so no Solana/Sui/Bitcoin wallets appeared with no hint why. It now logs a single actionable warning pointing at the missing install.
