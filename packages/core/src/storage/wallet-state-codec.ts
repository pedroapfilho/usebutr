import { z } from "zod";

import { logWarn } from "../logger";
import type { ConnectedWallet } from "../types";
import { CHAIN_PLATFORMS } from "../types/platform";

import type {
  PersistedWalletState,
  StoredPoolEntry,
  StoredPoolRecord,
  StoredSelectionRecord,
  WalletSnapshot,
} from "./persistence";

/** `persistent` survives app restart; `session` ends with the app session. */
type StorageSlot = "persistent" | "session";

type StorageEntry = { key: string; slot: StorageSlot; value: string | null };

/** Raw value stored under `key`; `null` or `undefined` when absent. */
type EntryReader = (key: string) => string | null | undefined;

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

const LABEL = "[butr]";

const parseRecord = (raw: string | null | undefined, what: string) => {
  if (raw === null || raw === undefined || raw === "") {
    return {};
  }
  try {
    const parsed = recordSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : {};
  } catch (error) {
    logWarn(`${LABEL} failed to parse ${what} from storage:`, error);
    return {};
  }
};

const decodePool = (raw: string | null | undefined): StoredPoolRecord => {
  const result: StoredPoolRecord = {};
  for (const [key, value] of Object.entries(parseRecord(raw, "pool"))) {
    const entry = storedPoolEntrySchema.safeParse(value);
    if (entry.success && entry.data.connectorId === key) {
      result[key] = entry.data;
    } else {
      logWarn(`${LABEL} dropping invalid pool entry for ${key}`);
    }
  }
  return result;
};

const decodeSelection = (raw: string | null | undefined): StoredSelectionRecord => {
  const result: StoredSelectionRecord = {};
  for (const [key, value] of Object.entries(parseRecord(raw, "selection"))) {
    const platform = chainPlatformSchema.safeParse(key);
    if (platform.success && typeof value === "string" && value.length > 0) {
      result[platform.data] = value;
    }
  }
  return result;
};

const decodeActive = (raw: string | null | undefined): string | null =>
  raw === null || raw === undefined || raw === "" ? null : raw;

const encodeRecord = (record: StoredPoolRecord | StoredSelectionRecord): string | null =>
  Object.keys(record).length === 0 ? null : JSON.stringify(record);

/** What the shadow adapter needs to render `wallet` before its adapter exists. */
const toStoredPoolEntry = (wallet: ConnectedWallet): StoredPoolEntry => ({
  account: wallet.account,
  accounts: wallet.accounts,
  chainPlatform: wallet.connector.chainPlatform,
  connectorId: wallet.connector.id,
  icon: wallet.connector.icon,
  name: wallet.connector.name,
});

/**
 * The one wire format of `PersistedWalletState`, so a server read cannot
 * disagree with the client load (ADR 0003). Decoding drops corrupt entries and
 * never throws; reconcile resolves an active id the pool does not hold.
 */
const createWalletStateCodec = (keyPrefix?: string) => {
  const prefix = keyPrefix === undefined || keyPrefix === "" ? DEFAULT_KEY_PREFIX : keyPrefix;
  const keys = {
    active: `${prefix}-active`,
    pool: `${prefix}-pool`,
    selection: `${prefix}-selection`,
    userDisconnected: `${prefix}-user-disconnected`,
  };

  const encode = (state: PersistedWalletState): ReadonlyArray<StorageEntry> => [
    { key: keys.pool, slot: "persistent", value: encodeRecord(state.pool) },
    { key: keys.selection, slot: "persistent", value: encodeRecord(state.selection) },
    { key: keys.active, slot: "persistent", value: state.activeConnectorId },
    {
      key: keys.userDisconnected,
      slot: "session",
      value: state.isUserDisconnected ? "true" : null,
    },
  ];

  /** The persistent slot alone: everything a server can read from cookies. */
  const decodeSnapshot = (read: EntryReader): WalletSnapshot => ({
    activeConnectorId: decodeActive(read(keys.active)),
    pool: decodePool(read(keys.pool)),
    selection: decodeSelection(read(keys.selection)),
  });

  const decode = (read: EntryReader): PersistedWalletState => ({
    ...decodeSnapshot(read),
    isUserDisconnected: read(keys.userDisconnected) === "true",
  });

  return {
    decode,
    decodeSnapshot,
    encode,
    /** Every key the state occupies, with the slot that holds it. */
    layout: encode({
      activeConnectorId: null,
      isUserDisconnected: false,
      pool: {},
      selection: {},
    }).map(({ key, slot }) => ({ key, slot })),
  };
};

export type { StorageSlot };
export { createWalletStateCodec, toStoredPoolEntry };
