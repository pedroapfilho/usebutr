type ChainPlatform = "evm" | "svm" | "sui" | "bitcoin";

/**
 * A wallet browser extension that automated tests may need to install.
 * Mirrors the small set of facts an installer (preferences-based or
 * --load-extension-based) needs at runtime.
 */
type WalletExtension = {
  /**
   * The 32-character id from the Web Store URL (`…/detail/<slug>/<id>`), used
   * both as the external-preferences filename and as the update URL target.
   */
  chromeWebStoreId: string;
  /** Human-readable name for logs and test descriptions. */
  name: string;
  /**
   * Which butr `ChainPlatform`(s) this wallet primarily serves. Wallets
   * that span both (Phantom now supports EVM via embedded networks)
   * list both.
   */
  platforms: ReadonlyArray<ChainPlatform>;
  /**
   * Lowercase kebab-case identifier; stable across Web Store renames.
   * Use this for directory names, test IDs, and registry lookups.
   */
  slug: string;
  /** Canonical Chrome Web Store listing URL. */
  webStoreUrl: string;
};

export type { ChainPlatform, WalletExtension };
