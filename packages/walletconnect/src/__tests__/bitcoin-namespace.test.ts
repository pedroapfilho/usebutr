import type { BitcoinAdapter } from "@usebutr/core";
import { BITCOIN_CHAINS, buildAccount, bytesToBase64, bytesToHex } from "@usebutr/core";
import type { Eip1193Value } from "@usebutr/evm";
import { describe, expect, it } from "vitest";

import { bitcoinNamespace } from "../namespaces/bitcoin";

import type { FakeProvider } from "./fake-provider";
import { createFakeProvider } from "./fake-provider";

const MAINNET = BITCOIN_CHAINS.mainnet.id;
const TESTNET = BITCOIN_CHAINS.testnet.id;

const buildAdapter = (
  provider: FakeProvider,
  chains: ReadonlyArray<string> = [MAINNET],
): BitcoinAdapter =>
  bitcoinNamespace.buildAdapter({
    chains,
    icon: "data:image/svg+xml;base64,Zm9v",
    id: "walletconnect-bitcoin",
    name: "WalletConnect (BITCOIN)",
    provider,
  });

const connectedProvider = (
  answer: Eip1193Value = null,
  accounts: ReadonlyArray<string> = [`${MAINNET}:bc1qabc123`],
) =>
  createFakeProvider({ request: () => answer, session: { namespaces: { bip122: { accounts } } } });

describe("bitcoinNamespace", () => {
  it("declares the right CAIP prefix, platform, chains, methods and events", () => {
    expect(bitcoinNamespace.caipPrefix).toBe("bip122");
    expect(bitcoinNamespace.chainPlatform).toBe("bitcoin");
    expect(bitcoinNamespace.defaultChains).toEqual([MAINNET]);
    expect(bitcoinNamespace.defaultMethods).toEqual([
      "signMessage",
      "signPsbt",
      "sendTransfer",
      "getAccountAddresses",
    ]);
    expect(bitcoinNamespace.defaultEvents).toEqual(["bip122_addressesChanged"]);
  });

  it("defines only what WalletConnect can do", () => {
    const adapter = buildAdapter(createFakeProvider());
    expect(adapter.id).toBe("walletconnect-bitcoin");
    expect(adapter.chainPlatform).toBe("bitcoin");
    expect(adapter.subscribe).toBeTypeOf("function");
    expect(adapter.getBalance).toBeUndefined();
    expect(adapter.getTransactionReceipt).toBeUndefined();
    expect(adapter.requestAccounts).toBeUndefined();
    expect(adapter.signTransaction).toBeTypeOf("function");
  });

  it("connect() drives the bip122 handshake with its methods and events", async () => {
    const provider = createFakeProvider();
    await buildAdapter(provider, [MAINNET, TESTNET]).connect();

    const namespace = provider.connectCalls[0]?.namespaces.bip122;
    expect(namespace?.chains).toEqual([MAINNET, TESTNET]);
    expect(namespace?.methods).toContain("sendTransfer");
    expect(namespace?.events).toContain("bip122_addressesChanged");
  });

  it("getAccounts() returns the current chain's accounts, named after the chain", async () => {
    const provider = connectedProvider(null, [`${MAINNET}:bc1qaaa`, `${TESTNET}:tb1qbbb`]);
    const adapter = buildAdapter(provider, [MAINNET, TESTNET]);

    await expect(adapter.getAccounts()).resolves.toEqual([
      buildAccount("bc1qaaa", BITCOIN_CHAINS.mainnet),
    ]);
    await adapter.switchChain?.(BITCOIN_CHAINS.testnet);
    await expect(adapter.getAccounts()).resolves.toEqual([
      buildAccount("tb1qbbb", BITCOIN_CHAINS.testnet),
    ]);
  });

  it("sendTx sends a transfer through sendTransfer with a decimal satoshi amount", async () => {
    const provider = connectedProvider({ txid: "f007551f" });

    const txid = await buildAdapter(provider).sendTx?.({
      amount: 123_000_000n,
      recipient: "bc1qrecipient",
    });

    expect(provider.requests).toEqual([
      {
        args: {
          method: "sendTransfer",
          params: { account: "bc1qabc123", amount: "123000000", recipientAddress: "bc1qrecipient" },
        },
        chain: MAINNET,
      },
    ]);
    expect(txid).toBe("f007551f");
  });

  it("sendTx routes to options.chain and rejects a chain the session did not approve", async () => {
    const provider = connectedProvider({ txid: "f007551f" }, [
      `${MAINNET}:bc1qaaa`,
      `${TESTNET}:tb1qbbb`,
    ]);
    const adapter = buildAdapter(provider, [MAINNET, TESTNET]);
    const transfer = { amount: 1n, recipient: "tb1qrecipient" };

    await adapter.sendTx?.(transfer, { chain: BITCOIN_CHAINS.testnet });
    expect(provider.requests[0]).toMatchObject({
      args: { params: { account: "tb1qbbb" } },
      chain: TESTNET,
    });

    await expect(adapter.sendTx?.(transfer, { chain: BITCOIN_CHAINS.signet })).rejects.toThrow(
      /did not approve Bitcoin chain/v,
    );
    expect(provider.requests).toHaveLength(1);
  });

  it("sendTx throws when the response carries no txid", async () => {
    await expect(
      buildAdapter(connectedProvider({})).sendTx?.({ amount: 1n, recipient: "bc1q" }),
    ).rejects.toThrow(/sendTransfer returned no txid/v);
  });

  it("signTransaction signs the PSBT without broadcasting and decodes the signed PSBT", async () => {
    const signed = new Uint8Array([7, 8, 9, 10]);
    const provider = connectedProvider({ psbt: bytesToBase64(signed) });

    const out = await buildAdapter(provider).signTransaction?.(new Uint8Array([1, 2, 3]));

    expect(provider.requests[0]?.args).toEqual({
      method: "signPsbt",
      params: {
        account: "bc1qabc123",
        broadcast: false,
        psbt: bytesToBase64(new Uint8Array([1, 2, 3])),
        signInputs: [],
      },
    });
    expect(out).toEqual(signed);
  });

  it("signTransaction throws when the response carries no psbt", async () => {
    await expect(
      buildAdapter(connectedProvider({})).signTransaction?.(new Uint8Array([1])),
    ).rejects.toThrow(/signPsbt returned no psbt/v);
  });

  it("signMessage sends utf-8 text and decodes a hex signature, 0x-prefixed or not", async () => {
    const message = new TextEncoder().encode("hello");
    const provider = connectedProvider({ address: "bc1qabc123", signature: "deadbeef" });

    const result = await buildAdapter(provider).signMessage?.(message);

    expect(provider.requests[0]?.args).toEqual({
      method: "signMessage",
      params: { account: "bc1qabc123", address: "bc1qabc123", message: "hello" },
    });
    expect(result && bytesToHex(result.signature)).toBe("deadbeef");
    expect(result?.signedMessage).toEqual(message);

    const prefixed = await buildAdapter(
      connectedProvider({ signature: "0xcafebabe" }),
    ).signMessage?.(message);
    expect(prefixed && bytesToHex(prefixed.signature)).toBe("cafebabe");
  });

  it("signMessage sends non-utf-8 bytes base64-encoded", async () => {
    const message = new Uint8Array([0xff, 0xfe]);
    const provider = connectedProvider({ signature: "dead" });

    await buildAdapter(provider).signMessage?.(message);

    expect(provider.requests[0]?.args.params).toMatchObject({ message: bytesToBase64(message) });
  });

  it("signs as the requested account and rejects one the session does not expose", async () => {
    const provider = connectedProvider({ signature: "dead" }, [
      `${MAINNET}:bc1qaaa`,
      `${MAINNET}:bc1qbbb`,
    ]);
    const adapter = buildAdapter(provider);

    await adapter.signMessage?.(new Uint8Array([1]), {
      account: buildAccount("bc1qbbb", BITCOIN_CHAINS.mainnet),
    });
    expect(provider.requests[0]?.args.params).toMatchObject({
      account: "bc1qbbb",
      address: "bc1qbbb",
    });

    await expect(
      adapter.signMessage?.(new Uint8Array([1]), {
        account: buildAccount("bc1qccc", BITCOIN_CHAINS.mainnet),
      }),
    ).rejects.toThrow(/does not expose Bitcoin account bc1qccc/v);
    expect(provider.requests).toHaveLength(1);
  });

  it("refuses to sign when the session holds no account on the current chain", async () => {
    const provider = connectedProvider({ signature: "dead" }, [`${TESTNET}:tb1qbbb`]);

    await expect(buildAdapter(provider).signMessage?.(new Uint8Array([1]))).rejects.toThrow(
      /No connected Bitcoin account on chain/v,
    );
    expect(provider.requests).toHaveLength(0);
  });

  it("switchChain rejects another namespace and a chain the session did not approve", async () => {
    const adapter = buildAdapter(connectedProvider(), [MAINNET, TESTNET]);

    await expect(
      adapter.switchChain?.({
        id: "solana:mainnet",
        name: "Solana",
        namespace: "solana",
        reference: "mainnet",
      }),
    ).rejects.toThrow(/non-Bitcoin chain/v);
    await expect(adapter.switchChain?.(BITCOIN_CHAINS.testnet)).rejects.toThrow(
      /did not approve Bitcoin chain/v,
    );
  });
});
