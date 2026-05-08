import { useCallback, useEffect, useState } from "react";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { useWalletStoreContext } from "./context";
import type { Balance, ConnectedWallet } from "./types";

type AsyncState<T> =
  | { data: null; error: null; status: "idle" }
  | { data: null; error: null; status: "loading" }
  | { data: T; error: null; status: "success" }
  | { data: null; error: unknown; status: "error" };

const walletEqual = (a: ConnectedWallet | undefined, b: ConnectedWallet | undefined) => {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return (
    a.connector.id === b.connector.id &&
    a.account.walletAddress === b.account.walletAddress &&
    a.account.chain.id === b.account.chain.id
  );
};

/** Subscribe to the pool entry for a connectorId. Re-renders only when the
 *  resolved wallet's identity (connectorId / address / chainId) changes. */
const useWalletEntry = (connectorId: string | null | undefined) => {
  const store = useWalletStoreContext();
  return useStoreWithEqualityFn(
    store,
    (state) => {
      const id = connectorId ?? state.activeConnectorId;
      return id ? state.pool.get(id) : undefined;
    },
    walletEqual,
  );
};

/**
 * Cached signer for a connector. Invalidates when `connectorId`, account
 * address, or chain id changes — so a chain switch or account switch in the
 * wallet invalidates the cached signer automatically.
 *
 * If `connectorId` is omitted (or `null`/`undefined`), the active wallet's
 * signer is returned.
 *
 * Returns `{ data, error, status }`. `status` is `"idle"` when there's no
 * wallet, `"loading"` while the connector resolves, `"success"` once the
 * signer is available, `"error"` if `getSigner()` rejected.
 */
const useSigner = (connectorId?: string | null): AsyncState<unknown> => {
  const wallet = useWalletEntry(connectorId);
  const [state, setState] = useState<AsyncState<unknown>>({
    data: null,
    error: null,
    status: "idle",
  });

  useEffect(() => {
    if (!wallet) {
      // oxlint-disable-next-line react-hooks-js/set-state-in-effect -- canonical "fetch when dep changes" pattern; the setState marks the lifecycle phase consumers observe
      setState({ data: null, error: null, status: "idle" });
      return;
    }
    // oxlint-disable-next-line react-hooks-js/set-state-in-effect -- canonical "fetch when dep changes" pattern; loading state is what consumers render while the await runs
    setState({ data: null, error: null, status: "loading" });
    let cancelled = false;
    void (async () => {
      try {
        const signer = await wallet.connector.getSigner();
        if (!cancelled) {
          setState({ data: signer, error: null, status: "success" });
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setState({ data: null, error, status: "error" });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [wallet]);

  return state;
};

type UseBalanceResult = AsyncState<Balance> & { refetch: () => void };

/**
 * Cached balance for a connector. Invalidates on the same events as
 * `useSigner` (connectorId / address / chainId), plus an explicit `refetch`
 * handle for poll-on-demand or after-action refreshes.
 *
 * If `connectorId` is omitted, the active wallet's balance is returned.
 * `mint` is forwarded to the connector — semantics depend on the chain.
 */
const useBalance = (connectorId?: string | null, mint?: string): UseBalanceResult => {
  const wallet = useWalletEntry(connectorId);
  const [state, setState] = useState<AsyncState<Balance>>({
    data: null,
    error: null,
    status: "idle",
  });
  const [counter, setCounter] = useState(0);
  const refetch = useCallback(() => {
    setCounter((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!wallet) {
      // oxlint-disable-next-line react-hooks-js/set-state-in-effect -- canonical "fetch when dep changes" pattern; the setState marks the lifecycle phase consumers observe
      setState({ data: null, error: null, status: "idle" });
      return;
    }
    // oxlint-disable-next-line react-hooks-js/set-state-in-effect -- canonical "fetch when dep changes" pattern; loading state is what consumers render while the await runs
    setState({ data: null, error: null, status: "loading" });
    let cancelled = false;
    void (async () => {
      try {
        const balance = await wallet.connector.getBalance(mint);
        if (!cancelled) {
          setState({ data: balance, error: null, status: "success" });
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setState({ data: null, error, status: "error" });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [wallet, mint, counter]);

  return { ...state, refetch };
};

export type { AsyncState, UseBalanceResult };
export { useBalance, useSigner, useWalletEntry };
