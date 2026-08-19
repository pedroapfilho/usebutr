import { address as toAddress, createSolanaRpc } from "@solana/kit";
import { useQuery } from "@tanstack/react-query";
import { formatUnits } from "ethers";
import { z } from "zod";

import { type ChainSpec, USDC_DECIMALS } from "./chains";

type Status = "idle" | "loading" | "success" | "error";

type UsdcBalance = {
  refetch: () => void;
  status: Status;
  uiAmountString: string | null;
};

const evmResponseSchema = z.object({
  error: z.object({ message: z.string() }).optional(),
  result: z.string().optional(),
});

const tokenAmountSchema = z.object({
  uiAmount: z.number().optional(),
  uiAmountString: z.string().optional(),
});
const tokenInfoSchema = z.object({ tokenAmount: tokenAmountSchema.optional() });
const parsedTokenSchema = z.object({ info: tokenInfoSchema.optional() });
const parsedTokenDataSchema = z.object({ parsed: parsedTokenSchema.optional() });

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
  if (!response.ok) {
    throw new Error(`EVM RPC request failed with status ${response.status}`);
  }
  const json = evmResponseSchema.parse(await response.json());
  if (json.error !== undefined) {
    throw new Error(json.error.message);
  }
  return formatUnits(BigInt(json.result ?? "0x0"), USDC_DECIMALS);
};

const readSvmUsdc = async (spec: ChainSpec, owner: string): Promise<string> => {
  const rpc = createSolanaRpc(spec.rpcUrl);
  const response = await rpc
    .getTokenAccountsByOwner(
      toAddress(owner),
      { mint: toAddress(spec.usdc) },
      { encoding: "jsonParsed" },
    )
    .send();
  const first = response.value[0];
  if (first === undefined) {
    return "0";
  }
  const parsedData = parsedTokenDataSchema.parse(first.account.data);
  const info = parsedData.parsed?.info?.tokenAmount;
  return info?.uiAmountString ?? String(info?.uiAmount ?? 0);
};

const useUsdcBalance = (spec: ChainSpec, owner: string | null | undefined): UsdcBalance => {
  const hasOwner = owner !== null && owner !== undefined && owner !== "";
  const query = useQuery({
    enabled: hasOwner,
    queryFn: () => {
      if (!hasOwner) {
        return Promise.resolve("0");
      }
      return spec.platform === "evm" ? readEvmUsdc(spec, owner) : readSvmUsdc(spec, owner);
    },
    queryKey: ["usdc-balance", spec.chain, spec.rpcUrl, spec.usdc, owner],
    retry: false,
  });

  let status: Status;
  if (!hasOwner) {
    status = "idle";
  } else if (query.isFetching) {
    status = "loading";
  } else if (query.isError) {
    status = "error";
  } else {
    status = "success";
  }

  return {
    refetch: () => {
      void query.refetch();
    },
    status,
    uiAmountString: status === "success" ? (query.data ?? "0") : null,
  };
};

export type { UsdcBalance };
export { useUsdcBalance };
