import type { ChainBase } from "./types";

/**
 * A small registry of well-known chains keyed by CAIP-2 id. Useful for
 * powering a chain-switcher UI without forcing every consumer to hand-
 * roll the same name + reference + namespace tuples.
 *
 * The reference for EVM chains is the decimal chain id; consumers
 * needing the hex form should use `chainIdDecimalToHex` from `butr/auto`.
 *
 * butr itself doesn't read this registry — `Connector.switchChain`
 * accepts any `ChainBase`. The registry is a convenience for callers.
 */
const EVM_CHAINS = {
  arbitrum: {
    id: "eip155:42161",
    name: "Arbitrum One",
    namespace: "eip155",
    reference: "42161",
  },
  base: { id: "eip155:8453", name: "Base", namespace: "eip155", reference: "8453" },
  bsc: { id: "eip155:56", name: "BNB Smart Chain", namespace: "eip155", reference: "56" },
  ethereum: { id: "eip155:1", name: "Ethereum", namespace: "eip155", reference: "1" },
  optimism: { id: "eip155:10", name: "Optimism", namespace: "eip155", reference: "10" },
  polygon: { id: "eip155:137", name: "Polygon", namespace: "eip155", reference: "137" },
  sepolia: { id: "eip155:11155111", name: "Sepolia", namespace: "eip155", reference: "11155111" },
} as const satisfies Record<string, ChainBase>;

// Solana chain identifiers follow the Wallet Standard convention
// (`solana:mainnet` / `solana:devnet` / `solana:testnet`) rather than
// the strict CAIP-2 genesis-hash form (`solana:5eykt…`). Phantom,
// Solflare, Backpack and the rest of the Wallet Standard ecosystem
// advertise these shortnames in `wallet.chains`, and the SVM adapter's
// `switchChain` rejects anything not in that set. The genesis-hash form
// remains valid CAIP-2 but isn't what real wallets exchange.
const SVM_CHAINS = {
  devnet: { id: "solana:devnet", name: "Solana Devnet", namespace: "solana", reference: "devnet" },
  mainnet: {
    id: "solana:mainnet",
    name: "Solana Mainnet",
    namespace: "solana",
    reference: "mainnet",
  },
  testnet: {
    id: "solana:testnet",
    name: "Solana Testnet",
    namespace: "solana",
    reference: "testnet",
  },
} as const satisfies Record<string, ChainBase>;

const CHAINS = {
  evm: EVM_CHAINS,
  svm: SVM_CHAINS,
} as const;

/**
 * Flat array form, indexed by `chainPlatform`. Handy for rendering a
 * chain picker:
 *
 * ```tsx
 * import { CHAINS_BY_PLATFORM } from "butr";
 *
 * CHAINS_BY_PLATFORM[wallet.connector.chainPlatform].map((chain) => (
 *   <button onClick={() => wallet.connector.switchChain(chain)}>{chain.name}</button>
 * ))
 * ```
 */
const CHAINS_BY_PLATFORM = {
  evm: Object.values(EVM_CHAINS),
  svm: Object.values(SVM_CHAINS),
} as const;

export { CHAINS, CHAINS_BY_PLATFORM, EVM_CHAINS, SVM_CHAINS };
