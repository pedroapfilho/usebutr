import type { ChainBase } from "@butr/core";

/**
 * Common EVM chain registry keyed by CAIP-2 id. Useful for chain-
 * switcher UIs. butr itself doesn't read this — `Connector.switchChain`
 * accepts any `ChainBase`.
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

const EVM_CHAINS_LIST: ReadonlyArray<ChainBase> = Object.values(EVM_CHAINS);

export { EVM_CHAINS, EVM_CHAINS_LIST };
