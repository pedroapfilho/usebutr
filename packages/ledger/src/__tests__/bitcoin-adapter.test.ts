import { describe, expect, it, vi } from "vitest";

import type {
  BitcoinAddressFormat,
  BtcAppConstructor,
  BtcAppLike,
  TransportFactory,
  TransportLike,
} from "../adapter";
import { createBitcoinLedgerAdapter, createLedgerAdapter } from "../adapter";

const PREFIX_BY_FORMAT: Record<BitcoinAddressFormat, string> = {
  bech32: "bc1q",
  bech32m: "bc1p",
  legacy: "1",
  p2sh: "3",
};

const buildFakeAddress = (index: number, format: BitcoinAddressFormat): string => {
  return `${PREFIX_BY_FORMAT[format]}fakeaddr${index}`;
};

type BtcCtorHooks = {
  onGetWalletPublicKey?: (path: string, format: BitcoinAddressFormat) => void;
  onSignMessage?: (path: string, messageHex: string) => void;
};

const buildFakeBtcCtor = (hooks: BtcCtorHooks = {}): BtcAppConstructor => {
  return class FakeBtc implements BtcAppLike {
    constructor(args: { currency?: string; transport: unknown }) {
      void args;
    }
    getWalletPublicKey(
      path: string,
      opts?: { format?: BitcoinAddressFormat; verify?: boolean },
    ): Promise<{ bitcoinAddress: string; chainCode: string; publicKey: string }> {
      const format = opts?.format ?? "bech32";
      hooks.onGetWalletPublicKey?.(path, format);
      const tail = path.split("/").pop() ?? "0";
      const idx = Math.trunc(Number(tail.replace(/'$/v, "")));
      return Promise.resolve({
        bitcoinAddress: buildFakeAddress(idx, format),
        chainCode: "aa".repeat(32),
        publicKey: "02".padEnd(66, "b"),
      });
    }
    signMessage(path: string, messageHex: string): Promise<{ r: string; s: string; v: number }> {
      hooks.onSignMessage?.(path, messageHex);
      return Promise.resolve({ r: "ab".repeat(32), s: "cd".repeat(32), v: 1 });
    }
    signPsbtBuffer(
      psbtBuffer: Uint8Array,
      options: { accountPath: string; addressFormat: BitcoinAddressFormat; finalizePsbt: boolean },
    ): Promise<{ psbt: Uint8Array; tx?: string }> {
      void options;
      // Echo the input bytes with an extra tag so tests can confirm the
      // round-trip plumbing without depending on a real PSBT structure.
      const out = new Uint8Array(psbtBuffer.length + 1);
      out.set(psbtBuffer);
      out[psbtBuffer.length] = 0xef;
      return Promise.resolve({ psbt: out });
    }
  };
};

const buildFakeTransport = (): {
  factory: TransportFactory;
  lastTransport: TransportLike | null;
} => {
  let lastTransport: TransportLike | null = null;
  const factory: TransportFactory = {
    create(): Promise<TransportLike> {
      const t: TransportLike = {
        close: vi.fn().mockResolvedValue(undefined),
      };
      lastTransport = t;
      return Promise.resolve(t);
    },
  };
  return {
    factory,
    get lastTransport() {
      return lastTransport;
    },
  };
};

describe("createBitcoinLedgerAdapter", () => {
  it("builds a Bitcoin adapter with conservative defaults", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createBitcoinLedgerAdapter({
      btc: buildFakeBtcCtor(),
      platform: "bitcoin",
      transport: factory,
    });

    expect(adapter.id).toBe("ledger");
    expect(adapter.name).toBe("Ledger");
    expect(adapter.chainPlatform).toBe("bitcoin");
    expect(adapter.capabilities.signMessage).toBe(true);
    expect(adapter.capabilities.sendTransaction).toBe(false);
    expect(adapter.capabilities.getBalance).toBe(false);
    expect(adapter.capabilities.subscribe).toBe(false);
    expect(adapter.capabilities.switchChain).toBe(true);
  });

  it("connect() opens transport and fetches a bech32 address by default", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createBitcoinLedgerAdapter({
      btc: buildFakeBtcCtor(),
      platform: "bitcoin",
      transport: factory,
    });

    await adapter.connect();
    const account = await adapter.getAccount();
    expect(account).not.toBeNull();
    expect(account?.chain.id).toBe("bip122:000000000019d6689c085ae165831e93");
    expect(account?.chain.namespace).toBe("bip122");
    expect(account?.walletAddress.startsWith("bc1q")).toBe(true);
  });

  it("respects an overridden addressFormat (legacy)", async () => {
    const formats: Array<BitcoinAddressFormat> = [];
    const { factory } = buildFakeTransport();
    const adapter = await createBitcoinLedgerAdapter({
      addressFormat: "legacy",
      btc: buildFakeBtcCtor({
        onGetWalletPublicKey: (_path, format) => {
          formats.push(format);
        },
      }),
      platform: "bitcoin",
      transport: factory,
    });

    await adapter.connect();
    const account = await adapter.getAccount();
    expect(account?.walletAddress.startsWith("1")).toBe(true);
    expect(formats[0]).toBe("legacy");
  });

  it("disconnect() closes the transport and clears state", async () => {
    const fake = buildFakeTransport();
    const adapter = await createBitcoinLedgerAdapter({
      btc: buildFakeBtcCtor(),
      platform: "bitcoin",
      transport: fake.factory,
    });

    await adapter.connect();
    const transport = fake.lastTransport;
    expect(transport).not.toBeNull();

    await adapter.disconnect?.();
    expect(transport?.close).toHaveBeenCalled();

    const account = await adapter.getAccount();
    expect(account).toBeNull();
  });

  it("getAccounts() walks the derivation path up to accountCount", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createBitcoinLedgerAdapter({
      accountCount: 3,
      btc: buildFakeBtcCtor(),
      platform: "bitcoin",
      transport: factory,
    });

    await adapter.connect();
    const accounts = await adapter.getAccounts!();
    expect(accounts).toHaveLength(3);
    const addresses = accounts.map((a) => a.walletAddress);
    expect(new Set(addresses).size).toBe(3);
    for (const account of accounts) {
      expect(account.chain.id).toBe("bip122:000000000019d6689c085ae165831e93");
    }
  });

  it("defaults accountCount to 1 when omitted", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createBitcoinLedgerAdapter({
      btc: buildFakeBtcCtor(),
      platform: "bitcoin",
      transport: factory,
    });

    await adapter.connect();
    const accounts = await adapter.getAccounts!();
    expect(accounts).toHaveLength(1);
  });

  it("signMessage() routes through Bitcoin signMessage with hex-encoded payload", async () => {
    const messages: Array<string> = [];
    const { factory } = buildFakeTransport();
    const adapter = await createBitcoinLedgerAdapter({
      btc: buildFakeBtcCtor({
        onSignMessage: (_path, messageHex) => {
          messages.push(messageHex);
        },
      }),
      platform: "bitcoin",
      transport: factory,
    });

    await adapter.connect();
    const message = new TextEncoder().encode("hi");
    const result = await adapter.signMessage(message);
    expect(messages[0]).toBe("6869");
    expect(result.signature).toBeInstanceOf(Uint8Array);
    expect(result.signature.length).toBe(65);
    expect(result.signature[64]).toBe(1);
  });

  it("signTransaction() round-trips PSBT bytes through signPsbtBuffer", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createBitcoinLedgerAdapter({
      btc: buildFakeBtcCtor(),
      platform: "bitcoin",
      transport: factory,
    });

    if (adapter.chainPlatform !== "bitcoin") {
      throw new Error("expected Bitcoin adapter");
    }

    await adapter.connect();
    const psbt = new Uint8Array([1, 2, 3, 4]);
    const signed = await adapter.signTransaction!(psbt);
    expect(signed).toBeInstanceOf(Uint8Array);
    expect(signed.length).toBe(5);
    expect(signed[4]).toBe(0xef);
  });

  it("signTransaction() rejects non-Uint8Array input", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createBitcoinLedgerAdapter({
      btc: buildFakeBtcCtor(),
      platform: "bitcoin",
      transport: factory,
    });

    if (adapter.chainPlatform !== "bitcoin") {
      throw new Error("expected Bitcoin adapter");
    }

    await adapter.connect();
    await expect(adapter.signTransaction!({ not: "bytes" })).rejects.toThrow(
      /expects a Uint8Array/v,
    );
  });

  it("signTransaction() with a non-active account walks paths to find it", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createBitcoinLedgerAdapter({
      accountCount: 3,
      btc: buildFakeBtcCtor(),
      platform: "bitcoin",
      transport: factory,
    });

    if (adapter.chainPlatform !== "bitcoin") {
      throw new Error("expected Bitcoin adapter");
    }

    await adapter.connect();
    const accounts = await adapter.getAccounts!();
    const targetAccount = accounts[2];
    if (!targetAccount) {
      throw new Error("expected third account");
    }
    const psbt = new Uint8Array([9, 9, 9]);
    const signed = await adapter.signTransaction!(psbt, targetAccount);
    expect(signed.length).toBe(4);
  });

  it("signTransaction() throws when the address isn't on any known path", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createBitcoinLedgerAdapter({
      accountCount: 2,
      btc: buildFakeBtcCtor(),
      platform: "bitcoin",
      transport: factory,
    });

    if (adapter.chainPlatform !== "bitcoin") {
      throw new Error("expected Bitcoin adapter");
    }

    await adapter.connect();
    await expect(
      adapter.signTransaction!(new Uint8Array([1, 2, 3]), {
        chain: {
          id: "bip122:000000000019d6689c085ae165831e93",
          name: "Bitcoin",
          namespace: "bip122",
          reference: "000000000019d6689c085ae165831e93",
        },
        id: "bip122:000000000019d6689c085ae165831e93:bc1qnotreal",
        walletAddress: "bc1qnotreal",
      }),
    ).rejects.toThrow(/not found on this device/v);
  });

  it("switchChain() updates the chain on subsequent getAccount() calls", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createBitcoinLedgerAdapter({
      btc: buildFakeBtcCtor(),
      platform: "bitcoin",
      transport: factory,
    });

    await adapter.connect();
    await adapter.switchChain({
      id: "bip122:000000000933ea01ad0ee984209779ba",
      name: "Bitcoin Testnet",
      namespace: "bip122",
      reference: "000000000933ea01ad0ee984209779ba",
    });
    const account = await adapter.getAccount();
    expect(account?.chain.id).toBe("bip122:000000000933ea01ad0ee984209779ba");
    expect(account?.chain.reference).toBe("000000000933ea01ad0ee984209779ba");
  });

  it("switchChain() rejects non-Bitcoin chains", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createBitcoinLedgerAdapter({
      btc: buildFakeBtcCtor(),
      platform: "bitcoin",
      transport: factory,
    });

    await expect(
      adapter.switchChain({
        id: "eip155:1",
        name: "Ethereum",
        namespace: "eip155",
        reference: "1",
      }),
    ).rejects.toThrow(/non-Bitcoin chain/v);
  });

  it("sendTx() / sendTxToChain() / getBalance() / getTransactionReceipt() reject", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createBitcoinLedgerAdapter({
      btc: buildFakeBtcCtor(),
      platform: "bitcoin",
      transport: factory,
    });

    await expect(adapter.sendTx({})).rejects.toThrow(/sendTx not supported/v);
    await expect(adapter.sendTxToChain({}, "testnet")).rejects.toThrow(
      /sendTxToChain not supported/v,
    );
    await expect(adapter.getBalance()).rejects.toThrow(/getBalance not supported/v);
    await expect(adapter.getTransactionReceipt("sig")).rejects.toThrow(
      /getTransactionReceipt not supported/v,
    );
  });
});

describe("createLedgerAdapter dispatch (bitcoin)", () => {
  it("routes platform: 'bitcoin' to the Bitcoin factory", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createLedgerAdapter({
      btc: buildFakeBtcCtor(),
      platform: "bitcoin",
      transport: factory,
    });

    expect(adapter.chainPlatform).toBe("bitcoin");
  });

  it("uses BIP-84 (coin 0) path with /N non-hardened address-index suffix", async () => {
    const seen: Array<string> = [];
    const { factory } = buildFakeTransport();
    const adapter = await createLedgerAdapter({
      accountCount: 2,
      btc: buildFakeBtcCtor({
        onGetWalletPublicKey: (path) => {
          seen.push(path);
        },
      }),
      platform: "bitcoin",
      transport: factory,
    });

    await adapter.connect();
    await adapter.getAccounts!();
    expect(seen).toEqual(["84'/0'/0'/0/0", "84'/0'/0'/0/0", "84'/0'/0'/0/1"]);
  });

  it("respects a custom derivationPathPrefix (legacy BIP-44)", async () => {
    const seen: Array<string> = [];
    const { factory } = buildFakeTransport();
    const adapter = await createLedgerAdapter({
      addressFormat: "legacy",
      btc: buildFakeBtcCtor({
        onGetWalletPublicKey: (path) => {
          seen.push(path);
        },
      }),
      derivationPathPrefix: "44'/0'/0'/0",
      platform: "bitcoin",
      transport: factory,
    });

    await adapter.connect();
    expect(seen[0]).toBe("44'/0'/0'/0/0");
  });
});
