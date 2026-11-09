import type { WalletSource } from "@usebutr/core";

import type { Eip6963AnnounceEvent, Eip6963ProviderInfo } from "./eip1193";
import { isEip1193Provider } from "./eip1193";
import { buildEvmAdapter } from "./eip6963-adapter";

const ANNOUNCE_EVENT = "eip6963:announceProvider";
const REQUEST_EVENT = "eip6963:requestProvider";

const PROVIDER_INFO_KEYS = ["icon", "name", "rdns", "uuid"] as const;

const isProviderInfo = (value: unknown): value is Eip6963ProviderInfo => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const fields = new Map(Object.entries(value));

  return PROVIDER_INFO_KEYS.every((key) => typeof fields.get(key) === "string");
};

const isEip6963AnnounceEvent = (event: Event): event is Eip6963AnnounceEvent => {
  const detail: unknown = "detail" in event ? event.detail : undefined;

  return (
    typeof detail === "object" &&
    detail !== null &&
    "info" in detail &&
    isProviderInfo(detail.info) &&
    "provider" in detail &&
    isEip1193Provider(detail.provider)
  );
};

/**
 * Spec: https://eips.ethereum.org/EIPS/eip-6963. Dedupe is by `info.rdns`
 * because `info.uuid` is regenerated per page load. The listener stays
 * attached for the session so wallets that boot late still register.
 */
const discoverEvmAdapters: WalletSource = (onAdapter) => {
  if (typeof window === "undefined") {
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
    onAdapter(buildEvmAdapter({ icon: info.icon, id: info.rdns, name: info.name }, provider));
  };

  window.addEventListener(ANNOUNCE_EVENT, handler);
  window.dispatchEvent(new Event(REQUEST_EVENT));

  return () => {
    window.removeEventListener(ANNOUNCE_EVENT, handler);
  };
};

export { ANNOUNCE_EVENT, REQUEST_EVENT, discoverEvmAdapters };
