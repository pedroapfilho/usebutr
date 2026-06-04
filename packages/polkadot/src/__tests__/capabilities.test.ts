import { describe, expect, it } from "vitest";

import {
  resolveInjectedPolkadotCapabilities,
  resolveWalletStandardPolkadotCapabilities,
} from "../capabilities";

describe("resolveInjectedPolkadotCapabilities", () => {
  it("enables signMessage, subscribe, switchChain; gates RPC features off", () => {
    expect(resolveInjectedPolkadotCapabilities()).toEqual({
      getBalance: false,
      getTransactionReceipt: false,
      requestAccounts: false,
      sendTransaction: false,
      signIn: false,
      signMessage: true,
      signTransaction: false,
      subscribe: true,
      switchAccount: false,
      switchChain: true,
    });
  });
});

describe("resolveWalletStandardPolkadotCapabilities", () => {
  it("derives signMessage/subscribe/switchChain from advertised features", () => {
    expect(
      resolveWalletStandardPolkadotCapabilities({
        chainCount: 2,
        features: { events: true, signMessage: true },
      }),
    ).toEqual({
      getBalance: false,
      getTransactionReceipt: false,
      requestAccounts: false,
      sendTransaction: false,
      signIn: false,
      signMessage: true,
      signTransaction: false,
      subscribe: true,
      switchAccount: false,
      switchChain: true,
    });
  });

  it("disables switchChain when only one chain is advertised", () => {
    expect(
      resolveWalletStandardPolkadotCapabilities({
        chainCount: 1,
        features: { events: false, signMessage: false },
      }).switchChain,
    ).toBe(false);
  });
});
