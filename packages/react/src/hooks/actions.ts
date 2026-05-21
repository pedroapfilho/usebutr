import { useStore } from "zustand";

import { useWalletStoreContext } from "../context";

/**
 * Action hooks — dispatchers that mutate the wallet store. Each
 * returns a stable function reference (Zustand's `useStore` against
 * action selectors is identity-stable across renders), safe to pass
 * to event handlers or effects without `useCallback`.
 *
 * No reactive subscription beyond identity stability — these don't
 * re-render the component when store state changes. For reactive
 * reads, see `./selectors.ts`.
 */

/** Begin the connect flow for a connector id. Routes through the
 *  store's connect handler, which calls the connector's `connect()`,
 *  reads accounts, and writes the resulting `ConnectedWallet` into
 *  the pool. */
const useConnectWallet = () => {
  const store = useWalletStoreContext();
  return useStore(store, (state) => state.connectWallet);
};

const useDisconnectWallet = () => {
  const store = useWalletStoreContext();
  return useStore(store, (state) => state.disconnectWallet);
};

const useSetActiveConnector = () => {
  const store = useWalletStoreContext();
  return useStore(store, (state) => state.setActiveConnector);
};

const useSetSelection = () => {
  const store = useWalletStoreContext();
  return useStore(store, (state) => state.setSelection);
};

const useResetWallet = () => {
  const store = useWalletStoreContext();
  return useStore(store, (state) => state.reset);
};

const useUpdateWalletAccount = () => {
  const store = useWalletStoreContext();
  return useStore(store, (state) => state.updateWalletAccount);
};

const useRefreshWallet = () => {
  const store = useWalletStoreContext();
  return useStore(store, (state) => state.refreshWallet);
};

/**
 * Open the wallet's account-selection UI (if the connector supports it),
 * then re-read `getAccounts()` and update the pool entry's `accounts`
 * array. EVM wallets call `wallet_requestPermissions` under the hood;
 * Wallet Standard wallets that don't expose a picker just refresh.
 *
 * Consumers should hide the trigger when
 * `wallet.connector.requestAccounts` is undefined — the action still
 * resolves cleanly, but no picker will open.
 */
const useRequestAccounts = () => {
  const store = useWalletStoreContext();
  return useStore(store, (state) => state.requestAccounts);
};

/** Clear `connectionError` + reset `connectionStatus` to idle. Useful when
 *  surfacing an error in UI and giving the user a "dismiss" affordance. */
const useResetConnectionStatus = () => {
  const store = useWalletStoreContext();
  return useStore(store, (state) => state.resetConnectionStatus);
};

const useSetConnectionError = () => {
  const store = useWalletStoreContext();
  return useStore(store, (state) => state.setConnectionError);
};

export {
  useConnectWallet,
  useDisconnectWallet,
  useRefreshWallet,
  useRequestAccounts,
  useResetConnectionStatus,
  useResetWallet,
  useSetActiveConnector,
  useSetConnectionError,
  useSetSelection,
  useUpdateWalletAccount,
};
