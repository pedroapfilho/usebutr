import { describe, expect, it } from "vitest";

import { resolveBitcoinCapabilities } from "../capabilities";

describe("resolveBitcoinCapabilities", () => {
  const baseFeatures = {
    events: true,
    sendTransfer: true,
    signMessage: true,
    signPsbt: true,
  };

  it("all-features wallet gets the expected Bitcoin shape", () => {
    const caps = resolveBitcoinCapabilities({
      chainCount: 1,
      features: baseFeatures,
    });
    expect(caps).toEqual({
      getBalance: false,
      getTransactionReceipt: false,
      requestAccounts: false,
      sendTransaction: true,
      signIn: false,
      signMessage: true,
      signTransaction: true,
      subscribe: true,
      switchAccount: false,
      switchChain: false,
    });
  });

  it("missing sendTransfer → sendTransaction: false", () => {
    const caps = resolveBitcoinCapabilities({
      chainCount: 1,
      features: { ...baseFeatures, sendTransfer: false },
    });
    expect(caps.sendTransaction).toBe(false);
  });

  it("missing signPsbt → signTransaction: false", () => {
    const caps = resolveBitcoinCapabilities({
      chainCount: 1,
      features: { ...baseFeatures, signPsbt: false },
    });
    expect(caps.signTransaction).toBe(false);
  });

  it("missing signMessage → signMessage: false", () => {
    const caps = resolveBitcoinCapabilities({
      chainCount: 1,
      features: { ...baseFeatures, signMessage: false },
    });
    expect(caps.signMessage).toBe(false);
  });

  it("missing events → subscribe: false", () => {
    const caps = resolveBitcoinCapabilities({
      chainCount: 1,
      features: { ...baseFeatures, events: false },
    });
    expect(caps.subscribe).toBe(false);
  });

  it("chainCount > 1 → switchChain: true", () => {
    const caps = resolveBitcoinCapabilities({
      chainCount: 2,
      features: baseFeatures,
    });
    expect(caps.switchChain).toBe(true);
  });
});
