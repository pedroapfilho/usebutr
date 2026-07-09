import { describe, expect, it, vi } from "vitest";

import type {
  SolanaAppConstructor,
  SolanaAppLike,
  TransportFactory,
  TransportLike,
} from "../adapter";
import { createLedgerAdapter, createSvmLedgerAdapter } from "../adapter";

// derivation path produces a distinguishable base58 address.
const buildFakePubkey = (index: number): Uint8Array => {
  const buf = new Uint8Array(32);
  buf.fill(index + 1);
  return buf;
};

const buildFakeSig = (fill: number): Uint8Array => {
  const sig = new Uint8Array(64);
  sig.fill(fill);
  return sig;
};

const buildFakeSolanaCtor = (onGetAddress?: (path: string) => void): SolanaAppConstructor => {
  return class FakeSolana implements SolanaAppLike {
    constructor(private readonly _transport: unknown) {
      void _transport;
    }
    getAddress(path: string): Promise<{ address: Uint8Array }> {
      onGetAddress?.(path);
      const tail = path.split("/").pop() ?? "0'";
      const idx = Math.trunc(Number(tail.replace(/'$/v, "")));
      return Promise.resolve({ address: buildFakePubkey(idx) });
    }
    signOffchainMessage(_path: string, message: Uint8Array): Promise<{ signature: Uint8Array }> {
      void message;
      return Promise.resolve({ signature: buildFakeSig(0xab) });
    }
    signTransaction(_path: string, tx: Uint8Array): Promise<{ signature: Uint8Array }> {
      void tx;
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

describe("createSvmLedgerAdapter", () => {
  it("builds an SVM adapter with conservative defaults", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createSvmLedgerAdapter({
      platform: "svm",
      solana: buildFakeSolanaCtor(),
      transport: factory,
    });

    expect(adapter.id).toBe("ledger");
    expect(adapter.name).toBe("Ledger");
    expect(adapter.chainPlatform).toBe("svm");
    expect(adapter.capabilities.signMessage).toBe(true);
    expect(adapter.capabilities.sendTransaction).toBe(false);
    expect(adapter.capabilities.getBalance).toBe(false);
    expect(adapter.capabilities.subscribe).toBe(false);
    expect(adapter.capabilities.switchChain).toBe(true);
  });

  it("connect() opens transport and fetches first address (base58-encoded)", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createSvmLedgerAdapter({
      platform: "svm",
      solana: buildFakeSolanaCtor(),
      transport: factory,
    });

    await adapter.connect();
    const account = await adapter.getAccount();
    expect(account).not.toBeNull();
    expect(account?.chain.id).toBe("solana:mainnet");
    expect(account?.chain.namespace).toBe("solana");
    // Base58 of 32 bytes filled with 1 — known constant we can sanity-check.
    expect(account?.walletAddress).toMatch(/^[1-9A-HJ-NP-Za-km-z]+$/v);
  });

  it("disconnect() closes the transport and clears state", async () => {
    const fake = buildFakeTransport();
    const adapter = await createSvmLedgerAdapter({
      platform: "svm",
      solana: buildFakeSolanaCtor(),
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
    const adapter = await createSvmLedgerAdapter({
      accountCount: 3,
      platform: "svm",
      solana: buildFakeSolanaCtor(),
      transport: factory,
    });

    await adapter.connect();
    const accounts = await adapter.getAccounts!();
    expect(accounts).toHaveLength(3);
    // Each path produces a unique pubkey -> unique base58 address
    const addresses = accounts.map((a) => a.walletAddress);
    expect(new Set(addresses).size).toBe(3);
    for (const account of accounts) {
      expect(account.chain.id).toBe("solana:mainnet");
    }
  });

  it("signMessage() routes through signOffchainMessage and returns the right shape", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createSvmLedgerAdapter({
      platform: "svm",
      solana: buildFakeSolanaCtor(),
      transport: factory,
    });

    await adapter.connect();
    const message = new TextEncoder().encode("hello solana");
    const result = await adapter.signMessage(message);
    expect(result.signature).toBeInstanceOf(Uint8Array);
    expect(result.signature.length).toBe(64);
    expect(result.signature[0]).toBe(0xab);
    expect(result.signedMessage).toBe(message);
  });

  it("signTransaction() routes through signTransaction and returns the signature bytes", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createSvmLedgerAdapter({
      platform: "svm",
      solana: buildFakeSolanaCtor(),
      transport: factory,
    });

    if (adapter.chainPlatform !== "svm") {
      throw new Error("expected SVM adapter");
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
    const adapter = await createSvmLedgerAdapter({
      platform: "svm",
      solana: buildFakeSolanaCtor(),
      transport: factory,
    });

    if (adapter.chainPlatform !== "svm") {
      throw new Error("expected SVM adapter");
    }

    await adapter.connect();
    await expect(adapter.signTransaction!({ not: "bytes" })).rejects.toThrow(
      /expects a Uint8Array/v,
    );
  });

  it("switchChain() updates the cluster on subsequent getAccount() calls", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createSvmLedgerAdapter({
      platform: "svm",
      solana: buildFakeSolanaCtor(),
      transport: factory,
    });

    await adapter.connect();
    await adapter.switchChain({
      id: "solana:devnet",
      name: "Solana Devnet",
      namespace: "solana",
      reference: "devnet",
    });
    const account = await adapter.getAccount();
    expect(account?.chain.id).toBe("solana:devnet");
    expect(account?.chain.reference).toBe("devnet");
  });

  it("switchChain() rejects non-Solana chains", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createSvmLedgerAdapter({
      platform: "svm",
      solana: buildFakeSolanaCtor(),
      transport: factory,
    });

    await expect(
      adapter.switchChain({
        id: "eip155:1",
        name: "Ethereum",
        namespace: "eip155",
        reference: "1",
      }),
    ).rejects.toThrow(/non-Solana chain/v);
  });

  it("switchChain() rejects unknown Solana clusters", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createSvmLedgerAdapter({
      platform: "svm",
      solana: buildFakeSolanaCtor(),
      transport: factory,
    });

    await expect(
      adapter.switchChain({
        id: "solana:5eyk",
        name: "Solana",
        namespace: "solana",
        reference: "5eyk",
      }),
    ).rejects.toThrow(/unsupported Solana cluster/v);
  });

  it("sendTx() / sendTxToChain() / getBalance() / getTransactionReceipt() reject", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createSvmLedgerAdapter({
      platform: "svm",
      solana: buildFakeSolanaCtor(),
      transport: factory,
    });

    await expect(adapter.sendTx({})).rejects.toThrow(/sendTx not supported/v);
    await expect(adapter.sendTxToChain({}, "devnet")).rejects.toThrow(
      /sendTxToChain not supported/v,
    );
    await expect(adapter.getBalance()).rejects.toThrow(/getBalance not supported/v);
    await expect(adapter.getTransactionReceipt("sig")).rejects.toThrow(
      /getTransactionReceipt not supported/v,
    );
  });
});

describe("createLedgerAdapter dispatch (svm)", () => {
  it("routes platform: 'svm' to the SVM factory", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createLedgerAdapter({
      platform: "svm",
      solana: buildFakeSolanaCtor(),
      transport: factory,
    });

    expect(adapter.chainPlatform).toBe("svm");
  });

  it("uses /N' (fully-hardened) account index suffix", async () => {
    const seen: Array<string> = [];
    const { factory } = buildFakeTransport();
    const adapter = await createLedgerAdapter({
      accountCount: 2,
      platform: "svm",
      solana: buildFakeSolanaCtor((path) => {
        seen.push(path);
      }),
      transport: factory,
    });

    await adapter.connect();
    await adapter.getAccounts!();
    expect(seen).toEqual(["44'/501'/0'/0'", "44'/501'/0'/0'", "44'/501'/0'/1'"]);
  });
});
