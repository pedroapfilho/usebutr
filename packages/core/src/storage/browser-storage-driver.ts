import type { StorageDriver } from "./persistence";

type BrowserStorageDrivers = {
  /** Survives app restart (localStorage on web, AsyncStorage/MMKV on RN). */
  persistent: StorageDriver;
  /** Cleared when the app session ends (sessionStorage on web, in-memory on RN). */
  session: StorageDriver;
};

type WebStorageKind = "localStorage" | "sessionStorage";

const webStorageGlobals: Partial<Pick<typeof globalThis, WebStorageKind>> = globalThis;

const hasWebStorage = (kind: WebStorageKind): boolean => {
  try {
    return kind === "localStorage"
      ? webStorageGlobals.localStorage !== undefined
      : webStorageGlobals.sessionStorage !== undefined;
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
    getItem: (key) => storage.getItem(key),
    removeItem(key) {
      storage.removeItem(key);
    },
    setItem(key, value) {
      storage.setItem(key, value);
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
