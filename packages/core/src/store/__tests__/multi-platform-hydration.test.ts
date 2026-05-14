// Reproduces the user-reported scenario:
//   1. Connect EVM wallet (e.g. MetaMask via EIP-6963).
//   2. Connect SVM wallet (e.g. Phantom via Wallet Standard).
//   3. Reload.
//   4. Expect BOTH wallets restored.
//
// The reload step is simulated by tearing down the first store and
// creating a fresh one against the same WalletPersistence. SVM is
// modeled as a "late-registered" adapter — its createConnector
// returns null at hydration time and resolves later via
// _tryRestoreFromPending, mirroring how @butr/wallets'
// DiscoverySubscriber drives the real auto-discovery path.

import { describe, expect, it, vi } from "vitest";
import { createMemoryStorageDriver, WalletStorage } from "../../storage";
import { createWalletStore } from "../wallet-store";
import type { ConnectedWallet, WalletAdapter } from "../../types";
import { createMockAccount, createMockChain, createMockConnector } from "../../__tests__/helpers";

const buildEvmAdapter = (): WalletAdapter =>
  createMockConnector({
    id: "io.metamask",
    name: "MetaMask",
    chainPlatform: "evm",
    getAccount: vi.fn().mockResolvedValue(
      createMockAccount({
        chain: createMockChain({ id: "eip155:1", name: "Ethereum" }),
        walletAddress: "0xevmaddress",
        id: "eip155:1:0xevmaddress",
      }),
    ),
  });

const buildSvmAdapter = (): WalletAdapter =>
  createMockConnector({
    id: "phantom",
    name: "Phantom",
    chainPlatform: "svm",
    getAccount: vi.fn().mockResolvedValue(
      createMockAccount({
        chain: createMockChain({
          id: "solana:mainnet",
          name: "Solana Mainnet",
          namespace: "solana",
          reference: "mainnet",
        }),
        walletAddress: "SoLaNaAdDrEsS",
        id: "solana:mainnet:SoLaNaAdDrEsS",
      }),
    ),
  });

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
  // Wait for hydration to finish (it's async after store creation).
  for (let i = 0; i < 50; i += 1) {
    if (store.getState().isHydrated) break;
    await new Promise((resolve) => setTimeout(resolve, 10));
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

    await store.getState()._hydrateWallets();
    expect(store.getState().pool.size).toBe(0);

    await store.getState().connectWallet(evmAdapter.id);
    await store.getState().connectWallet(svmAdapter.id);
    expect(store.getState().pool.size).toBe(2);

    // Verify it persisted both — sanity check before the reload step.
    const persisted = await storage.getPool();
    expect(Object.keys(persisted).sort()).toEqual(["io.metamask", "phantom"]);
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
    await firstStore.getState()._hydrateWallets();
    await firstStore.getState().connectWallet(evmAdapter.id);
    await firstStore.getState().connectWallet(svmAdapter.id);

    // Simulate reload — fresh store, same storage, both adapters
    // already in the Map (best-case timing for the eager path).
    const reloadedStore = createWalletStore({
      connectors: [],
      createConnector: (id) => adapters.get(id) ?? null,
      storage,
    });
    await reloadedStore.getState()._hydrateWallets();

    const connected = await collectConnected(reloadedStore);
    const ids = connected.map((w) => w.connector.id).sort();
    expect(ids).toEqual(["io.metamask", "phantom"]);
  });

  it("restores SVM wallet via _tryRestoreFromPending when its adapter arrives late", async () => {
    const storage = buildSharedStorage();
    const evmAdapter = buildEvmAdapter();
    const svmAdapter = buildSvmAdapter();

    // Stage 1: both connected during the initial session.
    const firstAdapters = new Map<string, WalletAdapter>([
      [evmAdapter.id, evmAdapter],
      [svmAdapter.id, svmAdapter],
    ]);
    const firstStore = createWalletStore({
      connectors: [],
      createConnector: (id) => firstAdapters.get(id) ?? null,
      storage,
    });
    await firstStore.getState()._hydrateWallets();
    await firstStore.getState().connectWallet(evmAdapter.id);
    await firstStore.getState().connectWallet(svmAdapter.id);

    // Stage 2: simulated reload. ONLY the EVM adapter is registered at
    // hydration time — SVM is announced after a delay, mirroring the
    // real `@wallet-standard/app` dynamic-import timing.
    const lateAdapters = new Map<string, WalletAdapter>([[evmAdapter.id, evmAdapter]]);
    const reloadedStore = createWalletStore({
      connectors: [],
      createConnector: (id) => lateAdapters.get(id) ?? null,
      storage,
    });
    await reloadedStore.getState()._hydrateWallets();

    // After hydration: EVM restored eagerly, SVM parked.
    expect([...reloadedStore.getState().pool.keys()]).toEqual(["io.metamask"]);

    // Simulate the discovery callback firing for SVM.
    lateAdapters.set(svmAdapter.id, svmAdapter);
    await reloadedStore.getState()._tryRestoreFromPending(svmAdapter.id);

    const connected = await collectConnected(reloadedStore);
    const ids = connected.map((w) => w.connector.id).sort();
    expect(ids).toEqual(["io.metamask", "phantom"]);
  });

  it("preserves entries added by CONNECT_SUCCEEDED that races with HYDRATED (regression: HYDRATED merges, not replaces)", async () => {
    // Reproduces the user-reported "only one chain per wallet auto-connects"
    // bug. Setup: hydrate parks SVM, awaits EVM restores. While waiting,
    // a late-restore via _tryRestoreFromPending dispatches CONNECT_SUCCEEDED
    // for an SVM entry, putting it in state.pool. Then HYDRATED fires with
    // event.pool containing only EVM. The reducer must MERGE, not REPLACE.
    const storage = buildSharedStorage();
    const evmAdapter = buildEvmAdapter();
    const svmAdapter = buildSvmAdapter();

    // Seed storage with both entries via a first session.
    const seedAdapters = new Map<string, WalletAdapter>([
      [evmAdapter.id, evmAdapter],
      [svmAdapter.id, svmAdapter],
    ]);
    const seedStore = createWalletStore({
      connectors: [],
      createConnector: (id) => seedAdapters.get(id) ?? null,
      storage,
    });
    await seedStore.getState()._hydrateWallets();
    await seedStore.getState().connectWallet(evmAdapter.id);
    await seedStore.getState().connectWallet(svmAdapter.id);

    // Simulated reload. At first only EVM is registered; SVM arrives
    // during the await window. The order is deterministic in this test
    // because we drive it manually.
    const lateAdapters = new Map<string, WalletAdapter>([[evmAdapter.id, evmAdapter]]);
    const reloadedStore = createWalletStore({
      connectors: [],
      createConnector: (id) => lateAdapters.get(id) ?? null,
      storage,
    });

    // Race: kick off hydrate, then before it dispatches HYDRATED,
    // simulate the SVM adapter arriving + late-restore firing.
    const hydratePromise = reloadedStore.getState()._hydrateWallets();
    // Yield once to let hydrate's await Promise.all begin.
    await Promise.resolve();
    lateAdapters.set(svmAdapter.id, svmAdapter);
    await reloadedStore.getState()._tryRestoreFromPending(svmAdapter.id);
    await hydratePromise;

    // Both entries must be in the final pool.
    const ids = [...reloadedStore.getState().pool.keys()].sort();
    expect(ids).toEqual(["io.metamask", "phantom"]);
  });

  it("restores EVM wallet via _tryRestoreFromPending when its adapter arrives late (inverse race)", async () => {
    // Less common — usually EIP-6963 is fast — but provable in principle.
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
    await firstStore.getState()._hydrateWallets();
    await firstStore.getState().connectWallet(evmAdapter.id);
    await firstStore.getState().connectWallet(svmAdapter.id);

    const lateAdapters = new Map<string, WalletAdapter>([[svmAdapter.id, svmAdapter]]);
    const reloadedStore = createWalletStore({
      connectors: [],
      createConnector: (id) => lateAdapters.get(id) ?? null,
      storage,
    });
    await reloadedStore.getState()._hydrateWallets();

    expect([...reloadedStore.getState().pool.keys()]).toEqual(["phantom"]);

    lateAdapters.set(evmAdapter.id, evmAdapter);
    await reloadedStore.getState()._tryRestoreFromPending(evmAdapter.id);

    const connected = await collectConnected(reloadedStore);
    const ids = connected.map((w) => w.connector.id).sort();
    expect(ids).toEqual(["io.metamask", "phantom"]);
  });
});
