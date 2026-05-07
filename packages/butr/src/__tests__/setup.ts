import { vi } from "vitest";

const createMockStorage = (): Storage => {
  const store = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
    key: vi.fn((index: number) => {
      const keys = Array.from(store.keys());
      return keys[index] ?? null;
    }),
    get length() {
      return store.size;
    },
  };
};

if (typeof globalThis.window === "undefined") {
  Object.defineProperty(globalThis, "window", {
    value: {
      localStorage: createMockStorage(),
      sessionStorage: createMockStorage(),
    },
    writable: true,
    configurable: true,
  });
}

if (typeof globalThis.sessionStorage === "undefined") {
  Object.defineProperty(globalThis, "sessionStorage", {
    value: (globalThis.window as { sessionStorage: Storage }).sessionStorage,
    writable: true,
    configurable: true,
  });
}

if (typeof globalThis.localStorage === "undefined") {
  Object.defineProperty(globalThis, "localStorage", {
    value: (globalThis.window as { localStorage: Storage }).localStorage,
    writable: true,
    configurable: true,
  });
}
