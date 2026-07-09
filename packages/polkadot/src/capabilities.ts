import type { WalletCapabilities } from "@usebutr/core";

type WalletStandardPolkadotCapabilityInput = {
  chainCount: number;
  features: {
    events: boolean;
    signMessage: boolean;
  };
};

/**
 * injectedWeb3 capability profile. The injected `signer.signRaw` always
 * supports message signing; `accounts.subscribe` always supports events;
 * butr authors the chain list (4 chains) so local switchChain is always
 * available.
 */
const resolveInjectedPolkadotCapabilities = (): WalletCapabilities => ({
  getBalance: false,
  getTransactionReceipt: false,
  requestAccounts: false,
  sendTransaction: false,
  signIn: false,
  signMessage: true,
  signTransaction: false,
  subscribe: true,
  switchAccount: false,
  switchChain: true,
});

/**
 * Wallet Standard `polkadot:*` capability mapping. Mirrors the Sui/SVM
 * resolvers: features come from what the wallet advertises; switchChain
 * follows chainCount (local re-routing among advertised chains).
 */
const resolveWalletStandardPolkadotCapabilities = (
  input: WalletStandardPolkadotCapabilityInput,
): WalletCapabilities => ({
  getBalance: false,
  getTransactionReceipt: false,
  requestAccounts: false,
  sendTransaction: false,
  signIn: false,
  signMessage: input.features.signMessage,
  signTransaction: false,
  subscribe: input.features.events,
  switchAccount: false,
  switchChain: input.chainCount > 1,
});

export type { WalletStandardPolkadotCapabilityInput };
export { resolveInjectedPolkadotCapabilities, resolveWalletStandardPolkadotCapabilities };
