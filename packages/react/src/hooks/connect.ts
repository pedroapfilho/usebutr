import type { ConnectedWallet, ConnectionError, ConnectStatus } from "@usebutr/core";
import { useCallback } from "react";
import { shallow } from "zustand/shallow";
import { useStoreWithEqualityFn } from "zustand/traditional";

import { useWalletManager } from "../context";

type UseConnectResult = {
  /** Starts an attempt and never rejects: its outcome lands in `status` and
   *  `error`. Safe to pass straight to `onClick`. */
  connect: (connectorId: string) => void;
  /** Resolves the connected wallet; rejects with a `ConnectionError`. */
  connectAsync: (connectorId: string) => Promise<ConnectedWallet>;
  /** The wallet the in-flight attempt is for; `null` when none is. */
  connectingId: string | null;
  error: ConnectionError | null;
  /** Clears `error` and returns `status` to idle, e.g. from a dismiss button. */
  reset: () => void;
  status: ConnectStatus;
};

/** The connect actions with the state of the latest attempt. Every action
 *  is a stable reference. */
const useConnect = (): UseConnectResult => {
  const manager = useWalletManager();
  const attempt = useStoreWithEqualityFn(
    manager,
    (state) => ({
      connectingId: state.connectingConnectorId,
      error: state.connectionError,
      status: state.connectionStatus,
    }),
    shallow,
  );
  const connect = useCallback(
    (connectorId: string) => {
      void (async () => {
        try {
          await manager.connect(connectorId);
        } catch {
          // Already in `error` and `status`, and reported to `onConnectError`.
        }
      })();
    },
    [manager],
  );
  return {
    ...attempt,
    connect,
    connectAsync: manager.connect,
    reset: manager.clearConnectionError,
  };
};

export type { UseConnectResult };
export { useConnect };
