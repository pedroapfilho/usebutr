import type { Balance } from "@usebutr/core";
import { useCallback, useEffect, useMemo, useReducer } from "react";

import { useIsReconnecting, useWalletEntry } from "./selectors";

type AsyncState<T> =
  | { data: null; error: null; status: "idle" }
  | { data: null; error: null; status: "loading" }
  | { data: T; error: null; status: "success" }
  | { data: null; error: unknown; status: "error" };

type AsyncAction<T> =
  | { type: "reset" }
  | { type: "load" }
  | { data: T; type: "success" }
  | { error: unknown; type: "error" };

/** Pure async-lifecycle reducer. One dispatch per state transition
 *  keeps `useEffect` clear of cascading setState calls; each effect
 *  branch invokes the reducer exactly once. */
const asyncReducer = <T>(_state: AsyncState<T>, action: AsyncAction<T>): AsyncState<T> => {
  switch (action.type) {
    case "reset": {
      return { data: null, error: null, status: "idle" };
    }
    case "load": {
      return { data: null, error: null, status: "loading" };
    }
    case "success": {
      return { data: action.data, error: null, status: "success" };
    }
    case "error": {
      return { data: null, error: action.error, status: "error" };
    }
    default: {
      const exhaustiveCheck: never = action;
      void exhaustiveCheck;
      return { data: null, error: null, status: "idle" };
    }
  }
};

const IDLE: AsyncState<never> = { data: null, error: null, status: "idle" };

/**
 * Invalidation is keyed on the identity of `fn`, so callers must stabilise it
 * with `useMemo` and re-create the closure to force a refetch. Pass `null` to
 * stay idle.
 */
const useAsyncResource = <T>(fn: (() => Promise<T>) | null): AsyncState<T> => {
  const [state, dispatch] = useReducer(asyncReducer<T>, IDLE);

  useEffect(() => {
    if (fn === null) {
      dispatch({ type: "reset" });
      return undefined;
    }
    dispatch({ type: "load" });
    let cancelled = false;
    void (async () => {
      try {
        const data = await fn();
        if (!cancelled) {
          dispatch({ data, type: "success" });
        }
      } catch (error: unknown) {
        if (!cancelled) {
          dispatch({ error, type: "error" });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fn]);

  return state;
};

/**
 * Cached signer for a connector; the active wallet when `connectorId` is
 * omitted. Stays `"idle"` while the wallet is still reconnecting, since
 * shadow adapters reject every call.
 */
const useSigner = (connectorId?: string | null): AsyncState<unknown> => {
  const wallet = useWalletEntry(connectorId);
  const reconnecting = useIsReconnecting(connectorId);
  const fn = useMemo(
    () => (wallet && !reconnecting ? () => wallet.connector.getSigner() : null),
    [wallet, reconnecting],
  );
  return useAsyncResource(fn);
};

type UseBalanceResult = AsyncState<Balance> & { refetch: () => void };

/**
 * Cached balance for a connector; the active wallet when `connectorId` is
 * omitted. Invalidates on the same events as `useSigner`. `mint` is forwarded
 * to the connector, where its meaning is chain-specific.
 */
const useBalance = (connectorId?: string | null, mint?: string): UseBalanceResult => {
  const wallet = useWalletEntry(connectorId);
  const reconnecting = useIsReconnecting(connectorId);
  const [counter, bumpCounter] = useReducer((n: number) => n + 1, 0);
  const refetch = useCallback(() => {
    bumpCounter();
  }, []);
  const fn = useMemo(() => {
    void counter;
    return wallet && !reconnecting ? () => wallet.connector.getBalance(mint) : null;
  }, [wallet, mint, counter, reconnecting]);
  const state = useAsyncResource(fn);
  return { ...state, refetch };
};

export type { AsyncState, UseBalanceResult };
export { useBalance, useSigner };
