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
