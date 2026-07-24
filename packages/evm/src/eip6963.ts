import type { WalletAdapter } from "@usebutr/core";

import type { Eip6963AnnounceEvent, Eip6963ProviderInfo } from "./eip1193";
import { buildEvmAdapter } from "./eip6963-adapter";

const ANNOUNCE_EVENT = "eip6963:announceProvider";
const REQUEST_EVENT = "eip6963:requestProvider";

type AdapterCallback = (adapter: WalletAdapter, info: Eip6963ProviderInfo) => void;

type DiscoverOptions = {
  /** Event target to listen on. Defaults to `window` in browser/RN/
   *  SSR'd environments; tests can pass a fresh `new EventTarget()` to
   *  exercise the discovery loop without a DOM. */
  target?: EventTarget;
};

const isEip6963AnnounceEvent = (event: Event): event is Eip6963AnnounceEvent => {
  if (!("detail" in event)) {
    return false;
  }
  const detail: unknown = event.detail;
  if (typeof detail !== "object" || detail === null) {
    return false;
  }
  if (!("info" in detail) || !("provider" in detail)) {
    return false;
  }
  const { info, provider } = detail;
  return (
    typeof info === "object" &&
    info !== null &&
    "rdns" in info &&
    typeof info.rdns === "string" &&
    typeof provider === "object" &&
    provider !== null
  );
};

const isEventTarget = (value: unknown): value is EventTarget =>
  typeof value === "object" &&
  value !== null &&
  "addEventListener" in value &&
  typeof value.addEventListener === "function";

const resolveTarget = (target?: EventTarget): EventTarget | null => {
  if (target !== undefined) {
    return target;
  }
  const candidate: unknown = (globalThis as { window?: unknown }).window;
  return isEventTarget(candidate) ? candidate : null;
};

/**
 * Subscribe to EIP-6963 wallet announcements. Spec:
 * https://eips.ethereum.org/EIPS/eip-6963
 *
 * Flow:
 *  1. Page registers a listener for `eip6963:announceProvider`.
 *  2. Page dispatches `eip6963:requestProvider` to kick wallets that
 *     have already loaded.
 *  3. Wallets that load later still dispatch their own announcement
 *     when they boot, so the listener stays attached for the lifetime
 *     of the discovery session.
 *  4. Dedup by `info.rdns`; wallets occasionally re-announce, and
 *     `info.uuid` is regenerated per page load so it's not stable.
 *
 * Returns an unsubscribe function that removes the listener.
 * In non-browser environments (SSR, tests with no window) returns
 * a noop unsubscribe and never fires the callback.
 */
const discoverEvmAdapters = (
  onAdapter: AdapterCallback,
  options: DiscoverOptions = {},
): (() => void) => {
  const target = resolveTarget(options.target);
  if (!target) {
    return () => {};
  }

  const seen = new Set<string>();
  const handler = (event: Event) => {
    if (!isEip6963AnnounceEvent(event)) {
      return;
    }
    const { info, provider } = event.detail;
    if (info.rdns.length === 0) {
      return;
    }
    if (seen.has(info.rdns)) {
      return;
    }
    seen.add(info.rdns);
    onAdapter(buildEvmAdapter(info, provider), info);
  };

  target.addEventListener(ANNOUNCE_EVENT, handler);
  target.dispatchEvent(new Event(REQUEST_EVENT));

  return () => {
    target.removeEventListener(ANNOUNCE_EVENT, handler);
  };
};

export { ANNOUNCE_EVENT, REQUEST_EVENT, discoverEvmAdapters };
