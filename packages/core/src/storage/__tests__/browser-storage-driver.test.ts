import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createBrowserStorageDriver, createMemoryStorageDriver } from "../browser-storage-driver";

describe("createMemoryStorageDriver", () => {
  it("sets and gets values", () => {
    const driver = createMemoryStorageDriver();
    driver.setItem("key", "value");
    expect(driver.getItem("key")).toBe("value");
  });

  it("returns null for missing keys", () => {
    const driver = createMemoryStorageDriver();
    expect(driver.getItem("nonexistent")).toBeNull();
  });

  it("removes items", () => {
    const driver = createMemoryStorageDriver();
    driver.setItem("key", "value");
    driver.removeItem("key");
    expect(driver.getItem("key")).toBeNull();
  });

  it("isolates memory between instances", () => {
    const a = createMemoryStorageDriver();
    const b = createMemoryStorageDriver();
    a.setItem("key", "a");
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

    it("falls back to in-memory for both drivers", () => {
      const { persistent, session } = createBrowserStorageDriver();

      persistent.setItem("p", "v");
      expect(persistent.getItem("p")).toBe("v");

      session.setItem("s", "v");
      expect(session.getItem("s")).toBe("v");
    });

    it("keeps persistent and session memory isolated", () => {
      const { persistent, session } = createBrowserStorageDriver();
      persistent.setItem("key", "persistent");
      session.setItem("key", "session");

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

    it("delegates persistent.setItem to localStorage", () => {
      const spy = vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {});
      const { persistent } = createBrowserStorageDriver();

      persistent.setItem("key", "value");
      expect(spy).toHaveBeenCalledWith("key", "value");
      spy.mockRestore();
    });

    it("delegates session.setItem to sessionStorage", () => {
      const spy = vi.spyOn(window.sessionStorage, "setItem").mockImplementation(() => {});
      const { session } = createBrowserStorageDriver();

      session.setItem("key", "value");
      expect(spy).toHaveBeenCalledWith("key", "value");
      spy.mockRestore();
    });

    it("delegates removeItem to the correct storage", () => {
      const localSpy = vi.spyOn(window.localStorage, "removeItem").mockImplementation(() => {});
      const sessionSpy = vi.spyOn(window.sessionStorage, "removeItem").mockImplementation(() => {});
      const { persistent, session } = createBrowserStorageDriver();

      persistent.removeItem("a");
      session.removeItem("b");

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
