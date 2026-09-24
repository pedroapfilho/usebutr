import type { EvmAdapter } from "@usebutr/core";
import { buildAccount, ConnectionError, EVM_CHAINS, SVM_CHAINS } from "@usebutr/core";
import { describe, expect, it } from "vitest";

import { createLedgerAdapter } from "../adapter";
import { isClassWith, loadPeer } from "../adapter-core";
import type { EthAppConstructor, EthAppLike } from "../apps/evm";
import { createEvmLedgerAdapter } from "../apps/evm";
import type { SolanaAppConstructor } from "../apps/svm";

import { buildFakeTransport, indexOfPath } from "./helpers";

const FAKE_ADDRESSES = [
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "0xb1c97082d7308c47e2D29Ee5BdB058Fe6c6c0c59",
  "0xC1a5d63D0Eb1c52E0e0006c3A7a3a3d52a3A3A3a",
] as const;

type EthHooks = {
  getAddress?: (path: string) => Promise<{ address: string; publicKey: string }>;
  onSign?: (path: string, messageHex: string) => void;
};

const buildFakeEthCtor = (hooks: EthHooks = {}): EthAppConstructor =>
  class FakeEth implements EthAppLike {
    getAddress(path: string): Promise<{ address: string; publicKey: string }> {
      if (hooks.getAddress !== undefined) {
        return hooks.getAddress(path);
      }
      const address = FAKE_ADDRESSES[indexOfPath(path)] ?? FAKE_ADDRESSES[0];
      return Promise.resolve({ address, publicKey: "0xpubkey" });
    }
    signPersonalMessage(
      path: string,
      messageHex: string,
    ): Promise<{ r: string; s: string; v: number }> {
      hooks.onSign?.(path, messageHex);
      // Ledger drops leading zero bytes, so `r` arrives short.
      return Promise.resolve({ r: "aa".repeat(31), s: "bb".repeat(32), v: 27 });
    }
    signTransaction(): Promise<{ r: string; s: string; v: string }> {
      return Promise.resolve({ r: "ff", s: "ee", v: "1b" });
    }
  };

const connectedEvm = async (
  options: { accountCount?: number; hooks?: EthHooks } = {},
): Promise<EvmAdapter> => {
  const adapter = await createEvmLedgerAdapter({
    accountCount: options.accountCount,
    eth: buildFakeEthCtor(options.hooks),
    platform: "evm",
    transport: buildFakeTransport().factory,
  });
  await adapter.connect();
  return adapter;
};

const hello = new TextEncoder().encode("hello");

describe("createEvmLedgerAdapter", () => {
  it("defines only what a device that signs without RPC can do", async () => {
    const adapter = await createEvmLedgerAdapter({
      eth: buildFakeEthCtor(),
      platform: "evm",
      transport: buildFakeTransport().factory,
    });

    expect(adapter).toMatchObject({ chainPlatform: "evm", id: "ledger", name: "Ledger" });
    expect(adapter.signMessage).toBeTypeOf("function");
    for (const method of [
      "getBalance",
      "getTransactionReceipt",
      "requestAccounts",
      "sendTx",
      "subscribe",
      "switchChain",
    ]) {
      expect(adapter).not.toHaveProperty(method);
    }
  });

  it("reads every account once on connect, active first, on the registry's chain", async () => {
    const seen: Array<string> = [];
    const adapter = await connectedEvm({
      accountCount: 3,
      hooks: {
        getAddress: (path) => {
          seen.push(path);
          const address = FAKE_ADDRESSES[indexOfPath(path)] ?? "";
          return Promise.resolve({ address, publicKey: "0xpubkey" });
        },
      },
    });

    const accounts = await adapter.getAccounts();
    await adapter.getAccounts();

    expect(seen).toEqual(["44'/60'/0'/0/0", "44'/60'/0'/0/1", "44'/60'/0'/0/2"]);
    expect(accounts).toEqual(FAKE_ADDRESSES.map((a) => buildAccount(a, EVM_CHAINS.ethereum)));
  });

  it("reports accounts on the configured chain", async () => {
    const onSepolia = await createEvmLedgerAdapter({
      chainId: EVM_CHAINS.sepolia.id,
      eth: buildFakeEthCtor(),
      platform: "evm",
      transport: buildFakeTransport().factory,
    });
    await onSepolia.connect();
    const [account] = await onSepolia.getAccounts();
    expect(account?.chain).toEqual(EVM_CHAINS.sepolia);

    const onAnvil = await createEvmLedgerAdapter({
      chainId: "eip155:31337",
      eth: buildFakeEthCtor(),
      platform: "evm",
      transport: buildFakeTransport().factory,
    });
    await onAnvil.connect();
    const [anvilAccount] = await onAnvil.getAccounts();
    expect(anvilAccount?.chain.name).toBe("eip155:31337");
  });

  it("rejects a chainId from another namespace", async () => {
    await expect(
      createEvmLedgerAdapter({
        chainId: SVM_CHAINS.mainnet.id,
        eth: buildFakeEthCtor(),
        platform: "evm",
      }),
    ).rejects.toThrow(/outside the "eip155" namespace/v);
  });

  it("rejects a silent connect instead of prompting", async () => {
    const fake = buildFakeTransport();
    const adapter = await createEvmLedgerAdapter({
      eth: buildFakeEthCtor(),
      platform: "evm",
      transport: fake.factory,
    });

    await expect(adapter.connect({ silent: true })).rejects.toThrow(/interactive connect/v);
    expect(fake.created).toHaveLength(0);
  });

  it("disconnect() closes the transport and empties the accounts", async () => {
    const fake = buildFakeTransport();
    const adapter = await createEvmLedgerAdapter({
      eth: buildFakeEthCtor(),
      platform: "evm",
      transport: fake.factory,
    });

    await adapter.connect();
    await adapter.disconnect?.();

    expect(fake.lastTransport?.close).toHaveBeenCalled();
    expect(await adapter.getAccounts()).toEqual([]);
  });

  it("a failed connect closes the transport and leaves the adapter disconnected", async () => {
    const fake = buildFakeTransport();
    const adapter = await createEvmLedgerAdapter({
      eth: buildFakeEthCtor({
        getAddress: () => Promise.reject(new Error("Ledger device is locked")),
      }),
      platform: "evm",
      transport: fake.factory,
    });

    await expect(adapter.connect()).rejects.toThrow(/locked/v);
    expect(fake.lastTransport?.close).toHaveBeenCalled();
    expect(await adapter.getAccounts()).toEqual([]);
    await expect(adapter.signMessage?.(hello)).rejects.toMatchObject({ kind: "NotConnected" });
    await expect(adapter.getSigner()).rejects.toBeInstanceOf(ConnectionError);
  });

  it("disconnect() during an in-flight connect() wins over the late addresses", async () => {
    const fake = buildFakeTransport();
    let release: (() => void) | undefined;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    const adapter = await createEvmLedgerAdapter({
      eth: buildFakeEthCtor({
        getAddress: async () => {
          await pending;
          return { address: FAKE_ADDRESSES[0], publicKey: "0xpubkey" };
        },
      }),
      platform: "evm",
      transport: fake.factory,
    });

    const connecting = adapter.connect();
    await adapter.disconnect?.();
    release?.();
    await connecting;

    expect(await adapter.getAccounts()).toEqual([]);
    expect(fake.lastTransport?.close).toHaveBeenCalled();
  });

  it("two concurrent connect() calls open exactly one transport", async () => {
    const fake = buildFakeTransport();
    const adapter = await createEvmLedgerAdapter({
      eth: buildFakeEthCtor(),
      platform: "evm",
      transport: fake.factory,
    });

    await Promise.all([adapter.connect(), adapter.connect()]);

    expect(fake.created).toHaveLength(1);
  });

  it("signMessage() returns r || s || v, each half padded to 32 bytes", async () => {
    const signed: Array<string> = [];
    const adapter = await connectedEvm({
      hooks: {
        onSign: (path) => {
          signed.push(path);
        },
      },
    });

    const result = await adapter.signMessage?.(hello);

    expect(signed).toEqual(["44'/60'/0'/0/0"]);
    expect(result?.signature).toHaveLength(65);
    expect(result?.signature.slice(0, 2)).toEqual(Uint8Array.of(0, 0xaa));
    expect(result?.signature[32]).toBe(0xbb);
    expect(result?.signature[64]).toBe(27);
    expect(result?.signedMessage).toBe(hello);
  });

  it("signMessage() signs as an exposed non-active account on its own path", async () => {
    const signed: Array<string> = [];
    const adapter = await connectedEvm({
      accountCount: 3,
      hooks: {
        onSign: (path) => {
          signed.push(path);
        },
      },
    });
    const accounts = await adapter.getAccounts();
    const third = accounts.at(2);

    await adapter.signMessage?.(hello, { account: third });

    expect(signed).toEqual(["44'/60'/0'/0/2"]);
  });

  it("signMessage() rejects an account the session does not expose", async () => {
    const signed: Array<string> = [];
    const adapter = await connectedEvm({
      accountCount: 2,
      hooks: {
        onSign: (path) => {
          signed.push(path);
        },
      },
    });
    const outsider = buildAccount(FAKE_ADDRESSES[2], EVM_CHAINS.ethereum);

    await expect(adapter.signMessage?.(hello, { account: outsider })).rejects.toThrow(
      /does not expose/v,
    );
    expect(signed).toEqual([]);
  });

  it("getSigner() resolves the device app tagged ledger-evm", async () => {
    const adapter = await connectedEvm();

    const signer = await adapter.getSigner();

    expect(signer.kind).toBe("ledger-evm");
    if (signer.kind === "ledger-evm") {
      await expect(signer.app.signTransaction("44'/60'/0'/0/0", "00")).resolves.toMatchObject({
        v: "1b",
      });
    }
  });
});

describe("loadPeer", () => {
  const isEth = isClassWith<EthAppConstructor>("getAddress", "signPersonalMessage");

  it("takes the default export, one hop deeper through CJS interop", async () => {
    const Eth = buildFakeEthCtor();

    await expect(loadPeer(Promise.resolve({ default: Eth }), "eth", isEth)).resolves.toBe(Eth);
    await expect(
      loadPeer(Promise.resolve({ default: { default: Eth } }), "eth", isEth),
    ).resolves.toBe(Eth);
  });

  it("rejects an export without the methods the app declares", async () => {
    const isSolana = isClassWith<SolanaAppConstructor>("getAddress", "signOffchainMessage");
    const ethModule = Promise.resolve({ default: buildFakeEthCtor() });

    await expect(loadPeer(ethModule, "solana", isSolana)).rejects.toThrow(/solana did not load/v);
    await expect(loadPeer(Promise.resolve({}), "eth", isEth)).rejects.toThrow(/did not load/v);
  });
});

describe("createLedgerAdapter", () => {
  it("dispatches on platform", async () => {
    const adapter = await createLedgerAdapter({
      eth: buildFakeEthCtor(),
      platform: "evm",
      transport: buildFakeTransport().factory,
    });

    expect(adapter.chainPlatform).toBe("evm");
  });
});
