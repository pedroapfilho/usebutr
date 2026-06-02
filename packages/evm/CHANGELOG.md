# @usebutr/evm

## 0.2.0

### Minor Changes

- db5d7e9: The EIP-6963 adapter's `getBalance` now reads ERC20 balances. Called with no argument it returns the native ETH balance as before; called with a token address (`getBalance(tokenAddress)`) it reads `balanceOf` / `decimals` / `symbol` for the active account on the currently-connected chain via parallel `eth_call`s on the wallet's own provider (no separate RPC needed). Non-standard `bytes32` symbols are decoded best-effort.

### Patch Changes

- Updated dependencies [db5d7e9]
  - @usebutr/core@0.2.2

## 0.1.2

### Patch Changes

- f846e77: Wallet-announced icons are trimmed of surrounding whitespace on ingestion. Some wallets ship data-URI icons with a leading newline, which strict consumers reject — Next.js's `<Image>` throws because `src` must not start with a control character. `@usebutr/core` exports a `sanitizeIcon` helper; the EIP-6963 and Wallet Standard adapters apply it, and an all-whitespace icon now resolves to `undefined` rather than a blank string.
- Updated dependencies [f846e77]
  - @usebutr/core@0.2.1

## 0.1.1

### Patch Changes

- Updated dependencies [b77a477]
  - @usebutr/core@0.2.0
