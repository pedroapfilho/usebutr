import type { ChainBase } from "./chain";

type Account = {
  chain: ChainBase;
  id: string;
  walletAddress: string;
};

/**
 * Build butr's `Account` shape from a wallet address and a resolved
 * `ChainBase`. The composite id (`<chain>:<address>`) is what the
 * reducer uses to compare accounts across refreshes, so every adapter
 * must build accounts through this helper (or keep the format
 * byte-identical).
 */
const buildAccount = (address: string, chain: ChainBase): Account => ({
  chain,
  id: `${chain.id}:${address}`,
  walletAddress: address,
});

type Balance = {
  /** Token decimals (e.g. 9 for SOL, 18 for ETH) */
  decimals: number;
  /** Human-readable string, trimmed of trailing zeros */
  formatted: string;
  /** Token symbol (e.g. "SOL", "ETH") */
  symbol: string;
  /** Raw integer amount */
  value: bigint;
};

export type { Account, Balance };
export { buildAccount };
