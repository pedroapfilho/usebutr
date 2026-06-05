import type {
  Account,
  ChainBase,
  ConnectorEvent,
  PolkadotAdapter,
  WalletCapabilities,
} from "@usebutr/core";
import { sanitizeIcon } from "@usebutr/core";

import { resolveInjectedPolkadotCapabilities } from "../capabilities";
import { POLKADOT_CHAINS } from "../chains";

import { GENERIC_POLKADOT_ICON } from "./icon";
import type { Injected, InjectedWindowProvider } from "./injected-web3";
import { bytesToHex, hexToBytes, wrapBytes } from "./injected-web3";

const DAPP_NAME = "butr";

/** Handle returned by `getSigner()`. Carries the `window.injectedWeb3`
 *  key (`extensionName`) so consumers can bridge to polkadot-api's
 *  `connectInjectedExtension`, the active SS58 address, and the raw
 *  `Injected` object for direct `signer` access. */
type PolkadotSignerHandle = {
  address: string;
  extension: Injected;
  extensionName: string;
};

/**
 * Convert a wallet display name into a stable kebab-case slug for the
 * injected adapter id. Strips anything that isn't a lowercase letter or
 * digit (turning "Polkadot{.js}" → "polkadot-js"), then prepends the
 * injected Polkadot channel prefix.
 *
 * This is intentionally NOT the wallet-standard-shared `slugify` helper
 * — that helper embeds the `wallet-standard:` scheme which is wrong for
 * the injected channel. The ID convention for injected adapters is
 * `injected:polkadot:<slug>`.
 */
const toKebab = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gv, "-")
    .replaceAll(/^-|-$/gv, "");

const buildPolkadotAccount = (address: string, chain: ChainBase): Account => ({
  chain,
  id: `${chain.id}:${address}`,
  walletAddress: address,
});

/**
 * Wrap a `window.injectedWeb3[name]` provider into a butr
 * `PolkadotAdapter`. The provider is NOT enabled at construction —
 * `enable()` triggers the authorization prompt, so it runs lazily in
 * `connect()`. Before connect, `getAccount` returns null.
 *
 * `id` is `injected:polkadot:<slug>` so consumers can distinguish the
 * injected channel from the Wallet Standard one in their picker.
 */
const buildInjectedPolkadotAdapter = (
  extensionName: string,
  displayName: string,
  provider: InjectedWindowProvider,
): PolkadotAdapter => {
  const capabilities: WalletCapabilities = resolveInjectedPolkadotCapabilities();
  let injected: Injected | null = null;
  let chain: ChainBase = POLKADOT_CHAINS.polkadot;
  const listenersSet = new Set<(event: ConnectorEvent) => void>();

  const requireInjected = (): Injected => {
    if (!injected) {
      throw new Error(`Wallet ${displayName} is not connected`);
    }
    return injected;
  };

  const firstAddress = async (): Promise<string | null> => {
    if (!injected) {
      return null;
    }
    const accounts = await injected.accounts.get();
    return accounts[0]?.address ?? null;
  };

  return {
    capabilities,
    chainPlatform: "polkadot",

    async connect() {
      injected = await provider.enable(DAPP_NAME);
      const accounts = await injected.accounts.get();
      if (accounts.length === 0) {
        throw new Error(`Wallet ${displayName} exposed no accounts`);
      }
    },

    disconnect() {
      injected = null;
      return Promise.resolve();
    },

    async getAccount() {
      const address = await firstAddress();
      return address ? buildPolkadotAccount(address, chain) : null;
    },

    async getAccounts() {
      if (!injected) {
        return [];
      }
      const accounts = await injected.accounts.get();
      return accounts.map((a) => buildPolkadotAccount(a.address, chain));
    },

    getBalance() {
      return Promise.resolve({ decimals: 10, formatted: "0", symbol: "DOT", value: 0n });
    },

    async getSigner() {
      const ext = requireInjected();
      const address = (await firstAddress()) ?? "";
      const handle: PolkadotSignerHandle = { address, extension: ext, extensionName };
      return handle;
    },

    getTransactionReceipt() {
      return Promise.resolve({ status: "Pending" as const });
    },

    icon: sanitizeIcon(GENERIC_POLKADOT_ICON),
    id: `injected:polkadot:${toKebab(extensionName)}`,
    name: displayName,

    sendTx() {
      // butr ships no RPC; building/broadcasting an extrinsic needs chain
      // metadata. Consumers drive polkadot-api with getSigner() instead.
      return Promise.reject(
        new Error(
          "Polkadot sendTx is unsupported — use getSigner() with polkadot-api to build and submit extrinsics",
        ),
      );
    },

    sendTxToChain() {
      return Promise.reject(
        new Error(
          "Polkadot sendTxToChain is unsupported — use getSigner() with polkadot-api to build and submit extrinsics",
        ),
      );
    },

    async signMessage(msg, account) {
      const ext = requireInjected();
      if (!ext.signer.signRaw) {
        throw new Error(`Wallet ${displayName} does not expose signRaw`);
      }
      const address = account?.walletAddress ?? (await firstAddress());
      if (!address) {
        throw new Error("No connected account");
      }
      const wrapped = wrapBytes(msg);
      const result = await ext.signer.signRaw({
        address,
        data: bytesToHex(wrapped),
        type: "bytes",
      });
      return { signature: hexToBytes(result.signature), signedMessage: wrapped };
    },

    subscribe(listener) {
      listenersSet.add(listener);
      let unsubWallet: (() => void) | null = null;
      if (injected?.accounts.subscribe) {
        unsubWallet = injected.accounts.subscribe((accounts) => {
          if (accounts.length === 0) {
            listener({ type: "disconnected" });
            return;
          }
          const built = accounts.map((a) => buildPolkadotAccount(a.address, chain));
          const first = built[0];
          if (first) {
            listener({ account: first, accounts: built, type: "accountChanged" });
          }
        });
      }
      return () => {
        listenersSet.delete(listener);
        unsubWallet?.();
      };
    },

    switchChain(target) {
      if (target.namespace !== "polkadot") {
        return Promise.reject(
          new Error(
            `Polkadot adapter received non-Polkadot chain "${target.id}". Pass a chain with namespace "polkadot".`,
          ),
        );
      }
      // Substrate accounts are chain-agnostic; switching is local state
      // that tells consumers which chain context to target.
      chain = target;
      return Promise.resolve();
    },
  };
};

export type { PolkadotSignerHandle };
export { buildInjectedPolkadotAdapter };
