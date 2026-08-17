import type { WalletAdapter } from "@usebutr/core";

import type { Eip1193Provider, Eip6963ProviderInfo } from "./eip1193";
import { buildEvmAdapter } from "./eip6963-adapter";

/**
 * Generic wallet icon (a stylised purse SVG, ~600 bytes). Used as
 * the fallback icon when an injected provider has no EIP-6963 info.
 * Inline rather than a network fetch so the picker doesn't flicker.
 */
const GENERIC_INJECTED_ICON =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjEgMTJWN0g1YTIgMiAwIDAgMSAwLTQgaDE0djQiLz48cGF0aCBkPSJNMyA1djE0YTIgMiAwIDAgMCAyIDJoMTZ2LTVNMjEgMTIgaC0zYTIgMiAwIDAgMC0yIDJ2MGEyIDIgMCAwIDAgMiAyaDN6Ii8+PC9zdmc+";

const DEFAULT_SETTLE_MS = 150;

type InjectedDiscoveryOptions = {
  /**
   * Consulted before emitting: an already-registered EIP-6963 adapter means
   * the wallet is covered by the standards path and emitting would duplicate
   * it. Omit to always emit.
   */
  hasAnyEip6963Adapter?: () => boolean;
  /**
   * Most wallets announce within the first frame; 150ms leaves room for slow
   * announcements without stalling the picker.
   */
  settleMs?: number;
  /** Override the global `window` reference (tests, iframes). */
  target?: { ethereum?: unknown } | null;
};

const isEip1193Provider = (value: unknown): value is Eip1193Provider =>
  typeof value === "object" &&
  value !== null &&
  "request" in value &&
  typeof value.request === "function";

const readEthereum = (target: InjectedDiscoveryOptions["target"]): Eip1193Provider | null => {
  const globalWindow: unknown = typeof window === "undefined" ? null : window;
  const host: unknown = target === undefined ? globalWindow : target;
  if (typeof host !== "object" || host === null || !("ethereum" in host)) {
    return null;
  }
  const eth: unknown = host.ethereum;
  return isEip1193Provider(eth) ? eth : null;
};

/**
 * Last-resort path for the long tail of EVM wallets that expose only
 * `window.ethereum` and never announce via EIP-6963. The emitted adapter
 * carries `rdns: "injected:legacy"` so consumers can tell it apart.
 */
const discoverInjectedAdapter = (
  onAdapter: (adapter: WalletAdapter) => void,
  options: InjectedDiscoveryOptions = {},
): (() => void) => {
  const settleMs = options.settleMs ?? DEFAULT_SETTLE_MS;
  let cancelled = false;
  const timer = setTimeout(() => {
    if (cancelled) {
      return;
    }
    if (options.hasAnyEip6963Adapter?.() === true) {
      return;
    }
    const provider = readEthereum(options.target);
    if (provider === null) {
      return;
    }
    const info: Eip6963ProviderInfo = {
      icon: GENERIC_INJECTED_ICON,
      name: "Browser wallet",
      rdns: "injected:legacy",
      uuid: "injected:legacy",
    };
    onAdapter(buildEvmAdapter(info, provider));
  }, settleMs);

  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
};

export type { InjectedDiscoveryOptions };
export { GENERIC_INJECTED_ICON, discoverInjectedAdapter };
