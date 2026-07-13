import { vi } from "vitest";

const createMockStorage = (): Storage => {
  const store = new Map<string, string>();
  return {
    clear: vi.fn(() => {
      store.clear();
    }),
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    key: vi.fn((index: number) => {
      const keys = [...store.keys()];
      return keys[index] ?? null;
    }),
    get length() {
      return store.size;
    },
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
  };
};

if (globalThis.window === undefined) {
  const localStorage = createMockStorage();
  const sessionStorage = createMockStorage();

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { localStorage, sessionStorage },
    writable: true,
  });

  // Newer Node ships native globalThis.sessionStorage (Web Storage), so a
  // `=== undefined` guard would leave the storage driver on the native storage
  // while tests spy on the window mock. Alias unconditionally so both are the
  // same object regardless of Node version.
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: localStorage,
    writable: true,
  });

  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: sessionStorage,
    writable: true,
  });
}
