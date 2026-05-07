import { vi } from "vitest";
import type {
  Account,
  ChainBase,
  ChainPlatform,
  UIConnector,
  WalletManagerConfig,
} from "../types";
import type { StorageDriver } from "../storage/persistence";

const createMockChain = (overrides?: Partial<ChainBase>): ChainBase => ({
  id: "eip155:1",
  namespace: "eip155",
  reference: "1",
  name: "Ethereum",
  ...overrides,
});

const createMockAccount = (overrides?: Partial<Account>): Account => ({
  chain: createMockChain(),
  walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
  id: "mock-account-id",
  ...overrides,
});

const createMockConnector = (
  overrides?: Partial<UIConnector>,
): UIConnector => ({
  id: "mock-connector",
  name: "Mock Wallet",
  chainPlatform: "evm" as ChainPlatform,
  connect: vi.fn().mockResolvedValue(undefined),
  disconnect: vi.fn().mockResolvedValue(undefined),
  getAccount: vi.fn().mockResolvedValue(createMockAccount()),
  switchChain: vi.fn().mockResolvedValue(undefined),
  getSigner: vi.fn().mockResolvedValue({}),
  signMessage: vi.fn().mockResolvedValue(new Uint8Array()),
  sendTx: vi.fn().mockResolvedValue("0xtxhash"),
  sendTxToChain: vi.fn().mockResolvedValue("0xtxhash"),
  getTransactionReceipt: vi
    .fn()
    .mockResolvedValue({ status: "Success" as const }),
  getBalance: vi.fn().mockResolvedValue({
    value: BigInt(0),
    decimals: 18,
    symbol: "ETH",
    formatted: "0",
  }),
  ...overrides,
});

const createMockStorageDriver = (): StorageDriver => {
  const store = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
  };
};

/** Returns an async driver backed by a Map. Each call defers via
 *  Promise.resolve to simulate AsyncStorage-like behavior. */
const createAsyncMockStorageDriver = (): StorageDriver => {
  const store = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve();
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
      return Promise.resolve();
    }),
  };
};

const createMockStoragePair = () => ({
  persistent: createMockStorageDriver(),
  session: createMockStorageDriver(),
});

const createMockConfig = (
  overrides?: Partial<WalletManagerConfig>,
): WalletManagerConfig => ({
  connectors: [],
  createConnector: vi.fn().mockReturnValue(createMockConnector()),
  ...overrides,
});

export {
  createAsyncMockStorageDriver,
  createMockAccount,
  createMockChain,
  createMockConfig,
  createMockConnector,
  createMockStorageDriver,
  createMockStoragePair,
};
