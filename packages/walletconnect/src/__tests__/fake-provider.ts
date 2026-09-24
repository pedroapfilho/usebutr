import type { Eip1193Listener, Eip1193RequestArgs, Eip1193Value } from "@usebutr/evm";
import { vi } from "vitest";

import type { UniversalProviderConstructor, UniversalProviderLike } from "../adapter";

type ConnectArgs = Parameters<UniversalProviderLike["connect"]>[0];
type FakeSession = { namespaces: Record<string, { accounts: ReadonlyArray<string> }> };
type ListenerCall = { event: string; listener: Eip1193Listener };
type RequestCall = { args: Eip1193RequestArgs; chain: string | undefined };

type FakeProviderOptions = {
  /** CAIP-10 accounts the wallet grants per namespace at pairing. */
  accounts?: Readonly<Record<string, ReadonlyArray<string>>>;
  /** Namespaces the wallet approves; omit to approve everything asked. */
  approve?: ReadonlyArray<string>;
  disconnect?: () => Promise<void>;
  request?: (args: Eip1193RequestArgs, chain: string | undefined) => Eip1193Value | undefined;
  /** A session that is already live, as after a page reload. */
  session?: FakeSession;
};

type FakeProvider = UniversalProviderLike & {
  connectCalls: Array<ConnectArgs>;
  disconnectCalls: () => number;
  emit: (event: string, ...args: ReadonlyArray<Eip1193Value | undefined>) => void;
  onCalls: Array<ListenerCall>;
  removeListenerCalls: Array<ListenerCall>;
  requests: Array<RequestCall>;
};

/** A UniversalProvider stand-in that records every call, including the
 *  chain each request was routed to. */
const createFakeProvider = (options: FakeProviderOptions = {}): FakeProvider => {
  const listeners = new Map<string, Set<Eip1193Listener>>();
  const connectCalls: Array<ConnectArgs> = [];
  const onCalls: Array<ListenerCall> = [];
  const removeListenerCalls: Array<ListenerCall> = [];
  const requests: Array<RequestCall> = [];
  let disconnectCalls = 0;
  let session: FakeSession | null = options.session ?? null;

  return {
    connect(args) {
      connectCalls.push(args);
      const granted = Object.keys({ ...args.namespaces, ...args.optionalNamespaces }).filter(
        (prefix) => options.approve === undefined || options.approve.includes(prefix),
      );
      session = {
        namespaces: Object.fromEntries(
          granted.map((prefix) => [prefix, { accounts: options.accounts?.[prefix] ?? [] }]),
        ),
      };
      return Promise.resolve(undefined);
    },
    connectCalls,
    disconnect() {
      disconnectCalls += 1;
      session = null;
      return options.disconnect ? options.disconnect() : Promise.resolve();
    },
    disconnectCalls: () => disconnectCalls,
    emit(event, ...args) {
      for (const listener of listeners.get(event) ?? []) {
        listener(...args);
      }
    },
    on(event, listener) {
      onCalls.push({ event, listener });
      const set = listeners.get(event) ?? new Set();
      set.add(listener);
      listeners.set(event, set);
    },
    onCalls,
    removeListener(event, listener) {
      removeListenerCalls.push({ event, listener });
      listeners.get(event)?.delete(listener);
    },
    removeListenerCalls,
    request(args, chain) {
      requests.push({ args, chain });
      // Deferred, so a throwing handler surfaces as a rejection.
      return Promise.resolve().then(() => options.request?.(args, chain) ?? null);
    },
    requests,
    get session() {
      return session;
    },
  };
};

const fakeUniversalProvider = (provider: UniversalProviderLike): UniversalProviderConstructor => ({
  init: vi.fn<UniversalProviderConstructor["init"]>().mockResolvedValue(provider),
});

/** Requests other than the eip155 provider's own `eth_chainId` reads. */
const walletRequests = (provider: FakeProvider): Array<RequestCall> =>
  provider.requests.filter(({ args }) => args.method !== "eth_chainId");

export type { FakeProvider };
export { createFakeProvider, fakeUniversalProvider, walletRequests };
