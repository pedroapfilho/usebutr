import { describe, expect, it } from "vitest";

import type { StoredPoolEntry } from "../../storage/persistence";
import type { ChainPlatform, WalletCapabilities } from "../../types";
import { createShadowAdapter, isShadowAdapter, ShadowConnectorError } from "../shadow-adapter";

const evmEntry = (overrides: Partial<StoredPoolEntry> = {}): StoredPoolEntry => ({
  account: {
    chain: { id: "eip155:1", name: "Ethereum", namespace: "eip155", reference: "1" },
    id: "acc-1",
    walletAddress: "0xabc",
  },
  accounts: [
    {
      chain: { id: "eip155:1", name: "Ethereum", namespace: "eip155", reference: "1" },
      id: "acc-1",
      walletAddress: "0xabc",
    },
  ],
  chainPlatform: "evm",
  connectorId: "metamask",
  icon: "data:image/png;base64,iVBORw0KGg",
  name: "MetaMask",
  ...overrides,
});

describe("createShadowAdapter", () => {
  it("populates id, name, icon, and chainPlatform from the entry", () => {
    const adapter = createShadowAdapter(evmEntry());
    expect(adapter.id).toBe("metamask");
    expect(adapter.name).toBe("MetaMask");
    expect(adapter.icon).toBe("data:image/png;base64,iVBORw0KGg");
    expect(adapter.chainPlatform).toBe("evm");
  });

  it("sets every capability to false", () => {
    const adapter = createShadowAdapter(evmEntry());
    expect(adapter.capabilities).toEqual({
      getBalance: false,
      getTransactionReceipt: false,
      requestAccounts: false,
      sendTransaction: false,
      signIn: false,
      signMessage: false,
      signTransaction: false,
      subscribe: false,
      switchAccount: false,
      switchChain: false,
    });
  });

  it.each<ChainPlatform>(["bitcoin", "evm", "sui", "svm"])(
    "constructs a discriminated-union variant for chainPlatform=%s",
    (platform) => {
      const adapter = createShadowAdapter(evmEntry({ chainPlatform: platform }));
      expect(adapter.chainPlatform).toBe(platform);
    },
  );

  describe("methods throw ShadowConnectorError when called", () => {
    it.each([
      ["connect", (a: ReturnType<typeof createShadowAdapter>) => a.connect()],
      ["getAccount", (a: ReturnType<typeof createShadowAdapter>) => a.getAccount()],
      ["getBalance", (a: ReturnType<typeof createShadowAdapter>) => a.getBalance()],
      ["getSigner", (a: ReturnType<typeof createShadowAdapter>) => a.getSigner()],
      [
        "getTransactionReceipt",
        (a: ReturnType<typeof createShadowAdapter>) => a.getTransactionReceipt("0xtx"),
      ],
      ["sendTx", (a: ReturnType<typeof createShadowAdapter>) => a.sendTx({})],
      [
        "sendTxToChain",
        (a: ReturnType<typeof createShadowAdapter>) => a.sendTxToChain({}, "eip155:1"),
      ],
      [
        "signMessage",
        (a: ReturnType<typeof createShadowAdapter>) => a.signMessage(new Uint8Array()),
      ],
      [
        "switchChain",
        (a: ReturnType<typeof createShadowAdapter>) =>
          a.switchChain({ id: "eip155:1", name: "X", namespace: "eip155", reference: "1" }),
      ],
    ])("%s rejects with ShadowConnectorError", async (methodName, call) => {
      const adapter = createShadowAdapter(evmEntry());
      await expect(call(adapter)).rejects.toBeInstanceOf(ShadowConnectorError);
      await expect(call(adapter)).rejects.toMatchObject({
        code: "BUTR_RECONNECTING",
        connectorId: "metamask",
        method: methodName,
      });
    });
  });
});

describe("isShadowAdapter", () => {
  it("returns true for adapters created via createShadowAdapter", () => {
    const shadow = createShadowAdapter(evmEntry());
    expect(isShadowAdapter(shadow)).toBe(true);
  });

  it("returns false for an adapter advertising any real capability", () => {
    const shadow = createShadowAdapter(evmEntry());
    // Mutate a capability flag — would be impossible on a real shadow
    const liveLooking = {
      ...shadow,
      capabilities: { ...shadow.capabilities, signMessage: true },
    } as typeof shadow;
    expect(isShadowAdapter(liveLooking)).toBe(false);
  });

  it.each<keyof WalletCapabilities>(["signIn", "signTransaction", "switchAccount"])(
    "returns false when only %s is advertised (previously-omitted flag)",
    (flag) => {
      const shadow = createShadowAdapter(evmEntry());
      const liveLooking = {
        ...shadow,
        capabilities: { ...shadow.capabilities, [flag]: true },
      } as typeof shadow;
      expect(isShadowAdapter(liveLooking)).toBe(false);
    },
  );

  it("returns false for a normal live-ish adapter", () => {
    const shadow = createShadowAdapter(evmEntry());
    const liveLooking = {
      ...shadow,
      capabilities: { ...shadow.capabilities, getBalance: true, signMessage: true },
    } as typeof shadow;
    expect(isShadowAdapter(liveLooking)).toBe(false);
  });
});
