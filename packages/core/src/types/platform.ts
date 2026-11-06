/**
 * Single runtime source of truth: `ChainPlatform` and the storage
 * validators' allowlists both derive from it. Omitting a platform here
 * silently stops its connections from persisting.
 */
const CHAIN_PLATFORMS = ["evm", "svm", "sui", "bitcoin", "polkadot"] as const;

type ChainPlatform = (typeof CHAIN_PLATFORMS)[number];

/** The CAIP-2 namespace every chain of a platform is named in. */
const CHAIN_NAMESPACES: Readonly<Record<ChainPlatform, string>> = {
  bitcoin: "bip122",
  evm: "eip155",
  polkadot: "polkadot",
  sui: "sui",
  svm: "solana",
};

const PLATFORMS: ReadonlySet<string> = new Set(CHAIN_PLATFORMS);

const isChainPlatform = (value: string): value is ChainPlatform => PLATFORMS.has(value);

export type { ChainPlatform };

export { CHAIN_NAMESPACES, CHAIN_PLATFORMS, isChainPlatform };
