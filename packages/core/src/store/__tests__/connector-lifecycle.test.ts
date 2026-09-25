import { afterEach, describe, expect, it, vi } from "vitest";

import { ETHEREUM, evmAdapter, walletOf } from "../../__tests__/helpers";
import { buildAccount } from "../../types";
import type { LifecycleHandlers } from "../connector-lifecycle";
import { createConnectorLifecycle } from "../connector-lifecycle";

const setup = () => {
  const onAccountsChanged = vi.fn<LifecycleHandlers["onAccountsChanged"]>();
  const onDisconnected = vi.fn<LifecycleHandlers["onDisconnected"]>();
  const lifecycle = createConnectorLifecycle({ onAccountsChanged, onDisconnected });
  return { lifecycle, onAccountsChanged, onDisconnected };
};

const poolOf = (...wallets: ReadonlyArray<ReturnType<typeof walletOf>>) =>
  new Map(wallets.map((wallet) => [wallet.connector.id, wallet]));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createConnectorLifecycle", () => {
  it("holds at most one subscription per live connector", () => {
    const { lifecycle } = setup();
    const adapter = evmAdapter("metamask");
    const pool = poolOf(walletOf(adapter));

    lifecycle.sync(pool);
    lifecycle.sync(pool);
    lifecycle.sync(poolOf(walletOf(adapter)));

    expect(adapter.subscribe).toHaveBeenCalledOnce();
    expect(adapter.listenerCount()).toBe(1);
  });

  it("skips connectors without subscribe", () => {
    const { lifecycle } = setup();
    const pool = poolOf(walletOf(evmAdapter("metamask", { subscribe: undefined })));
    expect(() => {
      lifecycle.sync(pool);
    }).not.toThrow();
  });

  it("detaches connectors that leave the pool", () => {
    const { lifecycle } = setup();
    const adapter = evmAdapter("metamask");
    lifecycle.sync(poolOf(walletOf(adapter)));
    lifecycle.sync(new Map());
    expect(adapter.listenerCount()).toBe(0);
  });

  it("swaps the subscription when a connector is replaced under the same id", () => {
    const { lifecycle, onAccountsChanged } = setup();
    const before = evmAdapter("metamask");
    const after = evmAdapter("metamask");
    lifecycle.sync(poolOf(walletOf(before)));
    lifecycle.sync(poolOf(walletOf(after)));

    expect(before.listenerCount()).toBe(0);
    expect(after.listenerCount()).toBe(1);

    const accounts = [buildAccount("0xnew", ETHEREUM)];
    after.emit({ accounts, type: "accountsChanged" });
    expect(onAccountsChanged).toHaveBeenCalledWith("metamask", accounts);
  });

  it("ignores an event from a connector that has since been replaced", () => {
    const { lifecycle, onAccountsChanged, onDisconnected } = setup();
    const before = evmAdapter("metamask");
    let stale: ((event: { type: "disconnected" }) => void) | undefined;
    before.subscribe = (listener) => {
      stale = listener;
      return () => {};
    };
    const replacement = walletOf(evmAdapter("metamask"));
    lifecycle.sync(poolOf(walletOf(before)));
    lifecycle.sync(poolOf(replacement));

    stale?.({ type: "disconnected" });
    expect(onDisconnected).not.toHaveBeenCalled();
    expect(onAccountsChanged).not.toHaveBeenCalled();
  });

  it("forwards accountsChanged, active account first", () => {
    const { lifecycle, onAccountsChanged } = setup();
    const adapter = evmAdapter("metamask");
    lifecycle.sync(poolOf(walletOf(adapter)));

    const accounts = [buildAccount("0xb", ETHEREUM), buildAccount("0xa", ETHEREUM)];
    adapter.emit({ accounts, type: "accountsChanged" });
    expect(onAccountsChanged).toHaveBeenCalledWith("metamask", accounts);
  });

  it.each([
    ["a disconnected event", { type: "disconnected" as const }],
    ["an empty account list", { accounts: [], type: "accountsChanged" as const }],
  ])("detaches before reporting %s", (_label, event) => {
    const { lifecycle, onDisconnected } = setup();
    const adapter = evmAdapter("metamask");
    lifecycle.sync(poolOf(walletOf(adapter)));
    onDisconnected.mockImplementation(() => {
      expect(adapter.listenerCount()).toBe(0);
    });

    adapter.emit(event);
    expect(onDisconnected).toHaveBeenCalledExactlyOnceWith("metamask");
  });

  it("logs a subscribe that throws and retries it on the next sync", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { lifecycle } = setup();
    const adapter = evmAdapter("metamask");
    const subscribe = vi
      .fn<NonNullable<typeof adapter.subscribe>>()
      .mockImplementationOnce(() => {
        throw new Error("boom");
      })
      .mockImplementation(() => () => {});
    adapter.subscribe = subscribe;
    const pool = poolOf(walletOf(adapter));

    lifecycle.sync(pool);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("subscribe failed"),
      expect.any(Error),
    );
    lifecycle.sync(pool);
    expect(subscribe).toHaveBeenCalledTimes(2);
  });

  it("logs an unsubscribe that throws", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { lifecycle } = setup();
    const adapter = evmAdapter("metamask");
    adapter.subscribe = () => () => {
      throw new Error("boom");
    };
    lifecycle.sync(poolOf(walletOf(adapter)));
    lifecycle.detachAll();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("unsubscribe threw"),
      expect.any(Error),
    );
  });

  it("detachAll drops every subscription", () => {
    const { lifecycle } = setup();
    const metamask = evmAdapter("metamask");
    const rabby = evmAdapter("rabby");
    lifecycle.sync(poolOf(walletOf(metamask), walletOf(rabby)));
    lifecycle.detachAll();
    expect(metamask.listenerCount()).toBe(0);
    expect(rabby.listenerCount()).toBe(0);
  });
});
