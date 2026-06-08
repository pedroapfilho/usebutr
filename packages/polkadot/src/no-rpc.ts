import type { Balance } from "@usebutr/core";

/**
 * butr ships no RPC on Polkadot: building/broadcasting an extrinsic and
 * reading on-chain state both need chain metadata. Balance and receipt
 * reads return neutral placeholders (gated behind
 * `capabilities.getBalance` / `getTransactionReceipt === false`);
 * transaction submission rejects with a hint to drive polkadot-api via
 * `getSigner()`. Both discovery channels (injectedWeb3 + Wallet Standard)
 * share these so the invariant lives in one place.
 */
const POLKADOT_SEND_TX_HINT =
  "Polkadot sendTx is unsupported — use getSigner() with polkadot-api to build and submit extrinsics";
const POLKADOT_SEND_TX_TO_CHAIN_HINT =
  "Polkadot sendTxToChain is unsupported — use getSigner() with polkadot-api to build and submit extrinsics";

// Neutral, chain-agnostic placeholder. The registry spans DOT/KSM/WND/PAS
// with different symbols and decimals, so a hardcoded "DOT"/10 would be
// wrong for most of them. Consumers read real balances via polkadot-api.
const noRpcBalance = (): Promise<Balance> =>
  Promise.resolve({ decimals: 0, formatted: "0", symbol: "", value: 0n });

const noRpcTransactionReceipt = (): Promise<{ status: "Success" | "Error" | "Pending" }> =>
  Promise.resolve({ status: "Pending" });

const noRpcSendTx = (): Promise<string> => Promise.reject(new Error(POLKADOT_SEND_TX_HINT));

const noRpcSendTxToChain = (): Promise<string> =>
  Promise.reject(new Error(POLKADOT_SEND_TX_TO_CHAIN_HINT));

export { noRpcBalance, noRpcSendTx, noRpcSendTxToChain, noRpcTransactionReceipt };
