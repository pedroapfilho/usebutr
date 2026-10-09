import type { SuiAdapter } from "@usebutr/core";
import { buildAccount, bytesToHexPrefixed, SUI_CHAINS } from "@usebutr/core";
import type { ObservedCall } from "@usebutr/testing/contract";
import { describeAdapterContract } from "@usebutr/testing/contract";
import { describe, expect, it } from "vitest";

import { createLedgerAdapter } from "../adapter";
import type { SuiAppConstructor, SuiAppLike } from "../apps/sui";
import { createSuiLedgerAdapter } from "../apps/sui";

import { buildFakeTransport, indexOfPath } from "./helpers";

const publicKeyAt = (index: number): Uint8Array => new Uint8Array(32).fill(index + 1);
const addressAt = (index: number): Uint8Array => new Uint8Array(32).fill((index + 1) << 4);
const SIGNATURE = new Uint8Array(64).fill(0xcd);

type SuiHooks = {
  onGetPublicKey?: (path: string) => void;
  onSignTransaction?: (path: string, intentMessage: Uint8Array) => void;
};

const buildFakeSuiCtor = (hooks: SuiHooks = {}): SuiAppConstructor =>
  class FakeSui implements SuiAppLike {
    getPublicKey(path: string): Promise<{ address: Uint8Array; publicKey: Uint8Array }> {
      hooks.onGetPublicKey?.(path);
      const index = indexOfPath(path);
      return Promise.resolve({ address: addressAt(index), publicKey: publicKeyAt(index) });
    }
    signTransaction(path: string, intentMessage: Uint8Array): Promise<{ signature: Uint8Array }> {
      hooks.onSignTransaction?.(path, intentMessage);
      return Promise.resolve({ signature: SIGNATURE });
    }
  };

const connectedSui = async (hooks: SuiHooks = {}): Promise<SuiAdapter> => {
  const adapter = await createSuiLedgerAdapter({
    accountCount: 3,
    platform: "sui",
    sui: buildFakeSuiCtor(hooks),
    transport: buildFakeTransport().factory,
  });
  await adapter.connect();
  return adapter;
};

describe("createSuiLedgerAdapter", () => {
  it("has no signMessage: the adapter signs transactions only", async () => {
    const adapter = await createSuiLedgerAdapter({
      platform: "sui",
      sui: buildFakeSuiCtor(),
      transport: buildFakeTransport().factory,
    });

    expect(adapter.chainPlatform).toBe("sui");
    expect(adapter.signTransaction).toBeTypeOf("function");
    for (const method of ["getBalance", "sendTx", "signMessage", "subscribe", "switchChain"]) {
      expect(adapter).not.toHaveProperty(method);
    }
  });

  it("derives 0x-hex accounts on hardened five-segment paths", async () => {
    const seen: Array<string> = [];
    const adapter = await connectedSui({
      onGetPublicKey: (path) => {
        seen.push(path);
      },
    });

    const accounts = await adapter.getAccounts();

    expect(seen).toEqual(["44'/784'/0'/0'/0'", "44'/784'/0'/0'/1'", "44'/784'/0'/0'/2'"]);
    const address = bytesToHexPrefixed(addressAt(0));
    expect(accounts[0]).toEqual(buildAccount(address, SUI_CHAINS.mainnet));
  });

  it("signTransaction() signs the TransactionData intent and serializes the signature", async () => {
    const received: Array<{ intentMessage: Uint8Array; path: string }> = [];
    const adapter = await connectedSui({
      onSignTransaction: (path, intentMessage) => {
        received.push({ intentMessage, path });
      },
    });
    const tx = Uint8Array.of(1, 2, 3, 4);

    const signed = await adapter.signTransaction?.(tx);

    expect(received).toEqual([
      { intentMessage: Uint8Array.of(0, 0, 0, 1, 2, 3, 4), path: "44'/784'/0'/0'/0'" },
    ]);
    expect(signed?.bytes).toBe(tx);
    const serialized = Uint8Array.of(0, ...SIGNATURE, ...publicKeyAt(0));
    expect(signed?.signature).toEqual(serialized);
  });

  it("signTransaction() signs as a non-active account with that account's key", async () => {
    const received: Array<string> = [];
    const adapter = await connectedSui({
      onSignTransaction: (path) => {
        received.push(path);
      },
    });
    const accounts = await adapter.getAccounts();
    const third = accounts.at(2);

    const signed = await adapter.signTransaction?.(Uint8Array.of(9), { account: third });

    expect(received).toEqual(["44'/784'/0'/0'/2'"]);
    expect(signed?.signature.slice(65)).toEqual(publicKeyAt(2));
  });

  it("signTransaction() signs base64 BCS bytes as the bytes they encode", async () => {
    const received: Array<Uint8Array> = [];
    const adapter = await connectedSui({
      onSignTransaction: (_path, intentMessage) => {
        received.push(intentMessage);
      },
    });

    const signed = await adapter.signTransaction?.("AQID");

    expect(received).toEqual([Uint8Array.of(0, 0, 0, 1, 2, 3)]);
    expect(signed?.bytes).toEqual(Uint8Array.of(1, 2, 3));
  });

  it.each([
    ["a Transaction's JSON", '{"version":2}'],
    ["a Transaction", { toJSON: () => Promise.resolve('{"version":2}') }],
  ])("signTransaction() rejects %s, which needs an RPC client to build", async (_label, tx) => {
    const adapter = await connectedSui();

    await expect(adapter.signTransaction?.(tx)).rejects.toThrow(
      /takes built BCS bytes or their base64/v,
    );
  });

  it("getSigner() resolves the device app tagged ledger-sui", async () => {
    const adapter = await connectedSui();

    await expect(adapter.getSigner()).resolves.toMatchObject({ kind: "ledger-sui" });
  });

  it("createLedgerAdapter() dispatches platform sui on the configured network", async () => {
    const adapter = await createLedgerAdapter({
      chainId: SUI_CHAINS.testnet.id,
      platform: "sui",
      sui: buildFakeSuiCtor(),
      transport: buildFakeTransport().factory,
    });
    await adapter.connect();

    const [account] = await adapter.getAccounts();

    expect(adapter.chainPlatform).toBe("sui");
    expect(account?.chain).toEqual(SUI_CHAINS.testnet);
  });
});

describeAdapterContract<SuiAdapter>({
  addresses: [bytesToHexPrefixed(addressAt(0)), bytesToHexPrefixed(addressAt(1))],
  chain: SUI_CHAINS.mainnet,
  connect: async (addresses) => {
    const calls: Array<ObservedCall> = [];
    const adapter = await createSuiLedgerAdapter({
      accountCount: addresses.length,
      platform: "sui",
      sui: buildFakeSuiCtor({
        onSignTransaction: (path) => {
          const address = addressAt(indexOfPath(path));
          calls.push({ address: bytesToHexPrefixed(address), chain: SUI_CHAINS.mainnet.id });
        },
      }),
      transport: buildFakeTransport().factory,
    });
    if (addresses.length > 0) {
      await adapter.connect();
    }
    return { adapter, lastCall: () => calls.at(-1) };
  },
  move: "fixed",
  name: "Ledger Sui",
  transactions: {
    signTransaction: (adapter, options) =>
      adapter.signTransaction?.(Uint8Array.of(1, 2, 3), options),
  },
  unreachable: SUI_CHAINS.testnet,
});
