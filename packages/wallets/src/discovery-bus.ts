import type { WalletAdapter } from "@usebutr/core";
import { logWarn } from "@usebutr/core";

/** The path calls `emit` per adapter it finds; the bus handles dedup. */
type DiscoveryPath = (emit: (adapter: WalletAdapter) => void) => () => void;

/**
 * Dedups adapters by `adapter.id` across every registered path, so `onAdapter`
 * fires exactly once per id. `hasAny` is public so a fallback path can gate on
 * earlier paths without the orchestrator handing it the dedup set.
 */
type DiscoveryBus = {
  /** True once any registered path has emitted. The injected fallback reads it
   *  to skip emitting when standards-based discovery already found a wallet. */
  hasAny: () => boolean;
  /** No-op if `path` is `null`. */
  register: (path: DiscoveryPath | null) => void;
  /** Tear down every registered path. */
  unsubscribeAll: () => void;
};

const createDiscoveryBus = (onAdapter: (adapter: WalletAdapter) => void): DiscoveryBus => {
  const seen = new Set<string>();
  const unsubs: Array<() => void> = [];

  const emit = (adapter: WalletAdapter) => {
    if (seen.has(adapter.id)) {
      return;
    }
    seen.add(adapter.id);
    onAdapter(adapter);
  };

  return {
    hasAny: () => seen.size > 0,
    register: (path) => {
      if (!path) {
        return;
      }
      unsubs.push(path(emit));
    },
    unsubscribeAll: () => {
      for (const unsub of unsubs) {
        try {
          unsub();
        } catch (error: unknown) {
          logWarn("[butr] discovery unsubscribe threw:", error);
        }
      }
      unsubs.length = 0;
    },
  };
};

export type { DiscoveryBus, DiscoveryPath };
export { createDiscoveryBus };
