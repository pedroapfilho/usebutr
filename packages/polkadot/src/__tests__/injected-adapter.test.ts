import type { ConnectorEvent, PolkadotAdapter } from "@usebutr/core";
import { buildAccount, POLKADOT_CHAINS } from "@usebutr/core";
import { describe, expect, it, vi } from "vitest";

import { buildInjectedPolkadotAdapter } from "../injected/adapter";
import type {
  Injected,
  InjectedAccount,
  InjectedSigner,
  InjectedWindowProvider,
} from "../injected/injected-web3";

const ADDRESS = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
const OTHER_ADDRESS = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";
const KUSAMA_GENESIS = "0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe";

const ALICE: InjectedAccount = { address: ADDRESS, name: "Alice" };
const BOB: InjectedAccount = { address: OTHER_ADDRESS, name: "Bob" };

type Extension = {
  injected: Injected;
  provider: InjectedWindowProvider;
  /** Drives the wallet-side `accounts.subscribe` callbacks. */
  push: (accounts: ReadonlyArray<InjectedAccount>) => void;
  signRaw: ReturnType<typeof vi.fn<NonNullable<InjectedSigner["signRaw"]>>>;
  unsubscribeCalls: () => number;
};

const makeExtension = ({
  accounts = [ALICE],
  withSignRaw = true,
  withSubscribe = true,
}: {
  accounts?: ReadonlyArray<InjectedAccount>;
  withSignRaw?: boolean;
  withSubscribe?: boolean;
} = {}): Extension => {
  const callbacks = new Set<(accounts: ReadonlyArray<InjectedAccount>) => void>();
  let unsubscribeCalls = 0;
  const signRaw = vi
    .fn<NonNullable<InjectedSigner["signRaw"]>>()
    .mockResolvedValue({ id: 1, signature: "0xdead" });
  const injected: Injected = {
    accounts: {
      get: () => Promise.resolve(accounts),
      ...(withSubscribe && {
        subscribe: (callback: (next: ReadonlyArray<InjectedAccount>) => void) => {
          callbacks.add(callback);
          return () => {
            callbacks.delete(callback);
            unsubscribeCalls += 1;
          };
        },
      }),
    },
    signer: withSignRaw ? { signRaw } : {},
  };
  return {
    injected,
    provider: { enable: vi.fn<InjectedWindowProvider["enable"]>().mockResolvedValue(injected) },
    push: (next) => {
      for (const callback of callbacks) {
        callback(next);
      }
    },
    signRaw,
    unsubscribeCalls: () => unsubscribeCalls,
  };
};

const build = (extension: Extension): PolkadotAdapter =>
  buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", extension.provider);

const connected = async (extension: Extension): Promise<PolkadotAdapter> => {
  const adapter = build(extension);
  await adapter.connect();
  return adapter;
};

const requireSignMessage = (adapter: PolkadotAdapter) => {
  if (adapter.signMessage === undefined) {
    throw new Error("expected signMessage once connected");
  }
  return adapter.signMessage;
};

/** Subscribes the way the manager does: once, after `connect()`. */
const listen = (adapter: PolkadotAdapter): Array<ConnectorEvent> => {
  const events: Array<ConnectorEvent> = [];
  adapter.subscribe?.((event) => {
    events.push(event);
  });
  return events;
};

const message = new TextEncoder().encode("hi");

describe("buildInjectedPolkadotAdapter", () => {
  it("derives a stable id from the injectedWeb3 key", () => {
    const adapter = build(makeExtension());
    expect(adapter.id).toBe("injected:polkadot:polkadot-js");
    expect(adapter.name).toBe("Polkadot{.js}");
    expect(adapter.chainPlatform).toBe("polkadot");
  });

  it("defines no method it cannot back", () => {
    const adapter = build(makeExtension());
    expect(adapter.switchChain).toBeUndefined();
    expect(adapter.getBalance).toBeUndefined();
    expect(adapter.getTransactionReceipt).toBeUndefined();
    expect(adapter.requestAccounts).toBeUndefined();
    expect("sendTx" in adapter).toBe(false);
  });

  it("defers enable() until connect", async () => {
    const extension = makeExtension();
    const adapter = build(extension);
    expect(extension.provider.enable).not.toHaveBeenCalled();
    await adapter.connect();
    expect(extension.provider.enable).toHaveBeenCalledWith("butr");
  });

  it("rejects connect when the extension exposes no account", async () => {
    const adapter = build(makeExtension({ accounts: [] }));
    await expect(adapter.connect()).rejects.toThrow(/exposed no accounts/v);
    await expect(adapter.getAccounts()).resolves.toEqual([]);
  });

  describe("getAccounts", () => {
    it("is empty before connect", async () => {
      await expect(build(makeExtension()).getAccounts()).resolves.toEqual([]);
    });

    it("resolves every exposed account in the extension's order", async () => {
      const adapter = await connected(makeExtension({ accounts: [ALICE, BOB] }));
      await expect(adapter.getAccounts()).resolves.toEqual([
        buildAccount(ADDRESS, POLKADOT_CHAINS.polkadot),
        buildAccount(OTHER_ADDRESS, POLKADOT_CHAINS.polkadot),
      ]);
    });

    it("labels an account pinned through genesisHash with its own chain", async () => {
      const adapter = await connected(
        makeExtension({
          accounts: [
            { address: ADDRESS, genesisHash: KUSAMA_GENESIS },
            { address: OTHER_ADDRESS, genesisHash: `0x${"ab".repeat(32)}` },
            { address: ADDRESS, genesisHash: null },
          ],
        }),
      );
      const [kusama, unknown, unpinned] = await adapter.getAccounts();
      expect(kusama?.chain).toBe(POLKADOT_CHAINS.kusama);
      expect(unknown?.chain).toEqual({
        id: `polkadot:${"ab".repeat(16)}`,
        name: `polkadot:${"ab".repeat(16)}`,
        namespace: "polkadot",
        reference: "ab".repeat(16),
      });
      expect(unpinned?.chain).toBe(POLKADOT_CHAINS.polkadot);
    });

    it("is empty again after disconnect", async () => {
      const extension = makeExtension();
      const adapter = await connected(extension);
      await adapter.disconnect?.();
      await expect(adapter.getAccounts()).resolves.toEqual([]);
      expect(extension.unsubscribeCalls()).toBe(1);
    });
  });

  describe("signMessage", () => {
    it("appears only once the connected extension exposes signRaw", async () => {
      const adapter = build(makeExtension());
      expect(adapter.signMessage).toBeUndefined();
      await adapter.connect();
      expect(adapter.signMessage).toBeTypeOf("function");

      const withoutSignRaw = await connected(makeExtension({ withSignRaw: false }));
      expect(withoutSignRaw.signMessage).toBeUndefined();
    });

    it("signs the <Bytes>-wrapped payload as the active account", async () => {
      const extension = makeExtension({ accounts: [ALICE, BOB] });
      const adapter = await connected(extension);
      const { signature, signedMessage } = await requireSignMessage(adapter)(message);
      expect([...signature]).toEqual([0xde, 0xad]);
      expect(new TextDecoder().decode(signedMessage)).toBe("<Bytes>hi</Bytes>");
      expect(extension.signRaw).toHaveBeenCalledWith({
        address: ADDRESS,
        data: "0x3c42797465733e68693c2f42797465733e",
        type: "bytes",
      });
    });

    it("signs as the requested account", async () => {
      const extension = makeExtension({ accounts: [ALICE, BOB] });
      const adapter = await connected(extension);
      await requireSignMessage(adapter)(message, {
        account: buildAccount(OTHER_ADDRESS, POLKADOT_CHAINS.polkadot),
      });
      expect(extension.signRaw).toHaveBeenCalledWith(
        expect.objectContaining({ address: OTHER_ADDRESS }),
      );
    });

    it("rejects an account the extension does not expose instead of signing as another", async () => {
      const extension = makeExtension({ accounts: [ALICE] });
      const adapter = await connected(extension);
      await expect(
        requireSignMessage(adapter)(message, {
          account: buildAccount(OTHER_ADDRESS, POLKADOT_CHAINS.polkadot),
        }),
      ).rejects.toThrow(/does not expose account/v);
      expect(extension.signRaw).not.toHaveBeenCalled();
    });

    it("rejects once the session has ended", async () => {
      const extension = makeExtension();
      const adapter = await connected(extension);
      const signMessage = requireSignMessage(adapter);
      await adapter.disconnect?.();
      await expect(signMessage(message)).rejects.toThrow(/is not connected/v);
    });
  });

  describe("getSigner", () => {
    it("hands back the enabled extension and its injectedWeb3 key", async () => {
      const extension = makeExtension();
      const adapter = await connected(extension);
      await expect(adapter.getSigner()).resolves.toEqual({
        extension: extension.injected,
        extensionName: "polkadot-js",
        kind: "polkadot-injected",
      });
    });

    it("rejects asynchronously before connect", async () => {
      const adapter = build(makeExtension());
      const pending = adapter.getSigner();
      await expect(pending).rejects.toThrow(/is not connected/v);
    });
  });

  describe("subscribe", () => {
    it("appears only while an account subscription is open", async () => {
      const adapter = build(makeExtension());
      expect(adapter.subscribe).toBeUndefined();
      await adapter.connect();
      expect(adapter.subscribe).toBeTypeOf("function");
      await adapter.disconnect?.();
      expect(adapter.subscribe).toBeUndefined();

      const withoutSubscribe = await connected(makeExtension({ withSubscribe: false }));
      expect(withoutSubscribe.subscribe).toBeUndefined();
    });

    it("emits accountsChanged with every account, active first", async () => {
      const extension = makeExtension();
      const adapter = await connected(extension);
      const events = listen(adapter);

      extension.push([BOB, ALICE]);

      expect(events).toEqual([
        {
          accounts: [
            buildAccount(OTHER_ADDRESS, POLKADOT_CHAINS.polkadot),
            buildAccount(ADDRESS, POLKADOT_CHAINS.polkadot),
          ],
          type: "accountsChanged",
        },
      ]);
    });

    it("turns an empty push into disconnected and tears the session down", async () => {
      const extension = makeExtension();
      const adapter = await connected(extension);
      const events = listen(adapter);

      extension.push([]);

      expect(events).toEqual([{ type: "disconnected" }]);
      expect(extension.unsubscribeCalls()).toBe(1);
      await expect(adapter.getAccounts()).resolves.toEqual([]);
      await expect(adapter.getSigner()).rejects.toThrow(/is not connected/v);
    });

    it("fans one wallet event out to every subscriber", async () => {
      const extension = makeExtension();
      const adapter = await connected(extension);
      const first = listen(adapter);
      const second = listen(adapter);

      extension.push([BOB]);

      expect(first).toHaveLength(1);
      expect(second).toHaveLength(1);
    });

    it("replaces the wallet subscription when connect runs again", async () => {
      const extension = makeExtension();
      const adapter = await connected(extension);
      const events = listen(adapter);

      await adapter.connect();
      extension.push([BOB]);

      expect(extension.unsubscribeCalls()).toBe(1);
      expect(events).toHaveLength(1);
    });

    it("stops delivering after unsubscribe", async () => {
      const extension = makeExtension();
      const adapter = await connected(extension);
      const listener = vi.fn<(event: ConnectorEvent) => void>();
      const unsubscribe = adapter.subscribe?.(listener);

      unsubscribe?.();
      extension.push([BOB]);

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
