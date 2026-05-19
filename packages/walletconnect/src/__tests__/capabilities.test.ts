import { describe, expect, it } from "vitest";

import { WALLETCONNECT_CAPABILITIES } from "../capabilities";

describe("WALLETCONNECT_CAPABILITIES", () => {
  it("returns the same shape as EIP-6963 except for requestAccounts (no EIP-2255)", () => {
    expect(WALLETCONNECT_CAPABILITIES).toEqual({
      getBalance: true,
      getTransactionReceipt: true,
      requestAccounts: false,
      sendTransaction: true,
      signIn: false,
      signMessage: true,
      signTransaction: false,
      subscribe: true,
      switchAccount: false,
      switchChain: true,
    });
  });
});
