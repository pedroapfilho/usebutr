import type { SuiAdapter, SuiTransactionInput } from "@usebutr/core";
import { base64ToBytes, bytesToHexPrefixed, SUI_CHAINS } from "@usebutr/core";
import type { SuiAppConstructor } from "@usebutr/ledger";
import { createSuiLedgerAdapter } from "@usebutr/ledger";
import { buildSuiAdapter } from "@usebutr/sui";
import { describe, expect, it } from "vitest";

import { suiNamespace } from "../namespaces/sui";

import { createFakeProvider } from "./fake-provider";
import type { Transport } from "./payload-transports";
import { ledgerTransport, requestParam, walletStandardWallet } from "./payload-transports";

const ADDRESS_BYTES = new Uint8Array(32).fill(0x10);
const ADDRESS = bytesToHexPrefixed(ADDRESS_BYTES);
const JSON_TX = '{"version":2}';

const walletStandard = (): Transport<SuiAdapter> => {
  const asked: Array<string> = [];

  const adapter = buildSuiAdapter(
    walletStandardWallet(SUI_CHAINS.mainnet.id, ADDRESS, {
      "sui:signTransaction": {
        signTransaction: async ({
          transaction,
        }: {
          transaction: { toJSON: () => Promise<string> };
        }) => {
          asked.push(await transaction.toJSON());

          return { bytes: "AQID", signature: "AQID" };
        },
      },
    }),
  );

  if (adapter === null) {
    throw new Error("expected a Sui adapter");
  }

  return { adapter, asked: () => asked.at(-1) };
};

const walletConnect = (): Transport<SuiAdapter> => {
  const provider = createFakeProvider({
    request: () => ({ signature: "AQID" }),
    session: { namespaces: { sui: { accounts: [`${SUI_CHAINS.mainnet.id}:${ADDRESS}`] } } },
  });

  const adapter = suiNamespace.buildAdapter({
    chains: [SUI_CHAINS.mainnet.id],
    icon: "data:image/svg+xml;base64,AAA",
    id: "walletconnect-sui",
    name: "WalletConnect",
    provider,
  });

  return { adapter, asked: () => requestParam(provider, "transaction") };
};

const ledger = async (): Promise<Transport<SuiAdapter>> => {
  const asked: Array<Uint8Array> = [];

  const FakeSui: SuiAppConstructor = class {
    getPublicKey() {
      return Promise.resolve({ address: ADDRESS_BYTES, publicKey: new Uint8Array(32) });
    }
    signTransaction(_path: string, intentMessage: Uint8Array) {
      asked.push(intentMessage.subarray(3));

      return Promise.resolve({ signature: new Uint8Array(64) });
    }
  };

  const adapter = await createSuiLedgerAdapter({
    platform: "sui",
    sui: FakeSui,
    transport: ledgerTransport,
  });

  await adapter.connect();

  return { adapter, asked: () => asked.at(-1) };
};

describe("Sui transactions across transports", () => {
  it.each<[string, SuiTransactionInput]>([
    ["BCS bytes", Uint8Array.of(1, 2, 3)],
    ["base64 BCS bytes", "AQID"],
  ])("asks every transport to sign the same %s", async (_label, tx) => {
    const transports = [walletStandard(), walletConnect(), await ledger()];

    const results = [];

    for (const { adapter } of transports) {
      results.push(await adapter.signTransaction?.(tx));
    }

    expect(transports.map(({ asked }) => asked())).toEqual(["AQID", "AQID", base64ToBytes("AQID")]);
    expect(results[1]?.bytes).toEqual(results[2]?.bytes);
  });

  it.each<[string, SuiTransactionInput]>([
    ["a Transaction's JSON", JSON_TX],
    ["a Transaction", { toJSON: () => Promise.resolve(JSON_TX) }],
  ])("sends %s as the same JSON, which Ledger rejects", async (_label, tx) => {
    const overWalletStandard = walletStandard();
    const overWalletConnect = walletConnect();
    const overLedger = await ledger();

    await overWalletStandard.adapter.signTransaction?.(tx);
    await expect(overWalletConnect.adapter.signTransaction?.(tx)).rejects.toThrow(
      /returned no transaction bytes/v,
    );
    await expect(overLedger.adapter.signTransaction?.(tx)).rejects.toThrow(
      /takes built BCS bytes or their base64/v,
    );

    expect(overWalletStandard.asked()).toBe(JSON_TX);
    expect(overWalletConnect.asked()).toBe(JSON_TX);
    expect(overLedger.asked()).toBeUndefined();
  });
});
