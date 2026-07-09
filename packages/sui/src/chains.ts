import type { ChainBase } from "@usebutr/core";

// Sui wallets follow the Wallet Standard convention of advertising
// rather than the strict CAIP-2 form (the genesis-checkpoint hash).
// Sui Wallet, Suiet, Phantom (Sui), and Surf all exchange these short
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
