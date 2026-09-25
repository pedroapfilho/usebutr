import { act } from "@testing-library/react";
import type { ConnectedWallet } from "@usebutr/core";
import { buildAccount, EVM_CHAINS } from "@usebutr/core";
import { createFakeAdapter, createFakeConnectedWallet } from "@usebutr/testing";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  useAccounts,
  useConnectedWallets,
  useConnectionStatus,
  useDiscoveredWallets,
  useIsHydrated,
  useIsReconnecting,
  useSelectedWallet,
  useWallet,
  useWalletState,
} from "../hooks/state";

import { renderWithManager, settle, storedEntryOf } from "./render";

const first = buildAccount("0xfirst", EVM_CHAINS.ethereum);
const second = buildAccount("0xsecond", EVM_CHAINS.ethereum);

const wallets = () => ({
  metamask: createFakeAdapter({ accounts: [first, second], id: "metamask" }),
  phantom: createFakeAdapter({ chainPlatform: "svm", id: "phantom" }),
  rabby: createFakeAdapter({ id: "rabby" }),
});

describe("useDiscoveredWallets", () => {
  it("lists announced adapters in order", async () => {
    const { metamask, phantom } = wallets();
    const { result } = renderWithManager(() => useDiscoveredWallets(), {
      adapters: [metamask, phantom],
    });
    await settle();
    expect(result.current.value).toEqual([metamask, phantom]);
  });
});

describe("useConnectedWallets", () => {
  it("lists the pool and keeps its reference while the pool is unchanged", async () => {
    const { metamask, rabby } = wallets();
    const { rerender, result } = renderWithManager(() => useConnectedWallets(), {
      adapters: [metamask, rabby],
    });
    await settle();
    expect(result.current.value).toEqual([]);

    await act(() => result.current.manager.connect("metamask"));
    const connected = result.current.value;
    expect(connected.map((wallet) => wallet.connector)).toEqual([metamask]);

    act(() => {
      result.current.manager.clearConnectionError();
    });
    rerender();
    expect(result.current.value).toBe(connected);
  });
});

describe("useWallet", () => {
  it("returns the active wallet, or the one asked for", async () => {
    const { metamask, rabby } = wallets();
    const { result } = renderWithManager(() => [useWallet(), useWallet("metamask")] as const, {
      adapters: [metamask, rabby],
    });
    await settle();
    expect(result.current.value).toEqual([undefined, undefined]);

    await act(() => result.current.manager.connect("metamask"));
    await act(() => result.current.manager.connect("rabby"));

    const [active, byId] = result.current.value;
    expect(active?.connector).toBe(rabby);
    expect(byId?.connector).toBe(metamask);
  });

  it("reads nothing for null, rather than falling back to the active wallet", async () => {
    const { metamask } = wallets();
    const { result } = renderWithManager(() => useWallet(null), { adapters: [metamask] });
    await settle();

    await act(() => result.current.manager.connect("metamask"));

    expect(result.current.value).toBeUndefined();
  });

  it("does not re-render for a change to another wallet", async () => {
    const { metamask, rabby } = wallets();
    let renders = 0;
    const { result } = renderWithManager(
      () => {
        renders += 1;
        return useWallet("metamask");
      },
      { adapters: [metamask, rabby] },
    );
    await settle();
    await act(() => result.current.manager.connect("metamask"));
    const before = renders;

    await act(() => result.current.manager.connect("rabby"));
    act(() => {
      rabby.emit({ accounts: [buildAccount("0xother", EVM_CHAINS.base)], type: "accountsChanged" });
    });

    expect(renders).toBe(before);
  });

  it("follows an account change of its wallet", async () => {
    const { metamask } = wallets();
    const { result } = renderWithManager(() => useWallet(), { adapters: [metamask] });
    await settle();
    await act(() => result.current.manager.connect("metamask"));

    act(() => {
      metamask.emit({ accounts: [second, first], type: "accountsChanged" });
    });

    expect(result.current.value?.account).toBe(second);
  });
});

describe("useSelectedWallet", () => {
  it("returns the platform's selected wallet, typed to it", async () => {
    const { metamask, phantom, rabby } = wallets();
    const { result } = renderWithManager(
      () => ({ evm: useSelectedWallet("evm"), svm: useSelectedWallet("svm") }),
      { adapters: [metamask, phantom, rabby] },
    );
    await settle();
    await act(() => result.current.manager.connect("metamask"));
    await act(() => result.current.manager.connect("rabby"));
    await act(() => result.current.manager.connect("phantom"));

    expect(result.current.value.evm?.connector).toBe(rabby);
    expect(result.current.value.svm?.connector).toBe(phantom);
    expectTypeOf(result.current.value.svm).toEqualTypeOf<ConnectedWallet<"svm"> | undefined>();

    act(() => {
      result.current.manager.setSelection("evm", "metamask");
    });
    expect(result.current.value.evm?.connector).toBe(metamask);
  });
});

describe("useAccounts", () => {
  it("returns a wallet's accounts, empty when there is none", async () => {
    const { metamask } = wallets();
    const { result } = renderWithManager(() => [useAccounts(), useAccounts("nope")] as const, {
      adapters: [metamask],
    });
    await settle();
    const [empty] = result.current.value;
    expect(empty).toEqual([]);

    await act(() => result.current.manager.connect("metamask"));
    expect(result.current.value[0]).toEqual([first, second]);
    expect(result.current.value[1]).toBe(empty);
  });

  it("keeps its reference when an event repeats the same accounts", async () => {
    const { metamask } = wallets();
    const { result } = renderWithManager(() => useAccounts(), { adapters: [metamask] });
    await settle();
    await act(() => result.current.manager.connect("metamask"));
    const accounts = result.current.value;

    act(() => {
      metamask.emit({
        accounts: [buildAccount("0xfirst", EVM_CHAINS.ethereum), second],
        type: "accountsChanged",
      });
    });

    expect(result.current.value).toBe(accounts);
  });
});

describe("useConnectionStatus", () => {
  it("moves from disconnected through connecting to connected", async () => {
    const gate = Promise.withResolvers<undefined>();
    const slow = createFakeAdapter({ id: "slow", overrides: { connect: () => gate.promise } });
    const { result } = renderWithManager(() => useConnectionStatus(), { adapters: [slow] });
    await settle();
    expect(result.current.value).toBe("disconnected");

    let attempt: Promise<unknown> = Promise.resolve();
    act(() => {
      attempt = result.current.manager.connect("slow");
    });
    expect(result.current.value).toBe("connecting");

    await act(async () => {
      gate.resolve(undefined);
      await attempt;
    });
    expect(result.current.value).toBe("connected");
  });

  it("reports a seeded wallet as reconnecting until its silent reconnect lands", async () => {
    const wallet = createFakeConnectedWallet({ id: "metamask" });
    const { result } = renderWithManager(
      () => ({
        hydrated: useIsHydrated(),
        reconnecting: useIsReconnecting(),
        status: useConnectionStatus(),
      }),
      {
        adapters: [wallet.connector],
        initialState: {
          activeConnectorId: "metamask",
          pool: { metamask: storedEntryOf(wallet) },
          selection: {},
        },
      },
    );
    expect(result.current.value).toEqual({
      hydrated: true,
      reconnecting: true,
      status: "reconnecting",
    });

    await settle();

    expect(result.current.value).toEqual({
      hydrated: true,
      reconnecting: false,
      status: "connected",
    });
  });
});

describe("useIsHydrated and useIsReconnecting", () => {
  it("start false and settle once hydration completes", async () => {
    const { result } = renderWithManager(() => ({
      hydrated: useIsHydrated(),
      reconnecting: useIsReconnecting("metamask"),
    }));
    expect(result.current.value.hydrated).toBe(false);
    await settle();
    expect(result.current.value).toEqual({ hydrated: true, reconnecting: false });
  });
});

describe("useWalletState", () => {
  it("selects a derived value without looping on a fresh object", async () => {
    const { metamask } = wallets();
    let renders = 0;
    const { rerender, result } = renderWithManager(
      () => {
        renders += 1;
        return useWalletState((state) => ({
          count: state.pool.size,
          ids: [...state.pool.keys()],
        }));
      },
      { adapters: [metamask] },
    );
    await settle();
    const before = renders;
    rerender();
    expect(renders).toBe(before + 1);

    await act(() => result.current.manager.connect("metamask"));
    expect(result.current.value).toEqual({ count: 1, ids: ["metamask"] });
  });
});
