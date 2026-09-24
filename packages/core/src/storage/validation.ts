import { z } from "zod";

import { logWarn } from "../logger";
import { CHAIN_PLATFORMS } from "../types/platform";

import type { StoredPoolRecord, StoredSelectionRecord } from "./persistence";

const chainPlatformSchema = z.enum(CHAIN_PLATFORMS);

const chainSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  namespace: z.string(),
  reference: z.string(),
});

const accountSchema = z.looseObject({
  chain: chainSchema,
  id: z.string(),
  walletAddress: z.string(),
});

const storedPoolEntrySchema = z.looseObject({
  account: accountSchema,
  accounts: z.array(accountSchema),
  chainPlatform: chainPlatformSchema,
  connectorId: z.string(),
  icon: z.string().optional(),
  name: z.string().min(1),
});

const recordSchema = z.record(z.string(), z.unknown());

const DEFAULT_KEY_PREFIX = "butr";

/**
 * `createWalletStorage` writes these and `readWalletSnapshot` reads them from
 * a cookie jar; any divergence desyncs the SSR-seeded render from the
 * client that rehydrates it, the failure ADR 0003 exists to prevent.
 */
const storageKeys = (keyPrefix?: string) => {
  const prefix = keyPrefix === undefined || keyPrefix === "" ? DEFAULT_KEY_PREFIX : keyPrefix;
  return {
    active: `${prefix}-active`,
    pool: `${prefix}-pool`,
    selection: `${prefix}-selection`,
    userDisconnected: `${prefix}-user-disconnected`,
  };
};

const parseRecord = (raw: string | null | undefined, label: string, what: string) => {
  if (raw === null || raw === undefined || raw === "") {
    return {};
  }
  try {
    const parsed = recordSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : {};
  } catch (error) {
    logWarn(`${label} failed to parse ${what} from storage:`, error);
    return {};
  }
};

/**
 * Never repairs or throws: one corrupt entry must not take down a whole
 * session, and `readWalletSnapshot` may run on a server with no cookie
 * jar to write the eviction to. The next save overwrites the bad value.
 */
const decodePool = (raw: string | null | undefined, label = "[butr]"): StoredPoolRecord => {
  const result: StoredPoolRecord = {};
  for (const [key, value] of Object.entries(parseRecord(raw, label, "pool"))) {
    const entry = storedPoolEntrySchema.safeParse(value);
    if (entry.success && entry.data.connectorId === key) {
      result[key] = entry.data;
    } else {
      logWarn(`${label} dropping invalid pool entry for ${key}`);
    }
  }
  return result;
};

/** Decode a persisted selection payload. Same contract as `decodePool`. */
const decodeSelection = (
  raw: string | null | undefined,
  label = "[butr]",
): StoredSelectionRecord => {
  const result: StoredSelectionRecord = {};
  for (const [key, value] of Object.entries(parseRecord(raw, label, "selection"))) {
    const platform = chainPlatformSchema.safeParse(key);
    if (platform.success && typeof value === "string" && value.length > 0) {
      result[platform.data] = value;
    }
  }
  return result;
};

export { decodePool, decodeSelection, storageKeys };
