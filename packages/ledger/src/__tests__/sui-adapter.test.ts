import { describe, expect, it, vi } from "vitest";

import type { SuiAppConstructor, SuiAppLike, TransportFactory, TransportLike } from "../adapter";
import { createLedgerAdapter, createSuiLedgerAdapter } from "../adapter";

// 32-byte ed25519 pubkey + 32-byte address filled with the index so
// each derivation path produces a distinguishable hex address.
const buildFakePubkey = (index: number): Uint8Array => {
  const buf = new Uint8Array(32);
  buf.fill(index + 1);
  return buf;
};

const buildFakeAddress = (index: number): Uint8Array => {
  const buf = new Uint8Array(32);
  // Distinguish address bytes from pubkey bytes so we don't accidentally
  // verify against the wrong field.
  buf.fill((index + 1) << 4);
  return buf;
};

const buildFakeSig = (fill: number): Uint8Array => {
  const sig = new Uint8Array(64);
  sig.fill(fill);
  return sig;
};

const buildFakeSuiCtor = (onGetPublicKey?: (path: string) => void): SuiAppConstructor => {
  return class FakeSui implements SuiAppLike {
    constructor(private readonly _transport: unknown) {
      void _transport;
    }
    getPublicKey(path: string): Promise<{ address: Uint8Array; publicKey: Uint8Array }> {
      onGetPublicKey?.(path);
      // Parse the trailing index off the path (e.g. "44'/784'/0'/0'/2'" → 2)
      const tail = path.split("/").pop() ?? "0'";
      const idx = Math.trunc(Number(tail.replace(/'$/v, "")));
      return Promise.resolve({
        address: buildFakeAddress(idx),
        publicKey: buildFakePubkey(idx),
      });
    }
    signTransaction(_path: string, txn: Uint8Array): Promise<{ signature: Uint8Array }> {
      void txn;
      return Promise.resolve({ signature: buildFakeSig(0xcd) });
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

describe("createSuiLedgerAdapter", () => {
  it("builds a Sui adapter with conservative defaults", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createSuiLedgerAdapter({
      platform: "sui",
      sui: buildFakeSuiCtor(),
      transport: factory,
    });

    expect(adapter.id).toBe("ledger");
    expect(adapter.name).toBe("Ledger");
    expect(adapter.chainPlatform).toBe("sui");
    // Sui's Ledger app exposes no off-chain message signing, so
    // signMessage capability is false (unlike EVM/SVM).
    expect(adapter.capabilities.signMessage).toBe(false);
    expect(adapter.capabilities.sendTransaction).toBe(false);
    expect(adapter.capabilities.getBalance).toBe(false);
    expect(adapter.capabilities.subscribe).toBe(false);
    expect(adapter.capabilities.switchChain).toBe(true);
  });

  it("connect() opens transport and fetches first address (0x-prefixed hex)", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createSuiLedgerAdapter({
      platform: "sui",
      sui: buildFakeSuiCtor(),
      transport: factory,
    });

    await adapter.connect();
    const account = await adapter.getAccount();
    expect(account).not.toBeNull();
    expect(account?.chain.id).toBe("sui:mainnet");
    expect(account?.chain.namespace).toBe("sui");
    expect(account?.walletAddress).toMatch(/^0x[0-9a-f]{64}$/v);
  });

  it("disconnect() closes the transport and clears state", async () => {
    const fake = buildFakeTransport();
    const adapter = await createSuiLedgerAdapter({
      platform: "sui",
      sui: buildFakeSuiCtor(),
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
    const adapter = await createSuiLedgerAdapter({
      accountCount: 3,
      platform: "sui",
      sui: buildFakeSuiCtor(),
      transport: factory,
    });

    await adapter.connect();
    const accounts = await adapter.getAccounts!();
    expect(accounts).toHaveLength(3);
    // Each path produces a unique address.
    const addresses = accounts.map((a) => a.walletAddress);
    expect(new Set(addresses).size).toBe(3);
    for (const account of accounts) {
      expect(account.chain.id).toBe("sui:mainnet");
    }
  });

  it("signMessage() rejects — Ledger Sui app has no off-chain signing", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createSuiLedgerAdapter({
      platform: "sui",
      sui: buildFakeSuiCtor(),
      transport: factory,
    });

    await adapter.connect();
    const message = new TextEncoder().encode("hello sui");
    await expect(adapter.signMessage(message)).rejects.toThrow(/signMessage not supported/v);
  });

  it("signTransaction() routes through signTransaction and returns the signature bytes", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createSuiLedgerAdapter({
      platform: "sui",
      sui: buildFakeSuiCtor(),
      transport: factory,
    });

    if (adapter.chainPlatform !== "sui") {
      throw new Error("expected Sui adapter");
    }

    await adapter.connect();
    const tx = new Uint8Array([1, 2, 3, 4]);
    const signed = await adapter.signTransaction!(tx);
    expect(signed).toBeInstanceOf(Uint8Array);
    expect(signed.length).toBe(64);
    expect(signed[0]).toBe(0xcd);
  });

  it("signTransaction() rejects non-Uint8Array input", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createSuiLedgerAdapter({
      platform: "sui",
      sui: buildFakeSuiCtor(),
      transport: factory,
    });

    if (adapter.chainPlatform !== "sui") {
      throw new Error("expected Sui adapter");
    }

    await adapter.connect();
    await expect(adapter.signTransaction!({ not: "bytes" })).rejects.toThrow(
      /expects a Uint8Array/v,
    );
  });

  it("signTransaction() with a non-active account walks paths to find it", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createSuiLedgerAdapter({
      accountCount: 3,
      platform: "sui",
      sui: buildFakeSuiCtor(),
      transport: factory,
    });

    if (adapter.chainPlatform !== "sui") {
      throw new Error("expected Sui adapter");
    }

    await adapter.connect();
    const accounts = await adapter.getAccounts!();
    const targetAccount = accounts[2];
    if (!targetAccount) {
      throw new Error("expected third account");
    }
    const tx = new Uint8Array([9, 9, 9]);
    const signed = await adapter.signTransaction!(tx, targetAccount);
    expect(signed.length).toBe(64);
  });

  it("signTransaction() throws when the address isn't on any known path", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createSuiLedgerAdapter({
      accountCount: 2,
      platform: "sui",
      sui: buildFakeSuiCtor(),
      transport: factory,
    });

    if (adapter.chainPlatform !== "sui") {
      throw new Error("expected Sui adapter");
    }

    await adapter.connect();
    await expect(
      adapter.signTransaction!(new Uint8Array([1, 2, 3]), {
        chain: {
          id: "sui:mainnet",
          name: "Sui Mainnet",
          namespace: "sui",
          reference: "mainnet",
        },
        id: "sui:mainnet:0xdeadbeef",
        walletAddress: `0x${"de".repeat(32)}`,
      }),
    ).rejects.toThrow(/not found on this device/v);
  });

  it("switchChain() updates the cluster on subsequent getAccount() calls", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createSuiLedgerAdapter({
      platform: "sui",
      sui: buildFakeSuiCtor(),
      transport: factory,
    });

    await adapter.connect();
    await adapter.switchChain({
      id: "sui:testnet",
      name: "Sui Testnet",
      namespace: "sui",
      reference: "testnet",
    });
    const account = await adapter.getAccount();
    expect(account?.chain.id).toBe("sui:testnet");
    expect(account?.chain.reference).toBe("testnet");
  });

  it("switchChain() rejects non-Sui chains", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createSuiLedgerAdapter({
      platform: "sui",
      sui: buildFakeSuiCtor(),
      transport: factory,
    });

    await expect(
      adapter.switchChain({
        id: "eip155:1",
        name: "Ethereum",
        namespace: "eip155",
        reference: "1",
      }),
    ).rejects.toThrow(/non-Sui chain/v);
  });

  it("switchChain() rejects unknown Sui clusters", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createSuiLedgerAdapter({
      platform: "sui",
      sui: buildFakeSuiCtor(),
      transport: factory,
    });

    await expect(
      adapter.switchChain({
        id: "sui:somenet",
        name: "Sui",
        namespace: "sui",
        reference: "somenet",
      }),
    ).rejects.toThrow(/unsupported Sui cluster/v);
  });

  it("sendTx() / sendTxToChain() / getBalance() / getTransactionReceipt() reject", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createSuiLedgerAdapter({
      platform: "sui",
      sui: buildFakeSuiCtor(),
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

describe("createLedgerAdapter dispatch (sui)", () => {
  it("routes platform: 'sui' to the Sui factory", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createLedgerAdapter({
      platform: "sui",
      sui: buildFakeSuiCtor(),
      transport: factory,
    });

    expect(adapter.chainPlatform).toBe("sui");
  });

  it("uses Sui's BIP-44 (coin 784) path with /N' fully-hardened suffix", async () => {
    const seen: Array<string> = [];
    const { factory } = buildFakeTransport();
    const adapter = await createLedgerAdapter({
      accountCount: 2,
      platform: "sui",
      sui: buildFakeSuiCtor((path) => {
        seen.push(path);
      }),
      transport: factory,
    });

    await adapter.connect();
    await adapter.getAccounts!();
    // First call is connect() at index 0; then getAccounts walks 0,1.
    expect(seen).toEqual(["44'/784'/0'/0'/0'", "44'/784'/0'/0'/0'", "44'/784'/0'/0'/1'"]);
  });
});
