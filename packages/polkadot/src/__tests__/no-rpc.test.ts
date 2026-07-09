import { describe, expect, it } from "vitest";

import { noRpcBalance, noRpcSendTx, noRpcSendTxToChain, noRpcTransactionReceipt } from "../no-rpc";

describe("no-rpc placeholders", () => {
  it("getBalance returns a neutral, chain-agnostic placeholder", async () => {
    expect(await noRpcBalance()).toEqual({ decimals: 0, formatted: "0", symbol: "", value: 0n });
  });

  it("getTransactionReceipt returns Pending", async () => {
    expect(await noRpcTransactionReceipt()).toEqual({ status: "Pending" });
  });

  it("sendTx / sendTxToChain reject with a getSigner() hint", async () => {
    await expect(noRpcSendTx()).rejects.toThrow(/getSigner\(\) with polkadot-api/v);
    await expect(noRpcSendTxToChain()).rejects.toThrow(/getSigner\(\) with polkadot-api/v);
  });
});
