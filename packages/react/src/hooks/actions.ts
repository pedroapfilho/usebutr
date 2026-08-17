import { useStore } from "zustand";

import { useWalletStoreContext } from "../context";

/**
 * Every hook here returns an identity-stable reference, so passing one to an
 * effect or handler needs no `useCallback`, and none of them re-render on
 * store changes.
 */

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
 * Opens the wallet's account picker, then refreshes the pool entry's accounts.
 * Wallet Standard wallets without a picker only refresh, so hide the trigger
 * when `wallet.connector.requestAccounts` is undefined.
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
