import type {
  StandardConnectFeature,
  WalletStandardWallet,
  WalletStandardWalletAccount,
} from "@usebutr/wallet-standard-shared";
import { describe, expect, it, vi } from "vitest";

import { buildPolkadotWalletStandardAdapter } from "../wallet-standard-adapter";
import type { PolkadotSignMessageFeature } from "../wallet-standard-types";

const buildAccount = (address: string): WalletStandardWalletAccount => ({
  address,
  chains: ["polkadot:paseo"],
  features: [],
});

type FeatureMap = Record<string, unknown>;

const buildWallet = (overrides: Partial<WalletStandardWallet> = {}): WalletStandardWallet => ({
  accounts: [buildAccount("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")],
  chains: ["polkadot:paseo"],
  features: {},
  icon: "data:image/svg+xml;base64,...",
  name: "Mock Polkadot Wallet",
  version: "1.0.0",
  ...overrides,
});

const withFeatures = (
  wallet: WalletStandardWallet,
  features: FeatureMap,
): WalletStandardWallet => ({
  ...wallet,
  features: { ...wallet.features, ...features },
});

const baseConnect: StandardConnectFeature = {
  connect: vi.fn().mockResolvedValue({ accounts: [] }),
};

describe("buildPolkadotWalletStandardAdapter", () => {
  it("returns null when the wallet advertises no polkadot: chain", () => {
    const wallet = buildWallet({ chains: ["eip155:1"] });
    expect(buildPolkadotWalletStandardAdapter(wallet)).toBeNull();
  });

  it("returns null when standard:connect is missing", () => {
    const wallet = buildWallet({ features: {} });
    expect(buildPolkadotWalletStandardAdapter(wallet)).toBeNull();
  });

  it("builds an adapter with chainPlatform polkadot and slug-based id", () => {
    const wallet = withFeatures(buildWallet({ name: "SubWallet" }), {
      "standard:connect": baseConnect,
    });
    const adapter = buildPolkadotWalletStandardAdapter(wallet);
    expect(adapter?.chainPlatform).toBe("polkadot");
    expect(adapter?.id).toBe("wallet-standard:polkadot-subwallet");
    expect(adapter?.name).toBe("SubWallet");
  });

  it("derives signMessage capability from advertised polkadot:signMessage feature", () => {
    const signFeature: PolkadotSignMessageFeature = {
      signMessage: vi.fn().mockResolvedValue({ signature: new Uint8Array() }),
    };
    const wallet = withFeatures(buildWallet(), {
      "polkadot:signMessage": signFeature,
      "standard:connect": baseConnect,
    });
    const adapter = buildPolkadotWalletStandardAdapter(wallet);
    expect(adapter?.capabilities.signMessage).toBe(true);
  });

  it("sets signMessage capability false when polkadot:signMessage is absent", () => {
    const wallet = withFeatures(buildWallet(), { "standard:connect": baseConnect });
    const adapter = buildPolkadotWalletStandardAdapter(wallet);
    expect(adapter?.capabilities.signMessage).toBe(false);
  });

  it("sets subscribe capability true when standard:events is advertised", () => {
    const wallet = withFeatures(buildWallet(), {
      "standard:connect": baseConnect,
      "standard:events": { on: vi.fn() },
    });
    const adapter = buildPolkadotWalletStandardAdapter(wallet);
    expect(adapter?.capabilities.subscribe).toBe(true);
  });

  it("sets switchChain true when wallet advertises more than one polkadot: chain", () => {
    const wallet = withFeatures(buildWallet({ chains: ["polkadot:paseo", "polkadot:polkadot"] }), {
      "standard:connect": baseConnect,
    });
    const adapter = buildPolkadotWalletStandardAdapter(wallet);
    expect(adapter?.capabilities.switchChain).toBe(true);
  });

  it("sets switchChain false when wallet advertises only one polkadot: chain", () => {
    const wallet = withFeatures(buildWallet({ chains: ["polkadot:paseo"] }), {
      "standard:connect": baseConnect,
    });
    const adapter = buildPolkadotWalletStandardAdapter(wallet);
    expect(adapter?.capabilities.switchChain).toBe(false);
  });

  it("switchChain rejects a non-polkadot namespace chain", () => {
    const wallet = withFeatures(buildWallet({ chains: ["polkadot:paseo", "polkadot:polkadot"] }), {
      "standard:connect": baseConnect,
    });
    const adapter = buildPolkadotWalletStandardAdapter(wallet);
    expect(() =>
      adapter?.switchChain({
        id: "eip155:1",
        name: "Ethereum",
        namespace: "eip155",
        reference: "1",
      }),
    ).toThrow(/non-Polkadot/v);
  });

  it("switchChain rejects a polkadot chain id the wallet does not advertise", () => {
    const wallet = withFeatures(buildWallet({ chains: ["polkadot:paseo"] }), {
      "standard:connect": baseConnect,
    });
    const adapter = buildPolkadotWalletStandardAdapter(wallet);
    expect(() =>
      adapter?.switchChain({
        id: "polkadot:polkadot",
        name: "Polkadot",
        namespace: "polkadot",
        reference: "polkadot",
      }),
    ).toThrow(/does not advertise chain/v);
  });

  it("getSigner() returns the wallet object", async () => {
    const wallet = withFeatures(buildWallet(), { "standard:connect": baseConnect });
    const adapter = buildPolkadotWalletStandardAdapter(wallet);
    const signer = await adapter?.getSigner();
    expect(signer).toBe(wallet);
  });
});
