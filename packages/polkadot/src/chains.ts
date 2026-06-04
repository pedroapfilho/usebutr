import type { ChainBase } from "@usebutr/core";

// CAIP-2 for Polkadot is `polkadot:{first-32-hex-of-genesis-hash}`.
// injectedWeb3 doesn't advertise chains (accounts are chain-agnostic
// across Substrate), so this registry is butr-authored. Wallet Standard
// polkadot wallets advertise these same CAIP-2 ids.
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

const POLKADOT_CHAINS_LIST: ReadonlyArray<ChainBase> = Object.values(POLKADOT_CHAINS);

export { POLKADOT_CHAINS, POLKADOT_CHAINS_LIST };
