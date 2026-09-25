import { act, renderHook } from "@testing-library/react";
import type {
  PersistedWalletState,
  StoredPoolEntry,
  WalletAdapter,
  WalletManagerConfig,
  WalletSnapshot,
  WalletSource,
} from "@usebutr/core";
import type { FakeConnectedWallet } from "@usebutr/testing";
import { createFakePersistence } from "@usebutr/testing";
import type { PropsWithChildren } from "react";

import { useWalletManager, WalletManagerProvider } from "../context";

/** Announces every adapter synchronously, so they are registered before
 *  hydration reads storage. */
const staticSource =
  (...adapters: ReadonlyArray<WalletAdapter>): WalletSource =>
  (onAdapter) => {
    for (const adapter of adapters) {
      onAdapter(adapter);
    }
    return () => {};
  };

type Setup = {
  adapters?: ReadonlyArray<WalletAdapter>;
  config?: WalletManagerConfig;
  initialState?: WalletSnapshot;
  persisted?: Partial<PersistedWalletState>;
};

/** Renders `hook` under a provider, next to the manager it binds to. */
const renderWithManager = <T,>(hook: () => T, setup: Setup = {}) => {
  const persistence = createFakePersistence(setup.persisted);
  const config: WalletManagerConfig = {
    sources: [staticSource(...(setup.adapters ?? []))],
    storage: persistence,
    ...setup.config,
  };
  const Wrapper = ({ children }: PropsWithChildren) => (
    <WalletManagerProvider config={config} initialState={setup.initialState}>
      {children}
    </WalletManagerProvider>
  );
  const view = renderHook(() => ({ manager: useWalletManager(), value: hook() }), {
    wrapper: Wrapper,
  });
  return { ...view, persistence };
};

/** Lets hydration and every pending wallet promise settle inside `act`. */
const settle = () =>
  act(async () => {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });
  });

const storedEntryOf = (wallet: FakeConnectedWallet<"evm">): StoredPoolEntry => ({
  account: wallet.account,
  accounts: wallet.accounts,
  chainPlatform: wallet.connector.chainPlatform,
  connectorId: wallet.connector.id,
  name: wallet.connector.name,
});

export { renderWithManager, settle, staticSource, storedEntryOf };
