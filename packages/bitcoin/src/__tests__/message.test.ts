import type { BitcoinAdapter } from "@usebutr/core";
import type { WalletStandardWallet } from "@usebutr/wallet-standard-shared";
import { describe, expect, it, vi } from "vitest";

import type { SatsConnectProvider } from "../injected/sats-connect";
import { buildSatsConnectAdapter } from "../injected/sats-connect";
import type { UnisatProvider } from "../injected/unisat";
import { buildUnisatAdapter } from "../injected/unisat";
import { bitcoinMessageText } from "../message";
import { buildBitcoinAdapter } from "../wallet-standard-adapter";
import type { BitcoinSignMessageFeature } from "../wallet-standard-types";

const ADDRESS = "bc1qaddr1";
const UTF8_MESSAGE = new TextEncoder().encode("hello ✓");
const BOM_MESSAGE = Uint8Array.of(0xef, 0xbb, 0xbf, 0x68, 0x69);
const NON_UTF8_MESSAGE = Uint8Array.of(0x68, 0xff, 0xfe);

type Transport = {
  adapter: BitcoinAdapter;
  /** What the wallet was asked to sign, as text or bytes. */
  signed: () => string | Uint8Array | undefined;
};

const unisat = (): Transport => {
  const signMessage = vi.fn<UnisatProvider["signMessage"]>().mockResolvedValue("AQID");
  const provider: UnisatProvider = {
    getAccounts: () => Promise.resolve([ADDRESS]),
    requestAccounts: () => Promise.resolve([ADDRESS]),
    signMessage,
    signPsbt: () => Promise.resolve(""),
  };
  return {
    adapter: buildUnisatAdapter("injected:bitcoin:unisat", "Unisat", provider),
    signed: () => signMessage.mock.lastCall?.[0],
  };
};

const satsConnect = async (): Promise<Transport> => {
  const request = vi.fn<SatsConnectProvider["request"]>((method) =>
    Promise.resolve({
      result:
        method === "signMessage"
          ? { signature: "AQID" }
          : [{ address: ADDRESS, purpose: "payment" }],
    }),
  );
  const adapter = buildSatsConnectAdapter("injected:bitcoin:xverse", "Xverse", { request });
  await adapter.connect();
  return {
    adapter,
    signed: () => {
      const [method, params] = request.mock.lastCall ?? [];
      return method === "signMessage" && typeof params?.message === "string"
        ? params.message
        : undefined;
    },
  };
};

const walletStandard = (): Transport => {
  const signMessage = vi.fn<BitcoinSignMessageFeature["signMessage"]>(({ message }) =>
    Promise.resolve({ signature: Uint8Array.of(1, 2, 3), signedMessage: message }),
  );
  const chains = ["bip122:000000000019d6689c085ae165831e93"];
  const wallet: WalletStandardWallet = {
    accounts: [{ address: ADDRESS, chains, features: [] }],
    chains,
    features: {
      "bitcoin:signMessage": { signMessage },
      "standard:connect": { connect: () => Promise.resolve({ accounts: [] }) },
    },
    icon: "data:image/svg+xml;base64,AAA",
    name: "Mock Bitcoin Wallet",
    version: "1.0.0",
  };
  const adapter = buildBitcoinAdapter(wallet);
  if (adapter === null) {
    throw new Error("expected a bitcoin adapter");
  }
  return { adapter, signed: () => signMessage.mock.lastCall?.[0].message };
};

const signWith = async (transport: Transport, message: Uint8Array) => {
  const result = await transport.adapter.signMessage?.(message);
  return { asked: transport.signed(), signedMessage: result?.signedMessage };
};

describe("bitcoinMessageText", () => {
  it("decodes UTF-8 exactly, keeping a byte-order mark", () => {
    expect(bitcoinMessageText(UTF8_MESSAGE, "Unisat")).toBe("hello ✓");
    expect(new TextEncoder().encode(bitcoinMessageText(BOM_MESSAGE, "Unisat"))).toEqual(
      BOM_MESSAGE,
    );
  });

  it("rejects bytes that are not UTF-8, naming the wallet", () => {
    expect(() => bitcoinMessageText(NON_UTF8_MESSAGE, "Unisat")).toThrow(
      /Wallet Unisat signs text, and this message is not valid UTF-8/v,
    );
  });
});

describe("Bitcoin message signing across transports", () => {
  it.each([
    ["plain text", UTF8_MESSAGE],
    ["a byte-order mark", BOM_MESSAGE],
  ])("asks every text wallet for the same text for %s", async (_label, message) => {
    const results = [
      await signWith(unisat(), message),
      await signWith(await satsConnect(), message),
    ];

    for (const result of results) {
      expect(result).toEqual({ asked: bitcoinMessageText(message, ""), signedMessage: message });
    }
    await expect(signWith(walletStandard(), message)).resolves.toEqual({
      asked: message,
      signedMessage: message,
    });
  });

  it("rejects non-UTF-8 on every text wallet without prompting, and signs it as bytes", async () => {
    const text = [unisat(), await satsConnect()];
    for (const transport of text) {
      await expect(transport.adapter.signMessage?.(NON_UTF8_MESSAGE)).rejects.toThrow(
        /signs text, and this message is not valid UTF-8/v,
      );
      expect(transport.signed()).toBeUndefined();
    }
    await expect(signWith(walletStandard(), NON_UTF8_MESSAGE)).resolves.toEqual({
      asked: NON_UTF8_MESSAGE,
      signedMessage: NON_UTF8_MESSAGE,
    });
  });
});
