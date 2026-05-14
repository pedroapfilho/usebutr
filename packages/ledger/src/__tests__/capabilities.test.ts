import { describe, expect, it } from "vitest";
import { LEDGER_CAPABILITIES } from "../capabilities";

describe("LEDGER_CAPABILITIES", () => {
  it("hardware-only profile — only signMessage + switchChain are true", () => {
    expect(LEDGER_CAPABILITIES).toEqual({
      getBalance: false,
      getTransactionReceipt: false,
      requestAccounts: false,
      sendTransaction: false,
      signMessage: true,
      subscribe: false,
      switchAccount: false,
      switchChain: true,
    });
  });
});
