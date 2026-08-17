import { act, waitFor } from "@testing-library/react";
import type { StoredPoolEntry, WalletSnapshot } from "@usebutr/core";
import { createFakeAdapter } from "@usebutr/testing";
import { describe, expect, it } from "vitest";

import { useConnectWallet } from "../../hooks/actions";
import { useBalance, useSigner } from "../../hooks/async-resources";
import { useConnectionError, useConnectionStatus, useIsReconnecting } from "../../hooks/selectors";
import { renderHookWithProvider } from "../render-with-provider";

const CONNECTOR_ID = "metamask";

const account = {
  chain: { id: "eip155:1", name: "Ethereum", namespace: "eip155" as const, reference: "1" },
  id: "eip155:1:0xabc",
  walletAddress: "0xabc",
};

const storedEntry: StoredPoolEntry = {
  account,
  accounts: [account],
  chainPlatform: "evm",
  connectorId: CONNECTOR_ID,
  name: "MetaMask",
};

const snapshot: WalletSnapshot = {
  activeConnectorId: CONNECTOR_ID,
  pool: { [CONNECTOR_ID]: storedEntry },
  selection: { evm: CONNECTOR_ID },
};

const seeded = { config: { initialState: snapshot } };

describe("the reconnecting window", () => {
  it("useIsReconnecting is true for a seeded entry before the live adapter arrives", () => {
    const { result } = renderHookWithProvider(() => useIsReconnecting(), seeded);
    expect(result.current).toBe(true);
  });

  // Shadow adapters reject every call. Invoking one and surfacing the rejection
  // reported a non-error as `status: "error"` on the flagship SSR path.
  it("useSigner stays idle rather than erroring on a shadow connector", async () => {
    const { result } = renderHookWithProvider(() => useSigner(), seeded);

    await waitFor(() => {
      expect(result.current.status).toBe("idle");
    });
    expect(result.current.error).toBeNull();
  });

  it("useBalance stays idle rather than erroring on a shadow connector", async () => {
    const { result } = renderHookWithProvider(() => useBalance(), seeded);

    await waitFor(() => {
      expect(result.current.status).toBe("idle");
    });
    expect(result.current.error).toBeNull();
  });

  it("useConnectionStatus reports reconnecting for a seeded store at rest", () => {
    const { result } = renderHookWithProvider(() => useConnectionStatus(), seeded);
    expect(result.current).toBe("reconnecting");
  });

  // The two axes are orthogonal. Letting the per-wallet derivation win hid the
  // user's own connect outcome, including a failure they needed to see.
  it("a failed connect outranks the reconnecting derivation", async () => {
    const failing = createFakeAdapter({ chainPlatform: "evm", id: "phantom" });
    failing.connect = () => Promise.reject(new Error("user rejected"));

    const { result } = renderHookWithProvider(
      () => ({
        connect: useConnectWallet(),
        error: useConnectionError(),
        status: useConnectionStatus(),
      }),
      { adapters: [failing], ...seeded },
    );

    expect(result.current.status).toBe("reconnecting");

    await act(async () => {
      await result.current.connect("phantom").catch(() => {});
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).not.toBeNull();
  });
});
