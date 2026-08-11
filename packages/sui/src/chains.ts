import type { ChainBase } from "@usebutr/core";

const SUI_CHAINS = {
  devnet: { id: "sui:devnet", name: "Sui Devnet", namespace: "sui", reference: "devnet" },
  localnet: {
    id: "sui:localnet",
    name: "Sui Localnet",
    namespace: "sui",
    reference: "localnet",
  },
  mainnet: {
    id: "sui:mainnet",
    name: "Sui Mainnet",
    namespace: "sui",
    reference: "mainnet",
  },
  testnet: { id: "sui:testnet", name: "Sui Testnet", namespace: "sui", reference: "testnet" },
} as const satisfies Record<string, ChainBase>;

const SUI_CHAINS_LIST: ReadonlyArray<ChainBase> = Object.values(SUI_CHAINS);

export { SUI_CHAINS, SUI_CHAINS_LIST };
