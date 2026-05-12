import type { Account, WalletAdapter } from "../types";
import type { Eip1193Provider, Eip6963ProviderInfo } from "../auto/eip1193";
import { buildEvmAdapter } from "../auto/eip6963-adapter";
import { resolveCapabilities } from "../capabilities";

/**
 * Minimal type surface for `@walletconnect/universal-provider`. We
 * declare what we use rather than imposing the full peer dep types
 * on butr's own type-check pipeline (the peer dep is optional). Real
 * provider instances satisfy this shape.
 */
type UniversalProviderLike = Eip1193Provider & {
  connect(opts: {
    namespaces: Record<
      string,
      {
        chains: ReadonlyArray<string>;
        events: ReadonlyArray<string>;
        methods: ReadonlyArray<string>;
        rpcMap?: Record<string, string>;
      }
    >;
  }): Promise<unknown>;
  disconnect(): Promise<void>;
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
  init(options: UniversalProviderInitOptions): Promise<UniversalProviderLike>;
};

type WalletConnectMetadata = {
  description?: string;
  icons?: ReadonlyArray<string>;
  name?: string;
  url?: string;
};

type WalletConnectOptions = {
  /**
   * CAIP-2 chain ids the dapp wants to support. Default: Ethereum
   * mainnet only (`eip155:1`). Pass more to let the user pick a chain
   * in their wallet at pairing time.
   */
  chains?: ReadonlyArray<string>;
  /** Override the wallet's display icon shown in butr's pickers. */
  icon?: string;
  /**
   * Override the adapter's id (used as the pool key). Default
   * `"walletconnect"`. Set to a more specific id if you instantiate
   * multiple WalletConnect adapters (e.g. one EVM, one Solana).
   */
  id?: string;
  /**
   * App metadata WalletConnect shows in the mobile wallet during
   * pairing. Pass at least `name` and `url`; some wallets refuse to
   * pair without them.
   */
  metadata?: WalletConnectMetadata;
  /** Override the wallet's display name. Default `"WalletConnect"`. */
  name?: string;
  /**
   * Called with the WalletConnect pairing URI whenever the provider
   * needs the user to scan a QR code (or open a mobile deep link).
   * butr ships no QR renderer by design — consumers wire their own
   * (`@walletconnect/modal`, `qrcode`, hand-rolled). On mobile,
   * forward the URI to `window.location` to trigger the OS's wallet
   * selection sheet.
   */
  onPairingUri?: (uri: string) => void;
  /**
   * Your WalletConnect Cloud project id (https://cloud.reown.com).
   * Required by the WalletConnect v2 relay.
   */
  projectId: string;
  /**
   * Dependency-injection override for the UniversalProvider class.
   * Tests pass a fake; production code leaves it undefined and
   * butr dynamic-imports `@walletconnect/universal-provider`.
   */
  universalProvider?: UniversalProviderConstructor;
};

const DEFAULT_CHAINS: ReadonlyArray<string> = ["eip155:1"];

const DEFAULT_METHODS: ReadonlyArray<string> = [
  "eth_sendTransaction",
  "eth_accounts",
  "eth_chainId",
  "eth_getBalance",
  "eth_getTransactionReceipt",
  "personal_sign",
  "wallet_switchEthereumChain",
];

const DEFAULT_EVENTS: ReadonlyArray<string> = ["accountsChanged", "chainChanged", "disconnect"];

const DEFAULT_ICON =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzNiOTlmYyI+PHBhdGggZD0iTTQuOTEzIDcuNTE5YzMuOTI0LTMuODQyIDEwLjI1Mi0zLjg0MiAxNC4xNzYgMGwuNDcyLjQ2MmEuNDgzLjQ4MyAwIDAgMSAwIC42OWwtMS42MTUgMS41ODFhLjI1NC4yNTQgMCAwIDEtLjM1NCAwbC0uNjUtLjYzN2MtMi43MzgtMi42OC03LjE3Ny0yLjY4LTkuOTE1IDBsLS42OTYuNjgyYS4yNTQuMjU0IDAgMCAxLS4zNTQgMEw0LjM2MyA4LjcxNmEuNDgzLjQ4MyAwIDAgMSAwLS42OXptMTcuNTA0IDMuMjY1IDEuNDM3IDEuNDA2YS40ODMuNDgzIDAgMCAxIDAgLjY5bC02LjQ4MiA2LjM0OWEuNTA4LjUwOCAwIDAgMS0uNzA4IDBsLTQuNjAyLTQuNTA1YS4xMjcuMTI3IDAgMCAwLS4xNzcgMGwtNC42MDIgNC41MDVhLjUwOC41MDggMCAwIDEtLjcwOCAwTC4wOTMgMTIuODhhLjQ4My40ODMgMCAwIDEgMC0uNjlsMS40MzctMS40MDZhLjUwOC41MDggMCAwIDEgLjcwOCAwbDQuNjAyIDQuNTA1Yy4wNDkuMDQ4LjEyOC4wNDguMTc3IDBsNC42MDItNC41MDVhLjUwOC41MDggMCAwIDEgLjcwOCAwbDQuNjAyIDQuNTA1Yy4wNDkuMDQ4LjEyOC4wNDguMTc3IDBsNC42MDItNC41MDVhLjUwOC41MDggMCAwIDEgLjcwOCAweiIvPjwvc3ZnPg==";

const loadUniversalProvider = async (): Promise<UniversalProviderConstructor> => {
  // Dynamic import keeps `@walletconnect/universal-provider` an
  // *optional* peer dep — consumers who don't import `butr/walletconnect`
  // never pay the bundle cost, and the package install works without
  // the dep present.
  const mod = (await import("@walletconnect/universal-provider")) as unknown as {
    UniversalProvider: UniversalProviderConstructor;
    default?: UniversalProviderConstructor;
  };
  // Two possible export shapes across versions
  return mod.UniversalProvider ?? (mod.default as UniversalProviderConstructor);
};

/**
 * Build a WalletConnect v2 adapter usable with butr's
 * `WalletManagerConfig.createConnector`. The returned adapter is
 * fully-formed but UN-paired — the actual QR pairing happens when
 * butr's runtime calls `adapter.connect()` (typically when the user
 * clicks "Connect" in your UI).
 *
 * @example
 * ```ts
 * const wc = await createWalletConnectAdapter({
 *   projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
 *   metadata: { name: "My dapp", url: "https://my-dapp.example" },
 *   chains: ["eip155:1", "eip155:137"],
 *   onPairingUri: (uri) => setQrUri(uri),
 * });
 *
 * const config: WalletManagerConfig = {
 *   connectors: [{ id: wc.id, name: wc.name, chainPlatform: "evm" }],
 *   createConnector: (id) => (id === wc.id ? wc : null),
 * };
 * ```
 *
 * The adapter survives across reloads — call this once at app boot,
 * cache the returned adapter, and re-register it on each mount. butr's
 * hydration layer will reconnect through the same session if it's
 * still live on WalletConnect's relay.
 */
const createWalletConnectAdapter = async (
  options: WalletConnectOptions,
): Promise<WalletAdapter> => {
  const UniversalProvider = options.universalProvider ?? (await loadUniversalProvider());
  const provider = await UniversalProvider.init({
    metadata: options.metadata
      ? {
          description: options.metadata.description,
          icons: options.metadata.icons ? [...options.metadata.icons] : undefined,
          name: options.metadata.name,
          url: options.metadata.url,
        }
      : undefined,
    projectId: options.projectId,
  });

  // Forward pairing URIs to the consumer so they can render a QR code
  // or deep-link the user's mobile wallet.
  if (options.onPairingUri) {
    provider.on("display_uri", ((uri: unknown) => {
      if (typeof uri === "string") {
        options.onPairingUri?.(uri);
      }
    }) as never);
  }

  const chains = options.chains && options.chains.length > 0 ? options.chains : DEFAULT_CHAINS;
  const id = options.id ?? "walletconnect";
  const name = options.name ?? "WalletConnect";
  const icon = options.icon ?? DEFAULT_ICON;

  const info: Eip6963ProviderInfo = {
    icon,
    name,
    rdns: id,
    uuid: id,
  };

  // buildEvmAdapter wires every EIP-1193 method against the provider —
  // request, on/removeListener, accountsChanged/chainChanged
  // subscription, sendTx, signMessage, etc. We only override `connect`
  // (which needs the WC namespace handshake) and `disconnect` (which
  // needs to kill the session).
  const base = buildEvmAdapter(info, provider as Eip1193Provider);

  const adapter: WalletAdapter = {
    ...base,
    capabilities: resolveCapabilities({ transport: "walletconnect" }),
    id,
    name,

    async connect() {
      // If a previous session is still live (e.g., across reloads),
      // skip the pairing handshake — the provider already has the
      // session topic and can route requests through the relay.
      if (provider.session) {
        return;
      }
      await provider.connect({
        namespaces: {
          eip155: {
            chains: [...chains],
            events: [...DEFAULT_EVENTS],
            methods: [...DEFAULT_METHODS],
          },
        },
      });
    },

    async disconnect() {
      if (!provider.session) {
        return;
      }
      try {
        await provider.disconnect();
      } catch (error) {
        // The relay may already have dropped the session (mobile
        // wallet was uninstalled, etc.). Don't propagate — butr's
        // reducer marks the wallet disconnected on its side regardless.
        console.warn("[butr/walletconnect] disconnect threw:", error);
      }
    },
  };

  return adapter;
};

export type { UniversalProviderConstructor, UniversalProviderLike, WalletConnectMetadata, WalletConnectOptions };
export { DEFAULT_ICON as WALLETCONNECT_DEFAULT_ICON, createWalletConnectAdapter };

// Account type re-exported for adapter authors who want to construct
// accounts manually (e.g. for SVM via WalletConnect — future work).
export type { Account };
