import type { WalletSource } from "@usebutr/core";

import type { Eip1193Provider } from "./eip1193";
import { isEip1193Provider } from "./eip1193";
import { buildEvmAdapter } from "./eip6963-adapter";

/**
 * Generic wallet icon (a stylised purse SVG, ~600 bytes). Used as
 * the fallback icon when an injected provider has no EIP-6963 info.
 * Inline rather than a network fetch so the picker doesn't flicker.
 */
const GENERIC_INJECTED_ICON =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjEgMTJWN0g1YTIgMiAwIDAgMSAwLTQgaDE0djQiLz48cGF0aCBkPSJNMyA1djE0YTIgMiAwIDAgMCAyIDJoMTZ2LTVNMjEgMTIgaC0zYTIgMiAwIDAgMC0yIDJ2MGEyIDIgMCAwIDAgMiAyaDN6Ii8+PC9zdmc+";

declare global {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- DOM globals require interface merging.
  interface Window {
    ethereum?: Partial<Eip1193Provider>;
  }
}

/**
 * For EVM wallets that expose only `window.ethereum` and never announce via
 * EIP-6963; the adapter id is `injected:legacy`. On its own it also lists a
 * wallet that announced; `autoDiscovery` lists it only when none did.
 */
const discoverInjectedAdapter: WalletSource = (onAdapter) => {
  const provider = typeof window === "undefined" ? undefined : window.ethereum;

  if (isEip1193Provider(provider)) {
    onAdapter(
      buildEvmAdapter(
        { icon: GENERIC_INJECTED_ICON, id: "injected:legacy", name: "Browser wallet" },
        provider,
      ),
    );
  }

  return () => {};
};

export { GENERIC_INJECTED_ICON, discoverInjectedAdapter };
