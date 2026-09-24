import type { BitcoinAdapter } from "@usebutr/core";
import { BITCOIN_CHAINS, buildAccount } from "@usebutr/core";
import { describe, expect, it } from "vitest";

import { createLedgerAdapter } from "../adapter";
import type {
  BitcoinAddressFormat,
  BitcoinLedgerOptions,
  BtcAppConstructor,
  BtcAppLike,
} from "../apps/bitcoin";
import { createBitcoinLedgerAdapter } from "../apps/bitcoin";

import { buildFakeTransport, indexOfPath } from "./helpers";

const PREFIX_BY_FORMAT: Record<BitcoinAddressFormat, string> = {
  bech32: "bc1q",
  bech32m: "bc1p",
  legacy: "1",
  p2sh: "3",
};

type BtcHooks = {
  onGetWalletPublicKey?: (path: string, format: BitcoinAddressFormat | undefined) => void;
  onSignMessage?: (path: string, messageHex: string) => void;
  onSignPsbt?: (accountPath: string) => void;
};

const buildFakeBtcCtor = (hooks: BtcHooks = {}): BtcAppConstructor =>
  class FakeBtc implements BtcAppLike {
    getWalletPublicKey(
      path: string,
      opts?: { format?: BitcoinAddressFormat },
    ): Promise<{ bitcoinAddress: string; chainCode: string; publicKey: string }> {
      hooks.onGetWalletPublicKey?.(path, opts?.format);
      const prefix = PREFIX_BY_FORMAT[opts?.format ?? "legacy"];
      return Promise.resolve({
        bitcoinAddress: `${prefix}fakeaddr${indexOfPath(path)}`,
        chainCode: "aa".repeat(32),
        publicKey: "02".padEnd(66, "b"),
      });
    }
    signMessage(path: string, messageHex: string): Promise<{ r: string; s: string; v: number }> {
      hooks.onSignMessage?.(path, messageHex);
      return Promise.resolve({ r: "ab".repeat(32), s: "cd".repeat(31), v: 1 });
    }
    signPsbtBuffer(
      psbtBuffer: Uint8Array,
      options: { accountPath: string },
    ): Promise<{ psbt: Uint8Array; tx?: string }> {
      hooks.onSignPsbt?.(options.accountPath);
      return Promise.resolve({ psbt: Uint8Array.of(...psbtBuffer, 0xef) });
    }
  };

const connectedBitcoin = async (
  hooks: BtcHooks = {},
  options: Partial<BitcoinLedgerOptions> = {},
): Promise<BitcoinAdapter> => {
  const adapter = await createBitcoinLedgerAdapter({
    accountCount: 3,
    btc: buildFakeBtcCtor(hooks),
    transport: buildFakeTransport().factory,
    ...options,
    platform: "bitcoin",
  });
  await adapter.connect();
  return adapter;
};

describe("createBitcoinLedgerAdapter", () => {
  it("defines signing only: no RPC, events or chain switch", async () => {
    const adapter = await createBitcoinLedgerAdapter({
      btc: buildFakeBtcCtor(),
      platform: "bitcoin",
      transport: buildFakeTransport().factory,
    });

    expect(adapter.chainPlatform).toBe("bitcoin");
    expect(adapter.signMessage).toBeTypeOf("function");
    expect(adapter.signTransaction).toBeTypeOf("function");
    for (const method of ["getBalance", "sendTx", "subscribe", "switchChain"]) {
      expect(adapter).not.toHaveProperty(method);
    }
  });

  it("derives bech32 accounts on BIP-84 paths with a non-hardened index", async () => {
    const seen: Array<string> = [];
    const adapter = await connectedBitcoin({
      onGetWalletPublicKey: (path, format) => {
        seen.push(`${path} ${format}`);
      },
    });

    const accounts = await adapter.getAccounts();

    expect(seen).toEqual(["84'/0'/0'/0/0 bech32", "84'/0'/0'/0/1 bech32", "84'/0'/0'/0/2 bech32"]);
    expect(accounts[0]).toEqual(buildAccount("bc1qfakeaddr0", BITCOIN_CHAINS.mainnet));
  });

  it("honours a custom addressFormat, path prefix and chain", async () => {
    const seen: Array<string> = [];
    const adapter = await connectedBitcoin(
      {
        onGetWalletPublicKey: (path) => {
          seen.push(path);
        },
      },
      {
        accountCount: 1,
        addressFormat: "legacy",
        chainId: BITCOIN_CHAINS.testnet.id,
        derivationPathPrefix: "44'/1'/0'/0",
      },
    );

    const accounts = await adapter.getAccounts();

    expect(seen).toEqual(["44'/1'/0'/0/0"]);
    expect(accounts).toEqual([buildAccount("1fakeaddr0", BITCOIN_CHAINS.testnet)]);
  });

  it("signMessage() returns a BIP-137 compact signature: header, then padded r and s", async () => {
    const signed: Array<string> = [];
    const adapter = await connectedBitcoin({
      onSignMessage: (path, hex) => {
        signed.push(`${path} ${hex}`);
      },
    });

    const result = await adapter.signMessage?.(new TextEncoder().encode("hi"));

    expect(signed).toEqual(["84'/0'/0'/0/0 6869"]);
    expect(result?.signature).toHaveLength(65);
    expect(result?.signature[0]).toBe(32);
    expect(result?.signature[1]).toBe(0xab);
    expect(result?.signature.slice(33, 35)).toEqual(Uint8Array.of(0, 0xcd));
  });

  it("signTransaction() hands the PSBT to the device under the account's path", async () => {
    const accountPaths: Array<string> = [];
    const adapter = await connectedBitcoin({
      onSignPsbt: (path) => {
        accountPaths.push(path);
      },
    });
    const accounts = await adapter.getAccounts();
    const third = accounts.at(2);

    const signed = await adapter.signTransaction?.(Uint8Array.of(1, 2, 3), { account: third });

    expect(signed).toEqual(Uint8Array.of(1, 2, 3, 0xef));
    expect(accountPaths).toEqual(["84'/0'/0'"]);
  });

  it("signTransaction() rejects an account or chain the adapter does not cover", async () => {
    const accountPaths: Array<string> = [];
    const adapter = await connectedBitcoin({
      onSignPsbt: (path) => {
        accountPaths.push(path);
      },
    });
    const psbt = Uint8Array.of(1, 2, 3);

    await expect(
      adapter.signTransaction?.(psbt, {
        account: buildAccount("bc1qnotreal", BITCOIN_CHAINS.mainnet),
      }),
    ).rejects.toThrow(/does not expose/v);
    await expect(
      adapter.signTransaction?.(psbt, { chain: BITCOIN_CHAINS.testnet }),
    ).rejects.toMatchObject({ kind: "ChainMismatch" });
    expect(accountPaths).toEqual([]);
  });

  it("getSigner() resolves the device app tagged ledger-bitcoin", async () => {
    const adapter = await connectedBitcoin();

    await expect(adapter.getSigner()).resolves.toMatchObject({ kind: "ledger-bitcoin" });
  });

  it("createLedgerAdapter() dispatches platform bitcoin", async () => {
    const adapter = await createLedgerAdapter({
      btc: buildFakeBtcCtor(),
      platform: "bitcoin",
      transport: buildFakeTransport().factory,
    });

    expect(adapter.chainPlatform).toBe("bitcoin");
  });
});
