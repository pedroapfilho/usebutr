type ChainPlatform = "evm" | "svm";

/**
 * A wallet browser extension that automated tests may need to install.
 * Mirrors the small set of facts an installer (preferences-based or
 * --load-extension-based) needs at runtime.
 */
type WalletExtension = {
  /**
   * Chrome Web Store extension ID. The 32-character lowercase identifier
   * that appears in the Web Store URL: `…/detail/<slug>/<id>`.
   * Used both as the filename for Chrome's external-preferences manifest
   * and as the update URL target.
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
   * Lowercase kebab-case identifier — stable across Web Store renames.
   * Use this for directory names, test IDs, and registry lookups.
   */
  slug: string;
  /** Canonical Chrome Web Store listing URL. */
  webStoreUrl: string;
};

export type { ChainPlatform, WalletExtension };
