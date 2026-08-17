import { describe, expect, it, vi } from "vitest";

import type { EthAppConstructor, EthAppLike, TransportFactory, TransportLike } from "../adapter";
import { createLedgerAdapter } from "../adapter";

const FAKE_ADDRESSES = [
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "0xb1c97082d7308c47e2D29Ee5BdB058Fe6c6c0c59",
  "0xc1a5d63d0eb1c52e0e0006c3a7a3a3d52a3a3a3a",
] as const;

const buildEthCtorWithAddress = (
  getAddress: (path: string) => Promise<{ address: string; publicKey: string }>,
): EthAppConstructor => {
  return class FakeEth implements EthAppLike {
    constructor(private readonly _transport: unknown) {
      void _transport;
    }
    getAddress(path: string): Promise<{ address: string; publicKey: string }> {
      return getAddress(path);
    }
    signPersonalMessage(_path: string, _hex: string): Promise<{ r: string; s: string; v: number }> {
      return Promise.resolve({ r: "a".repeat(64), s: "b".repeat(64), v: 27 });
    }
    signTransaction(_path: string, _hex: string): Promise<{ r: string; s: string; v: string }> {
      return Promise.resolve({ r: "ff", s: "ee", v: "1b" });
    }
  };
};

const buildFakeEthCtor = (addresses: ReadonlyArray<string> = FAKE_ADDRESSES): EthAppConstructor =>
  buildEthCtorWithAddress((path) => {
    const idx = Math.trunc(Number(path.split("/").pop() ?? "0"));
    const address = addresses[idx] ?? addresses[0];
    return Promise.resolve({ address: address ?? "0x0", publicKey: "0xpubkey" });
  });

const buildFakeTransport = (): {
  created: ReadonlyArray<TransportLike>;
  factory: TransportFactory;
  lastTransport: TransportLike | null;
} => {
  const created: Array<TransportLike> = [];
  const factory: TransportFactory = {
    create(): Promise<TransportLike> {
      const t: TransportLike = {
        close: vi.fn().mockResolvedValue(undefined),
      };
      created.push(t);
      return Promise.resolve(t);
    },
  };
  return {
    created,
    factory,
    get lastTransport() {
      return created.at(-1) ?? null;
    },
  };
};

describe("createLedgerAdapter", () => {
  it("builds an adapter with conservative defaults", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createLedgerAdapter({
      eth: buildFakeEthCtor(),
      platform: "evm",
      transport: factory,
    });

    expect(adapter.id).toBe("ledger");
    expect(adapter.name).toBe("Ledger");
    expect(adapter.chainPlatform).toBe("evm");
    expect(adapter.capabilities.signMessage).toBe(true);
    expect(adapter.capabilities.sendTransaction).toBe(false);
    expect(adapter.capabilities.signTransaction).toBe(false);
    expect(adapter.capabilities.getBalance).toBe(false);
    expect(adapter.capabilities.subscribe).toBe(false);
    expect(adapter.capabilities.switchChain).toBe(true);
  });

  it("connect() opens transport + fetches first address", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createLedgerAdapter({
      eth: buildFakeEthCtor(),
      platform: "evm",
      transport: factory,
    });

    await adapter.connect();
    const account = await adapter.getAccount();
    expect(account?.walletAddress).toBe(FAKE_ADDRESSES[0]);
    expect(account?.chain.id).toBe("eip155:1");
  });

  it("disconnect() closes the transport and clears state", async () => {
    const fake = buildFakeTransport();
    const adapter = await createLedgerAdapter({
      eth: buildFakeEthCtor(),
      platform: "evm",
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

  it("connect() rejects, closes the transport, and stays account-less when the address read fails", async () => {
    const fake = buildFakeTransport();
    const adapter = await createLedgerAdapter({
      eth: buildEthCtorWithAddress(() => Promise.reject(new Error("Ledger device is locked"))),
      platform: "evm",
      transport: fake.factory,
    });

    await expect(adapter.connect()).rejects.toThrow(/locked/v);
    expect(fake.lastTransport?.close).toHaveBeenCalled();
    expect(await adapter.getAccount()).toBeNull();
    await expect(adapter.signMessage(new TextEncoder().encode("hello"))).rejects.toThrow(
      /not connected/v,
    );
  });

  it("disconnect() during an in-flight connect() wins over the late address", async () => {
    const fake = buildFakeTransport();
    let releaseAddress: (() => void) | undefined;
    const pending = new Promise<void>((resolve) => {
      releaseAddress = resolve;
    });
    const adapter = await createLedgerAdapter({
      eth: buildEthCtorWithAddress(async () => {
        await pending;
        return { address: FAKE_ADDRESSES[0] ?? "0x0", publicKey: "0xpubkey" };
      }),
      platform: "evm",
      transport: fake.factory,
    });

    const connecting = adapter.connect();
    await adapter.disconnect?.();
    releaseAddress?.();
    await connecting;

    expect(await adapter.getAccount()).toBeNull();
    expect(fake.lastTransport?.close).toHaveBeenCalled();
  });

  it("two concurrent connect() calls open exactly one transport", async () => {
    const fake = buildFakeTransport();
    const adapter = await createLedgerAdapter({
      eth: buildFakeEthCtor(),
      platform: "evm",
      transport: fake.factory,
    });

    await Promise.all([adapter.connect(), adapter.connect()]);

    expect(fake.created).toHaveLength(1);
    const account = await adapter.getAccount();
    expect(account?.walletAddress).toBe(FAKE_ADDRESSES[0]);
  });

  it("getAccounts() walks the derivation path up to accountCount", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createLedgerAdapter({
      accountCount: 3,
      eth: buildFakeEthCtor(),
      platform: "evm",
      transport: factory,
    });

    await adapter.connect();
    const accounts = await adapter.getAccounts!();
    expect(accounts.map((a) => a.walletAddress)).toEqual([...FAKE_ADDRESSES]);
  });

  it("switchChain() updates the chain id on subsequent getAccount() calls", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createLedgerAdapter({
      eth: buildFakeEthCtor(),
      platform: "evm",
      transport: factory,
    });

    await adapter.connect();
    await adapter.switchChain({
      id: "eip155:137",
      name: "Polygon",
      namespace: "eip155",
      reference: "137",
    });
    const account = await adapter.getAccount();
    expect(account?.chain.id).toBe("eip155:137");
    expect(account?.chain.reference).toBe("137");
  });

  it("switchChain() rejects non-EVM chains", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createLedgerAdapter({
      eth: buildFakeEthCtor(),
      platform: "evm",
      transport: factory,
    });

    await expect(
      adapter.switchChain({
        id: "solana:mainnet",
        name: "Solana",
        namespace: "solana",
        reference: "mainnet",
      }),
    ).rejects.toThrow(/non-EVM chain/v);
  });

  it("signMessage() returns a 65-byte (r||s||v) signature", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createLedgerAdapter({
      eth: buildFakeEthCtor(),
      platform: "evm",
      transport: factory,
    });

    await adapter.connect();
    const result = await adapter.signMessage(new TextEncoder().encode("hello"));
    expect(result.signature).toBeInstanceOf(Uint8Array);
    expect(result.signature.length).toBe(65);
    expect(result.signature[0]).toBe(0xaa);
    expect(result.signature[32]).toBe(0xbb);
    expect(result.signature[64]).toBe(0x1b);
  });

  it("signMessage() with a non-active account walks paths to find it", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createLedgerAdapter({
      accountCount: 3,
      eth: buildFakeEthCtor(),
      platform: "evm",
      transport: factory,
    });

    await adapter.connect();
    const result = await adapter.signMessage(new TextEncoder().encode("hello"), {
      chain: { id: "eip155:1", name: "Ethereum", namespace: "eip155", reference: "1" },
      id: `eip155:1:${(FAKE_ADDRESSES[2] ?? "0x0").toLowerCase()}`,
      walletAddress: FAKE_ADDRESSES[2] ?? "0x0",
    });
    expect(result.signature.length).toBe(65);
  });

  it("signMessage() throws when the address isn't on any known path", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createLedgerAdapter({
      accountCount: 2,
      eth: buildFakeEthCtor(),
      platform: "evm",
      transport: factory,
    });

    await adapter.connect();
    await expect(
      adapter.signMessage(new TextEncoder().encode("hello"), {
        chain: { id: "eip155:1", name: "Ethereum", namespace: "eip155", reference: "1" },
        id: "eip155:1:0xdeadbeef",
        walletAddress: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      }),
    ).rejects.toThrow(/not found on this device/v);
  });

  it("sendTx() / sendTxToChain() / getBalance() / getTransactionReceipt() reject", async () => {
    const { factory } = buildFakeTransport();
    const adapter = await createLedgerAdapter({
      eth: buildFakeEthCtor(),
      platform: "evm",
      transport: factory,
    });

    await expect(adapter.sendTx({})).rejects.toThrow(/sendTx not supported/v);
    await expect(adapter.sendTxToChain({}, "137")).rejects.toThrow(/sendTxToChain not supported/v);
    await expect(adapter.getBalance()).rejects.toThrow(/getBalance not supported/v);
    await expect(adapter.getTransactionReceipt("0x0")).rejects.toThrow(
      /getTransactionReceipt not supported/v,
    );
  });
});
