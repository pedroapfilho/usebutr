import { describe, expect, it } from "vitest";

import type { WalletCapabilityProfile } from "../capabilities";
import { buildWalletCapabilities } from "../capabilities";

const profile = (overrides: Partial<WalletCapabilityProfile> = {}): WalletCapabilityProfile => ({
  chainCount: 1,
  events: true,
  sendTransaction: true,
  signIn: true,
  signMessage: true,
  signTransaction: true,
  ...overrides,
});

describe("buildWalletCapabilities", () => {
  it("maps a fully featured single-chain wallet", () => {
    expect(buildWalletCapabilities(profile())).toEqual({
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

  it("passes each feature flag straight through", () => {
    expect(
      buildWalletCapabilities(
        profile({
          events: false,
          sendTransaction: false,
          signIn: false,
          signMessage: false,
          signTransaction: false,
        }),
      ),
    ).toEqual({
      getBalance: false,
      getTransactionReceipt: false,
      requestAccounts: false,
      sendTransaction: false,
      signIn: false,
      signMessage: false,
      signTransaction: false,
      subscribe: false,
      switchAccount: false,
      switchChain: false,
    });
  });

  it("gates switchChain on more than one chain in the namespace", () => {
    expect(buildWalletCapabilities(profile({ chainCount: 0 })).switchChain).toBe(false);
    expect(buildWalletCapabilities(profile({ chainCount: 1 })).switchChain).toBe(false);
    expect(buildWalletCapabilities(profile({ chainCount: 3 })).switchChain).toBe(true);
  });
});
