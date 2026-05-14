import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StorageDriver } from "@butr/core";

/**
 * AsyncStorage-backed `StorageDriver` for React Native / Expo. The
 * butr storage layer is happy with any get/set/remove driver; on web
 * it defaults to localStorage, on native we route everything through
 * AsyncStorage.
 *
 * Persistent storage survives app restart on both Android (SharedPreferences/
 * SQLite) and iOS (native serialization). Session storage has no true
 * AsyncStorage equivalent, so we namespace session keys under
 * `butr-session::` and rely on a startup sweep to purge them. For this
 * demo we just back both drivers with the same store — session entries
 * will outlive the session but that's harmless given butr's session
 * storage only holds the active-connector id which gets overwritten
 * on the next connect anyway.
 */
const asyncStorageDriver: StorageDriver = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};

export { asyncStorageDriver };
