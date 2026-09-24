import type { ConnectorEvent, PolkadotAdapter } from "@usebutr/core";
import { buildAccount, POLKADOT_CHAINS } from "@usebutr/core";
import type {
  StandardConnectFeature,
  StandardEventsFeature,
  StandardEventsListener,
  WalletStandardWallet,
  WalletStandardWalletAccount,
} from "@usebutr/wallet-standard-shared";
import { describe, expect, it, vi } from "vitest";

import { buildPolkadotWalletStandardAdapter } from "../wallet-standard-adapter";
import type { PolkadotSignMessageFeature } from "../wallet-standard-types";

const ADDRESS = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
const OTHER_ADDRESS = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";
const { kusama, polkadot, westend } = POLKADOT_CHAINS;

const walletAccount = (address: string): WalletStandardWalletAccount => ({
  address,
  chains: [polkadot.id],
  features: [],
});

type FeatureMap = Record<
  string,
  PolkadotSignMessageFeature | StandardConnectFeature | StandardEventsFeature
>;

const connectFeature: StandardConnectFeature = {
  connect: vi.fn<StandardConnectFeature["connect"]>().mockResolvedValue({ accounts: [] }),
};

const buildWallet = (
  overrides: Partial<WalletStandardWallet> = {},
  features: FeatureMap = {},
): WalletStandardWallet => ({
  accounts: [walletAccount(ADDRESS)],
  chains: [polkadot.id],
  icon: "data:image/svg+xml;base64,AAAA",
  name: "Mock Polkadot Wallet",
  version: "1.0.0",
  ...overrides,
  features: { "standard:connect": connectFeature, ...features },
});

const requireAdapter = (wallet: WalletStandardWallet): PolkadotAdapter => {
  const adapter = buildPolkadotWalletStandardAdapter(wallet);
  if (adapter === null) {
    throw new Error("expected a Polkadot Wallet Standard adapter");
  }
  return adapter;
};

const requireSignMessage = (adapter: PolkadotAdapter) => {
  if (adapter.signMessage === undefined) {
    throw new Error("expected signMessage");
  }
  return adapter.signMessage;
};

const signMessageFeature = () =>
  vi
    .fn<PolkadotSignMessageFeature["signMessage"]>()
    .mockResolvedValue({ signature: new Uint8Array([2]) });

describe("buildPolkadotWalletStandardAdapter", () => {
  it("returns null when the wallet advertises no polkadot: chain", () => {
    expect(buildPolkadotWalletStandardAdapter(buildWallet({ chains: ["eip155:1"] }))).toBeNull();
  });

  it("returns null when standard:connect is missing", () => {
    expect(buildPolkadotWalletStandardAdapter({ ...buildWallet(), features: {} })).toBeNull();
  });

  it("builds a polkadot adapter with a slug id and the wallet's name", () => {
    const adapter = requireAdapter(buildWallet({ name: "SubWallet" }));
    expect(adapter.chainPlatform).toBe("polkadot");
    expect(adapter.id).toBe("wallet-standard:polkadot-subwallet");
    expect(adapter.name).toBe("SubWallet");
  });

  it("defines no RPC-backed method", () => {
    const adapter = requireAdapter(buildWallet());
    expect(adapter.getBalance).toBeUndefined();
    expect(adapter.getTransactionReceipt).toBeUndefined();
    expect("sendTx" in adapter).toBe(false);
  });

  it("resolves accounts on the chain registry's Polkadot entry", async () => {
    const adapter = requireAdapter(
      buildWallet({ accounts: [walletAccount(ADDRESS), walletAccount(OTHER_ADDRESS)] }),
    );
    await expect(adapter.getAccounts()).resolves.toEqual([
      buildAccount(ADDRESS, polkadot),
      buildAccount(OTHER_ADDRESS, polkadot),
    ]);
  });

  it("prefers Polkadot even when the wallet lists a testnet first", async () => {
    const adapter = requireAdapter(buildWallet({ chains: [westend.id, polkadot.id] }));
    const [account] = await adapter.getAccounts();
    expect(account?.chain).toBe(polkadot);
  });

  it("names a chain outside the registry by its id, never the wallet's name", async () => {
    const adapter = requireAdapter(buildWallet({ chains: ["polkadot:paseo-like"] }));
    const [account] = await adapter.getAccounts();
    expect(account?.chain.name).toBe("polkadot:paseo-like");
  });

  it("getSigner() hands back the Wallet Standard wallet", async () => {
    const wallet = buildWallet();
    await expect(requireAdapter(wallet).getSigner()).resolves.toEqual({
      kind: "wallet-standard",
      wallet,
    });
  });

  describe("switchChain", () => {
    it("is absent when the wallet advertises a single polkadot: chain", () => {
      expect(requireAdapter(buildWallet()).switchChain).toBeUndefined();
    });

    it("re-points accounts at a chain the wallet advertises", async () => {
      const adapter = requireAdapter(buildWallet({ chains: [polkadot.id, kusama.id] }));
      await adapter.switchChain?.(kusama);
      const [account] = await adapter.getAccounts();
      expect(account?.chain).toBe(kusama);
    });

    it("rejects a chain from another namespace", async () => {
      const adapter = requireAdapter(buildWallet({ chains: [polkadot.id, kusama.id] }));
      await expect(
        adapter.switchChain?.({
          id: "eip155:1",
          name: "Ethereum",
          namespace: "eip155",
          reference: "1",
        }),
      ).rejects.toThrow(/non-Polkadot/v);
    });

    it("rejects a polkadot chain the wallet does not advertise", async () => {
      const adapter = requireAdapter(buildWallet({ chains: [polkadot.id, kusama.id] }));
      await expect(adapter.switchChain?.(westend)).rejects.toThrow(/does not advertise chain/v);
    });
  });

  describe("subscribe", () => {
    it("is absent without standard:events", () => {
      expect(requireAdapter(buildWallet()).subscribe).toBeUndefined();
    });

    it("ignores a chains change: Polkadot wallets advertise one relay chain", () => {
      const listeners = new Set<StandardEventsListener>();
      const events: StandardEventsFeature = {
        on: (_event, listener) => {
          listeners.add(listener);
          return () => {
            listeners.delete(listener);
          };
        },
      };
      const emitChange: StandardEventsListener = (changes) => {
        for (const listener of listeners) {
          listener(changes);
        }
      };
      const adapter = requireAdapter(
        buildWallet({ chains: [polkadot.id, kusama.id] }, { "standard:events": events }),
      );
      const received: Array<ConnectorEvent> = [];
      adapter.subscribe?.((event) => {
        received.push(event);
      });

      emitChange({ chains: [kusama.id] });
      emitChange({ accounts: [walletAccount(OTHER_ADDRESS)] });

      expect(received).toEqual([
        { accounts: [buildAccount(OTHER_ADDRESS, polkadot)], type: "accountsChanged" },
      ]);
    });
  });

  describe("signMessage", () => {
    it("is absent when polkadot:signMessage is not advertised", () => {
      expect(requireAdapter(buildWallet()).signMessage).toBeUndefined();
    });

    it("signs as the active account and falls back to the input as signedMessage", async () => {
      const signMessage = signMessageFeature();
      const wallet = buildWallet({}, { "polkadot:signMessage": { signMessage } });
      const message = new Uint8Array([1]);

      await expect(requireSignMessage(requireAdapter(wallet))(message)).resolves.toEqual({
        signature: new Uint8Array([2]),
        signedMessage: message,
      });
      expect(signMessage).toHaveBeenCalledWith({ account: wallet.accounts[0], message });
    });

    it("preserves the signed message the wallet reports", async () => {
      const signedMessage = new Uint8Array([3]);
      const signMessage = signMessageFeature().mockResolvedValue({
        signature: new Uint8Array([2]),
        signedMessage,
      });
      const adapter = requireAdapter(buildWallet({}, { "polkadot:signMessage": { signMessage } }));

      await expect(requireSignMessage(adapter)(new Uint8Array([1]))).resolves.toEqual({
        signature: new Uint8Array([2]),
        signedMessage,
      });
    });

    it("signs as the requested account", async () => {
      const signMessage = signMessageFeature();
      const wallet = buildWallet(
        { accounts: [walletAccount(ADDRESS), walletAccount(OTHER_ADDRESS)] },
        { "polkadot:signMessage": { signMessage } },
      );

      await requireSignMessage(requireAdapter(wallet))(new Uint8Array([1]), {
        account: buildAccount(OTHER_ADDRESS, polkadot),
      });

      expect(signMessage).toHaveBeenCalledWith(
        expect.objectContaining({ account: wallet.accounts[1] }),
      );
    });

    it("rejects an account the wallet does not expose instead of signing as another", async () => {
      const signMessage = signMessageFeature();
      const adapter = requireAdapter(buildWallet({}, { "polkadot:signMessage": { signMessage } }));

      await expect(
        requireSignMessage(adapter)(new Uint8Array([1]), {
          account: buildAccount(OTHER_ADDRESS, polkadot),
        }),
      ).rejects.toThrow(/does not expose account/v);
      expect(signMessage).not.toHaveBeenCalled();
    });
  });
});
