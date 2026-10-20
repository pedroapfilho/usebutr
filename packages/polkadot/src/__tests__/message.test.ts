import { bytesToHexPrefixed, hexToBytes, POLKADOT_CHAINS } from "@usebutr/core";
import type { WalletStandardWallet } from "@usebutr/wallet-standard-shared";
import { describe, expect, it, vi } from "vitest";

import { buildInjectedPolkadotAdapter } from "../injected/adapter";
import type { Injected, InjectedSigner } from "../injected/injected-web3";
import { wrapBytes } from "../message";
import { buildPolkadotWalletStandardAdapter } from "../wallet-standard-adapter";
import type { PolkadotSignMessageFeature } from "../wallet-standard-types";

const ADDRESS = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
const MESSAGE = new TextEncoder().encode("hi");
const WRAPPED = new TextEncoder().encode("<Bytes>hi</Bytes>");

const injected = async () => {
  const signRaw = vi
    .fn<NonNullable<InjectedSigner["signRaw"]>>()
    .mockResolvedValue({ id: 1, signature: "0xdead" });
  const extension: Injected = {
    accounts: { get: () => Promise.resolve([{ address: ADDRESS }]) },
    signer: { signRaw },
  };
  const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", {
    enable: () => Promise.resolve(extension),
  });
  await adapter.connect();
  return { adapter, asked: () => hexToBytes(signRaw.mock.lastCall?.[0].data ?? "") };
};

const walletStandard = () => {
  const signMessage = vi
    .fn<PolkadotSignMessageFeature["signMessage"]>()
    .mockResolvedValue({ signature: hexToBytes("dead") });
  const wallet: WalletStandardWallet = {
    accounts: [
      {
        address: ADDRESS,
        chains: [POLKADOT_CHAINS.polkadot.id],
        features: ["polkadot:signMessage"],
      },
    ],
    chains: [POLKADOT_CHAINS.polkadot.id],
    features: {
      "polkadot:signMessage": { signMessage },
      "standard:connect": { connect: () => Promise.resolve({ accounts: [] }) },
    },
    icon: "data:image/svg+xml;base64,AAAA",
    name: "Mock Polkadot Wallet",
    version: "1.0.0",
  };
  const adapter = buildPolkadotWalletStandardAdapter(wallet);
  if (adapter === null) {
    throw new Error("expected a Polkadot Wallet Standard adapter");
  }
  return { adapter, asked: () => signMessage.mock.lastCall?.[0].message };
};

describe("wrapBytes", () => {
  it("wraps a message in <Bytes>…</Bytes> the way polkadot-js extensions sign it", () => {
    expect(wrapBytes(MESSAGE)).toEqual(WRAPPED);
  });
});

describe("Polkadot messages across transports", () => {
  it("asks both transports to sign the wrapped bytes and reports them as signedMessage", async () => {
    const transports = [await injected(), walletStandard()];

    const results = [];
    for (const { adapter } of transports) {
      results.push(await adapter.signMessage?.(MESSAGE));
    }

    expect(transports.map(({ asked }) => asked())).toEqual([WRAPPED, WRAPPED]);
    expect(results.map((result) => result?.signedMessage)).toEqual([WRAPPED, WRAPPED]);
    expect(
      results.map((result) => bytesToHexPrefixed(result?.signature ?? new Uint8Array())),
    ).toEqual(["0xdead", "0xdead"]);
  });
});
