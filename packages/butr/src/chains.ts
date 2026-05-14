import { EVM_CHAINS } from "@butr/evm";
import { SVM_CHAINS } from "@butr/svm";

const CHAINS = {
  evm: EVM_CHAINS,
  svm: SVM_CHAINS,
} as const;

/**
 * Flat array form, indexed by `chainPlatform`. Handy for rendering a
 * chain picker:
 *
 * ```tsx
 * import { CHAINS_BY_PLATFORM } from "butr";
 *
 * CHAINS_BY_PLATFORM[wallet.connector.chainPlatform].map((chain) => (
 *   <button onClick={() => wallet.connector.switchChain(chain)}>{chain.name}</button>
 * ))
 * ```
 */
const CHAINS_BY_PLATFORM = {
  evm: Object.values(EVM_CHAINS),
  svm: Object.values(SVM_CHAINS),
} as const;

export { CHAINS, CHAINS_BY_PLATFORM, EVM_CHAINS, SVM_CHAINS };
