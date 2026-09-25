import type { StoredPoolRecord, StoredSelectionRecord, WalletSnapshot } from "./persistence";
import { decodePool, decodeSelection, storageKeys } from "./validation";

type CookieSource =
  | Iterable<{ name: string; value: string }>
  | Iterable<[string, string]>
  | Readonly<Record<string, string>>;

type SnapshotOptions = {
  /**
   * Same prefix passed as `storageKeyPrefix` / to `createWalletStorage`.
   * Defaults to `"butr"` to match the library default.
   */
  keyPrefix?: string;
};

const EMPTY_POOL: StoredPoolRecord = Object.freeze({});
const EMPTY_SELECTION: StoredSelectionRecord = Object.freeze({});

const EMPTY_SNAPSHOT: WalletSnapshot = Object.freeze({
  activeConnectorId: null,
  pool: EMPTY_POOL,
  selection: EMPTY_SELECTION,
});

const toCookieMap = (input: CookieSource): Map<string, string> => {
  if (!(Symbol.iterator in input)) {
    return new Map(Object.entries(input));
  }
  const out = new Map<string, string>();
  for (const entry of input) {
    if (Array.isArray(entry)) {
      const [name, value] = entry;
      if (typeof name === "string" && typeof value === "string") {
        out.set(name, value);
      }
      continue;
    }
    if (typeof entry.name === "string" && typeof entry.value === "string") {
      out.set(entry.name, entry.value);
    }
  }
  return out;
};

const SNAPSHOT_LABEL = "[butr] readWalletSnapshot:";

/**
 * Optimistic: only what the browser last persisted, so an uninstall or
 * other-tab disconnect makes it stale. Authoritative once the entry
 * leaves `reconnectingIds`; `isHydrated` is true from render one.
 */
const readWalletSnapshot = (
  source: CookieSource,
  options: SnapshotOptions = {},
): WalletSnapshot => {
  const keys = storageKeys(options.keyPrefix);
  const cookies = toCookieMap(source);

  const pool = decodePool(cookies.get(keys.pool), SNAPSHOT_LABEL);
  const selection = decodeSelection(cookies.get(keys.selection), SNAPSHOT_LABEL);

  const rawActive = cookies.get(keys.active);
  let activeConnectorId: string | null = null;
  if (rawActive !== undefined && rawActive.length > 0 && pool[rawActive] !== undefined) {
    activeConnectorId = rawActive;
  } else {
    const firstKey = Object.keys(pool)[0];
    if (firstKey) {
      activeConnectorId = firstKey;
    }
  }

  return { activeConnectorId, pool, selection };
};

export type { CookieSource, SnapshotOptions };
export { EMPTY_SNAPSHOT, readWalletSnapshot };
