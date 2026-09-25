import type { ChainPlatform, WalletAdapter } from "@usebutr/core";

/** Just enough adapter for discovery plumbing, which only reads identity. */
const createAdapter = (id: string, chainPlatform: ChainPlatform = "evm"): WalletAdapter => ({
  chainPlatform,
  connect: () => Promise.resolve(),
  getAccounts: () => Promise.resolve([]),
  getSigner: () => Promise.reject(new Error("not used in discovery tests")),
  id,
  name: id,
});

export { createAdapter };
