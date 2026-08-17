import type { ChainBase } from "@usebutr/core";

/**
 * CAIP-2 Bitcoin references are the first 8 bytes of each network's
 * genesis block hash, which is what wallets advertise in `wallet.chains`.
 * No major wallet exposes a switch-chain RPC, so chain stays local state.
 */
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
} as const satisfies Record<string, ChainBase>;

const BITCOIN_CHAINS_LIST: ReadonlyArray<ChainBase> = Object.values(BITCOIN_CHAINS);

export { BITCOIN_CHAINS, BITCOIN_CHAINS_LIST };
