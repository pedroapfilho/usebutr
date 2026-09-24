import type { ConnectorEvent, SvmAdapter } from "@usebutr/core";
import { buildAccount, bytesToBase58, bytesToBase64, SVM_CHAINS } from "@usebutr/core";
import type { Eip1193Value } from "@usebutr/evm";
import { describe, expect, it, vi } from "vitest";

import { solanaNamespace } from "../namespaces/svm";

import type { FakeProvider } from "./fake-provider";
import { createFakeProvider } from "./fake-provider";

// WalletConnect's CAIP-2 ids, which core's registry does not name.
// What the session calls each cluster, and what butr's accounts carry.
const MAINNET_ID = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp";
const DEVNET_ID = "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1";
const MAINNET = SVM_CHAINS.mainnet;
const DEVNET = SVM_CHAINS.devnet;

const key = (fill: number) => new Uint8Array(32).fill(fill);
const SIGNER_KEY = key(2);
const SIGNER = bytesToBase58(SIGNER_KEY);
const OTHER = bytesToBase58(key(9));

const buildAdapter = (
  provider: FakeProvider,
  chains: ReadonlyArray<string> = [MAINNET_ID],
): SvmAdapter =>
  solanaNamespace.buildAdapter({
    chains,
    icon: "data:image/svg+xml;base64,Zm9v",
    id: "walletconnect-svm",
    name: "WalletConnect (SVM)",
    provider,
  });

const connectedProvider = (answer: Eip1193Value = null) =>
  createFakeProvider({
    request: () => answer,
    session: {
      namespaces: {
        solana: {
          accounts: [`${MAINNET_ID}:${SIGNER}`, `${MAINNET_ID}:${OTHER}`, `${DEVNET_ID}:${OTHER}`],
        },
      },
    },
  });

/** `[2 signatures][2 empty slots][header 2/0/1][3 keys][payload]`, with the
 *  signer's key second, optionally behind a v0 prefix. */
const unsignedTransaction = (versioned: boolean) =>
  Uint8Array.from([
    2,
    ...new Uint8Array(128),
    ...(versioned ? [0x80] : []),
    2,
    0,
    1,
    3,
    ...key(1),
    ...SIGNER_KEY,
    ...key(3),
    ...new Uint8Array(32).fill(4),
  ]);

describe("solanaNamespace", () => {
  it("declares the right CAIP prefix, platform, chains and methods", () => {
    expect(solanaNamespace.caipPrefix).toBe("solana");
    expect(solanaNamespace.chainPlatform).toBe("svm");
    expect(solanaNamespace.defaultChains).toEqual([MAINNET_ID]);
    expect(solanaNamespace.defaultMethods).toEqual([
      "solana_signMessage",
      "solana_signTransaction",
      "solana_signAndSendTransaction",
    ]);
  });

  it("defines only what WalletConnect can do", () => {
    const adapter = buildAdapter(createFakeProvider());

    expect(adapter.id).toBe("walletconnect-svm");
    expect(adapter.name).toBe("WalletConnect (SVM)");
    expect(adapter.chainPlatform).toBe("svm");
    expect(adapter.signIn).toBeUndefined();
    expect(adapter.getBalance).toBeUndefined();
    expect(adapter.getTransactionReceipt).toBeUndefined();
    expect(adapter.requestAccounts).toBeUndefined();
    // One configured chain leaves nowhere to switch to.
    expect(adapter.switchChain).toBeUndefined();
    expect(buildAdapter(createFakeProvider(), [MAINNET_ID, DEVNET_ID]).switchChain).toBeTypeOf(
      "function",
    );
  });

  it("connect() pairs for the solana namespace when driven standalone", async () => {
    const provider = createFakeProvider();
    await buildAdapter(provider, [MAINNET_ID, DEVNET_ID]).connect();

    const namespace = provider.connectCalls[0]?.namespaces.solana;
    expect(namespace?.chains).toEqual([MAINNET_ID, DEVNET_ID]);
    expect(namespace?.events).toContain("accountsChanged");
  });

  it("connect() short-circuits when the session already carries the namespace", async () => {
    const provider = connectedProvider();
    await buildAdapter(provider).connect();
    expect(provider.connectCalls).toHaveLength(0);
  });

  it("getAccounts() returns the session's CAIP-10 accounts on the current chain", async () => {
    const accounts = await buildAdapter(connectedProvider()).getAccounts();
    expect(accounts).toEqual([buildAccount(SIGNER, MAINNET), buildAccount(OTHER, MAINNET)]);
  });

  it("getSigner() hands back the provider and the chain to route to", async () => {
    const provider = connectedProvider();
    await expect(buildAdapter(provider).getSigner()).resolves.toEqual({
      chainId: MAINNET_ID,
      kind: "walletconnect",
      provider,
    });
  });

  it("signMessage sends a base58 message and decodes the base58 signature", async () => {
    const provider = connectedProvider({ signature: "111" });

    const result = await buildAdapter(provider).signMessage?.(new Uint8Array([1, 2, 3]));

    expect(provider.requests).toEqual([
      {
        args: {
          method: "solana_signMessage",
          params: { message: bytesToBase58(new Uint8Array([1, 2, 3])), pubkey: SIGNER },
        },
        chain: MAINNET_ID,
      },
    ]);
    expect(result).toEqual({
      signature: new Uint8Array([0, 0, 0]),
      signedMessage: new Uint8Array([1, 2, 3]),
    });
  });

  it("signs as the requested account and rejects one the session does not expose", async () => {
    const provider = connectedProvider({ signature: "111" });
    const adapter = buildAdapter(provider);

    await adapter.signMessage?.(new Uint8Array([1]), {
      account: buildAccount(OTHER, MAINNET),
    });
    expect(provider.requests[0]?.args.params).toMatchObject({ pubkey: OTHER });

    await expect(
      adapter.signMessage?.(new Uint8Array([1]), {
        account: buildAccount("Unknown111", MAINNET),
      }),
    ).rejects.toThrow(/does not expose Solana account Unknown111/v);
    expect(provider.requests).toHaveLength(1);
  });

  it("sendTx routes through solana_signAndSendTransaction and returns the signature", async () => {
    const provider = connectedProvider({ signature: "abc123" });

    const signature = await buildAdapter(provider).sendTx?.(new Uint8Array([9, 8, 7]));

    expect(provider.requests[0]?.args).toEqual({
      method: "solana_signAndSendTransaction",
      params: { pubkey: SIGNER, transaction: bytesToBase64(new Uint8Array([9, 8, 7])) },
    });
    expect(signature).toBe("abc123");
  });

  it("signTransaction returns the wallet's signed transaction when it sends one", async () => {
    const signed = new Uint8Array([7, 7, 7]);
    const provider = connectedProvider({ signature: "111", transaction: bytesToBase64(signed) });

    await expect(buildAdapter(provider).signTransaction?.(new Uint8Array([1]))).resolves.toEqual(
      signed,
    );
  });

  it.each([
    ["legacy", false],
    ["versioned", true],
  ])(
    "signTransaction splices a bare signature into the signer's slot (%s)",
    async (_label, versioned) => {
      const signature = new Uint8Array(64).fill(7);
      const provider = connectedProvider({ signature: bytesToBase58(signature) });
      const tx = unsignedTransaction(versioned);

      const signed = await buildAdapter(provider).signTransaction?.(tx);

      const expected = Uint8Array.from(tx);
      expected.set(signature, 1 + 64);
      expect(signed).toEqual(expected);
      // The input stays untouched.
      expect(tx.subarray(65, 129).every((byte) => byte === 0)).toBe(true);
    },
  );

  it("signTransaction rejects a bare signature for a key that signs nothing", async () => {
    const provider = connectedProvider({ signature: bytesToBase58(new Uint8Array(64).fill(7)) });

    await expect(
      buildAdapter(provider).signTransaction?.(unsignedTransaction(false), {
        account: buildAccount(OTHER, MAINNET),
      }),
    ).rejects.toThrow(/is not a required signer/v);
  });

  it("rejects a response with neither transaction nor signature", async () => {
    const provider = connectedProvider({});
    await expect(
      buildAdapter(provider).signTransaction?.(unsignedTransaction(false)),
    ).rejects.toThrow(/solana_signTransaction returned no signature/v);
  });

  it("subscribe() reports the new chain's accounts after switchChain", async () => {
    const adapter = buildAdapter(connectedProvider(), [MAINNET_ID, DEVNET_ID]);
    const listener = vi.fn<(event: ConnectorEvent) => void>();
    const unsubscribe = adapter.subscribe?.(listener);

    await adapter.switchChain?.(DEVNET);

    expect(listener).toHaveBeenCalledExactlyOnceWith({
      accounts: [buildAccount(OTHER, DEVNET)],
      type: "accountsChanged",
    });
    unsubscribe?.();
  });

  it("subscribe() emits nothing when switchChain rejects", async () => {
    const adapter = buildAdapter(connectedProvider(), [MAINNET_ID, DEVNET_ID]);
    const listener = vi.fn<(event: ConnectorEvent) => void>();
    adapter.subscribe?.(listener);

    await expect(adapter.switchChain?.(SVM_CHAINS.testnet)).rejects.toThrow(/did not approve/v);

    expect(listener).not.toHaveBeenCalled();
  });

  it("subscribe() reports disconnected when the wallet deletes the session", () => {
    const provider = connectedProvider();
    const listener = vi.fn<(event: ConnectorEvent) => void>();
    const unsubscribe = buildAdapter(provider).subscribe?.(listener);

    provider.emit("disconnect", { code: 6000, message: "User disconnected." });
    expect(listener).toHaveBeenCalledExactlyOnceWith({ type: "disconnected" });

    unsubscribe?.();
    provider.emit("disconnect");
    expect(listener).toHaveBeenCalledOnce();
    expect(provider.removeListenerCalls.map(({ event }) => event)).toEqual(["disconnect"]);
  });
});
