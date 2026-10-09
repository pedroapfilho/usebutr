import type { EvmAdapter } from "@usebutr/core";

import type { Eip1193Provider, Eip6963ProviderInfo } from "./eip1193";
import { buildEvmAdapter } from "./eip6963-adapter";

/**
 * Generic wallet icon (a stylised purse SVG, ~600 bytes). Used as
 * the fallback icon when an injected provider has no EIP-6963 info.
 * Inline rather than a network fetch so the picker doesn't flicker.
 */
const GENERIC_INJECTED_ICON =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjEgMTJWN0g1YTIgMiAwIDAgMSAwLTQgaDE0djQiLz48cGF0aCBkPSJNMyA1djE0YTIgMiAwIDAgMCAyIDJoMTZ2LTVNMjEgMTIgaC0zYTIgMiAwIDAgMC0yIDJ2MGEyIDIgMCAwIDAgMiAyaDN6Ii8+PC9zdmc+";

type InjectedDiscoveryOptions = {
  /** Override the global `window` reference (tests, iframes). */
  target?: { ethereum?: Partial<Eip1193Provider> } | null;
};

declare global {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- DOM globals require interface merging.
  interface Window {
    ethereum?: Partial<Eip1193Provider>;
  }
}

/** Structural check for code that holds a provider of unknown origin, such
 *  as `window.ethereum`. A butr signer narrows on `kind === "eip1193"`
 *  instead. */
const isEip1193Provider = (value: unknown): value is Eip1193Provider =>
  typeof value === "object" &&
  value !== null &&
  "on" in value &&
  typeof value.on === "function" &&
  "removeListener" in value &&
  typeof value.removeListener === "function" &&
  "request" in value &&
  typeof value.request === "function";

const readEthereum = (target: InjectedDiscoveryOptions["target"]): Eip1193Provider | null => {
  const host = target === undefined ? globalThis.window : target;
  return isEip1193Provider(host?.ethereum) ? host.ethereum : null;
};

/**
 * For EVM wallets that expose only `window.ethereum` and never announce via
 * EIP-6963; the adapter id is `injected:legacy`. On its own it also lists a
 * wallet that announced; `autoDiscovery` lists it only when none did.
 */
const discoverInjectedAdapter = (
  onAdapter: (adapter: EvmAdapter) => void,
  options: InjectedDiscoveryOptions = {},
): (() => void) => {
  const provider = readEthereum(options.target);
  if (provider !== null) {
    const info: Eip6963ProviderInfo = {
      icon: GENERIC_INJECTED_ICON,
      name: "Browser wallet",
      rdns: "injected:legacy",
      uuid: "injected:legacy",
    };
    onAdapter(buildEvmAdapter(info, provider));
  }
  return () => {};
};

export type { InjectedDiscoveryOptions };
export { GENERIC_INJECTED_ICON, discoverInjectedAdapter, isEip1193Provider };
