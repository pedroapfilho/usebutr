import type { WalletAdapter } from "@usebutr/core";
import { BITCOIN_CHAINS, buildAccount } from "@usebutr/core";
import type {
  StandardConnectFeature,
  WalletStandardFeature,
  WalletStandardWallet,
  WalletStandardWalletAccount,
} from "@usebutr/wallet-standard-shared";
import { describe, expect, it, vi } from "vitest";

import { buildBitcoinAdapter, discoverBitcoinAdapters } from "../wallet-standard-adapter";
import type {
  BitcoinSendTransferFeature,
  BitcoinSignMessageFeature,
  BitcoinSignPsbtFeature,
} from "../wallet-standard-types";

const MAINNET = BITCOIN_CHAINS.mainnet.id;
const TESTNET = BITCOIN_CHAINS.testnet.id;

const wsAccount = (address: string): WalletStandardWalletAccount => ({
  address,
  chains: [MAINNET],
  features: [],
});

const FIRST = wsAccount("bc1qfirst");
const SECOND = wsAccount("bc1qsecond");

const connectFeature = (): StandardConnectFeature => ({
  connect: vi.fn<StandardConnectFeature["connect"]>().mockResolvedValue({ accounts: [] }),
});

const buildWallet = (
  overrides: Partial<WalletStandardWallet> = {},
  features: Record<string, WalletStandardFeature> = {},
): WalletStandardWallet => ({
  accounts: [FIRST, SECOND],
  chains: [MAINNET],
  features: { "standard:connect": connectFeature(), ...features },
  icon: "data:image/svg+xml;base64,...",
  name: "Mock Bitcoin Wallet",
  version: "1.0.0",
  ...overrides,
});

const buildAdapter = (wallet: WalletStandardWallet) => {
  const adapter = buildBitcoinAdapter(wallet);
  if (adapter === null) {
    throw new Error("expected a bitcoin adapter");
  }
  return adapter;
};

const sendTransferFeature = () => {
  const sendTransfer = vi
    .fn<BitcoinSendTransferFeature["sendTransfer"]>()
    .mockResolvedValue({ txid: "abcd1234" });
  const feature: BitcoinSendTransferFeature = { sendTransfer };
  return { feature, sendTransfer };
};

const signPsbtFeature = () => {
  const signPsbt = vi
    .fn<BitcoinSignPsbtFeature["signPsbt"]>()
    .mockResolvedValue({ signedPsbt: new Uint8Array([10, 11, 12]) });
  const feature: BitcoinSignPsbtFeature = { signPsbt };
  return { feature, signPsbt };
};

const TRANSFER = { amount: 12_345n, recipient: "bc1qto" };
const STRANGER = buildAccount("bc1qstranger", BITCOIN_CHAINS.mainnet);
const SUI_MAINNET = { id: "sui:mainnet", name: "Sui", namespace: "sui", reference: "mainnet" };

describe("buildBitcoinAdapter", () => {
  it("returns null when the wallet advertises no bip122 chain", () => {
    expect(buildBitcoinAdapter(buildWallet({ chains: ["eip155:1"] }))).toBeNull();
  });

  it("returns null when standard:connect is missing", () => {
    expect(buildBitcoinAdapter(buildWallet({ features: {} }))).toBeNull();
  });

  it("uses the wallet name for the adapter name and its slug for the id", () => {
    const adapter = buildAdapter(buildWallet({ name: "Phantom" }));

    expect(adapter.id).toBe("wallet-standard:btc-phantom");
    expect(adapter.name).toBe("Phantom");
    expect(adapter.chainPlatform).toBe("bitcoin");
  });

  it("getAccounts() lists every account, active first, on the registry's chain", async () => {
    const accounts = await buildAdapter(buildWallet()).getAccounts();

    expect(accounts.map((a) => a.walletAddress)).toEqual([FIRST.address, SECOND.address]);
    expect(accounts[0]?.chain).toEqual(BITCOIN_CHAINS.mainnet);
  });

  it("getSigner() hands back the Wallet Standard wallet", async () => {
    const wallet = buildWallet();

    expect(await buildAdapter(wallet).getSigner()).toEqual({ kind: "wallet-standard", wallet });
  });

  it("defines no method the wallet cannot back", () => {
    const adapter = buildAdapter(buildWallet());

    expect(adapter.sendTx).toBeUndefined();
    expect(adapter.signMessage).toBeUndefined();
    expect(adapter.signTransaction).toBeUndefined();
    expect(adapter.getBalance).toBeUndefined();
    expect(adapter.getTransactionReceipt).toBeUndefined();
    expect(adapter.requestAccounts).toBeUndefined();
    expect(adapter.switchChain).toBeUndefined();
  });

  describe("signMessage", () => {
    const buildSigner = () => {
      const signMessage = vi.fn<BitcoinSignMessageFeature["signMessage"]>().mockResolvedValue({
        signature: new Uint8Array([7, 8, 9]),
        signedMessage: new Uint8Array([1, 2]),
      });
      const adapter = buildAdapter(buildWallet({}, { "bitcoin:signMessage": { signMessage } }));
      return { adapter, signMessage };
    };

    it("bridges through bitcoin:signMessage with the active account", async () => {
      const { adapter, signMessage } = buildSigner();
      const message = new Uint8Array([99]);

      const result = await adapter.signMessage?.(message);

      expect(signMessage).toHaveBeenCalledWith({ account: FIRST, message });
      expect(result).toEqual({
        signature: new Uint8Array([7, 8, 9]),
        signedMessage: new Uint8Array([1, 2]),
      });
    });

    it("signs as the requested account", async () => {
      const { adapter, signMessage } = buildSigner();

      await adapter.signMessage?.(new Uint8Array([99]), {
        account: buildAccount(SECOND.address, BITCOIN_CHAINS.mainnet),
      });

      expect(signMessage).toHaveBeenCalledWith(expect.objectContaining({ account: SECOND }));
    });

    it("rejects an account the wallet does not expose", async () => {
      const { adapter, signMessage } = buildSigner();

      await expect(
        adapter.signMessage?.(new Uint8Array([99]), { account: STRANGER }),
      ).rejects.toThrow(/does not expose account bc1qstranger/v);
      expect(signMessage).not.toHaveBeenCalled();
    });
  });

  describe("sendTx", () => {
    const buildSender = (chains: ReadonlyArray<string> = [MAINNET, TESTNET]) => {
      const { feature, sendTransfer } = sendTransferFeature();
      const adapter = buildAdapter(buildWallet({ chains }, { "bitcoin:sendTransfer": feature }));
      return { adapter, sendTransfer };
    };

    it("bridges through bitcoin:sendTransfer on the current chain and returns the txid", async () => {
      const { adapter, sendTransfer } = buildSender();

      const txid = await adapter.sendTx?.(TRANSFER);

      expect(sendTransfer).toHaveBeenCalledWith({
        account: FIRST,
        amount: 12_345n,
        chain: MAINNET,
        recipient: "bc1qto",
      });
      expect(txid).toBe("abcd1234");
    });

    it("routes options.chain to this one call without moving the adapter", async () => {
      const { adapter, sendTransfer } = buildSender();

      await adapter.sendTx?.(TRANSFER, { chain: BITCOIN_CHAINS.testnet });
      await adapter.sendTx?.(TRANSFER);

      expect(sendTransfer.mock.calls.map((call) => call[0].chain)).toEqual([TESTNET, MAINNET]);
    });

    it("sends from the requested account", async () => {
      const { adapter, sendTransfer } = buildSender();

      await adapter.sendTx?.(TRANSFER, {
        account: buildAccount(SECOND.address, BITCOIN_CHAINS.mainnet),
      });

      expect(sendTransfer).toHaveBeenCalledWith(expect.objectContaining({ account: SECOND }));
    });

    it("rejects an account the wallet does not expose", async () => {
      const { adapter, sendTransfer } = buildSender();

      await expect(adapter.sendTx?.(TRANSFER, { account: STRANGER })).rejects.toThrow(
        /does not expose account/v,
      );
      expect(sendTransfer).not.toHaveBeenCalled();
    });

    it("rejects a chain the wallet does not advertise", async () => {
      const { adapter, sendTransfer } = buildSender([MAINNET]);

      await expect(adapter.sendTx?.(TRANSFER, { chain: BITCOIN_CHAINS.testnet })).rejects.toThrow(
        /does not advertise chain/v,
      );
      expect(sendTransfer).not.toHaveBeenCalled();
    });

    it("rejects a chain from another namespace", async () => {
      const { adapter } = buildSender();

      await expect(adapter.sendTx?.(TRANSFER, { chain: SUI_MAINNET })).rejects.toThrow(
        /non-Bitcoin/v,
      );
    });
  });

  describe("signTransaction", () => {
    it("bridges PSBT bytes through bitcoin:signPsbt on the current chain", async () => {
      const { feature, signPsbt } = signPsbtFeature();
      const adapter = buildAdapter(buildWallet({}, { "bitcoin:signPsbt": feature }));
      const psbt = new Uint8Array([1, 2, 3]);

      const signed = await adapter.signTransaction?.(psbt);

      expect(signPsbt).toHaveBeenCalledWith({ account: FIRST, chain: MAINNET, psbt });
      expect(signed).toEqual(new Uint8Array([10, 11, 12]));
    });

    it("routes options.chain and options.account", async () => {
      const { feature, signPsbt } = signPsbtFeature();
      const adapter = buildAdapter(
        buildWallet({ chains: [MAINNET, TESTNET] }, { "bitcoin:signPsbt": feature }),
      );

      await adapter.signTransaction?.(new Uint8Array([1]), {
        account: buildAccount(SECOND.address, BITCOIN_CHAINS.mainnet),
        chain: BITCOIN_CHAINS.testnet,
      });

      expect(signPsbt).toHaveBeenCalledWith(
        expect.objectContaining({ account: SECOND, chain: TESTNET }),
      );
    });
  });

  describe("switchChain", () => {
    it("re-points later calls when the wallet advertises several chains", async () => {
      const { feature, sendTransfer } = sendTransferFeature();
      const adapter = buildAdapter(
        buildWallet({ chains: [MAINNET, TESTNET] }, { "bitcoin:sendTransfer": feature }),
      );

      await adapter.switchChain?.(BITCOIN_CHAINS.testnet);
      await adapter.sendTx?.(TRANSFER);

      expect(sendTransfer).toHaveBeenCalledWith(expect.objectContaining({ chain: TESTNET }));
      await expect(adapter.getAccounts()).resolves.toMatchObject([
        { chain: BITCOIN_CHAINS.testnet },
        { chain: BITCOIN_CHAINS.testnet },
      ]);
    });

    it("rejects a non-bip122 namespace", async () => {
      const adapter = buildAdapter(buildWallet({ chains: [MAINNET, TESTNET] }));

      await expect(adapter.switchChain?.(SUI_MAINNET)).rejects.toThrow(/non-Bitcoin/v);
    });
  });
});

describe("discoverBitcoinAdapters", () => {
  it("returns a teardown handle", () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();

    const unsubscribe = discoverBitcoinAdapters(onAdapter);

    expect(typeof unsubscribe).toBe("function");
    expect(() => {
      unsubscribe();
    }).not.toThrow();
  });
});
