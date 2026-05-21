import { BITCOIN_CHAINS, BITCOIN_CHAINS_LIST } from "@usebutr/bitcoin";
import type { ChainBase } from "@usebutr/core";
import { EVM_CHAINS, EVM_CHAINS_LIST } from "@usebutr/evm";
import { SUI_CHAINS, SUI_CHAINS_LIST } from "@usebutr/sui";
import { SVM_CHAINS, SVM_CHAINS_LIST } from "@usebutr/svm";

/**
 * Combined EVM + SVM + Sui + Bitcoin chain registries. Convenient for
 * `@usebutr/wallets` consumers who already pull every platform.
 * Single-platform apps should import the corresponding `EVM_CHAINS` /
 * `SVM_CHAINS` / `SUI_CHAINS` / `BITCOIN_CHAINS` from the platform
 * package directly to keep unused registries out of the bundle.
 */
const CHAINS = {
  bitcoin: BITCOIN_CHAINS,
  evm: EVM_CHAINS,
  sui: SUI_CHAINS,
  svm: SVM_CHAINS,
} as const;

const CHAINS_BY_PLATFORM: Readonly<
  Record<"evm" | "svm" | "sui" | "bitcoin", ReadonlyArray<ChainBase>>
> = {
  bitcoin: BITCOIN_CHAINS_LIST,
  evm: EVM_CHAINS_LIST,
  sui: SUI_CHAINS_LIST,
  svm: SVM_CHAINS_LIST,
} as const;

export { CHAINS, CHAINS_BY_PLATFORM };
