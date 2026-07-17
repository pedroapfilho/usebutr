//   1. Connect EVM wallet (e.g. MetaMask via EIP-6963).
//   2. Connect SVM wallet (e.g. Phantom via Wallet Standard).
//   3. Reload.
//   4. Expect BOTH wallets restored.
//
// The reload step is simulated by tearing down the first store and
// creating a fresh one against the same WalletPersistence. SVM is
// modeled as a "late-registered" adapter; its createConnector
// returns null at hydration time and resolves later via
// tryRestoreFromPending, mirroring how @usebutr/wallets'
// DiscoverySubscriber drives the real auto-discovery path.

import { describe, expect, it, vi } from "vitest";

import { createMockAccount, createMockChain, createMockConnector } from "../../__tests__/helpers";
import { createMemoryStorageDriver, WalletStorage } from "../../storage";
import type { ConnectedWallet, WalletAdapter } from "../../types";
import { createWalletStore } from "../wallet-store";

const buildEvmAdapter = (): WalletAdapter => {
  const evmAccount = createMockAccount({
    chain: createMockChain({ id: "eip155:1", name: "Ethereum" }),
    id: "eip155:1:0xevmaddress",
    walletAddress: "0xevmaddress",
  });
  return createMockConnector({
    chainPlatform: "evm",
    getAccount: vi.fn().mockResolvedValue(evmAccount),
    id: "io.metamask",
    name: "MetaMask",
  });
};

const buildSvmAdapter = (): WalletAdapter => {
  const svmAccount = createMockAccount({
    chain: createMockChain({
      id: "solana:mainnet",
      name: "Solana Mainnet",
      namespace: "solana",
      reference: "mainnet",
    }),
    id: "solana:mainnet:SoLaNaAdDrEsS",
    walletAddress: "SoLaNaAdDrEsS",
  });
  return createMockConnector({
    chainPlatform: "svm",
    getAccount: vi.fn().mockResolvedValue(svmAccount),
    id: "phantom",
    name: "Phantom",
  });
};

const buildSharedStorage = () => {
  const driver = createMemoryStorageDriver();
  return new WalletStorage({
    keyPrefix: "butr-test",
    persistent: driver,
    session: driver,
  });
};

const collectConnected = async (
  store: ReturnType<typeof createWalletStore>,
): Promise<Array<ConnectedWallet>> => {
  for (let i = 0; i < 50; i += 1) {
    if (store.getState().isHydrated) {
      break;
    }
    // eslint-disable-next-line no-await-in-loop -- sequential polling: each iteration must wait before checking state again
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 10);
    });
  }
  return [...store.getState().pool.values()];
};

describe("multi-platform hydration (EVM + SVM)", () => {
  it("persists both wallets when connected in sequence", async () => {
    const storage = buildSharedStorage();
    const evmAdapter = buildEvmAdapter();
    const svmAdapter = buildSvmAdapter();
    const adapters = new Map<string, WalletAdapter>([
      [evmAdapter.id, evmAdapter],
      [svmAdapter.id, svmAdapter],
    ]);

    const store = createWalletStore({
      connectors: [],
      createConnector: (id) => adapters.get(id) ?? null,
      storage,
    });

    await store.getState().hydrateWallets();
    expect(store.getState().pool.size).toBe(0);

    await store.getState().connectWallet(evmAdapter.id);
    await store.getState().connectWallet(svmAdapter.id);
    expect(store.getState().pool.size).toBe(2);

    const persisted = await storage.getPool();
    expect(Object.keys(persisted).toSorted()).toEqual(["io.metamask", "phantom"]);
  });

  it("eagerly restores both wallets when both adapters are registered before hydration", async () => {
    const storage = buildSharedStorage();
    const evmAdapter = buildEvmAdapter();
    const svmAdapter = buildSvmAdapter();
    const adapters = new Map<string, WalletAdapter>([
      [evmAdapter.id, evmAdapter],
      [svmAdapter.id, svmAdapter],
    ]);

    const firstStore = createWalletStore({
      connectors: [],
      createConnector: (id) => adapters.get(id) ?? null,
      storage,
    });
    await firstStore.getState().hydrateWallets();
    await firstStore.getState().connectWallet(evmAdapter.id);
    await firstStore.getState().connectWallet(svmAdapter.id);

    const reloadedStore = createWalletStore({
      connectors: [],
      createConnector: (id) => adapters.get(id) ?? null,
      storage,
    });
    await reloadedStore.getState().hydrateWallets();

    const connected = await collectConnected(reloadedStore);
    const ids = connected.map((w) => w.connector.id).toSorted();
    expect(ids).toEqual(["io.metamask", "phantom"]);
  });

  it("restores SVM wallet via tryRestoreFromPending when its adapter arrives late", async () => {
    const storage = buildSharedStorage();
    const evmAdapter = buildEvmAdapter();
    const svmAdapter = buildSvmAdapter();

    const firstAdapters = new Map<string, WalletAdapter>([
      [evmAdapter.id, evmAdapter],
      [svmAdapter.id, svmAdapter],
    ]);
    const firstStore = createWalletStore({
      connectors: [],
      createConnector: (id) => firstAdapters.get(id) ?? null,
      storage,
    });
    await firstStore.getState().hydrateWallets();
    await firstStore.getState().connectWallet(evmAdapter.id);
    await firstStore.getState().connectWallet(svmAdapter.id);

    // Stage 2: simulated reload. ONLY the EVM adapter is registered at
    // hydration time; SVM is announced after a delay, mirroring the
    // real `@wallet-standard/app` dynamic-import timing.
    const lateAdapters = new Map<string, WalletAdapter>([[evmAdapter.id, evmAdapter]]);
    const reloadedStore = createWalletStore({
      connectors: [],
      createConnector: (id) => lateAdapters.get(id) ?? null,
      storage,
    });
    await reloadedStore.getState().hydrateWallets();

    expect([...reloadedStore.getState().pool.keys()]).toEqual(["io.metamask"]);

    lateAdapters.set(svmAdapter.id, svmAdapter);
    await reloadedStore.getState().tryRestoreFromPending(svmAdapter.id);

    const connected = await collectConnected(reloadedStore);
    const ids = connected.map((w) => w.connector.id).toSorted();
    expect(ids).toEqual(["io.metamask", "phantom"]);
  });

  it("preserves entries added by CONNECT_SUCCEEDED that races with HYDRATED (regression: HYDRATED merges, not replaces)", async () => {
    // Reproduces the user-reported "only one chain per wallet auto-connects"
    // bug. Setup: hydrate parks SVM, awaits EVM restores. While waiting,
    // a late-restore via tryRestoreFromPending dispatches CONNECT_SUCCEEDED
    // for an SVM entry, putting it in state.pool. Then HYDRATED fires with
    // event.pool containing only EVM. The reducer must MERGE, not REPLACE.
    const storage = buildSharedStorage();
    const evmAdapter = buildEvmAdapter();
    const svmAdapter = buildSvmAdapter();

    const seedAdapters = new Map<string, WalletAdapter>([
      [evmAdapter.id, evmAdapter],
      [svmAdapter.id, svmAdapter],
    ]);
    const seedStore = createWalletStore({
      connectors: [],
      createConnector: (id) => seedAdapters.get(id) ?? null,
      storage,
    });
    await seedStore.getState().hydrateWallets();
    await seedStore.getState().connectWallet(evmAdapter.id);
    await seedStore.getState().connectWallet(svmAdapter.id);

    const lateAdapters = new Map<string, WalletAdapter>([[evmAdapter.id, evmAdapter]]);
    const reloadedStore = createWalletStore({
      connectors: [],
      createConnector: (id) => lateAdapters.get(id) ?? null,
      storage,
    });

    const hydratePromise = reloadedStore.getState().hydrateWallets();
    await Promise.resolve();
    lateAdapters.set(svmAdapter.id, svmAdapter);
    await reloadedStore.getState().tryRestoreFromPending(svmAdapter.id);
    await hydratePromise;

    const ids = [...reloadedStore.getState().pool.keys()].toSorted();
    expect(ids).toEqual(["io.metamask", "phantom"]);
  });

  it("restores EVM wallet via tryRestoreFromPending when its adapter arrives late (inverse race)", async () => {
    // Less common (usually EIP-6963 is fast) but provable in principle.
    const storage = buildSharedStorage();
    const evmAdapter = buildEvmAdapter();
    const svmAdapter = buildSvmAdapter();

    const firstAdapters = new Map<string, WalletAdapter>([
      [evmAdapter.id, evmAdapter],
      [svmAdapter.id, svmAdapter],
    ]);
    const firstStore = createWalletStore({
      connectors: [],
      createConnector: (id) => firstAdapters.get(id) ?? null,
      storage,
    });
    await firstStore.getState().hydrateWallets();
    await firstStore.getState().connectWallet(evmAdapter.id);
    await firstStore.getState().connectWallet(svmAdapter.id);

    const lateAdapters = new Map<string, WalletAdapter>([[svmAdapter.id, svmAdapter]]);
    const reloadedStore = createWalletStore({
      connectors: [],
      createConnector: (id) => lateAdapters.get(id) ?? null,
      storage,
    });
    await reloadedStore.getState().hydrateWallets();

    expect([...reloadedStore.getState().pool.keys()]).toEqual(["phantom"]);

    lateAdapters.set(evmAdapter.id, evmAdapter);
    await reloadedStore.getState().tryRestoreFromPending(evmAdapter.id);

    const connected = await collectConnected(reloadedStore);
    const ids = connected.map((w) => w.connector.id).toSorted();
    expect(ids).toEqual(["io.metamask", "phantom"]);
  });
});
