---
"@usebutr/evm": minor
---

The EIP-6963 adapter's `getBalance` now reads ERC20 balances. Called with no argument it returns the native ETH balance as before; called with a token address (`getBalance(tokenAddress)`) it reads `balanceOf` / `decimals` / `symbol` for the active account on the currently-connected chain via parallel `eth_call`s on the wallet's own provider (no separate RPC needed). Non-standard `bytes32` symbols are decoded best-effort.
