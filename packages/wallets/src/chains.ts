import { BITCOIN_CHAINS, BITCOIN_CHAINS_LIST } from "@usebutr/bitcoin";
import { buildChainsByPlatform } from "@usebutr/core";
import { EVM_CHAINS, EVM_CHAINS_LIST } from "@usebutr/evm";
import { POLKADOT_CHAINS, POLKADOT_CHAINS_LIST } from "@usebutr/polkadot";
import { SUI_CHAINS, SUI_CHAINS_LIST } from "@usebutr/sui";
import { SVM_CHAINS, SVM_CHAINS_LIST } from "@usebutr/svm";

/**
 * Importing this pulls every platform's chain table into the bundle.
 * Single-platform apps should import the per-platform registry directly and
 * assemble their map with `buildChainsByPlatform` from `@usebutr/core`.
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
