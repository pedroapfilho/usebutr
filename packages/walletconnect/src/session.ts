import { logWarn } from "@usebutr/core";
import type { Eip1193Listener } from "@usebutr/evm";

import type { UniversalProviderLike, WcNamespaceRequest } from "./loader";

type PairingRequest = Readonly<Record<string, WcNamespaceRequest>>;

type WalletConnectSession = {
  /** Tear the session down for every adapter sharing it. */
  disconnect: () => Promise<void>;
  /** Pair once for the whole session; concurrent callers share the
   *  in-flight pairing instead of racing two QR codes. */
  ensurePaired: () => Promise<void>;
  /** Whether the live session actually carries this CAIP namespace. A
   *  wallet can approve the pairing while declining an optional
   *  namespace, whose RPC calls would then fail at the relay. */
  hasNamespace: (caipPrefix: string) => boolean;
  hasSession: () => boolean;
  provider: UniversalProviderLike;
  /** Register one adapter as a holder of the pairing URI channel. The
   *  `display_uri` listener is dropped only once every holder has
   *  released, so one adapter's disconnect cannot blind its siblings. */
  retain: () => () => void;
};

type CreateWalletConnectSessionInput = {
  namespaces: PairingRequest;
  onPairingUri?: (uri: string) => void;
  optionalNamespaces?: PairingRequest;
  provider: UniversalProviderLike;
};

/**
 * Owns the provider and the pairing state shared by every adapter of
 * one factory call. A WC v2 session's namespaces are fixed at approval
 * time and cannot be extended from the dapp afterwards.
 */
const createWalletConnectSession = ({
  namespaces,
  onPairingUri,
  optionalNamespaces,
  provider,
}: CreateWalletConnectSessionInput): WalletConnectSession => {
  const holders = new Set<symbol>();
  const live = new Set<symbol>();
  let pairing: Promise<void> | null = null;
  let displayUriListener: Eip1193Listener | null = null;

  const attachPairingListener = (): void => {
    if (onPairingUri === undefined || displayUriListener !== null) {
      return;
    }
    const listener: Eip1193Listener = (...args) => {
      const uri = args[0];
      if (typeof uri === "string") {
        onPairingUri(uri);
      }
    };
    displayUriListener = listener;
    provider.on("display_uri", listener);
  };

  const detachPairingListener = (): void => {
    if (displayUriListener === null) {
      return;
    }
    provider.removeListener("display_uri", displayUriListener);
    displayUriListener = null;
  };

  attachPairingListener();

  const optional =
    optionalNamespaces !== undefined && Object.keys(optionalNamespaces).length > 0
      ? optionalNamespaces
      : undefined;

  const pair = async (): Promise<void> => {
    await provider.connect({ namespaces: { ...namespaces }, optionalNamespaces: optional });
  };

  return {
    async disconnect() {
      if (!provider.session) {
        return;
      }
      try {
        await provider.disconnect();
      } catch (error) {
        logWarn("[butr/walletconnect] disconnect threw:", error);
      }
    },

    async ensurePaired() {
      if (provider.session) {
        return;
      }
      const inFlight = pairing;
      if (inFlight !== null) {
        await inFlight;
        return;
      }
      attachPairingListener();
      for (const holder of holders) {
        live.add(holder);
      }
      const started = pair();
      pairing = started;
      try {
        await started;
      } finally {
        pairing = null;
      }
    },

    hasNamespace: (caipPrefix) => provider.session?.namespaces?.[caipPrefix] !== undefined,

    hasSession: () => Boolean(provider.session),

    provider,

    retain() {
      const holder = Symbol("butr-wc-holder");
      holders.add(holder);
      live.add(holder);
      return () => {
        live.delete(holder);
        if (live.size === 0) {
          detachPairingListener();
        }
      };
    },
  };
};

/** Session for a namespace builder driven on its own, outside the
 *  factory: it pairs for the one namespace it serves. */
const createSingleNamespaceSession = (input: {
  chains: ReadonlyArray<string>;
  events: ReadonlyArray<string>;
  methods: ReadonlyArray<string>;
  namespace: string;
  provider: UniversalProviderLike;
}): WalletConnectSession =>
  createWalletConnectSession({
    namespaces: {
      [input.namespace]: {
        chains: [...input.chains],
        events: [...input.events],
        methods: [...input.methods],
      },
    },
    provider: input.provider,
  });

/** Every request in a namespace the session does not carry fails at the
 *  relay, so the adapter refuses to report itself connected. */
const missingNamespaceError = (namespace: string, platform: string): Error =>
  new Error(
    `[butr/walletconnect] the WalletConnect session carries no "${namespace}" namespace, so ${platform} requests cannot be routed. The wallet declined it at pairing time.`,
  );

export type { PairingRequest, WalletConnectSession };
export { createSingleNamespaceSession, createWalletConnectSession, missingNamespaceError };
