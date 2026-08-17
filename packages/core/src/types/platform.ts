/**
 * Single runtime source of truth: `ChainPlatform` and the storage
 * validators' allowlists both derive from it. Omitting a platform here
 * silently stops its connections from persisting.
 */
const CHAIN_PLATFORMS = ["evm", "svm", "sui", "bitcoin", "polkadot"] as const;

type ChainPlatform = (typeof CHAIN_PLATFORMS)[number];

export type { ChainPlatform };
export { CHAIN_PLATFORMS };
