import type { WalletAdapter } from "@usebutr/core";
import { logWarn } from "@usebutr/core";

type DiscoveryPath = (emit: (adapter: WalletAdapter) => void) => () => void;

type DiscoveryBus = {
  hasAny: () => boolean;
  register: (path: DiscoveryPath | null) => void;
  unsubscribeAll: () => void;
};

const createDiscoveryBus = (
  onAdapter: (adapter: WalletAdapter) => void,
  warn: typeof logWarn = logWarn,
): DiscoveryBus => {
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
        } catch (error) {
          warn("[butr] discovery unsubscribe threw:", error);
        }
      }
      unsubs.length = 0;
    },
  };
};

export type { DiscoveryBus, DiscoveryPath };
export { createDiscoveryBus };
