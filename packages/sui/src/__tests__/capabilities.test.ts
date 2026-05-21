import { describe, expect, it } from "vitest";

import { resolveSuiCapabilities } from "../capabilities";

describe("resolveSuiCapabilities", () => {
  const baseFeatures = {
    events: true,
    signAndExecuteTransaction: true,
    signMessage: true,
    signTransaction: true,
  };

  it("all-features wallet gets the expected Sui shape", () => {
    const caps = resolveSuiCapabilities({
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

  it("missing signAndExecuteTransaction → sendTransaction: false", () => {
    const caps = resolveSuiCapabilities({
      chainCount: 1,
      features: { ...baseFeatures, signAndExecuteTransaction: false },
    });
    expect(caps.sendTransaction).toBe(false);
  });

  it("missing signMessage → signMessage: false", () => {
    const caps = resolveSuiCapabilities({
      chainCount: 1,
      features: { ...baseFeatures, signMessage: false },
    });
    expect(caps.signMessage).toBe(false);
  });

  it("missing signTransaction → signTransaction: false", () => {
    const caps = resolveSuiCapabilities({
      chainCount: 1,
      features: { ...baseFeatures, signTransaction: false },
    });
    expect(caps.signTransaction).toBe(false);
  });

  it("missing events → subscribe: false", () => {
    const caps = resolveSuiCapabilities({
      chainCount: 1,
      features: { ...baseFeatures, events: false },
    });
    expect(caps.subscribe).toBe(false);
  });

  it("signIn is always false (Sui has no SIWS equivalent in Wallet Standard)", () => {
    const caps = resolveSuiCapabilities({
      chainCount: 1,
      features: baseFeatures,
    });
    expect(caps.signIn).toBe(false);
  });

  it("chainCount > 1 → switchChain: true", () => {
    const caps = resolveSuiCapabilities({
      chainCount: 2,
      features: baseFeatures,
    });
    expect(caps.switchChain).toBe(true);
  });

  it("chainCount === 1 → switchChain: false", () => {
    const caps = resolveSuiCapabilities({
      chainCount: 1,
      features: baseFeatures,
    });
    expect(caps.switchChain).toBe(false);
  });
});
