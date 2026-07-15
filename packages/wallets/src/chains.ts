import { BITCOIN_CHAINS, BITCOIN_CHAINS_LIST } from "@usebutr/bitcoin";
import { buildChainsByPlatform } from "@usebutr/core";
import { EVM_CHAINS, EVM_CHAINS_LIST } from "@usebutr/evm";
import { POLKADOT_CHAINS, POLKADOT_CHAINS_LIST } from "@usebutr/polkadot";
import { SUI_CHAINS, SUI_CHAINS_LIST } from "@usebutr/sui";
import { SVM_CHAINS, SVM_CHAINS_LIST } from "@usebutr/svm";

/**
 * Combined EVM + SVM + Sui + Bitcoin + Polkadot chain registries.
 * Convenient for `@usebutr/wallets` consumers who already pull every
 * platform; i.e. multi-chain apps using `autoDiscovery()`.
 *
 * Single-platform apps should NOT import this. Instead, import the
 * per-platform registry directly (e.g. `EVM_CHAINS` from `@usebutr/evm`)
 * and use `buildChainsByPlatform` from `@usebutr/core` to assemble a
 * `ChainsByPlatform` map without pulling unused chain tables into the
 * bundle.
 */
const CHAINS = {
  bitcoin: BITCOIN_CHAINS,
  evm: EVM_CHAINS,
  polkadot: POLKADOT_CHAINS,
  sui: SUI_CHAINS,
  svm: SVM_CHAINS,
} as const;

const CHAINS_BY_PLATFORM = buildChainsByPlatform({
  bitcoin: BITCOIN_CHAINS_LIST,
  evm: EVM_CHAINS_LIST,
  polkadot: POLKADOT_CHAINS_LIST,
  sui: SUI_CHAINS_LIST,
  svm: SVM_CHAINS_LIST,
});

export { CHAINS, CHAINS_BY_PLATFORM };
