import { describe, expect, it } from "vitest";
import { createFakeAdapter } from "../fake-adapter";

describe("createFakeAdapter", () => {
  it("returns a WalletAdapter with all required surface", () => {
    const a = createFakeAdapter();
    expect(a.id).toBe("fake");
    expect(a.name).toBe("Fake Wallet");
    expect(a.chainPlatform).toBe("evm");
    expect(typeof a.connect).toBe("function");
    expect(typeof a.disconnect).toBe("function");
    expect(typeof a.getAccount).toBe("function");
    expect(typeof a.getAccounts).toBe("function");
    expect(typeof a.getBalance).toBe("function");
    expect(typeof a.getSigner).toBe("function");
    expect(typeof a.getTransactionReceipt).toBe("function");
    expect(typeof a.sendTx).toBe("function");
    expect(typeof a.sendTxToChain).toBe("function");
    expect(typeof a.signMessage).toBe("function");
    expect(typeof a.subscribe).toBe("function");
    expect(typeof a.switchAccount).toBe("function");
    expect(typeof a.switchChain).toBe("function");
  });

  it("honours id, name, icon, and chainPlatform overrides", () => {
    const a = createFakeAdapter({
      id: "x",
      name: "X Wallet",
      icon: "data:img/svg",
      chainPlatform: "svm",
    });
    expect(a.id).toBe("x");
    expect(a.name).toBe("X Wallet");
    expect(a.icon).toBe("data:img/svg");
    expect(a.chainPlatform).toBe("svm");
  });

  it("merges capability overrides on top of defaults", () => {
    const a = createFakeAdapter({ capabilities: { requestAccounts: false, switchAccount: false } });
    expect(a.capabilities.requestAccounts).toBe(false);
    expect(a.capabilities.switchAccount).toBe(false);
    // Untouched capabilities keep their defaults.
    expect(a.capabilities.getBalance).toBe(true);
    expect(a.capabilities.signMessage).toBe(true);
  });

  it("returns the first account from getAccount and the full list from getAccounts", async () => {
    const accounts = [
      {
        chain: { id: "eip155:1", name: "Ethereum", namespace: "eip155" as const, reference: "1" },
        id: "eip155:1:0x1",
        walletAddress: "0x1",
      },
      {
        chain: { id: "eip155:1", name: "Ethereum", namespace: "eip155" as const, reference: "1" },
        id: "eip155:1:0x2",
        walletAddress: "0x2",
      },
    ];
    const a = createFakeAdapter({ accounts });
    await expect(a.getAccount()).resolves.toEqual(accounts[0]);
    await expect(a.getAccounts?.()).resolves.toEqual(accounts);
  });

  it("returns null from getAccount when no accounts are configured", async () => {
    const a = createFakeAdapter();
    await expect(a.getAccount()).resolves.toBeNull();
  });

  it("uses 'ETH' symbol for EVM and 'SOL' for SVM balance stubs", async () => {
    const evm = createFakeAdapter({ chainPlatform: "evm" });
    const svm = createFakeAdapter({ chainPlatform: "svm" });
    const evmBalance = await evm.getBalance();
    const svmBalance = await svm.getBalance();
    expect(evmBalance.symbol).toBe("ETH");
    expect(svmBalance.symbol).toBe("SOL");
  });

  it("getTransactionReceipt resolves to a Success outcome", async () => {
    const a = createFakeAdapter();
    await expect(a.getTransactionReceipt("0xtx")).resolves.toEqual({ status: "Success" });
  });

  it("signMessage echoes the input bytes for signature and signedMessage", async () => {
    const a = createFakeAdapter();
    const msg = new Uint8Array([1, 2, 3]);
    const out = await a.signMessage(msg);
    expect(out.signature).toBe(msg);
    expect(out.signedMessage).toBe(msg);
  });

  it("sendTx and sendTxToChain return a deterministic hash", async () => {
    const a = createFakeAdapter();
    await expect(a.sendTx({})).resolves.toBe("0xfakehash");
    await expect(a.sendTxToChain({}, "1")).resolves.toBe("0xfakehash");
  });

  it("subscribe returns an unsubscribe function (no-op)", () => {
    const a = createFakeAdapter();
    const unsubscribe = a.subscribe?.(() => {});
    expect(typeof unsubscribe).toBe("function");
    expect(() => unsubscribe?.()).not.toThrow();
  });

  it("all stubbed lifecycle methods resolve without throwing", async () => {
    const a = createFakeAdapter();
    const chain = { id: "eip155:1", name: "Ethereum", namespace: "eip155" as const, reference: "1" };
    await expect(a.connect()).resolves.toBeUndefined();
    await expect(a.disconnect?.()).resolves.toBeUndefined();
    await expect(a.requestAccounts?.()).resolves.toBeUndefined();
    await expect(a.getSigner()).resolves.toEqual({});
    await expect(a.switchAccount?.("0x0")).resolves.toBeUndefined();
    await expect(a.switchChain(chain)).resolves.toBeUndefined();
  });
});
