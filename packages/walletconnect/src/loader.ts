import type { Eip1193Provider } from "@usebutr/evm";

/**
 * Declared here rather than imported, so butr's type-check never requires
 * the optional `@walletconnect/universal-provider` peer dep.
 */
type WcNamespaceRequest = {
  chains: ReadonlyArray<string>;
  events: ReadonlyArray<string>;
  methods: ReadonlyArray<string>;
  rpcMap?: Record<string, string>;
};

type UniversalProviderLike = Eip1193Provider & {
  connect: (opts: {
    namespaces: Record<string, WcNamespaceRequest>;
    /**
     * Namespaces the wallet may decline without failing the pairing. WC v2
     * sessions cannot be extended after approval, so everything butr will
     * ever need has to be declared in the first `connect` call.
     */
    optionalNamespaces?: Record<string, WcNamespaceRequest>;
  }) => Promise<WcSession | undefined>;
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

const hasUniversalProviderInit = (
  value: CallableFunction,
): value is CallableFunction & UniversalProviderConstructor =>
  "init" in value && typeof value.init === "function";

/**
 * Dynamic so consumers who don't ship WC pay no bundle cost and can install
 * without the peer dep. WC v2 minors expose either `{ UniversalProvider }`
 * or `default`, so both are accepted.
 */
const loadUniversalProvider = async (): Promise<UniversalProviderConstructor> => {
  const mod: unknown = await import("@walletconnect/universal-provider");
  if (typeof mod !== "object" || mod === null) {
    throw new Error("@walletconnect/universal-provider did not resolve to a module");
  }
  const named = "UniversalProvider" in mod ? mod.UniversalProvider : undefined;
  const fallback = "default" in mod ? mod.default : undefined;
  const ctor = named ?? fallback;
  if (typeof ctor !== "function" || !hasUniversalProviderInit(ctor)) {
    throw new TypeError(
      "@walletconnect/universal-provider exposes no UniversalProvider constructor",
    );
  }
  return { init: ctor.init };
};

export type {
  UniversalProviderConstructor,
  UniversalProviderInitOptions,
  UniversalProviderLike,
  WcNamespaceRequest,
};
export { loadUniversalProvider };
