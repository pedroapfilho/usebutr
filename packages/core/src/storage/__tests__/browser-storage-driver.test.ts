import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createBrowserStorageDriver, createMemoryStorageDriver } from "../browser-storage-driver";

describe("createMemoryStorageDriver", () => {
  it("sets and gets values", async () => {
    const driver = createMemoryStorageDriver();
    await driver.setItem("key", "value");
    expect(driver.getItem("key")).toBe("value");
  });

  it("returns null for missing keys", () => {
    const driver = createMemoryStorageDriver();
    expect(driver.getItem("nonexistent")).toBeNull();
  });

  it("removes items", async () => {
    const driver = createMemoryStorageDriver();
    await driver.setItem("key", "value");
    await driver.removeItem("key");
    expect(driver.getItem("key")).toBeNull();
  });

  it("isolates memory between instances", async () => {
    const a = createMemoryStorageDriver();
    const b = createMemoryStorageDriver();
    await a.setItem("key", "a");
    expect(b.getItem("key")).toBeNull();
  });
});

describe("createBrowserStorageDriver", () => {
  describe("when no web storage is available (SSR)", () => {
    let originalWindow: typeof globalThis.window;
    let originalLocalStorage: typeof globalThis.localStorage;
    let originalSessionStorage: typeof globalThis.sessionStorage;

    beforeEach(() => {
      originalWindow = globalThis.window;
      originalLocalStorage = globalThis.localStorage;
      originalSessionStorage = globalThis.sessionStorage;
      // @ts-expect-error -- simulating SSR
      globalThis.window = undefined;
      // @ts-expect-error -- simulating SSR
      globalThis.localStorage = undefined;
      // @ts-expect-error -- simulating SSR
      globalThis.sessionStorage = undefined;
    });

    afterEach(() => {
      globalThis.window = originalWindow;
      globalThis.localStorage = originalLocalStorage;
      globalThis.sessionStorage = originalSessionStorage;
    });

    it("falls back to in-memory for both drivers", async () => {
      const { persistent, session } = createBrowserStorageDriver();

      await persistent.setItem("p", "v");
      expect(persistent.getItem("p")).toBe("v");

      await session.setItem("s", "v");
      expect(session.getItem("s")).toBe("v");
    });

    it("keeps persistent and session memory isolated", async () => {
      const { persistent, session } = createBrowserStorageDriver();
      await persistent.setItem("key", "persistent");
      await session.setItem("key", "session");

      expect(persistent.getItem("key")).toBe("persistent");
      expect(session.getItem("key")).toBe("session");
    });
  });

  describe("when web storage is available", () => {
    it("delegates persistent.getItem to localStorage", () => {
      const spy = vi.spyOn(window.localStorage, "getItem").mockReturnValue("stored");
      const { persistent } = createBrowserStorageDriver();

      expect(persistent.getItem("key")).toBe("stored");
      expect(spy).toHaveBeenCalledWith("key");
      spy.mockRestore();
    });

    it("delegates session.getItem to sessionStorage", () => {
      const spy = vi.spyOn(window.sessionStorage, "getItem").mockReturnValue("s-stored");
      const { session } = createBrowserStorageDriver();

      expect(session.getItem("key")).toBe("s-stored");
      expect(spy).toHaveBeenCalledWith("key");
      spy.mockRestore();
    });

    it("delegates persistent.setItem to localStorage", async () => {
      const spy = vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {});
      const { persistent } = createBrowserStorageDriver();

      await persistent.setItem("key", "value");
      expect(spy).toHaveBeenCalledWith("key", "value");
      spy.mockRestore();
    });

    it("delegates session.setItem to sessionStorage", async () => {
      const spy = vi.spyOn(window.sessionStorage, "setItem").mockImplementation(() => {});
      const { session } = createBrowserStorageDriver();

      await session.setItem("key", "value");
      expect(spy).toHaveBeenCalledWith("key", "value");
      spy.mockRestore();
    });

    it("delegates removeItem to the correct storage", async () => {
      const localSpy = vi.spyOn(window.localStorage, "removeItem").mockImplementation(() => {});
      const sessionSpy = vi.spyOn(window.sessionStorage, "removeItem").mockImplementation(() => {});
      const { persistent, session } = createBrowserStorageDriver();

      await persistent.removeItem("a");
      await session.removeItem("b");

      expect(localSpy).toHaveBeenCalledWith("a");
      expect(sessionSpy).toHaveBeenCalledWith("b");
      localSpy.mockRestore();
      sessionSpy.mockRestore();
    });

    it("returns null when storage.getItem throws", () => {
      const spy = vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
        throw new Error("SecurityError");
      });
      const { persistent } = createBrowserStorageDriver();

      expect(persistent.getItem("key")).toBeNull();
      spy.mockRestore();
    });

    it("does not throw when storage.setItem throws", () => {
      const spy = vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });
      const { persistent } = createBrowserStorageDriver();

      expect(() => persistent.setItem("key", "value")).not.toThrow();
      spy.mockRestore();
    });

    it("does not throw when storage.removeItem throws", () => {
      const spy = vi.spyOn(window.sessionStorage, "removeItem").mockImplementation(() => {
        throw new Error("SecurityError");
      });
      const { session } = createBrowserStorageDriver();

      expect(() => session.removeItem("key")).not.toThrow();
      spy.mockRestore();
    });
  });
});
