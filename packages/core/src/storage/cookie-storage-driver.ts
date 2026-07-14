import type { StorageDriver } from "./persistence";

type InitialCookies = Iterable<[string, string]> | Readonly<Record<string, string>>;

type CookieDriverOptions = {
  /**
   * Cookie `domain` attribute. Omit to scope to the current host.
   * Set to a parent domain (e.g. `.example.com`) to share state
   * across subdomains.
   */
  domain?: string;
  /**
   * Snapshot of cookies for the SSR pass; typically the result of
   * Next.js' `cookies()` (from `next/headers`) or a parsed
   * `req.headers.cookie`. Used only when `document` is unavailable.
   *
   * When provided, `getItem` reads from this snapshot during the
   * server render so the store sees the same persisted state the
   * client will see after hydration. Writes remain no-ops on the
   * server: emitting `Set-Cookie` has to be done by the framework
   * layer that owns the response.
   */
  initialCookies?: InitialCookies;
  /**
   * Lifetime in seconds. Defaults to 30 days. Pass `undefined`
   * (the default) for "until the session ends", but note that
   * butr persists wallet state across sessions, so a finite
   * max-age is usually what consumers want.
   */
  maxAgeSeconds?: number;
  /**
   * URL path the cookie applies to. Defaults to `/` (whole origin).
   */
  path?: string;
  /**
   * `SameSite` attribute. Defaults to `"lax"`; restrictive enough
   * to avoid CSRF on cross-origin POSTs, permissive enough for
   * top-level navigations.
   */
  sameSite?: "lax" | "strict" | "none";
  /**
   * `Secure` attribute. Defaults to `true` (cookies only sent over
   * HTTPS). Force `false` for local development on plain `http://`.
   */
  secure?: boolean;
};

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const encode = (value: string): string => encodeURIComponent(value);
const decode = (value: string): string => decodeURIComponent(value);

const readCookies = (): Map<string, string> => {
  const out = new Map<string, string>();
  if (typeof document === "undefined") {
    return out;
  }
  const cookieString = document.cookie;
  if (!cookieString) {
    return out;
  }
  for (const segment of cookieString.split(";")) {
    const trimmed = segment.trim();
    if (!trimmed) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const name = trimmed.slice(0, eq);
    const raw = trimmed.slice(eq + 1);
    try {
      out.set(name, decode(raw));
    } catch {
      void 0;
    }
  }
  return out;
};

const buildCookieString = (
  name: string,
  value: string,
  options: CookieDriverOptions,
  expired = false,
): string => {
  const parts: Array<string> = [`${name}=${encode(value)}`, `Path=${options.path ?? "/"}`];
  if (options.domain) {
    parts.push(`Domain=${options.domain}`);
  }
  if (expired) {
    parts.push("Max-Age=0");
  } else {
    const maxAge = options.maxAgeSeconds ?? DEFAULT_MAX_AGE_SECONDS;
    parts.push(`Max-Age=${maxAge}`);
  }
  parts.push(`SameSite=${options.sameSite ?? "lax"}`);
  if (options.secure ?? true) {
    parts.push("Secure");
  }
  return parts.join("; ");
};

const toCookieMap = (input: InitialCookies | undefined): Map<string, string> | null => {
  if (!input) {
    return null;
  }
  if (typeof (input as Iterable<[string, string]>)[Symbol.iterator] === "function") {
    return new Map(input as Iterable<[string, string]>);
  }
  return new Map(Object.entries(input as Readonly<Record<string, string>>));
};

/**
 * Cookie-backed storage driver. Reads/writes `document.cookie`;
 * server-readable, survives reloads, scoped per `domain`/`path`.
 *
 * **When to use this:** SSR apps that need to know who's connected
 * during the server render (so they can stream the connected-wallet
 * UI without a client-side hydration flicker). Pass `initialCookies`
 * from a server-side cookie source (e.g. `cookies()` in Next.js'
 * `next/headers`, or a parsed `req.headers.cookie`) and the same
 * driver will serve those values during the server render and switch
 * to `document.cookie` once it mounts in the browser.
 *
 * **Trade-offs vs `localStorage`:** cookies travel with every
 * request, so they cost bytes on the wire. Keep the storage key
 * prefix short, and prefer this driver for the `persistent` slot
 * only: the `session` slot can stay in `sessionStorage` (which
 * cookies can't natively model anyway).
 *
 * **Server-side writes are no-ops.** Emitting `Set-Cookie` requires
 * access to the framework's response object, which a storage driver
 * shouldn't reach into. The store doesn't mutate persisted state
 * during the SSR pass anyway; writes only fire after client mount,
 * once `document.cookie` is reachable.
 */
const createCookieStorageDriver = (options: CookieDriverOptions = {}): StorageDriver => {
  const seeded = toCookieMap(options.initialCookies);

  if (typeof document === "undefined") {
    if (!seeded) {
      return {
        getItem() {
          return null;
        },
        removeItem() {},
        setItem() {},
      };
    }
    return {
      getItem(key) {
        return seeded.get(key) ?? null;
      },
      removeItem() {},
      setItem() {},
    };
  }
  return {
    getItem(key) {
      return readCookies().get(key) ?? null;
    },
    removeItem(key) {
      // eslint-disable-next-line unicorn/no-document-cookie -- cookie storage driver is the document.cookie abstraction by design
      document.cookie = buildCookieString(key, "", options, true);
    },
    setItem(key, value) {
      // eslint-disable-next-line unicorn/no-document-cookie -- cookie storage driver is the document.cookie abstraction by design
      document.cookie = buildCookieString(key, value, options);
    },
  };
};

export type { CookieDriverOptions, InitialCookies };
export { createCookieStorageDriver };
