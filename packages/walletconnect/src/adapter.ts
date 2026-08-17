import type { ChainPlatform, WalletAdapter } from "@usebutr/core";

import type {
  UniversalProviderConstructor,
  UniversalProviderLike,
  WcNamespaceRequest,
} from "./loader";
import { loadUniversalProvider } from "./loader";
import { bitcoinNamespace } from "./namespaces/bitcoin";
import { evmNamespace } from "./namespaces/evm";
import { suiNamespace } from "./namespaces/sui";
import { solanaNamespace } from "./namespaces/svm";
import type { WalletConnectNamespaceBuilder } from "./namespaces/types";
import type { PairingRequest } from "./session";
import { createWalletConnectSession } from "./session";

type WalletConnectMetadata = {
  description?: string;
  icons?: ReadonlyArray<string>;
  name?: string;
  url?: string;
};

type WalletConnectOptions = {
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
   * Per-namespace chain requests. Each key is a `ChainPlatform`; each
   * value is the CAIP-2 chains to advertise for that namespace.
   *
   * Omit a key to skip that namespace entirely. Pass an empty array
   * to use the namespace builder's `defaultChains`.
   */
  namespaces: Partial<Record<ChainPlatform, ReadonlyArray<string>>>;
  /**
   * Called with the WalletConnect pairing URI whenever the provider
   * needs the user to scan a QR code (or open a mobile deep link).
   * butr ships no QR renderer by design; consumers wire their own
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

const DEFAULT_ICON =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzNiOTlmYyI+PHBhdGggZD0iTTQuOTEzIDcuNTE5YzMuOTI0LTMuODQyIDEwLjI1Mi0zLjg0MiAxNC4xNzYgMGwuNDcyLjQ2MmEuNDgzLjQ4MyAwIDAgMSAwIC42OWwtMS42MTUgMS41ODFhLjI1NC4yNTQgMCAwIDEtLjM1NCAwbC0uNjUtLjYzN2MtMi43MzgtMi42OC03LjE3Ny0yLjY4LTkuOTE1IDBsLS42OTYuNjgyYS4yNTQuMjU0IDAgMCAxLS4zNTQgMEw0LjM2MyA4LjcxNmEuNDgzLjQ4MyAwIDAgMSAwLS42OXptMTcuNTA0IDMuMjY1IDEuNDM3IDEuNDA2YS40ODMuNDgzIDAgMCAxIDAgLjY5bC02LjQ4MiA2LjM0OWEuNTA4LjUwOCAwIDAgMS0uNzA4IDBsLTQuNjAyLTQuNTA1YS4xMjcuMTI3IDAgMCAwLS4xNzcgMGwtNC42MDIgNC41MDVhLjUwOC41MDggMCAwIDEtLjcwOCAwTC4wOTMgMTIuODhhLjQ4My40ODMgMCAwIDEgMC0uNjlsMS40MzctMS40MDZhLjUwOC41MDggMCAwIDEgLjcwOCAwbDQuNjAyIDQuNTA1Yy4wNDkuMDQ4LjEyOC4wNDguMTc3IDBsNC42MDItNC41MDVhLjUwOC41MDggMCAwIDEgLjcwOCAwbDQuNjAyIDQuNTA1Yy4wNDkuMDQ4LjEyOC4wNDguMTc3IDBsNC42MDItNC41MDVhLjUwOC41MDggMCAwIDEgLjcwOCAweiIvPjwvc3ZnPg==";

const initProvider = async (options: WalletConnectOptions): Promise<UniversalProviderLike> => {
  const UniversalProvider = options.universalProvider ?? (await loadUniversalProvider());
  return UniversalProvider.init({
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
};

const namespaceRequest = (
  builder: WalletConnectNamespaceBuilder,
  chains: ReadonlyArray<string>,
): WcNamespaceRequest => ({
  chains: [...chains],
  events: [...builder.defaultEvents],
  methods: [...builder.defaultMethods],
});

/**
 * Registry of known per-namespace builders. Adding a new namespace =
 * import its builder + add the entry. Today EVM, SVM, Sui, and Bitcoin
 * (bip122) all ship.
 */
const KNOWN_NAMESPACES: Readonly<Record<string, WalletConnectNamespaceBuilder | undefined>> = {
  bitcoin: bitcoinNamespace,
  evm: evmNamespace,
  sui: suiNamespace,
  svm: solanaNamespace,
};

/**
 * WalletConnect v2 factory. Accepts a per-platform `chains` map and
 * returns one adapter per requested namespace from a single paired
 * session. Each returned adapter has its own id (with a platform suffix
 * when more than one namespace is requested) so butr's pool can hold
 * them simultaneously.
 *
 * EVM, SVM (Solana), Sui, and Bitcoin (bip122) namespace builders all
 * ship with the package. The factory is shaped this way so adding a
 * platform = adding one file under `src/namespaces/` and one entry to
 * {@link KNOWN_NAMESPACES}, with no API change elsewhere.
 *
 * A WC v2 session's namespaces are fixed at approval time, so the
 * pairing declares the union up front: the first requested namespace
 * is required, the rest optional. Adapters for a namespace the wallet
 * declined reject on `connect()` rather than report a connection whose
 * requests would fail at the relay.
 *
 * @example Single namespace
 * ```ts
 * const [wc] = await createWalletConnectAdapters({
 *   projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
 *   namespaces: { evm: ["eip155:1"] },
 *   onPairingUri: (uri) => setQrUri(uri),
 * });
 * ```
 *
 * @example Multi-namespace
 * ```ts
 * const wcs = await createWalletConnectAdapters({
 *   projectId,
 *   namespaces: {
 *     evm: ["eip155:1"],
 *     svm: ["solana:mainnet"],
 *     sui: ["sui:mainnet"],
 *     bitcoin: ["bip122:000000000019d6689c085ae165831e93"],
 *   },
 *   onPairingUri: (uri) => setQrUri(uri),
 * });
 * ```
 */
const createWalletConnectAdapters = async (
  options: WalletConnectOptions,
): Promise<Array<WalletAdapter>> => {
  const requested: Array<[string, ReadonlyArray<string>]> = [];
  for (const [key, value] of Object.entries(options.namespaces)) {
    if (value !== undefined) {
      requested.push([key, value]);
    }
  }
  if (requested.length === 0) {
    throw new Error(
      "[butr/walletconnect] createWalletConnectAdapters needs at least one namespace",
    );
  }
  const unsupported = requested.filter(([platform]) => !KNOWN_NAMESPACES[platform]);
  if (unsupported.length > 0) {
    throw new Error(
      `[butr/walletconnect] no namespace builder registered for: ${unsupported
        .map(([p]) => p)
        .join(", ")}. Today "evm", "svm", "sui", and "bitcoin" ship.`,
    );
  }

  const selected = requested.map(([platform, chains]) => {
    const builder = KNOWN_NAMESPACES[platform];
    if (!builder) {
      throw new Error(`Unreachable: builder missing for ${platform}`);
    }
    return { builder, chains: chains.length > 0 ? chains : builder.defaultChains, platform };
  });

  const [primary, ...secondary] = selected;
  if (primary === undefined) {
    throw new Error("Unreachable: empty namespace selection");
  }
  const namespaces: PairingRequest = {
    [primary.builder.caipPrefix]: namespaceRequest(primary.builder, primary.chains),
  };
  const optionalNamespaces: PairingRequest = Object.fromEntries(
    secondary.map(({ builder, chains }) => [builder.caipPrefix, namespaceRequest(builder, chains)]),
  );

  const provider = await initProvider(options);
  const session = createWalletConnectSession({
    namespaces,
    onPairingUri: options.onPairingUri,
    optionalNamespaces,
    provider,
  });
  const baseId = options.id ?? "walletconnect";
  const baseName = options.name ?? "WalletConnect";
  const icon = options.icon ?? DEFAULT_ICON;
  const multiNamespace = selected.length > 1;
  const connectedAdapters = new Set<WalletAdapter>();

  return selected.map(({ builder, chains, platform }) => {
    const adapter = builder.buildAdapter({
      chains,
      icon,
      id: multiNamespace ? `${baseId}-${platform}` : baseId,
      name: multiNamespace ? `${baseName} (${platform.toUpperCase()})` : baseName,
      provider,
      session,
    });
    const release = session.retain();
    const innerConnect = adapter.connect.bind(adapter);
    return Object.assign(adapter, {
      connect: async (connectOptions?: { silent?: boolean }) => {
        await innerConnect(connectOptions);
        connectedAdapters.add(adapter);
      },
      disconnect: async () => {
        connectedAdapters.delete(adapter);
        release();
        if (connectedAdapters.size === 0) {
          await session.disconnect();
        }
      },
    });
  });
};

export type { Account } from "@usebutr/core";
export type { UniversalProviderConstructor, UniversalProviderLike } from "./loader";
export type { WalletConnectNamespaceBuilder } from "./namespaces/types";
export type { WalletConnectMetadata, WalletConnectOptions };
export { bitcoinNamespace } from "./namespaces/bitcoin";
export { evmNamespace } from "./namespaces/evm";
export { solanaNamespace } from "./namespaces/svm";
export { suiNamespace } from "./namespaces/sui";
export {
  DEFAULT_ICON as WALLETCONNECT_DEFAULT_ICON,
  KNOWN_NAMESPACES,
  createWalletConnectAdapters,
};
