import type { ChainBase } from "./types/chain";
import type { ChainsByPlatform } from "./types/chains-by-platform";

/*
 * Every platform's chain registry, as plain data, so every transport names
 * a chain the same way through `resolveChain`. Unused ones tree-shake away.
 */

/** Common EVM chains. `switchChain` accepts any `ChainBase`, so a chain
 *  missing here still works; it is just named by its CAIP-2 id. */
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

/** CAIP-2 Bitcoin references are the first 16 bytes of each network's
 *  genesis block hash, which is what wallets advertise in `wallet.chains`. */
const BITCOIN_CHAINS = {
  mainnet: {
    id: "bip122:000000000019d6689c085ae165831e93",
    name: "Bitcoin",
    namespace: "bip122",
    reference: "000000000019d6689c085ae165831e93",
  },
  signet: {
    id: "bip122:00000008819873e925422c1ff0f99f7c",
    name: "Bitcoin Signet",
    namespace: "bip122",
    reference: "00000008819873e925422c1ff0f99f7c",
  },
  testnet: {
    id: "bip122:000000000933ea01ad0ee984209779ba",
    name: "Bitcoin Testnet",
    namespace: "bip122",
    reference: "000000000933ea01ad0ee984209779ba",
  },
  testnet4: {
    id: "bip122:00000000da84f2bafbbc53dee25a72ae",
    name: "Bitcoin Testnet4",
    namespace: "bip122",
    reference: "00000000da84f2bafbbc53dee25a72ae",
  },
} as const satisfies Record<string, ChainBase>;

const POLKADOT_CHAINS = {
  kusama: {
    id: "polkadot:b0a8d493285c2df73290dfb7e61f870f",
    name: "Kusama",
    namespace: "polkadot",
    reference: "b0a8d493285c2df73290dfb7e61f870f",
  },
  paseo: {
    id: "polkadot:77afd6190f1554ad45fd0d31aee62aac",
    name: "Paseo",
    namespace: "polkadot",
    reference: "77afd6190f1554ad45fd0d31aee62aac",
  },
  polkadot: {
    id: "polkadot:91b171bb158e2d3848fa23a9f1c25182",
    name: "Polkadot",
    namespace: "polkadot",
    reference: "91b171bb158e2d3848fa23a9f1c25182",
  },
  westend: {
    id: "polkadot:e143f23803ac50e8f6f8e62695d1ce9e",
    name: "Westend",
    namespace: "polkadot",
    reference: "e143f23803ac50e8f6f8e62695d1ce9e",
  },
} as const satisfies Record<string, ChainBase>;

const EVM_CHAINS_LIST: ReadonlyArray<ChainBase> = Object.values(EVM_CHAINS);
const SVM_CHAINS_LIST: ReadonlyArray<ChainBase> = Object.values(SVM_CHAINS);
const SUI_CHAINS_LIST: ReadonlyArray<ChainBase> = Object.values(SUI_CHAINS);
const BITCOIN_CHAINS_LIST: ReadonlyArray<ChainBase> = Object.values(BITCOIN_CHAINS);
const POLKADOT_CHAINS_LIST: ReadonlyArray<ChainBase> = Object.values(POLKADOT_CHAINS);

/** Every registry as a list, keyed by platform: the shape chain pickers want. */
const CHAINS_BY_PLATFORM: ChainsByPlatform = {
  bitcoin: BITCOIN_CHAINS_LIST,
  evm: EVM_CHAINS_LIST,
  polkadot: POLKADOT_CHAINS_LIST,
  sui: SUI_CHAINS_LIST,
  svm: SVM_CHAINS_LIST,
};

export {
  BITCOIN_CHAINS,
  BITCOIN_CHAINS_LIST,
  CHAINS_BY_PLATFORM,
  EVM_CHAINS,
  EVM_CHAINS_LIST,
  POLKADOT_CHAINS,
  POLKADOT_CHAINS_LIST,
  SUI_CHAINS,
  SUI_CHAINS_LIST,
  SVM_CHAINS,
  SVM_CHAINS_LIST,
};
