# @usebutr/core

## 0.2.1

### Patch Changes

- f846e77: Wallet-announced icons are trimmed of surrounding whitespace on ingestion. Some wallets ship data-URI icons with a leading newline, which strict consumers reject — Next.js's `<Image>` throws because `src` must not start with a control character. `@usebutr/core` exports a `sanitizeIcon` helper; the EIP-6963 and Wallet Standard adapters apply it, and an all-whitespace icon now resolves to `undefined` rather than a blank string.

## 0.2.0

### Minor Changes

- b77a477: Persisted pool entries now require the `accounts` field. Entries written by older versions without it are dropped on read with a warning.
