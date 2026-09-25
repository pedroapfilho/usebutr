import type { Account, Balance, ConnectedWallet, WalletSigner } from "@usebutr/core";
import { useEffect, useMemo, useReducer, useState } from "react";

import { useIsReconnecting } from "./state";

type AsyncState<T> =
  | { data: null; error: null; status: "idle" }
  | { data: null; error: null; status: "loading" }
  | { data: T; error: null; status: "success" }
  | { data: null; error: Error; status: "error" };

const IDLE: AsyncState<never> = { data: null, error: null, status: "idle" };
const LOADING: AsyncState<never> = { data: null, error: null, status: "loading" };

/** Wallets throw strings and bare objects too; consumers get an `Error`
 *  either way, with the original value as its `cause`. */
const toError = (thrown: unknown): Error => {
  if (thrown instanceof Error) {
    return thrown;
  }
  const message = typeof thrown === "string" && thrown !== "" ? thrown : "Request failed";
  return new Error(message, { cause: thrown });
};

const settle = async <T>(fn: () => Promise<T>): Promise<AsyncState<T>> => {
  try {
    return { data: await fn(), error: null, status: "success" };
  } catch (error) {
    return { data: null, error: toError(error), status: "error" };
  }
};

/**
 * Keyed on the identity of `fn`: callers stabilise it with `useMemo` and
 * re-create it to refetch; `null` stays idle. A result shows only for the
 * `fn` that produced it, so a wallet switch never renders stale data.
 */
const useAsyncResource = <T>(fn: (() => Promise<T>) | null): AsyncState<T> => {
  const [settled, setSettled] = useState<{ fn: () => Promise<T>; state: AsyncState<T> }>();

  useEffect(() => {
    if (fn === null) {
      return undefined;
    }
    let cancelled = false;
    void (async () => {
      const state = await settle(fn);
      if (!cancelled) {
        setSettled({ fn, state });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fn]);

  if (fn === null) {
    return IDLE;
  }
  return settled?.fn === fn ? settled.state : LOADING;
};

/**
 * The signer for `wallet` (from `useWallet()` or `useSelectedWallet(p)`);
 * narrow `data` with `switch (data.kind)`. `"idle"` without a wallet and
 * while it reconnects, since its shadow adapter rejects `getSigner`.
 */
const useSigner = (wallet: ConnectedWallet | undefined): AsyncState<WalletSigner> => {
  const reconnecting = useIsReconnecting(wallet?.connector.id ?? null);
  const fn = useMemo(
    () => (wallet && !reconnecting ? () => wallet.connector.getSigner() : null),
    [wallet, reconnecting],
  );
  return useAsyncResource(fn);
};

type UseBalanceOptions = {
  /** Which account to read; the wallet's active account when omitted. */
  account?: Account;
  /** Chain-specific token id (an ERC-20 address on EVM); the native asset
   *  when omitted. */
  token?: string;
};

type UseBalanceResult = AsyncState<Balance> & { refetch: () => void };

/**
 * `wallet`'s balance. `"idle"` without a wallet, for adapters with no
 * `getBalance` (butr ships no RPC for Wallet Standard chains), and while the
 * wallet is reconnecting.
 */
const useBalance = (
  wallet: ConnectedWallet | undefined,
  options: UseBalanceOptions = {},
): UseBalanceResult => {
  const { account, token } = options;
  const reconnecting = useIsReconnecting(wallet?.connector.id ?? null);
  const [counter, refetch] = useReducer((n: number) => n + 1, 0);
  const fn = useMemo(() => {
    void counter;
    if (wallet === undefined || reconnecting) {
      return null;
    }
    // Bound, so an adapter written as a class keeps its `this`.
    const getBalance = wallet.connector.getBalance?.bind(wallet.connector);
    if (getBalance === undefined) {
      return null;
    }
    const target = account ?? wallet.account;
    return () => getBalance({ account: target, token });
  }, [wallet, account, token, counter, reconnecting]);
  const state = useAsyncResource(fn);
  return { ...state, refetch };
};

export type { AsyncState, UseBalanceOptions, UseBalanceResult };
export { useBalance, useSigner };
