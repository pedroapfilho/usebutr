import type { ChainBase } from "./chain";
import type { ChainPlatform } from "./platform";

/**
 * Values come from the per-platform packages (`EVM_CHAINS_LIST`,
 * `SVM_CHAINS_LIST`, …); an empty list opts that platform out of the
 * consumer's chain UI.
 */
type ChainsByPlatform = Readonly<Record<ChainPlatform, ReadonlyArray<ChainBase>>>;

/**
 * Naming only the platforms an app targets keeps the other packages'
 * chain registries out of its bundle. Apps that want all of them import
 * `CHAINS_BY_PLATFORM` from `@usebutr/wallets`.
 */
const buildChainsByPlatform = (partial: Partial<ChainsByPlatform>) =>
  ({
    bitcoin: partial.bitcoin ?? [],
    evm: partial.evm ?? [],
    polkadot: partial.polkadot ?? [],
    sui: partial.sui ?? [],
    svm: partial.svm ?? [],
  }) satisfies ChainsByPlatform;

export type { ChainsByPlatform };
export { buildChainsByPlatform };
