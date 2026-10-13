import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createCookieStorageDriver } from "../cookie-storage-driver";

const fakeDocument = (initial = ""): { cookie: string } => {
  let cookie = initial;
  return {
    get cookie() {
      return cookie;
    },
    set cookie(value: string) {
      const head = value.split(";")[0]?.trim() ?? "";
      if (!head) {
        return;
      }
      const [name] = head.split("=");
      if (name === undefined || name === "") {
        return;
      }
      const segments = cookie ? cookie.split("; ").filter(Boolean) : [];
      const filtered = segments.filter((s) => !s.startsWith(`${name}=`));
      if (/Max-Age=0(?:\b|$)/v.test(value)) {
        cookie = filtered.join("; ");
        return;
      }
      filtered.push(head);
      cookie = filtered.join("; ");
    },
  };
};

describe("createCookieStorageDriver", () => {
  let docStub: { cookie: string };
  beforeEach(() => {
    docStub = fakeDocument();
    vi.stubGlobal("document", docStub);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("setItem writes a cookie that getItem can read back", async () => {
    const driver = createCookieStorageDriver();
    await driver.setItem("butr-pool", "hello world");
    expect(driver.getItem("butr-pool")).toBe("hello world");
  });

  it("encodes special characters", async () => {
    const driver = createCookieStorageDriver();
    await driver.setItem("butr-pool", "value with spaces & =");
    expect(driver.getItem("butr-pool")).toBe("value with spaces & =");
  });

  it("removeItem clears the cookie", async () => {
    const driver = createCookieStorageDriver();
    await driver.setItem("butr-pool", "hi");
    await driver.removeItem("butr-pool");
    expect(driver.getItem("butr-pool")).toBeNull();
  });

  it("getItem returns null for missing entries", () => {
    const driver = createCookieStorageDriver();
    expect(driver.getItem("nope")).toBeNull();
  });

  it("honours domain, path, sameSite, secure options on writes", async () => {
    const writes: Array<string> = [];
    vi.stubGlobal("document", {
      get cookie() {
        return "";
      },
      set cookie(value: string) {
        writes.push(value);
      },
    });
    const driver = createCookieStorageDriver({
      domain: ".example.com",
      path: "/app",
      sameSite: "strict",
      secure: true,
    });
    await driver.setItem("k", "v");
    const written = writes.at(-1) ?? "";
    expect(written).toContain("Domain=.example.com");
    expect(written).toContain("Path=/app");
    expect(written).toContain("SameSite=strict");
    expect(written).toContain("Secure");
  });

  it("omits Secure when secure is set to false", async () => {
    const writes: Array<string> = [];
    vi.stubGlobal("document", {
      get cookie() {
        return "";
      },
      set cookie(value: string) {
        writes.push(value);
      },
    });
    const driver = createCookieStorageDriver({ secure: false });
    await driver.setItem("k", "v");
    expect(writes.at(-1)).not.toContain("Secure");
  });

  it("uses Max-Age default when omitted, custom when supplied", async () => {
    const cookies: Array<string> = [];
    vi.stubGlobal("document", {
      get cookie() {
        return cookies.join("; ");
      },
      set cookie(value: string) {
        cookies.push(value);
      },
    });
    const driver = createCookieStorageDriver({ maxAgeSeconds: 60 });
    await driver.setItem("k", "v");
    expect(cookies.at(-1)).toContain("Max-Age=60");

    const defaultDriver = createCookieStorageDriver();
    await defaultDriver.setItem("k", "v");
    expect(cookies.at(-1)).toContain("Max-Age=2592000"); // 30 days
  });

  it("removeItem sets Max-Age=0", async () => {
    const cookies: Array<string> = [];
    vi.stubGlobal("document", {
      get cookie() {
        return cookies.join("; ");
      },
      set cookie(value: string) {
        cookies.push(value);
      },
    });
    const driver = createCookieStorageDriver();
    await driver.removeItem("k");
    expect(cookies.at(-1)).toContain("Max-Age=0");
  });

  it("skips malformed cookie entries gracefully", () => {
    vi.stubGlobal("document", {
      cookie: "good=hello; %ZZbad; nameonly; another=world",
    });
    const driver = createCookieStorageDriver();
    expect(driver.getItem("good")).toBe("hello");
    expect(driver.getItem("another")).toBe("world");
    expect(driver.getItem("nameonly")).toBeNull();
  });

  it("returns null when document.cookie is empty", () => {
    vi.stubGlobal("document", { cookie: "" });
    const driver = createCookieStorageDriver();
    expect(driver.getItem("anything")).toBeNull();
  });
});
