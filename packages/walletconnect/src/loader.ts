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
  session: WcSession | null | undefined;
};

type WcSession = {
  namespaces?: Record<string, { accounts?: ReadonlyArray<string> }>;
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
  const mod: unknown = await import("@walletconnect/universal-provider");
  if (typeof mod !== "object" || mod === null) {
    throw new Error("@walletconnect/universal-provider did not resolve to a module");
  }
  const named = "UniversalProvider" in mod ? mod.UniversalProvider : undefined;
  const fallback = "default" in mod ? mod.default : undefined;
  const ctor = named ?? fallback;
  if (typeof ctor !== "function") {
    throw new TypeError(
      "@walletconnect/universal-provider exposes no UniversalProvider constructor",
    );
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- validated the export is callable; the untyped WC module is otherwise opaque
  return ctor as unknown as UniversalProviderConstructor;
};

export type { UniversalProviderConstructor, UniversalProviderInitOptions, UniversalProviderLike };
export { loadUniversalProvider };
