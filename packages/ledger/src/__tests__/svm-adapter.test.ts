import type { SvmAdapter } from "@usebutr/core";
import { base64ToBytes, buildAccount, bytesToBase58, SVM_CHAINS } from "@usebutr/core";
import { describe, expect, it } from "vitest";

import { createLedgerAdapter } from "../adapter";
import type { SolanaAppConstructor, SolanaAppLike } from "../apps/svm";
import { createSvmLedgerAdapter } from "../apps/svm";

import { buildFakeTransport, indexOfPath } from "./helpers";

/*
 * @solana/web3.js 1.98 transfers paid by 0x09…09, so the Ledger signs slot 1:
 * legacy from account 0 (0x01…01), v0 from account 1 (0x02…02). `_SIGNED` is
 * web3.js's own `addSignature(key, 0xcd × 64)` output.
 */
const LEGACY_UNSIGNED =
  "AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgABBAkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMBAwIBAgwCAAAA6AMAAAAAAAA=";
const LEGACY_SIGNED =
  "AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3NAgABBAkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMBAwIBAgwCAAAA6AMAAAAAAAA=";
const V0_UNSIGNED =
  "AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAIAAQQJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAQMCAQIMAgAAAOgDAAAAAAAAAA==";
const V0_SIGNED =
  "AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3NgAIAAQQJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAQMCAQIMAgAAAOgDAAAAAAAAAA==";
/** One compact-u16 byte plus two 64-byte signature slots. */
const MESSAGE_OFFSET = 1 + 2 * 64;

/** Account `index` is the 32-byte key filled with `index + 1`. */
const keyAt = (index: number): Uint8Array => new Uint8Array(32).fill(index + 1);

type SolanaHooks = {
  onGetAddress?: (path: string) => void;
  onSignTransaction?: (path: string, message: Uint8Array) => void;
};

const buildFakeSolanaCtor = (hooks: SolanaHooks = {}): SolanaAppConstructor =>
  class FakeSolana implements SolanaAppLike {
    getAddress(path: string): Promise<{ address: Uint8Array }> {
      hooks.onGetAddress?.(path);
      return Promise.resolve({ address: keyAt(indexOfPath(path)) });
    }
    signOffchainMessage(): Promise<{ signature: Uint8Array }> {
      return Promise.resolve({ signature: new Uint8Array(64).fill(0xab) });
    }
    signTransaction(path: string, message: Uint8Array): Promise<{ signature: Uint8Array }> {
      hooks.onSignTransaction?.(path, message);
      return Promise.resolve({ signature: new Uint8Array(64).fill(0xcd) });
    }
  };

const connectedSvm = async (hooks: SolanaHooks = {}): Promise<SvmAdapter> => {
  const adapter = await createSvmLedgerAdapter({
    accountCount: 2,
    platform: "svm",
    solana: buildFakeSolanaCtor(hooks),
    transport: buildFakeTransport().factory,
  });
  await adapter.connect();
  return adapter;
};

describe("createSvmLedgerAdapter", () => {
  it("defines signing only: no RPC, events or chain switch", async () => {
    const adapter = await createSvmLedgerAdapter({
      platform: "svm",
      solana: buildFakeSolanaCtor(),
      transport: buildFakeTransport().factory,
    });

    expect(adapter.chainPlatform).toBe("svm");
    expect(adapter.signMessage).toBeTypeOf("function");
    expect(adapter.signTransaction).toBeTypeOf("function");
    for (const method of ["getBalance", "sendTx", "signIn", "subscribe", "switchChain"]) {
      expect(adapter).not.toHaveProperty(method);
    }
  });

  it("derives base58 accounts on hardened paths, read once at connect", async () => {
    const seen: Array<string> = [];
    const adapter = await connectedSvm({
      onGetAddress: (path) => {
        seen.push(path);
      },
    });

    const accounts = await adapter.getAccounts();

    expect(seen).toEqual(["44'/501'/0'/0'", "44'/501'/0'/1'"]);
    const addresses = [keyAt(0), keyAt(1)].map((key) => bytesToBase58(key));
    expect(accounts).toEqual(addresses.map((address) => buildAccount(address, SVM_CHAINS.mainnet)));
  });

  it("reports accounts on the configured cluster", async () => {
    const adapter = await createSvmLedgerAdapter({
      chainId: SVM_CHAINS.devnet.id,
      platform: "svm",
      solana: buildFakeSolanaCtor(),
      transport: buildFakeTransport().factory,
    });
    await adapter.connect();

    const [account] = await adapter.getAccounts();

    expect(account?.chain).toEqual(SVM_CHAINS.devnet);
  });

  it("signMessage() routes through signOffchainMessage", async () => {
    const adapter = await connectedSvm();
    const message = new TextEncoder().encode("hello solana");

    const result = await adapter.signMessage?.(message);

    expect(result?.signature).toEqual(new Uint8Array(64).fill(0xab));
    expect(result?.signedMessage).toBe(message);
  });

  it("signTransaction() signs a legacy message and fills the signer's slot", async () => {
    const received: Array<{ message: Uint8Array; path: string }> = [];
    const adapter = await connectedSvm({
      onSignTransaction: (path, message) => {
        received.push({ message, path });
      },
    });
    const tx = base64ToBytes(LEGACY_UNSIGNED);

    const signed = await adapter.signTransaction?.(tx);

    expect(received).toEqual([{ message: tx.subarray(MESSAGE_OFFSET), path: "44'/501'/0'/0'" }]);
    expect(signed).toEqual(base64ToBytes(LEGACY_SIGNED));
    expect(tx).toEqual(base64ToBytes(LEGACY_UNSIGNED));
  });

  it("signTransaction() signs a v0 message as the account it is given", async () => {
    const received: Array<{ message: Uint8Array; path: string }> = [];
    const adapter = await connectedSvm({
      onSignTransaction: (path, message) => {
        received.push({ message, path });
      },
    });
    const accounts = await adapter.getAccounts();
    const second = accounts.at(1);
    const tx = base64ToBytes(V0_UNSIGNED);

    const signed = await adapter.signTransaction?.(tx, { account: second });

    expect(received).toEqual([{ message: tx.subarray(MESSAGE_OFFSET), path: "44'/501'/0'/1'" }]);
    expect(signed).toEqual(base64ToBytes(V0_SIGNED));
  });

  it("signTransaction() rejects when the account is not one of the transaction's signers", async () => {
    const received: Array<string> = [];
    const adapter = await connectedSvm({
      onSignTransaction: (path) => {
        received.push(path);
      },
    });

    await expect(adapter.signTransaction?.(base64ToBytes(V0_UNSIGNED))).rejects.toThrow(
      /not a required signer/v,
    );
    expect(received).toEqual([]);
  });

  it("signTransaction() rejects bytes that are not a serialized transaction", async () => {
    const adapter = await connectedSvm();

    await expect(adapter.signTransaction?.(Uint8Array.of(1, 2, 3, 4))).rejects.toThrow(
      /Truncated Solana transaction message/v,
    );
  });

  it("signTransaction() rejects an account or chain the adapter does not cover", async () => {
    const adapter = await connectedSvm();
    const tx = base64ToBytes(LEGACY_UNSIGNED);

    await expect(
      adapter.signTransaction?.(tx, { account: buildAccount("outsider", SVM_CHAINS.mainnet) }),
    ).rejects.toThrow(/does not expose/v);
    await expect(adapter.signTransaction?.(tx, { chain: SVM_CHAINS.devnet })).rejects.toMatchObject(
      { kind: "ChainMismatch" },
    );
    await expect(adapter.signTransaction?.(tx, { chain: SVM_CHAINS.mainnet })).resolves.toEqual(
      base64ToBytes(LEGACY_SIGNED),
    );
  });

  it("getSigner() resolves the device app tagged ledger-svm", async () => {
    const adapter = await connectedSvm();

    await expect(adapter.getSigner()).resolves.toMatchObject({ kind: "ledger-svm" });
  });

  it("createLedgerAdapter() dispatches platform svm", async () => {
    const adapter = await createLedgerAdapter({
      platform: "svm",
      solana: buildFakeSolanaCtor(),
      transport: buildFakeTransport().factory,
    });

    expect(adapter.chainPlatform).toBe("svm");
  });
});
