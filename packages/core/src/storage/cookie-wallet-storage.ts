import type { CookieDriverOptions } from "./cookie-storage-driver";
import { createCookieStorageDriver } from "./cookie-storage-driver";
import type { WalletPersistence, WalletSnapshot } from "./persistence";
import { createWalletStateCodec } from "./wallet-state-codec";
import { createWalletStorage } from "./wallet-storage";

/** Next.js `cookies().getAll()`, `[name, value]` pairs, or a name → value record. */
type CookieSource =
  | Iterable<{ name: string; value: string }>
  | Iterable<[string, string]>
  | Readonly<Record<string, string>>;

type CookieWalletStorageOptions = CookieDriverOptions & {
  /** Namespaces every cookie, for several apps on one origin. Defaults to `"butr"`. */
  keyPrefix?: string;
};

type CookieWalletStorage = WalletPersistence & {
  /**
   * The state the browser last saved, from the request's cookies, for
   * `initialState`. Optimistic: an uninstall or other-tab disconnect makes it
   * stale, so an entry is authoritative only once it leaves `reconnectingIds`.
   */
  readInitialState: (cookies: CookieSource) => WalletSnapshot;
};

const toCookieMap = (input: CookieSource): Map<string, string> => {
  if (!(Symbol.iterator in input)) {
    return new Map(Object.entries(input));
  }

  const out = new Map<string, string>();

  for (const entry of input) {
    if (Array.isArray(entry)) {
      const [name, value] = entry;

      if (typeof name === "string" && typeof value === "string") {
        out.set(name, value);
      }

      continue;
    }

    if (typeof entry.name === "string" && typeof entry.value === "string") {
      out.set(entry.name, entry.value);
    }
  }

  return out;
};

/**
 * The client persistence and the server reader over one key layout. Creation
 * touches no browser global, so a module shared by a Server Component and the
 * client provider can build it. The disconnect intent stays in sessionStorage.
 */
const createCookieWalletStorage = ({
  keyPrefix,
  ...cookie
}: CookieWalletStorageOptions = {}): CookieWalletStorage => {
  const codec = createWalletStateCodec(keyPrefix);

  return {
    ...createWalletStorage({ keyPrefix, persistent: createCookieStorageDriver(cookie) }),
    readInitialState: (cookies) => {
      const jar = toCookieMap(cookies);

      return codec.decodeSnapshot((key) => jar.get(key));
    },
  };
};

export type { CookieSource, CookieWalletStorage, CookieWalletStorageOptions };

export { createCookieWalletStorage };
