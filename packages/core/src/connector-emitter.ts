import type { ConnectorEvent } from "./types/connector";

type ConnectorListener = (event: ConnectorEvent) => void;

type ConnectorEmitter = {
  /** Delivers `event` to every current subscriber. */
  emit: (event: ConnectorEvent) => void;
  /** Current subscribers. */
  listenerCount: () => number;
  /** Shaped as `Connector.subscribe`, so an adapter can hand it out as is. */
  subscribe: (listener: ConnectorListener) => () => void;
};

const createConnectorEmitter = (): ConnectorEmitter => {
  const listeners = new Set<ConnectorListener>();

  return {
    emit: (event) => {
      for (const listener of listeners) {
        listener(event);
      }
    },
    listenerCount: () => listeners.size,
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
};

export type { ConnectorEmitter };

export { createConnectorEmitter };
