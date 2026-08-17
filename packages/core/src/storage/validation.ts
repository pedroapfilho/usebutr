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

const parseStoredPoolEntry = (key: string, value: unknown) => {
  const parsed = storedPoolEntrySchema.safeParse(value);
  if (!parsed.success || parsed.data.connectorId !== key) {
    return null;
  }
  return parsed.data;
};

const DEFAULT_KEY_PREFIX = "butr";

/**
 * `WalletStorage` writes these and `readWalletSnapshot` reads them from
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

/**
 * Never repairs or throws: one corrupt entry must not take down a whole
 * session, and `readWalletSnapshot` may run on a server with no cookie
 * jar to write the eviction to.
 */
const decodePool = (raw: string | null | undefined, label = "[butr]"): StoredPoolRecord => {
  if (raw === null || raw === undefined || raw === "") {
    return {};
  }
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch (error) {
    logWarn(`${label} failed to parse pool from storage:`, error);
    return {};
  }
  const parsed = recordSchema.safeParse(value);
  if (!parsed.success) {
    return {};
  }
  const result: StoredPoolRecord = {};
  for (const [key, entryValue] of Object.entries(parsed.data)) {
    const entry = parseStoredPoolEntry(key, entryValue);
    if (entry === null) {
      logWarn(`${label} dropping invalid pool entry for ${key}`);
    } else {
      result[key] = entry;
    }
  }
  return result;
};

/** Decode a persisted selection payload. Same contract as `decodePool`. */
const decodeSelection = (
  raw: string | null | undefined,
  label = "[butr]",
): StoredSelectionRecord => {
  if (raw === null || raw === undefined || raw === "") {
    return {};
  }
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch (error) {
    logWarn(`${label} failed to parse selection from storage:`, error);
    return {};
  }
  const parsed = recordSchema.safeParse(value);
  if (!parsed.success) {
    return {};
  }
  const result: StoredSelectionRecord = {};
  for (const [key, selectionValue] of Object.entries(parsed.data)) {
    const platform = chainPlatformSchema.safeParse(key);
    if (platform.success && typeof selectionValue === "string" && selectionValue.length > 0) {
      result[platform.data] = selectionValue;
    }
  }
  return result;
};

export { decodePool, decodeSelection, parseStoredPoolEntry, storageKeys };
