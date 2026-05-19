import { describe, expect, it } from "vitest";
import { EIP6963_RDNS_WITH_REQUEST_ACCOUNTS, resolveEip6963Capabilities } from "../capabilities";

describe("resolveEip6963Capabilities", () => {
  it("MetaMask gets requestAccounts: true (allow-listed)", () => {
    const caps = resolveEip6963Capabilities({ rdns: "io.metamask" });
    expect(caps.requestAccounts).toBe(true);
  });

  it.each([
    "io.rabby",
    "com.coinbase.wallet",
    "app.phantom",
    "com.brave.wallet",
    "com.okex.wallet",
    "com.binance.wallet",
    "com.bitkeep.wallet",
    "com.trustwallet.app",
    "com.backpack",
    "sh.frame.wallet",
    "xyz.unknown.wallet",
  ])("non-allow-listed wallet %s gets requestAccounts: false", (rdns) => {
    const caps = resolveEip6963Capabilities({ rdns });
    expect(caps.requestAccounts).toBe(false);
  });

  it("universal EVM capabilities are stable across rdns values", () => {
    for (const rdns of ["io.metamask", "io.rabby", "app.phantom"]) {
      const caps = resolveEip6963Capabilities({ rdns });
      expect(caps).toMatchObject({
        getBalance: true,
        getTransactionReceipt: true,
        sendTransaction: true,
        signMessage: true,
        subscribe: true,
        switchAccount: false,
        switchChain: true,
      });
    }
  });

  it("allow-list contents are stable (pin contract)", () => {
    expect([...EIP6963_RDNS_WITH_REQUEST_ACCOUNTS]).toEqual(["io.metamask"]);
  });
});
