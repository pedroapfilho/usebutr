import { buildBitcoinAdapter } from "@usebutr/bitcoin";
import { bitcoinMessageText } from "@usebutr/bitcoin/message";
import type { BitcoinAdapter } from "@usebutr/core";
import { BITCOIN_CHAINS, bytesToHex } from "@usebutr/core";
import type { BtcAppConstructor } from "@usebutr/ledger";
import { createBitcoinLedgerAdapter } from "@usebutr/ledger";
import { describe, expect, it } from "vitest";

import { bitcoinNamespace } from "../namespaces/bitcoin";

import { createFakeProvider } from "./fake-provider";
import type { Transport } from "./payload-transports";
import { ledgerTransport, requestParam, walletStandardWallet } from "./payload-transports";

const ADDRESS = "bc1qaddr1";

const walletConnect = (): Transport<BitcoinAdapter> => {
  const provider = createFakeProvider({
    request: () => ({ signature: "dead" }),
    session: { namespaces: { bip122: { accounts: [`${BITCOIN_CHAINS.mainnet.id}:${ADDRESS}`] } } },
  });
  const adapter = bitcoinNamespace.buildAdapter({
    chains: [BITCOIN_CHAINS.mainnet.id],
    icon: "data:image/svg+xml;base64,AAA",
    id: "walletconnect-bitcoin",
    name: "WalletConnect",
    provider,
  });
  return { adapter, asked: () => requestParam(provider, "message") };
};

const ledger = async (): Promise<Transport<BitcoinAdapter>> => {
  const asked: Array<string> = [];
  const FakeBtc: BtcAppConstructor = class {
    getWalletPublicKey() {
      return Promise.resolve({ bitcoinAddress: ADDRESS, chainCode: "", publicKey: "" });
    }
    signMessage(_path: string, messageHex: string) {
      asked.push(messageHex);
      return Promise.resolve({ r: "01", s: "02", v: 0 });
    }
    signPsbtBuffer(psbt: Uint8Array) {
      return Promise.resolve({ psbt });
    }
  };
  const adapter = await createBitcoinLedgerAdapter({
    btc: FakeBtc,
    platform: "bitcoin",
    transport: ledgerTransport,
  });
  await adapter.connect();
  return { adapter, asked: () => asked.at(-1) };
};

const walletStandard = (): Transport<BitcoinAdapter> => {
  const asked: Array<Uint8Array> = [];
  const adapter = buildBitcoinAdapter(
    walletStandardWallet(BITCOIN_CHAINS.mainnet.id, ADDRESS, {
      "bitcoin:signMessage": {
        signMessage: ({ message }: { message: Uint8Array }) => {
          asked.push(message);
          return Promise.resolve({ signature: Uint8Array.of(1), signedMessage: message });
        },
      },
    }),
  );
  if (adapter === null) {
    throw new Error("expected a Bitcoin adapter");
  }
  return { adapter, asked: () => asked.at(-1) };
};

describe("Bitcoin messages across transports", () => {
  it("asks for the same message and returns the same signedMessage", async () => {
    const message = new TextEncoder().encode("hello ✓");
    const transports = [walletConnect(), await ledger(), walletStandard()];

    const signedMessages = [];
    for (const { adapter } of transports) {
      const result = await adapter.signMessage?.(message);
      signedMessages.push(result?.signedMessage);
    }

    expect(transports.map(({ asked }) => asked())).toEqual([
      bitcoinMessageText(message, "WalletConnect"),
      bytesToHex(message),
      message,
    ]);
    expect(signedMessages).toEqual([message, message, message]);
  });

  it("rejects non-text bytes over WalletConnect and signs them as bytes elsewhere", async () => {
    const message = Uint8Array.of(0x68, 0xff);
    const overWalletConnect = walletConnect();
    const overLedger = await ledger();
    const overWalletStandard = walletStandard();

    await expect(overWalletConnect.adapter.signMessage?.(message)).rejects.toThrow(
      /signs text, and this message is not valid/v,
    );
    await expect(overLedger.adapter.signMessage?.(message)).resolves.toMatchObject({
      signedMessage: message,
    });
    await expect(overWalletStandard.adapter.signMessage?.(message)).resolves.toMatchObject({
      signedMessage: message,
    });
    expect(overWalletConnect.asked()).toBeUndefined();
    expect(overLedger.asked()).toBe(bytesToHex(message));
    expect(overWalletStandard.asked()).toEqual(message);
  });
});
