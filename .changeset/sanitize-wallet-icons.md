---
"@usebutr/core": patch
"@usebutr/evm": patch
"@usebutr/svm": patch
"@usebutr/sui": patch
"@usebutr/bitcoin": patch
---

Wallet-announced icons are trimmed of surrounding whitespace on ingestion. Some wallets ship data-URI icons with a leading newline, which strict consumers reject — Next.js's `<Image>` throws because `src` must not start with a control character. `@usebutr/core` exports a `sanitizeIcon` helper; the EIP-6963 and Wallet Standard adapters apply it, and an all-whitespace icon now resolves to `undefined` rather than a blank string.
