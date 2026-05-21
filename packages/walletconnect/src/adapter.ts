import type { Account, ChainPlatform, WalletAdapter } from "@usebutr/core";

import type { UniversalProviderConstructor, UniversalProviderLike } from "./loader";
import { loadUniversalProvider } from "./loader";
import { evmNamespace } from "./namespaces/evm";
import { suiNamespace } from "./namespaces/sui";
import { solanaNamespace } from "./namespaces/svm";
import type { WalletConnectNamespaceBuilder } from "./namespaces/types";

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
   *
   * Single-platform (EVM-only). For multi-platform pairings, use
   * `createWalletConnectAdapters` with the `namespaces` option.
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

const DEFAULT_ICON =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzNiOTlmYyI+PHBhdGggZD0iTTQuOTEzIDcuNTE5YzMuOTI0LTMuODQyIDEwLjI1Mi0zLjg0MiAxNC4xNzYgMGwuNDcyLjQ2MmEuNDgzLjQ4MyAwIDAgMSAwIC42OWwtMS42MTUgMS41ODFhLjI1NC4yNTQgMCAwIDEtLjM1NCAwbC0uNjUtLjYzN2MtMi43MzgtMi42OC03LjE3Ny0yLjY4LTkuOTE1IDBsLS42OTYuNjgyYS4yNTQuMjU0IDAgMCAxLS4zNTQgMEw0LjM2MyA4LjcxNmEuNDgzLjQ4MyAwIDAgMSAwLS42OXptMTcuNTA0IDMuMjY1IDEuNDM3IDEuNDA2YS40ODMuNDgzIDAgMCAxIDAgLjY5bC02LjQ4MiA2LjM0OWEuNTA4LjUwOCAwIDAgMS0uNzA4IDBsLTQuNjAyLTQuNTA1YS4xMjcuMTI3IDAgMCAwLS4xNzcgMGwtNC42MDIgNC41MDVhLjUwOC41MDggMCAwIDEtLjcwOCAwTC4wOTMgMTIuODhhLjQ4My40ODMgMCAwIDEgMC0uNjlsMS40MzctMS40MDZhLjUwOC41MDggMCAwIDEgLjcwOCAwbDQuNjAyIDQuNTA1Yy4wNDkuMDQ4LjEyOC4wNDguMTc3IDBsNC42MDItNC41MDVhLjUwOC41MDggMCAwIDEgLjcwOCAwbDQuNjAyIDQuNTA1Yy4wNDkuMDQ4LjEyOC4wNDguMTc3IDBsNC42MDItNC41MDVhLjUwOC41MDggMCAwIDEgLjcwOCAweiIvPjwvc3ZnPg==";

const initProvider = async (options: WalletConnectOptions): Promise<UniversalProviderLike> => {
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

  return provider;
};

/**
 * Build a single WalletConnect v2 adapter wired to the EVM namespace.
 * The returned adapter is fully-formed but UN-paired — the actual QR
 * pairing happens when butr's runtime calls `adapter.connect()`
 * (typically when the user clicks "Connect" in your UI).
 *
 * **Single-platform.** This factory always returns one EVM-namespace
 * adapter, preserving the original API. For multi-platform pairings
 * (one QR scan, multiple chains), use {@link createWalletConnectAdapters}.
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
  const provider = await initProvider(options);
  const chains =
    options.chains && options.chains.length > 0 ? options.chains : evmNamespace.defaultChains;
  return evmNamespace.buildAdapter({
    chains,
    icon: options.icon ?? DEFAULT_ICON,
    id: options.id ?? "walletconnect",
    name: options.name ?? "WalletConnect",
    provider,
  });
};

/**
 * Multi-namespace WalletConnect factory. Accepts a per-platform
 * `chains` map and returns one adapter per requested namespace from a
 * single paired session. Each returned adapter has its own id (with a
 * platform suffix) so butr's pool can hold them simultaneously.
 *
 * **What's implemented today.** EVM, SVM (Solana), and Sui namespace
 * builders ship with the package. Passing `bitcoin` chains today
 * throws — the namespace builder for Bitcoin is a tracked follow-up.
 * The factory is shaped this way so adding a platform = adding one
 * file under `src/namespaces/` and one entry to {@link KNOWN_NAMESPACES},
 * with no API change elsewhere.
 *
 * **Per-namespace adapter ids.** When more than one namespace is
 * requested, each adapter's id is suffixed with the platform
 * (`walletconnect-evm`, `walletconnect-svm`, …) so they coexist in
 * butr's pool. With a single namespace, the id stays the base
 * `options.id ?? "walletconnect"` for back-compat with
 * {@link createWalletConnectAdapter}.
 */
type WalletConnectMultiOptions = Omit<WalletConnectOptions, "chains"> & {
  /**
   * Per-namespace chain requests. Each key is a `ChainPlatform`; each
   * value is the CAIP-2 chains to advertise for that namespace.
   *
   * Omit a key to skip that namespace entirely. Pass an empty array
   * to use the namespace builder's `defaultChains`.
   */
  namespaces: Partial<Record<ChainPlatform, ReadonlyArray<string>>>;
};

/**
 * Registry of known per-namespace builders. Adding a new namespace =
 * import its builder + add the entry. Today EVM, SVM, and Sui are
 * implemented; the Bitcoin builder is a tracked follow-up.
 */
const KNOWN_NAMESPACES: Readonly<Partial<Record<ChainPlatform, WalletConnectNamespaceBuilder>>> = {
  evm: evmNamespace,
  sui: suiNamespace,
  svm: solanaNamespace,
};

const createWalletConnectAdapters = async (
  options: WalletConnectMultiOptions,
): Promise<Array<WalletAdapter>> => {
  const requested = Object.entries(options.namespaces).filter(([, v]) => v !== undefined) as Array<
    [ChainPlatform, ReadonlyArray<string>]
  >;
  if (requested.length === 0) {
    throw new Error(
      "[butr/walletconnect] createWalletConnectAdapters needs at least one namespace",
    );
  }
  // Validate every requested namespace has a registered builder before
  // we open a WC session — fail loudly upfront rather than after the
  // user has scanned the QR.
  const unsupported = requested.filter(([platform]) => !KNOWN_NAMESPACES[platform]);
  if (unsupported.length > 0) {
    throw new Error(
      `[butr/walletconnect] no namespace builder registered for: ${unsupported
        .map(([p]) => p)
        .join(
          ", ",
        )}. Today "evm", "svm", and "sui" ship; the Bitcoin builder is a tracked follow-up.`,
    );
  }

  const provider = await initProvider(options);
  const baseId = options.id ?? "walletconnect";
  const baseName = options.name ?? "WalletConnect";
  const icon = options.icon ?? DEFAULT_ICON;
  const multiNamespace = requested.length > 1;

  return requested.map(([platform, chains]) => {
    const builder = KNOWN_NAMESPACES[platform];
    if (!builder) {
      throw new Error(`Unreachable: builder missing for ${platform}`);
    }
    return builder.buildAdapter({
      chains: chains.length > 0 ? chains : builder.defaultChains,
      icon,
      // Suffix the id when more than one namespace is in play so each
      // adapter has a unique pool key.
      id: multiNamespace ? `${baseId}-${platform}` : baseId,
      name: multiNamespace ? `${baseName} (${platform.toUpperCase()})` : baseName,
      provider,
    });
  });
};

export type {
  Account,
  UniversalProviderConstructor,
  UniversalProviderLike,
  WalletConnectMetadata,
  WalletConnectMultiOptions,
  WalletConnectNamespaceBuilder,
  WalletConnectOptions,
};
export {
  DEFAULT_ICON as WALLETCONNECT_DEFAULT_ICON,
  KNOWN_NAMESPACES,
  createWalletConnectAdapter,
  createWalletConnectAdapters,
  evmNamespace,
  solanaNamespace,
  suiNamespace,
};
