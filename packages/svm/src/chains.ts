import type { ChainBase } from "@usebutr/core";

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

const SVM_CHAINS_LIST: ReadonlyArray<ChainBase> = Object.values(SVM_CHAINS);

export { SVM_CHAINS, SVM_CHAINS_LIST };
