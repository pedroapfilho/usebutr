import type { ChainPlatform, PlatformDiscoverer, WalletAdapter } from "@usebutr/core";
import { logWarn } from "@usebutr/core";

/**
 * Fans platforms' discoverers into one callback, deduplicated by id. A
 * fallback learns whether its own platform's standard channel already
 * spoke. Kept apart from the real registry so tests can drive it.
 */
const runDiscoverers = (
  discoverers: ReadonlyArray<readonly [ChainPlatform, PlatformDiscoverer]>,
  onAdapter: (adapter: WalletAdapter) => void,
  options: { fallbacks?: boolean } = {},
): (() => void) => {
  const seen = new Set<string>();
  const platforms = new Set<ChainPlatform>();
  const emit = (adapter: WalletAdapter) => {
    if (seen.has(adapter.id)) {
      return;
    }
    seen.add(adapter.id);
    platforms.add(adapter.chainPlatform);
    onAdapter(adapter);
  };

  const unsubscribes: Array<() => void> = [];
  for (const [platform, { fallback, subscribe }] of discoverers) {
    unsubscribes.push(subscribe(emit));
    if (fallback !== undefined && options.fallbacks !== false) {
      const hasAnyPrimaryAdapter = () => platforms.has(platform);
      unsubscribes.push(fallback.subscribe(emit, { hasAnyPrimaryAdapter }));
    }
  }

  return () => {
    for (const unsubscribe of unsubscribes.splice(0)) {
      try {
        unsubscribe();
      } catch (error) {
        logWarn("[butr] discovery unsubscribe threw:", error);
      }
    }
  };
};

export { runDiscoverers };
