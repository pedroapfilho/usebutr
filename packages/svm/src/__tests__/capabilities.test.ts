import { describe, expect, it } from "vitest";

import { resolveWalletStandardCapabilities } from "../capabilities";

describe("resolveWalletStandardCapabilities", () => {
  const baseFeatures = {
    events: true,
    signAndSendTransaction: true,
    signIn: true,
    signMessage: true,
    signTransaction: true,
  };

  it("all-features wallet gets the expected SVM shape", () => {
    const caps = resolveWalletStandardCapabilities({
      chainCount: 1,
      features: baseFeatures,
    });
    expect(caps).toEqual({
      getBalance: false,
      getTransactionReceipt: false,
      requestAccounts: false,
      sendTransaction: true,
      signIn: true,
      signMessage: true,
      signTransaction: true,
      subscribe: true,
      switchAccount: false,
      switchChain: false,
    });
  });

  it("missing signAndSendTransaction → sendTransaction: false", () => {
    const caps = resolveWalletStandardCapabilities({
      chainCount: 1,
      features: { ...baseFeatures, signAndSendTransaction: false },
    });
    expect(caps.sendTransaction).toBe(false);
  });

  it("missing signMessage → signMessage: false", () => {
    const caps = resolveWalletStandardCapabilities({
      chainCount: 1,
      features: { ...baseFeatures, signMessage: false },
    });
    expect(caps.signMessage).toBe(false);
  });

  it("missing events → subscribe: false", () => {
    const caps = resolveWalletStandardCapabilities({
      chainCount: 1,
      features: { ...baseFeatures, events: false },
    });
    expect(caps.subscribe).toBe(false);
  });

  it("chainCount > 1 → switchChain: true", () => {
    const caps = resolveWalletStandardCapabilities({
      chainCount: 2,
      features: baseFeatures,
    });
    expect(caps.switchChain).toBe(true);
  });

  it("chainCount === 1 → switchChain: false", () => {
    const caps = resolveWalletStandardCapabilities({
      chainCount: 1,
      features: baseFeatures,
    });
    expect(caps.switchChain).toBe(false);
  });
});
