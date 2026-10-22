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
  chains: [MAINNET, TESTNET],
  features: ["bitcoin:sendTransfer", "bitcoin:signMessage", "bitcoin:signPsbt"],
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

const buildSigner = () => {
  const signMessage = vi.fn<BitcoinSignMessageFeature["signMessage"]>().mockResolvedValue({
    signature: new Uint8Array([7, 8, 9]),
    signedMessage: new Uint8Array([1, 2]),
  });

  const adapter = buildAdapter(buildWallet({}, { "bitcoin:signMessage": { signMessage } }));

  return { adapter, signMessage };
};

const buildSender = (chains: ReadonlyArray<string> = [MAINNET, TESTNET]) => {
  const { feature, sendTransfer } = sendTransferFeature();
  const adapter = buildAdapter(buildWallet({ chains }, { "bitcoin:sendTransfer": feature }));

  return { adapter, sendTransfer };
};

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
  });

  describe("sendTx", () => {
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
  });
});

describe("discoverBitcoinAdapters", () => {
  it("announces only wallets that speak Bitcoin", async () => {
    const onAdapter = vi.fn<(adapter: WalletAdapter) => void>();
    const wallets = [buildWallet(), buildWallet({ chains: ["solana:mainnet"], name: "Solflare" })];

    const unsubscribe = discoverBitcoinAdapters(onAdapter, () =>
      Promise.resolve({ getWallets: () => ({ get: () => wallets, on: () => () => {} }) }),
    );

    await vi.waitFor(() => {
      expect(onAdapter).toHaveBeenCalledOnce();
    });
    expect(onAdapter.mock.calls[0]?.[0].chainPlatform).toBe("bitcoin");
    unsubscribe();
  });
});

describe("buildBitcoinAdapter scoped signing", () => {
  it("routes transfers and PSBTs through an account on the requested chain", async () => {
    const main = { ...FIRST, chains: [MAINNET] };
    const test = { ...SECOND, chains: [TESTNET] };
    const { feature: send, sendTransfer } = sendTransferFeature();
    const { feature: sign, signPsbt } = signPsbtFeature();

    const adapter = buildAdapter(
      buildWallet(
        {
          accounts: [{ ...main, address: "SUI", chains: ["sui:mainnet"] }, main, test],
          chains: [MAINNET, TESTNET],
        },
        { "bitcoin:sendTransfer": send, "bitcoin:signPsbt": sign },
      ),
    );

    await adapter.sendTx?.(TRANSFER, { chain: BITCOIN_CHAINS.testnet });
    await adapter.signTransaction?.(new Uint8Array([1]), { chain: BITCOIN_CHAINS.testnet });
    expect(sendTransfer).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ account: test, chain: TESTNET }),
    );
    expect(signPsbt).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ account: test, chain: TESTNET }),
    );

    const invalid = {
      account: buildAccount(main.address, BITCOIN_CHAINS.mainnet),
      chain: BITCOIN_CHAINS.testnet,
    };

    await expect(adapter.sendTx?.(TRANSFER, invalid)).rejects.toMatchObject({
      kind: "AccountNotExposed",
    });
    await expect(adapter.signTransaction?.(new Uint8Array([1]), invalid)).rejects.toMatchObject({
      kind: "AccountNotExposed",
    });
    expect(sendTransfer).toHaveBeenCalledOnce();
    expect(signPsbt).toHaveBeenCalledOnce();
  });

  it("requires message-signing support on the selected account", async () => {
    const signMessage = vi
      .fn<BitcoinSignMessageFeature["signMessage"]>()
      .mockResolvedValue({ signature: new Uint8Array([1]), signedMessage: new Uint8Array([1]) });

    const adapter = buildAdapter(
      buildWallet(
        { accounts: [{ ...FIRST, features: [] }, SECOND] },
        { "bitcoin:signMessage": { signMessage } },
      ),
    );

    await adapter.signMessage?.(new Uint8Array([1]));
    expect(signMessage).toHaveBeenCalledWith(expect.objectContaining({ account: SECOND }));
  });
});
