import type {
  Eip1193Listener,
  Eip1193Provider,
  Eip1193RequestArgs,
  Eip1193Value,
} from "../eip1193";

type MockProviderHandle = Eip1193Provider & {
  emit: (event: string, ...args: ReadonlyArray<Eip1193Value | undefined>) => void;
  methods: () => Array<string>;
  requests: Array<Eip1193RequestArgs>;
  setHandler: (
    method: string,
    handler: (params: Eip1193RequestArgs["params"]) => Eip1193Value | undefined,
  ) => void;
};

/** An EIP-1193 provider that records requests and answers from per-method handlers. */
const createMockProvider = (): MockProviderHandle => {
  const listeners = new Map<string, Set<Eip1193Listener>>();

  const handlers = new Map<
    string,
    (params: Eip1193RequestArgs["params"]) => Eip1193Value | undefined
  >();

  const requests: Array<Eip1193RequestArgs> = [];

  return {
    emit(event, ...args) {
      const set = listeners.get(event);

      if (!set) {
        return;
      }

      for (const listener of set) {
        listener(...args);
      }
    },
    methods: () => requests.map(({ method }) => method),
    on(event, listener) {
      let set = listeners.get(event);

      if (!set) {
        set = new Set();
        listeners.set(event, set);
      }

      set.add(listener);
    },
    removeListener(event, listener) {
      listeners.get(event)?.delete(listener);
    },
    request({ method, params }) {
      requests.push({ method, params });
      const handler = handlers.get(method);

      return Promise.resolve(handler ? handler(params) : undefined);
    },
    requests,
    setHandler(method, handler) {
      handlers.set(method, handler);
    },
  };
};

export type { MockProviderHandle };

export { createMockProvider };
