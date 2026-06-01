import { type Address, address as toAddress, createSolanaRpc } from "@solana/kit";
import { formatUnits } from "ethers";
import { useEffect, useReducer } from "react";

import { type ChainSpec, USDC_DECIMALS } from "./chains";

type Status = "idle" | "loading" | "success" | "error";

type UsdcBalance = {
  refetch: () => void;
  status: Status;
  uiAmountString: string | null;
};

type State = { status: Status; tick: number; uiAmountString: string | null };

type Action =
  | { type: "reset" }
  | { type: "load" }
  | { type: "success"; uiAmountString: string }
  | { type: "error" }
  | { type: "bump" };

const INITIAL: State = { status: "idle", tick: 0, uiAmountString: null };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "reset": {
      return { status: "idle", tick: state.tick, uiAmountString: null };
    }
    case "load": {
      return { status: "loading", tick: state.tick, uiAmountString: null };
    }
    case "success": {
      return { status: "success", tick: state.tick, uiAmountString: action.uiAmountString };
    }
    case "error": {
      return { status: "error", tick: state.tick, uiAmountString: null };
    }
    case "bump": {
      return { ...state, tick: state.tick + 1 };
    }
    default: {
      const _exhaustive: never = action;
      void _exhaustive;
      return state;
    }
  }
};

// EVM: `balanceOf(address)` via a single `eth_call` against the chain's
// own RPC, so the figure tracks the SELECTED chain, not whichever
// network the wallet happens to be on.
const readEvmUsdc = async (spec: ChainSpec, owner: string): Promise<string> => {
  const padded = owner.slice(2).toLowerCase().padStart(64, "0");
  const data = `0x70a08231${padded}`;
  const response = await fetch(spec.rpcUrl, {
    body: JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "eth_call",
      params: [{ data, to: spec.usdc }, "latest"],
    }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  const json = (await response.json()) as { error?: { message: string }; result?: string };
  if (json.error) {
    throw new Error(json.error.message);
  }
  return formatUnits(BigInt(json.result ?? "0x0"), USDC_DECIMALS);
};

// SVM: SPL token balance via `getTokenAccountsByOwner`, filtered to the
// USDC mint. `jsonParsed` returns a human-readable amount directly.
const readSvmUsdc = async (spec: ChainSpec, owner: string): Promise<string> => {
  const rpc = createSolanaRpc(spec.rpcUrl);
  const response = await rpc
    .getTokenAccountsByOwner(
      toAddress(owner) as Address,
      { mint: toAddress(spec.usdc) as Address },
      { encoding: "jsonParsed" },
    )
    .send();
  const first = response.value[0];
  if (!first) {
    return "0";
  }
  const info = (
    first.account.data as unknown as {
      parsed?: { info?: { tokenAmount?: { uiAmount?: number; uiAmountString?: string } } };
    }
  ).parsed?.info?.tokenAmount;
  return info?.uiAmountString ?? String(info?.uiAmount ?? 0);
};

/**
 * USDC balance for the given chain + owner, read from that chain's RPC.
 * Shape mirrors butr's `UseBalanceResult` (status + refetch) so the
 * demo renders source and destination symmetrically.
 */
const useUsdcBalance = (spec: ChainSpec, owner: string | null | undefined): UsdcBalance => {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  useEffect(() => {
    if (owner === null || owner === undefined || owner === "") {
      dispatch({ type: "reset" });
      return;
    }
    let cancelled = false;
    dispatch({ type: "load" });
    void (async () => {
      try {
        const uiAmountString =
          spec.platform === "evm" ? await readEvmUsdc(spec, owner) : await readSvmUsdc(spec, owner);
        if (!cancelled) {
          dispatch({ type: "success", uiAmountString });
        }
      } catch {
        if (!cancelled) {
          dispatch({ type: "error" });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [spec, owner, state.tick]);

  return {
    refetch: () => dispatch({ type: "bump" }),
    status: state.status,
    uiAmountString: state.status === "success" ? state.uiAmountString : null,
  };
};

export type { UsdcBalance };
export { useUsdcBalance };
