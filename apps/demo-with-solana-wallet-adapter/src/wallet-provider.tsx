import {
  createContext,
  use,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { WalletAdapter, WalletManagerConfig } from "@butr/core";
import { WalletManagerProvider, useWalletStoreContext } from "@butr/react";
import { discoverSvmAdapters } from "@butr/svm";

// SVM-only manual wiring. Same pattern as the EVM demos but with
// `discoverSvmAdapters` from @butr/svm. No EVM bundle in this demo.

const EMPTY_DISCOVERED: ReadonlyArray<WalletAdapter> = [];
const DiscoveredSvmWalletsContext = createContext<ReadonlyArray<WalletAdapter>>(EMPTY_DISCOVERED);

const DiscoverySubscriber = ({
  adapters,
  setDiscoveredList,
}: {
  adapters: Map<string, WalletAdapter>;
  setDiscoveredList: (
    next: (prev: ReadonlyArray<WalletAdapter>) => ReadonlyArray<WalletAdapter>,
  ) => void;
}) => {
  const store = useWalletStoreContext();
  useEffect(() => {
    const unsubscribe = discoverSvmAdapters((adapter) => {
      if (adapters.has(adapter.id)) {
        return;
      }
      adapters.set(adapter.id, adapter);
      setDiscoveredList((prev) => [...prev, adapter]);
      void store.getState()._tryRestoreFromPending(adapter.id);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [adapters] = useState<Map<string, WalletAdapter>>(() => new Map());
  const [discoveredList, setDiscoveredList] =
    useState<ReadonlyArray<WalletAdapter>>(EMPTY_DISCOVERED);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const config = useMemo<WalletManagerConfig>(
    () => ({
      connectors: [],
      createConnector: (id) => adapters.get(id) ?? null,
      storageKeyPrefix: "butr-solana-wallet-adapter-demo",
    }),
    [],
  );

  return (
    <WalletManagerProvider config={config}>
      <DiscoverySubscriber adapters={adapters} setDiscoveredList={setDiscoveredList} />
      <DiscoveredSvmWalletsContext.Provider value={discoveredList}>
        {children}
      </DiscoveredSvmWalletsContext.Provider>
    </WalletManagerProvider>
  );
};

const useDiscoveredWallets = (): ReadonlyArray<WalletAdapter> =>
  use(DiscoveredSvmWalletsContext);

export { WalletProvider, useDiscoveredWallets };
