import type { StorageDriver } from "./persistence";

type CookieDriverOptions = {
  /**
   * Cookie `domain` attribute. Omit to scope to the current host.
   * Set to a parent domain (e.g. `.example.com`) to share state
   * across subdomains.
   */
  domain?: string;
  /**
   * Lifetime in seconds. Defaults to 30 days. Pass `undefined`
   * (the default) for "until the session ends" — but note that
   * butr persists wallet state across sessions, so a finite
   * max-age is usually what consumers want.
   */
  maxAgeSeconds?: number;
  /**
   * `SameSite` attribute. Defaults to `"lax"` — restrictive enough
   * to avoid CSRF on cross-origin POSTs, permissive enough for
   * top-level navigations.
   */
  sameSite?: "lax" | "strict" | "none";
  /**
   * `Secure` attribute. Defaults to `true` (cookies only sent over
   * HTTPS). Force `false` for local development on plain `http://`.
   */
  secure?: boolean;
  /**
   * URL path the cookie applies to. Defaults to `/` (whole origin).
   */
  path?: string;
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
      // Malformed entry; skip rather than crash hydration.
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
  const parts: Array<string> = [`${name}=${encode(value)}`];
  parts.push(`Path=${options.path ?? "/"}`);
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

/**
 * Cookie-backed storage driver. Reads/writes `document.cookie` —
 * server-readable, survives reloads, scoped per `domain`/`path`.
 *
 * **When to use this:** SSR apps that need to know who's connected
 * during the server render (so they can stream the connected-wallet
 * UI without a client-side hydration flicker). The server can read
 * the same cookies via `req.headers.cookie` and feed them into
 * `WalletStorage` ahead of mount.
 *
 * **Trade-offs vs `localStorage`:** cookies travel with every
 * request, so they cost bytes on the wire. Keep the storage key
 * prefix short, and prefer this driver for the `persistent` slot
 * only — the `session` slot can stay in `sessionStorage` (which
 * cookies can't natively model anyway).
 *
 * **No-op on the server.** If `document` is undefined the driver
 * returns a read-only stub that always resolves to `null` for
 * `getItem` and ignores writes. The caller is expected to hydrate
 * server-side state by reading cookies from the request header
 * directly and seeding `WalletStorage` with an in-memory driver
 * built from that snapshot.
 */
const createCookieStorageDriver = (options: CookieDriverOptions = {}): StorageDriver => {
  if (typeof document === "undefined") {
    return {
      getItem() {
        return null;
      },
      removeItem() {
        // server-side no-op
      },
      setItem() {
        // server-side no-op
      },
    };
  }
  return {
    getItem(key) {
      return readCookies().get(key) ?? null;
    },
    removeItem(key) {
      document.cookie = buildCookieString(key, "", options, true);
    },
    setItem(key, value) {
      document.cookie = buildCookieString(key, value, options);
    },
  };
};

export type { CookieDriverOptions };
export { createCookieStorageDriver };
