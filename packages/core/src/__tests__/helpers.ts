import { vi } from "vitest";

import { EVM_CHAINS, SVM_CHAINS } from "../chains";
import type { PersistedWalletState, StorageDriver } from "../storage/persistence";
import type {
  Account,
  ConnectedWallet,
  ConnectorEvent,
  EvmAdapter,
  SvmAdapter,
  WalletAdapter,
  WalletManagerConfig,
} from "../types";
import { buildAccount } from "../types";
import type { WalletSource } from "../wallet-source";

const ETHEREUM = EVM_CHAINS.ethereum;
const SOLANA = SVM_CHAINS.mainnet;

/** Typed so `vi.fn<Callbacks["onConnect"]>()` satisfies strict void returns. */
type Callbacks = Required<WalletManagerConfig>;

type TestControls = {
  /** Delivers `event` to every live `subscribe` listener. */
  emit: (event: ConnectorEvent) => void;
  listenerCount: () => number;
};

type TestAdapterOptions = {
  /** What `getAccounts` resolves; one account derived from the id otherwise. */
  accounts?: ReadonlyArray<Account>;
};

const createListeners = () => {
  const listeners = new Set<(event: ConnectorEvent) => void>();
  return {
    emit: (event: ConnectorEvent) => {
      for (const listener of listeners) {
        listener(event);
      }
    },
    listenerCount: () => listeners.size,
    subscribe: vi.fn((listener: (event: ConnectorEvent) => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }),
  };
};

/** A minimal EVM adapter whose members are spies. `overrides` replace
 *  members; `undefined` removes an optional one. */
const evmAdapter = (
  id: string,
  options: TestAdapterOptions & Partial<EvmAdapter> = {},
): EvmAdapter & TestControls => {
  const { accounts, ...overrides } = options;
  const exposed = accounts ?? [buildAccount(`0x${id}`, ETHEREUM)];
  const events = createListeners();
  const adapter: EvmAdapter = {
    chainPlatform: "evm",
    connect: vi.fn(() => Promise.resolve()),
    disconnect: vi.fn(() => Promise.resolve()),
    getAccounts: vi.fn(() => Promise.resolve(exposed)),
    getSigner: vi.fn(() => Promise.reject(new Error("core tests register no signer"))),
    id,
    name: `${id} wallet`,
    subscribe: events.subscribe,
    ...overrides,
  };
  return Object.assign(adapter, { emit: events.emit, listenerCount: events.listenerCount });
};

const svmAdapter = (
  id: string,
  options: TestAdapterOptions & Partial<SvmAdapter> = {},
): SvmAdapter & TestControls => {
  const { accounts, ...overrides } = options;
  const exposed = accounts ?? [buildAccount(`So1${id}`, SOLANA)];
  const events = createListeners();
  const adapter: SvmAdapter = {
    chainPlatform: "svm",
    connect: vi.fn(() => Promise.resolve()),
    disconnect: vi.fn(() => Promise.resolve()),
    getAccounts: vi.fn(() => Promise.resolve(exposed)),
    getSigner: vi.fn(() => Promise.reject(new Error("core tests register no signer"))),
    id,
    name: `${id} wallet`,
    subscribe: events.subscribe,
    ...overrides,
  };
  return Object.assign(adapter, { emit: events.emit, listenerCount: events.listenerCount });
};

/** A pool entry for `adapter`, active account first. */
const walletOf = (
  adapter: WalletAdapter,
  accounts: ReadonlyArray<Account> = [
    buildAccount(
      adapter.chainPlatform === "svm" ? `So1${adapter.id}` : `0x${adapter.id}`,
      adapter.chainPlatform === "svm" ? SOLANA : ETHEREUM,
    ),
  ],
): ConnectedWallet => {
  const [account] = accounts;
  if (account === undefined) {
    throw new Error("walletOf needs at least one account");
  }
  return { account, accounts, connector: adapter };
};

/** Announces every adapter synchronously on subscribe, so they are
 *  registered before hydration reads storage. */
const staticSource =
  (...adapters: ReadonlyArray<WalletAdapter>): WalletSource =>
  (onAdapter) => {
    for (const adapter of adapters) {
      onAdapter(adapter);
    }
    return () => {};
  };

/** A source the test drives: `announce` registers an adapter whenever the
 *  test decides, as a late-injected extension would. */
const createManualSource = () => {
  let listener: ((adapter: WalletAdapter) => void) | null = null;
  const unsubscribe = vi.fn(() => {
    listener = null;
  });
  const source = vi.fn<WalletSource>((onAdapter) => {
    listener = onAdapter;
    return unsubscribe;
  });
  return {
    announce: (adapter: WalletAdapter) => {
      listener?.(adapter);
    },
    source,
    unsubscribe,
  };
};

const EMPTY_PERSISTED: PersistedWalletState = {
  activeConnectorId: null,
  isUserDisconnected: false,
  pool: {},
  selection: {},
};

/** A plain in-memory `WalletPersistence` that records every save. */
const createMemoryPersistence = (seed: Partial<PersistedWalletState> = {}) => {
  let current: PersistedWalletState = { ...EMPTY_PERSISTED, ...seed };
  const saves: Array<PersistedWalletState> = [];
  return {
    load: vi.fn(() => Promise.resolve(current)),
    save: vi.fn((state: PersistedWalletState) => {
      saves.push(state);
      current = state;
      return Promise.resolve();
    }),
    saves,
  };
};

const createSyncDriver = (): StorageDriver & { entries: Map<string, string> } => {
  const entries = new Map<string, string>();
  return {
    entries,
    getItem: vi.fn((key: string) => entries.get(key) ?? null),
    removeItem: vi.fn((key: string) => {
      entries.delete(key);
    }),
    setItem: vi.fn((key: string, value: string) => {
      entries.set(key, value);
    }),
  };
};

/** AsyncStorage-shaped: every call settles on a later microtask. */
const createAsyncDriver = (): StorageDriver & { entries: Map<string, string> } => {
  const entries = new Map<string, string>();
  return {
    entries,
    getItem: vi.fn((key: string) => Promise.resolve(entries.get(key) ?? null)),
    removeItem: vi.fn((key: string) => {
      entries.delete(key);
      return Promise.resolve();
    }),
    setItem: vi.fn((key: string, value: string) => {
      entries.set(key, value);
      return Promise.resolve();
    }),
  };
};

/** Resolves the error `promise` rejects with, so a test can inspect it. */
const rejectionOf = async (promise: Promise<unknown>): Promise<Error> => {
  try {
    await promise;
  } catch (error) {
    if (error instanceof Error) {
      return error;
    }
    throw error;
  }
  throw new Error("expected a rejection");
};

/** A promise the test settles by hand, e.g. a wallet that answers late. */
const createGate = () => {
  const { promise, resolve } = Promise.withResolvers<undefined>();
  return {
    open: () => {
      resolve(undefined);
    },
    promise,
  };
};

/** Lets every queued microtask and zero-delay timer run. */
const flush = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });

export type { Callbacks };
export {
  createAsyncDriver,
  createGate,
  createManualSource,
  createMemoryPersistence,
  createSyncDriver,
  EMPTY_PERSISTED,
  ETHEREUM,
  evmAdapter,
  flush,
  rejectionOf,
  SOLANA,
  staticSource,
  svmAdapter,
  walletOf,
};
