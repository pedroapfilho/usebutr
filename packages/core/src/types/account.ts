import type { ChainBase } from "./chain";

type Account = {
  chain: ChainBase;
  id: string;
  walletAddress: string;
};

/**
 * The reducer compares accounts by the composite `<chain>:<address>`
 * id, so every adapter must build accounts here or reproduce that
 * format byte for byte.
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
