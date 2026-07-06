import type { Eip1193Provider } from "@usebutr/evm";

/**
 * Minimal type surface for `@walletconnect/universal-provider`. We
 * declare what we use rather than imposing the full peer-dep types on
 * butr's own type-check pipeline (the peer dep is optional). Real
 * provider instances satisfy this shape.
 */
type UniversalProviderLike = Eip1193Provider & {
  connect: (opts: {
    namespaces: Record<
      string,
      {
        chains: ReadonlyArray<string>;
        events: ReadonlyArray<string>;
        methods: ReadonlyArray<string>;
        rpcMap?: Record<string, string>;
      }
    >;
  }) => Promise<unknown>;
  disconnect: () => Promise<void>;
  session: unknown;
};

type UniversalProviderInitOptions = {
  metadata?: {
    description?: string;
    icons?: ReadonlyArray<string>;
    name?: string;
    url?: string;
  };
  projectId: string;
};

type UniversalProviderConstructor = {
  init: (options: UniversalProviderInitOptions) => Promise<UniversalProviderLike>;
};

/**
 * Dynamic-import `@walletconnect/universal-provider`. Keeping it
 * dynamic preserves the optional-peer-dep posture: consumers who
 * don't ship WC pay no bundle cost, and `pnpm install` works without
 * the dep present.
 *
 * Two export shapes show up across WC v2 minor versions
 * (`{ UniversalProvider }` vs `default`); we accept either.
 */
const loadUniversalProvider = async (): Promise<UniversalProviderConstructor> => {
  const mod = (await import("@walletconnect/universal-provider")) as unknown as {
    default?: UniversalProviderConstructor;
    UniversalProvider: UniversalProviderConstructor;
  };
  return mod.UniversalProvider ?? (mod.default as UniversalProviderConstructor);
};

export type { UniversalProviderConstructor, UniversalProviderInitOptions, UniversalProviderLike };
export { loadUniversalProvider };
