import type { SuiAdapter } from "@usebutr/core";
import { base64ToBytes, buildAccount, bytesToBase64, SUI_CHAINS } from "@usebutr/core";
import type { Eip1193Value } from "@usebutr/evm";
import { describe, expect, it } from "vitest";

import { suiNamespace } from "../namespaces/sui";

import type { FakeProvider } from "./fake-provider";
import { createFakeProvider } from "./fake-provider";

const buildAdapter = (
  provider: FakeProvider,
  chains: ReadonlyArray<string> = ["sui:mainnet"],
): SuiAdapter =>
  suiNamespace.buildAdapter({
    chains,
    icon: "data:image/svg+xml;base64,Zm9v",
    id: "walletconnect-sui",
    name: "WalletConnect (SUI)",
    provider,
  });

const connectedProvider = (
  answer: Eip1193Value = null,
  accounts: ReadonlyArray<string> = ["sui:mainnet:0xabc"],
) => createFakeProvider({ request: () => answer, session: { namespaces: { sui: { accounts } } } });

describe("suiNamespace", () => {
  it("declares the right CAIP prefix, platform, chains, methods and events", () => {
    expect(suiNamespace.caipPrefix).toBe("sui");
    expect(suiNamespace.chainPlatform).toBe("sui");
    expect(suiNamespace.defaultChains).toEqual(["sui:mainnet"]);
    expect(suiNamespace.defaultMethods).toEqual([
      "sui_signTransaction",
      "sui_signAndExecuteTransaction",
      "sui_signPersonalMessage",
    ]);
    expect(suiNamespace.defaultEvents).toContain("accountsChanged");
  });

  it("defines only what WalletConnect can do", () => {
    const adapter = buildAdapter(createFakeProvider());
    expect(adapter.id).toBe("walletconnect-sui");
    expect(adapter.chainPlatform).toBe("sui");
    expect(adapter.subscribe).toBeTypeOf("function");
    expect(adapter.getBalance).toBeUndefined();
    expect(adapter.getTransactionReceipt).toBeUndefined();
    expect(adapter.requestAccounts).toBeUndefined();
    expect(adapter.signTransaction).toBeTypeOf("function");
  });

  it("connect({ silent: true }) without a session rejects rather than prompting", async () => {
    const provider = createFakeProvider();
    await expect(buildAdapter(provider).connect({ silent: true })).rejects.toThrow(
      /silent reconnect/v,
    );
    expect(provider.connectCalls).toHaveLength(0);
  });

  it("getAccounts() returns the accounts on the current chain, named after the chain", async () => {
    const provider = connectedProvider(null, ["sui:mainnet:0xaaa", "sui:testnet:0xbbb"]);
    const adapter = buildAdapter(provider, ["sui:mainnet", "sui:testnet"]);

    await expect(adapter.getAccounts()).resolves.toEqual([
      buildAccount("0xaaa", SUI_CHAINS.mainnet),
    ]);

    await adapter.switchChain?.(SUI_CHAINS.testnet);
    await expect(adapter.getAccounts()).resolves.toEqual([
      buildAccount("0xbbb", SUI_CHAINS.testnet),
    ]);
  });

  it("getAccounts() follows session account drift", async () => {
    const sui = { accounts: ["sui:mainnet:0xaaa"] };
    const adapter = buildAdapter(createFakeProvider({ session: { namespaces: { sui } } }));

    await expect(adapter.getAccounts()).resolves.toEqual([
      buildAccount("0xaaa", SUI_CHAINS.mainnet),
    ]);
    sui.accounts = ["sui:mainnet:0xbbb"];
    await expect(adapter.getAccounts()).resolves.toEqual([
      buildAccount("0xbbb", SUI_CHAINS.mainnet),
    ]);
  });

  it("switchChain rejects another namespace and a chain the session did not approve", async () => {
    const adapter = buildAdapter(connectedProvider(), ["sui:mainnet", "sui:testnet"]);

    const pending = adapter.switchChain?.({
      id: "solana:mainnet",
      name: "Solana",
      namespace: "solana",
      reference: "mainnet",
    });
    expect(pending).toBeInstanceOf(Promise);
    await expect(pending).rejects.toThrow(/non-Sui chain/v);
    await expect(adapter.switchChain?.(SUI_CHAINS.testnet)).rejects.toThrow(/did not approve/v);
  });

  it("signMessage routes through sui_signPersonalMessage and decodes the signature", async () => {
    const echoed = new Uint8Array([4, 5, 6]);
    const provider = connectedProvider({ bytes: bytesToBase64(echoed), signature: "Zm9v" });

    const result = await buildAdapter(provider).signMessage?.(new Uint8Array([1, 2, 3]));

    expect(provider.requests).toEqual([
      {
        args: {
          method: "sui_signPersonalMessage",
          params: { address: "0xabc", message: bytesToBase64(new Uint8Array([1, 2, 3])) },
        },
        chain: "sui:mainnet",
      },
    ]);
    expect(result).toEqual({ signature: base64ToBytes("Zm9v"), signedMessage: echoed });
  });

  it("signMessage falls back to the input bytes when the wallet echoes none", async () => {
    const message = new Uint8Array([1, 2, 3]);
    const result = await buildAdapter(connectedProvider({ signature: "Zm9v" })).signMessage?.(
      message,
    );
    expect(result?.signedMessage).toEqual(message);
  });

  it("signs as the requested account and rejects one the session does not expose", async () => {
    const provider = connectedProvider({ signature: "Zm9v" }, [
      "sui:mainnet:0xaaa",
      "sui:mainnet:0xbbb",
    ]);
    const adapter = buildAdapter(provider);

    await adapter.signMessage?.(new Uint8Array([1]), {
      account: buildAccount("0xbbb", SUI_CHAINS.mainnet),
    });
    expect(provider.requests[0]?.args.params).toMatchObject({ address: "0xbbb" });

    await expect(
      adapter.signMessage?.(new Uint8Array([1]), {
        account: buildAccount("0xccc", SUI_CHAINS.mainnet),
      }),
    ).rejects.toThrow(/does not expose Sui account 0xccc/v);
    expect(provider.requests).toHaveLength(1);
  });

  it.each([
    ["transactionBytes", "transactionBytes"],
    ["the legacy transactionBlockBytes", "transactionBlockBytes"],
  ])("signTransaction returns the bytes the wallet echoes under %s", async (_label, field) => {
    const signed = new Uint8Array([7, 8, 9, 10]);
    const provider = connectedProvider({ [field]: bytesToBase64(signed), signature: "Zm9v" });

    const out = await buildAdapter(provider).signTransaction?.(new Uint8Array([1, 2, 3]));

    expect(provider.requests[0]?.args).toEqual({
      method: "sui_signTransaction",
      params: { address: "0xabc", transaction: bytesToBase64(new Uint8Array([1, 2, 3])) },
    });
    expect(out).toEqual({ bytes: signed, signature: base64ToBytes("Zm9v") });
  });

  it("signTransaction falls back to submitted bytes, and rejects when it has none", async () => {
    const adapter = buildAdapter(connectedProvider({ signature: "Zm9v" }));
    const tx = new Uint8Array([1, 2, 3]);

    await expect(adapter.signTransaction?.(tx)).resolves.toEqual({
      bytes: tx,
      signature: base64ToBytes("Zm9v"),
    });
    await expect(adapter.signTransaction?.('{"version":2}')).rejects.toThrow(
      /returned no transaction bytes/v,
    );
  });

  it("sendTx serializes a Transaction through toJSON() and returns the digest", async () => {
    const provider = connectedProvider({ digest: "0xdeadbeef" });
    const transaction = { toJSON: () => Promise.resolve('{"version":2}') };

    const digest = await buildAdapter(provider).sendTx?.(transaction);

    expect(provider.requests).toEqual([
      {
        args: {
          method: "sui_signAndExecuteTransaction",
          params: { address: "0xabc", transaction: '{"version":2}' },
        },
        chain: "sui:mainnet",
      },
    ]);
    expect(digest).toBe("0xdeadbeef");
  });

  it("sendTx passes a string through and throws when the response has no digest", async () => {
    const provider = connectedProvider({});
    await expect(buildAdapter(provider).sendTx?.("AAEC")).rejects.toThrow(
      /sui_signAndExecuteTransaction returned no digest/v,
    );
    expect(provider.requests[0]?.args.params).toMatchObject({ transaction: "AAEC" });
  });
});
