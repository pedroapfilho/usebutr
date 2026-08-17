import type { Balance } from "@usebutr/core";

/**
 * Building an extrinsic or reading on-chain state both need chain metadata
 * butr doesn't fetch, so it ships no Polkadot RPC. The neutral balance and
 * receipt values are gated behind the matching `capabilities` flags.
 */
const POLKADOT_SEND_TX_HINT =
  "Polkadot sendTx is unsupported: use getSigner() with polkadot-api to build and submit extrinsics";
const POLKADOT_SEND_TX_TO_CHAIN_HINT =
  "Polkadot sendTxToChain is unsupported: use getSigner() with polkadot-api to build and submit extrinsics";

const noRpcBalance = (): Promise<Balance> =>
  Promise.resolve({ decimals: 0, formatted: "0", symbol: "", value: 0n });

const noRpcTransactionReceipt = (): Promise<{ status: "Success" | "Error" | "Pending" }> =>
  Promise.resolve({ status: "Pending" });

const noRpcSendTx = (): Promise<string> => Promise.reject(new Error(POLKADOT_SEND_TX_HINT));

const noRpcSendTxToChain = (): Promise<string> =>
  Promise.reject(new Error(POLKADOT_SEND_TX_TO_CHAIN_HINT));

export { noRpcBalance, noRpcSendTx, noRpcSendTxToChain, noRpcTransactionReceipt };
