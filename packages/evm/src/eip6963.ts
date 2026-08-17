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
 * Spec: https://eips.ethereum.org/EIPS/eip-6963. Dedupe is by `info.rdns`
 * because `info.uuid` is regenerated per page load. The listener stays
 * attached for the session so wallets that boot late still register.
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
