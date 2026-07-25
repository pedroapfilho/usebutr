import type { StorageDriver } from "./persistence";

type BrowserStorageDrivers = {
  /** Survives app restart (localStorage on web, AsyncStorage/MMKV on RN). */
  persistent: StorageDriver;
  /** Cleared when the app session ends (sessionStorage on web, in-memory on RN). */
  session: StorageDriver;
};

type WebStorageKind = "localStorage" | "sessionStorage";

const hasWebStorage = (kind: WebStorageKind): boolean => {
  try {
    return (
      typeof globalThis !== "undefined" &&
      (globalThis as Record<string, unknown>)[kind] !== undefined
    );
  } catch {
    return false;
  }
};

const createMemoryStorageDriver = (): StorageDriver => {
  const memory = new Map<string, string>();
  return {
    getItem(key) {
      return memory.get(key) ?? null;
    },
    removeItem(key) {
      memory.delete(key);
    },
    setItem(key, value) {
      memory.set(key, value);
    },
  };
};

const createWebStorageDriver = (kind: WebStorageKind): StorageDriver => {
  if (!hasWebStorage(kind)) {
    return createMemoryStorageDriver();
  }

  const storage = kind === "localStorage" ? globalThis.localStorage : globalThis.sessionStorage;

  return {
    getItem(key) {
      try {
        return storage.getItem(key);
      } catch {
        return null;
      }
    },
    removeItem(key) {
      try {
        storage.removeItem(key);
      } catch {
        void 0;
      }
    },
    setItem(key, value) {
      try {
        storage.setItem(key, value);
      } catch {
        void 0;
      }
    },
  };
};

/**
 * Default storage drivers for web. `persistent` wraps `localStorage`,
 * `session` wraps `sessionStorage`. Both fall back to in-memory maps
 * when the global isn't available (SSR, non-browser environments).
 */
const createBrowserStorageDriver = (): BrowserStorageDrivers => ({
  persistent: createWebStorageDriver("localStorage"),
  session: createWebStorageDriver("sessionStorage"),
});

export type { BrowserStorageDrivers };
export { createBrowserStorageDriver, createMemoryStorageDriver };
