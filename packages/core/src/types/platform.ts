/**
 * Canonical list of supported chain platforms. The single runtime source
 * of truth: `ChainPlatform` is derived from it, and storage validators
 * build their allowlists from it, so the type and the runtime checks can
 * never drift (a missing platform here was why Polkadot connections failed
 * to persist).
 */
const CHAIN_PLATFORMS = ["evm", "svm", "sui", "bitcoin", "polkadot"] as const;

type ChainPlatform = (typeof CHAIN_PLATFORMS)[number];

export type { ChainPlatform };
export { CHAIN_PLATFORMS };
