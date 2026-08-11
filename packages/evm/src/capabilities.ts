import type { WalletCapabilities } from "@usebutr/core";

const EIP6963_RDNS_WITH_REQUEST_ACCOUNTS = new Set<string>([
  "io.metamask", // MetaMask: verified May 2026
]);

type Eip6963CapabilityInput = { rdns: string };

const resolveEip6963Capabilities = (input: Eip6963CapabilityInput): WalletCapabilities => ({
  getBalance: true,
  getTransactionReceipt: true,
  requestAccounts: EIP6963_RDNS_WITH_REQUEST_ACCOUNTS.has(input.rdns),
  sendTransaction: true,
  signIn: false,
  signMessage: true,
  signTransaction: false,
  subscribe: true,
  switchAccount: false,
  switchChain: true,
});

export type { Eip6963CapabilityInput };
export { EIP6963_RDNS_WITH_REQUEST_ACCOUNTS, resolveEip6963Capabilities };
