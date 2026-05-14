import type { ChainBase } from "@butr/core";
import { EVM_CHAINS, EVM_CHAINS_LIST } from "@butr/evm";
import { SVM_CHAINS, SVM_CHAINS_LIST } from "@butr/svm";

/**
 * Combined EVM + SVM chain registries. Convenient for `@butr/wallets`
 * consumers who already pull both platforms. EVM-only or SVM-only apps
 * should import the corresponding `EVM_CHAINS` / `SVM_CHAINS` from
 * `@butr/evm` / `@butr/svm` directly to keep the unused platform's
 * registry out of the bundle.
 */
const CHAINS = {
  evm: EVM_CHAINS,
  svm: SVM_CHAINS,
} as const;

const CHAINS_BY_PLATFORM: Readonly<Record<"evm" | "svm", ReadonlyArray<ChainBase>>> = {
  evm: EVM_CHAINS_LIST,
  svm: SVM_CHAINS_LIST,
} as const;

export { CHAINS, CHAINS_BY_PLATFORM };
