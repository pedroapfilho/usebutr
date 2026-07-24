import { logWarn } from "../logger";
import { CHAIN_PLATFORMS } from "../types";
import type { ChainPlatform } from "../types";

import type { StoredPoolEntry, StoredPoolRecord, StoredSelectionRecord } from "./persistence";

const VALID_CHAIN_PLATFORMS: ReadonlySet<string> = new Set(CHAIN_PLATFORMS);

const isChainPlatform = (value: string): value is ChainPlatform => VALID_CHAIN_PLATFORMS.has(value);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/**
 * Server-safe view of a butr-persisted session; everything you can
 * know about a user's connected wallets from the cookie payload alone,
 * without instantiating a `Connector`.
 *
 * Notably absent: the `Connector` instance. A wallet extension exists
 * only in the browser, so a server render can know *which* wallet was
 * connected and *what address* it held, but cannot dispatch
 * `signMessage`/`sendTransaction` on it. Splitting display from action
 * along this seam keeps the impossibility expressed in the types
 * rather than hidden inside a runtime check.
 */
type WalletSnapshot = {
  activeConnectorId: string | null;
  pool: StoredPoolRecord;
  selection: StoredSelectionRecord;
};

type CookieSource =
  | Iterable<{ name: string; value: string }>
  | Iterable<[string, string]>
  | Readonly<Record<string, string>>;

type SnapshotOptions = {
  /**
   * Same prefix passed to `WalletManagerProvider` / `WalletStorage`.
   * Defaults to `"butr"` to match the library default.
   */
  keyPrefix?: string;
};

const EMPTY_SNAPSHOT: WalletSnapshot = Object.freeze({
  activeConnectorId: null,
  pool: Object.freeze({}) as StoredPoolRecord,
  selection: Object.freeze({}) as StoredSelectionRecord,
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

const isValidAccount = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }
  if (typeof value.walletAddress !== "string" || typeof value.id !== "string") {
    return false;
  }
  if (!isRecord(value.chain)) {
    return false;
  }
  return true;
};

const isValidPoolEntry = (key: string, value: unknown): value is StoredPoolEntry => {
  if (!isRecord(value)) {
    return false;
  }
  const entry = value;
  if (typeof entry.connectorId !== "string" || entry.connectorId !== key) {
    return false;
  }
  if (typeof entry.chainPlatform !== "string") {
    return false;
  }
  if (!isChainPlatform(entry.chainPlatform)) {
    return false;
  }
  if (typeof entry.name !== "string" || entry.name.length === 0) {
    return false;
  }
  if (entry.icon !== undefined && typeof entry.icon !== "string") {
    return false;
  }
  if (!isValidAccount(entry.account)) {
    return false;
  }
  if (!Array.isArray(entry.accounts) || !entry.accounts.every(isValidAccount)) {
    return false;
  }
  return true;
};

const parsePool = (raw: string | undefined): StoredPoolRecord => {
  if (raw === undefined || raw === "") {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) {
      return {};
    }
    const result: StoredPoolRecord = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (isValidPoolEntry(key, value)) {
        result[key] = value;
      } else {
        logWarn(`[butr] readWalletSnapshot: dropping invalid pool entry for ${key}`);
      }
    }
    return result;
  } catch (error) {
    logWarn("[butr] readWalletSnapshot: failed to parse pool cookie:", error);
    return {};
  }
};

const parseSelection = (raw: string | undefined): StoredSelectionRecord => {
  if (raw === undefined || raw === "") {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) {
      return {};
    }
    const result: StoredSelectionRecord = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (isChainPlatform(key) && typeof value === "string" && value.length > 0) {
        result[key] = value;
      }
    }
    return result;
  } catch (error) {
    logWarn("[butr] readWalletSnapshot: failed to parse selection cookie:", error);
    return {};
  }
};

/**
 * Parse a cookie source into a server-safe `WalletSnapshot`.
 *
 * Pure, sync, no `document`, no React; runnable in any environment
 * (Server Component, route handler, edge middleware, even client
 * code). Pair with `createCookieStorageDriver({ initialCookies })`
 * and `<WalletManagerProvider initialSnapshot={…} />` to render a
 * connected shell server-side without a hydration flash.
 *
 * **Stale-snapshot semantics.** The snapshot reflects whatever the
 * browser most recently persisted. If the user has since uninstalled
 * the wallet, switched accounts, or disconnected in another tab, the
 * client-side hydration will reconcile reality and the live store
 * will diverge from the snapshot. Treat the snapshot as an
 * *optimistic* shell; accurate enough to avoid a paint flicker,
 * authoritative only after `useIsHydrated()` is true.
 *
 * **Inputs.** Accepts the three shapes Next.js / Express / Hono /
 * generic-Node cookie code naturally produces:
 *  - A plain object: `{ "butr-pool": "{...}", … }`
 *  - An array of `{ name, value }` (Next.js' `cookies().getAll()`)
 *  - An iterable of `[name, value]` tuples
 *
 * Malformed entries are dropped with a `logWarn` (same policy as
 * `WalletStorage.getPool`); a cross-tab corruption shouldn't crash
 * the server render.
 */
const readWalletSnapshot = (
  source: CookieSource,
  options: SnapshotOptions = {},
): WalletSnapshot => {
  const keyPrefix =
    options.keyPrefix === undefined || options.keyPrefix === "" ? "butr" : options.keyPrefix;
  const cookies = toCookieMap(source);

  const pool = parsePool(cookies.get(`${keyPrefix}-pool`));
  const selection = parseSelection(cookies.get(`${keyPrefix}-selection`));

  const rawActive = cookies.get(`${keyPrefix}-active`);
  let activeConnectorId: string | null = null;
  if (rawActive !== undefined && rawActive.length > 0 && pool[rawActive] !== undefined) {
    activeConnectorId = rawActive;
  } else {
    // Mirror `HydrationCoordinator.hydrate` selection-fallback: when no
    // explicit active is stored, surface any pool member so the render
    // shell can still show "connected" instead of "disconnected".
    const firstKey = Object.keys(pool)[0];
    if (firstKey) {
      activeConnectorId = firstKey;
    }
  }

  return { activeConnectorId, pool, selection };
};

export type { CookieSource, SnapshotOptions, WalletSnapshot };
export { EMPTY_SNAPSHOT, readWalletSnapshot };
