import type { ChainBase } from "./chain";
import type { ChainPlatform } from "./wallet";

/**
 * Map of every chain platform to the list of chains the consumer wants
 * to expose to its UI (chain switcher, picker, etc).
 *
 * The platform key set is fixed by `ChainPlatform`. The value is the
 * chain list — empty when the consumer doesn't want to support that
 * platform's chains in this view. This is the only type that callers
 * write down; the values come from per-platform packages
 * (`EVM_CHAINS_LIST`, `SVM_CHAINS_LIST`, etc).
 */
type ChainsByPlatform = Readonly<Record<ChainPlatform, ReadonlyArray<ChainBase>>>;

/**
 * Build a fully-populated `ChainsByPlatform` from a partial. Platforms
 * the consumer doesn't specify default to an empty list.
 *
 * Use this in apps that target one or two chain platforms — importing
 * only those packages keeps unused chain registries out of the bundle.
 * Apps that want every chain reach for `CHAINS_BY_PLATFORM` from
 * `@usebutr/wallets` instead.
 *
 * @example
 * // EVM-only app — Solana/Sui/Bitcoin tables never enter the bundle
 * import { EVM_CHAINS_LIST } from "@usebutr/evm";
 * import { buildChainsByPlatform } from "@usebutr/core";
 *
 * const chains = buildChainsByPlatform({ evm: EVM_CHAINS_LIST });
 *
 * @example
 * // Multi-chain app — pull from each package the app actually uses
 * import { EVM_CHAINS_LIST } from "@usebutr/evm";
 * import { SVM_CHAINS_LIST } from "@usebutr/svm";
 *
 * const chains = buildChainsByPlatform({
 *   evm: EVM_CHAINS_LIST,
 *   svm: SVM_CHAINS_LIST,
 * });
 */
const buildChainsByPlatform = (partial: Partial<ChainsByPlatform>): ChainsByPlatform => ({
  bitcoin: partial.bitcoin ?? [],
  evm: partial.evm ?? [],
  polkadot: partial.polkadot ?? [],
  sui: partial.sui ?? [],
  svm: partial.svm ?? [],
});

export type { ChainsByPlatform };
export { buildChainsByPlatform };
