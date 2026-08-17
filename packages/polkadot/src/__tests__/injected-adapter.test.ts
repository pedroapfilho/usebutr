import type { ConnectorEvent } from "@usebutr/core";
import { describe, expect, it, vi } from "vitest";

import { POLKADOT_CHAINS } from "../chains";
import { buildInjectedPolkadotAdapter } from "../injected/adapter";
import type { InjectedAccount, InjectedWindowProvider } from "../injected/injected-web3";

const ADDRESS = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
const OTHER_ADDRESS = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";

const makeProvider = (): InjectedWindowProvider => ({
  enable: vi.fn().mockResolvedValue({
    accounts: {
      get: vi.fn().mockResolvedValue([{ address: ADDRESS, name: "Alice" }]),
      subscribe: vi.fn().mockReturnValue(() => undefined),
    },
    signer: {
      signRaw: vi.fn().mockResolvedValue({ id: 1, signature: "0xdead" }),
    },
  }),
});

const accountChanges = (
  events: ReadonlyArray<ConnectorEvent>,
): ReadonlyArray<Extract<ConnectorEvent, { type: "accountChanged" }>> =>
  events.filter((e) => e.type === "accountChanged");

/** A provider whose `accounts.subscribe` hands the test the wallet-side
 *  callback, so a test can drive account changes the way an extension does. */
const makeDrivableProvider = (): {
  provider: InjectedWindowProvider;
  push: (accounts: ReadonlyArray<InjectedAccount>) => void;
  unsubscribeCalls: () => number;
} => {
  const callbacks = new Set<(accounts: ReadonlyArray<InjectedAccount>) => void>();
  let unsubscribeCalls = 0;
  const provider: InjectedWindowProvider = {
    enable: vi.fn().mockResolvedValue({
      accounts: {
        get: vi.fn().mockResolvedValue([{ address: ADDRESS, name: "Alice" }]),
        subscribe: (cb: (accounts: ReadonlyArray<InjectedAccount>) => void) => {
          callbacks.add(cb);
          return () => {
            callbacks.delete(cb);
            unsubscribeCalls += 1;
          };
        },
      },
      signer: { signRaw: vi.fn() },
    }),
  };
  return {
    provider,
    push: (accounts) => {
      for (const callback of callbacks) {
        callback(accounts);
      }
    },
    unsubscribeCalls: () => unsubscribeCalls,
  };
};

describe("buildInjectedPolkadotAdapter", () => {
  it("reports the injected capability profile and a stable id", () => {
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", makeProvider());
    expect(adapter.id).toBe("injected:polkadot:polkadot-js");
    expect(adapter.chainPlatform).toBe("polkadot");
    expect(adapter.capabilities.signMessage).toBe(true);
    expect(adapter.capabilities.sendTransaction).toBe(false);
  });

  it("returns null account before connect, real account after", async () => {
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", makeProvider());
    expect(await adapter.getAccount()).toBeNull();
    await adapter.connect();
    const account = await adapter.getAccount();
    expect(account?.walletAddress).toBe(ADDRESS);
    expect(account?.chain.namespace).toBe("polkadot");
  });

  it("signs a message via signRaw and returns the <Bytes>-wrapped payload", async () => {
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", makeProvider());
    await adapter.connect();
    const { signature, signedMessage } = await adapter.signMessage(new TextEncoder().encode("hi"));
    expect([...signature]).toEqual([0xde, 0xad]);
    expect(new TextDecoder().decode(signedMessage)).toBe("<Bytes>hi</Bytes>");
  });

  it("exposes a signer handle (extensionName + address + extension) via getSigner", async () => {
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", makeProvider());
    await adapter.connect();
    const signer = (await adapter.getSigner()) as {
      address: string;
      extensionName: string;
    };
    expect(signer.extensionName).toBe("polkadot-js");
    expect(signer.address).toBe(ADDRESS);
  });

  it("getSigner throws when the connected wallet exposes no account", async () => {
    const provider: InjectedWindowProvider = {
      enable: vi.fn().mockResolvedValue({
        accounts: {
          get: vi
            .fn()
            .mockResolvedValueOnce([{ address: ADDRESS, name: "Alice" }])
            .mockResolvedValue([]),
          subscribe: vi.fn().mockReturnValue(() => undefined),
        },
        signer: { signRaw: vi.fn() },
      }),
    };
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", provider);
    await adapter.connect();
    await expect(adapter.getSigner()).rejects.toThrow(/No connected account/v);
  });

  it("getBalance returns the neutral no-RPC placeholder", async () => {
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", makeProvider());
    await adapter.connect();
    expect(await adapter.getBalance()).toEqual({
      decimals: 0,
      formatted: "0",
      symbol: "",
      value: 0n,
    });
  });

  it("switchChain accepts polkadot chains and rejects others", async () => {
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", makeProvider());
    await adapter.connect();
    await expect(
      adapter.switchChain({
        id: "eip155:1",
        name: "Ethereum",
        namespace: "eip155",
        reference: "1",
      }),
    ).rejects.toThrow(/non-Polkadot/v);
  });

  it("delivers accountChanged to a listener registered before connect", async () => {
    const driver = makeDrivableProvider();
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", driver.provider);
    const events: Array<ConnectorEvent> = [];
    adapter.subscribe?.((event) => {
      events.push(event);
    });

    await adapter.connect();
    driver.push([{ address: OTHER_ADDRESS, name: "Bob" }]);

    expect(events.map((e) => e.type)).toEqual(["accountChanged"]);
    expect(accountChanges(events)[0]?.account.walletAddress).toBe(OTHER_ADDRESS);
  });

  it("an empty account push emits disconnected and tears the session down", async () => {
    const driver = makeDrivableProvider();
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", driver.provider);
    const events: Array<ConnectorEvent> = [];
    adapter.subscribe?.((event) => {
      events.push(event);
    });

    await adapter.connect();
    driver.push([]);

    expect(events.map((e) => e.type)).toEqual(["disconnected"]);
    expect(driver.unsubscribeCalls()).toBe(1);
    expect(await adapter.getAccount()).toBeNull();
    await expect(adapter.getSigner()).rejects.toThrow(/is not connected/v);
  });

  it("fans one wallet event out to every subscriber", async () => {
    const driver = makeDrivableProvider();
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", driver.provider);
    const first = vi.fn<(event: ConnectorEvent) => void>();
    const second = vi.fn<(event: ConnectorEvent) => void>();
    adapter.subscribe?.(first);
    adapter.subscribe?.(second);

    await adapter.connect();
    driver.push([{ address: OTHER_ADDRESS, name: "Bob" }]);

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(driver.provider.enable).toHaveBeenCalledTimes(1);
  });

  it("replaces the wallet subscription when connect runs again", async () => {
    const driver = makeDrivableProvider();
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", driver.provider);
    const listener = vi.fn<(event: ConnectorEvent) => void>();
    adapter.subscribe?.(listener);

    await adapter.connect();
    await adapter.connect();
    driver.push([{ address: OTHER_ADDRESS, name: "Bob" }]);

    expect(driver.unsubscribeCalls()).toBe(1);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("stops delivering after unsubscribe", async () => {
    const driver = makeDrivableProvider();
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", driver.provider);
    const listener = vi.fn<(event: ConnectorEvent) => void>();
    const unsubscribe = adapter.subscribe?.(listener);

    await adapter.connect();
    unsubscribe?.();
    driver.push([{ address: OTHER_ADDRESS, name: "Bob" }]);

    expect(listener).not.toHaveBeenCalled();
  });

  it("switchChain emits accountChanged carrying the new chain", async () => {
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", makeProvider());
    const events: Array<ConnectorEvent> = [];
    adapter.subscribe?.((event) => {
      events.push(event);
    });

    await adapter.connect();
    await adapter.switchChain(POLKADOT_CHAINS.kusama);

    expect(events.map((e) => e.type)).toEqual(["accountChanged"]);
    expect(accountChanges(events)[0]?.account.chain.id).toBe(POLKADOT_CHAINS.kusama.id);
    const account = await adapter.getAccount();
    expect(account?.chain.name).toBe("Kusama");
  });

  it("switchChain resolves a known chain id to the registry entry", async () => {
    const adapter = buildInjectedPolkadotAdapter("polkadot-js", "Polkadot{.js}", makeProvider());
    await adapter.connect();
    await adapter.switchChain({
      id: POLKADOT_CHAINS.westend.id,
      name: "some wallet label",
      namespace: "polkadot",
      reference: POLKADOT_CHAINS.westend.reference,
    });

    const account = await adapter.getAccount();
    expect(account?.chain.name).toBe("Westend");
  });
});
