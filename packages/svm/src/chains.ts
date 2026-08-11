import type { ChainBase } from "@usebutr/core";

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

const SVM_CHAINS_LIST: ReadonlyArray<ChainBase> = Object.values(SVM_CHAINS);

export { SVM_CHAINS, SVM_CHAINS_LIST };
