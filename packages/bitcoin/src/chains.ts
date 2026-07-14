import type { ChainBase } from "@usebutr/core";

/**
 * CAIP-2 Bitcoin chain references use the first 8 bytes (big-endian)
 * of each network's genesis block hash. These string ids are what
 * Bitcoin Wallet Standard wallets (Phantom, Magic Eden, OKX) advertise
 * in `wallet.chains`; the adapter's `switchChain` rejects anything else.
 *
 * - Mainnet:  `bip122:000000000019d6689c085ae165831e93`
 * - Testnet:  `bip122:000000000933ea01ad0ee984209779ba`
 * - Signet:   `bip122:00000008819873e925422c1ff0f99f7c`
 *
 * Bitcoin has no per-call "switch chain" RPC across the major wallets,
 * so butr's adapter treats chain as a wallet-side configuration;
 * `switchChain` updates local state to influence subsequent calls (same
 * posture as SVM). Bitcoin's `switchChain` capability is `false` by
 * default; consumers building on top can opt in if their wallet exposes
 * a switch primitive.
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
