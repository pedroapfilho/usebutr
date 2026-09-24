import "./signer-registry";

import { act, waitFor } from "@testing-library/react";
import type { Balance, BalanceOptions, WalletSigner } from "@usebutr/core";
import { buildAccount, EVM_CHAINS } from "@usebutr/core";
import { createFakeAdapter, createFakeConnectedWallet } from "@usebutr/testing";
import { describe, expect, it, vi } from "vitest";

import { useBalance, useSigner } from "../hooks/async-resources";
import { useWallet } from "../hooks/state";

import { renderWithManager, settle, storedEntryOf } from "./render";

const first = buildAccount("0xfirst", EVM_CHAINS.ethereum);
const second = buildAccount("0xsecond", EVM_CHAINS.ethereum);

describe("useSigner", () => {
  it("stays idle without a wallet", async () => {
    let renders = 0;
    const { result } = renderWithManager(() => {
      renders += 1;
      return useSigner(useWallet());
    });
    await settle();
    expect(result.current.value).toEqual({ data: null, error: null, status: "idle" });
    // Mount, then the provider's start: no render for resetting an idle state.
    expect(renders).toBe(1);
  });

  it("resolves the active wallet's signer", async () => {
    const signer: WalletSigner = { connectorId: "metamask", kind: "test" };
    const { result } = renderWithManager(() => useSigner(useWallet()), {
      adapters: [createFakeAdapter({ id: "metamask", signer })],
    });
    await settle();
    await act(() => result.current.manager.connect("metamask"));

    await waitFor(() => {
      expect(result.current.value.status).toBe("success");
    });
    expect(result.current.value.data).toBe(signer);
  });

  it("stays idle while the wallet is still a reconnecting shadow", () => {
    const wallet = createFakeConnectedWallet({ id: "metamask" });
    const { result } = renderWithManager(() => useSigner(useWallet()), {
      initialState: {
        activeConnectorId: "metamask",
        pool: { metamask: storedEntryOf(wallet) },
        selection: {},
      },
    });
    expect(result.current.value.status).toBe("idle");
  });

  it("surfaces a signer that fails", async () => {
    const failure = new Error("locked");
    const adapter = createFakeAdapter({
      id: "metamask",
      overrides: { getSigner: () => Promise.reject(failure) },
    });
    const { result } = renderWithManager(() => useSigner(useWallet("metamask")), {
      adapters: [adapter],
    });
    await settle();
    await act(() => result.current.manager.connect("metamask"));

    await waitFor(() => {
      expect(result.current.value).toEqual({ data: null, error: failure, status: "error" });
    });
  });
});

describe("useBalance", () => {
  it("stays idle without a wallet, and for a wallet without getBalance", async () => {
    const { result } = renderWithManager(() => useBalance(useWallet()), {
      adapters: [createFakeAdapter({ chainPlatform: "svm", id: "phantom" })],
    });
    await settle();
    expect(result.current.value.status).toBe("idle");

    await act(() => result.current.manager.connect("phantom"));
    expect(result.current.value.status).toBe("idle");
  });

  it("reads the active account's native balance", async () => {
    const { result } = renderWithManager(() => useBalance(useWallet()), {
      adapters: [createFakeAdapter({ balance: 1_500_000_000_000_000_000n, id: "metamask" })],
    });
    await settle();
    await act(() => result.current.manager.connect("metamask"));

    await waitFor(() => {
      expect(result.current.value.status).toBe("success");
    });
    expect(result.current.value.data).toEqual({
      decimals: 18,
      formatted: "1.5",
      symbol: "ETH",
      value: 1_500_000_000_000_000_000n,
    });
  });

  it("passes the account and token, and refetches on demand", async () => {
    const getBalance = vi.fn((_options?: BalanceOptions): Promise<Balance> =>
      Promise.resolve({ decimals: 6, formatted: "1", symbol: "USDC", value: 1_000_000n }),
    );
    const adapter = createFakeAdapter({
      accounts: [first, second],
      id: "metamask",
      overrides: { getBalance },
    });
    const { result } = renderWithManager(
      () => useBalance(useWallet("metamask"), { account: second, token: "0xusdc" }),
      { adapters: [adapter] },
    );
    await settle();
    await act(() => result.current.manager.connect("metamask"));
    await waitFor(() => {
      expect(result.current.value.status).toBe("success");
    });
    expect(getBalance).toHaveBeenLastCalledWith({ account: second, token: "0xusdc" });

    act(() => {
      result.current.value.refetch();
    });
    await waitFor(() => {
      expect(getBalance).toHaveBeenCalledTimes(2);
    });
  });

  it("calls getBalance on its adapter", async () => {
    const adapter = createFakeAdapter({ id: "metamask" });
    const receivers: Array<unknown> = [];
    adapter.getBalance = function getBalance(this: unknown) {
      receivers.push(this);
      return Promise.resolve({ decimals: 18, formatted: "0", symbol: "ETH", value: 0n });
    };
    const { result } = renderWithManager(() => useBalance(useWallet()), { adapters: [adapter] });
    await settle();
    await act(() => result.current.manager.connect("metamask"));

    await waitFor(() => {
      expect(result.current.value.status).toBe("success");
    });
    expect(receivers).toEqual([adapter]);
  });

  it("never renders the previous wallet's balance next to the new one", async () => {
    const seen: Array<{ id: string | undefined; value: bigint | undefined }> = [];
    const { result } = renderWithManager(
      () => {
        const wallet = useWallet();
        const balance = useBalance(wallet);
        if (balance.status === "success") {
          seen.push({ id: wallet?.connector.id, value: balance.data.value });
        }
        return balance;
      },
      {
        adapters: [
          createFakeAdapter({ balance: 1n, id: "metamask" }),
          createFakeAdapter({ balance: 2n, id: "rabby" }),
        ],
      },
    );
    await settle();
    await act(() => result.current.manager.connect("metamask"));
    await waitFor(() => {
      expect(result.current.value.status).toBe("success");
    });

    await act(() => result.current.manager.connect("rabby"));
    await waitFor(() => {
      expect(result.current.value.data?.value).toBe(2n);
    });
    act(() => {
      result.current.manager.disconnectAll();
    });

    expect(result.current.value.status).toBe("idle");
    expect(seen.every(({ id, value }) => (id === "metamask" ? value === 1n : value === 2n))).toBe(
      true,
    );
  });

  it("normalises a thrown non-Error into an Error that keeps it as the cause", async () => {
    const adapter = createFakeAdapter({
      id: "metamask",
      overrides: {
        // oxlint-disable-next-line prefer-promise-reject-errors, typescript/prefer-promise-reject-errors -- wallets reject with bare objects; that is the case under test
        getBalance: () => Promise.reject({ code: -32_603 }),
      },
    });
    const { result } = renderWithManager(() => useBalance(useWallet()), { adapters: [adapter] });
    await settle();
    await act(() => result.current.manager.connect("metamask"));

    await waitFor(() => {
      expect(result.current.value.status).toBe("error");
    });
    expect(result.current.value.error).toBeInstanceOf(Error);
    expect(result.current.value.error?.cause).toEqual({ code: -32_603 });
  });

  it("surfaces a rejected read as an error", async () => {
    const { result } = renderWithManager(() => useBalance(useWallet(), { token: "0xusdc" }), {
      adapters: [createFakeAdapter({ id: "metamask" })],
    });
    await settle();
    await act(() => result.current.manager.connect("metamask"));

    await waitFor(() => {
      expect(result.current.value.status).toBe("error");
    });
    expect(result.current.value.error).toBeInstanceOf(Error);
  });
});
