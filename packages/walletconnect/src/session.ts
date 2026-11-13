import type { Connector } from "@usebutr/core";
import type { Eip1193Listener } from "@usebutr/evm";

import type { UniversalProviderLike, WcNamespaceRequest } from "./loader";

type PairingRequest = Readonly<Record<string, WcNamespaceRequest>>;

type SessionLifecycle = Pick<Connector, "connect"> &
  Required<Pick<Connector, "disconnect" | "restore">>;

type WalletConnectSession = {
  /** `connect` / `disconnect` for the adapter `name` of `namespace`. The
   *  first `connect` pairs every namespace; the WC session ends only when the
   *  last connected adapter disconnects. */
  lifecycle: (namespace: string, name: string) => SessionLifecycle;
};

type CreateWalletConnectSessionInput = {
  namespaces: PairingRequest;
  onPairingUri?: (uri: string) => void;
  optionalNamespaces?: PairingRequest;
  provider: UniversalProviderLike;
};

/** Every request in a namespace the session does not carry fails at the
 *  relay, so the adapter refuses to report itself connected. */
const missingNamespaceError = (namespace: string, name: string): Error =>
  new Error(
    `[butr/walletconnect] the WalletConnect session carries no "${namespace}" namespace, so ${name} requests cannot be routed. The wallet declined it at pairing time.`,
  );

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
  const connected = new Set<symbol>();
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

  const hasNamespace = (namespace: string) =>
    provider.session?.namespaces?.[namespace] !== undefined;

  /** Concurrent callers share the in-flight pairing instead of racing two
   *  QR codes. */
  const ensurePaired = async (): Promise<void> => {
    if (provider.session) {
      return;
    }

    pairing ??= (async () => {
      attachPairingListener();

      try {
        await provider.connect({ namespaces: { ...namespaces }, optionalNamespaces: optional });
      } finally {
        pairing = null;
      }
    })();
    await pairing;
  };

  return {
    lifecycle: (namespace, name) => {
      const member = Symbol(namespace);

      return {
        async connect() {
          if (!hasNamespace(namespace)) {
            await ensurePaired();

            if (!hasNamespace(namespace)) {
              throw missingNamespaceError(namespace, name);
            }
          }

          connected.add(member);
        },

        async disconnect() {
          connected.delete(member);

          if (connected.size > 0) {
            return;
          }

          detachPairingListener();

          if (!provider.session) {
            return;
          }

          await provider.disconnect();
        },

        async restore() {
          if (!provider.session) {
            throw new Error("No WalletConnect session for silent reconnect");
          }

          if (!hasNamespace(namespace)) {
            throw missingNamespaceError(namespace, name);
          }

          connected.add(member);
          await Promise.resolve();
        },
      };
    },
  };
};

export type { PairingRequest, WalletConnectSession };

export { createWalletConnectSession };
