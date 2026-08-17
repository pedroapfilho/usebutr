import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StorageDriver } from "@usebutr/core";

/**
 * AsyncStorage has no session-scoped equivalent, so backing butr's session
 * store with it leaks entries across launches. Harmless here: butr only keeps
 * the active-connector id in session storage, overwritten on next connect.
 */
const asyncStorageDriver: StorageDriver = {
  getItem: (key) => AsyncStorage.getItem(key),
  removeItem: (key) => AsyncStorage.removeItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
};

export { asyncStorageDriver };
