import type { ConnectedWallet } from "@usebutr/core";
import { type Network, Wormhole } from "@wormhole-foundation/sdk-connect";
// Direct chain-SDK imports; bypass the `@wormhole-foundation/sdk`
// umbrella, which side-effect-imports addresses for chains we don't use.
// The Circle (CCTP) protocol modules register themselves via side-effect
// imports in `main.tsx`, sequenced before any `sdk-solana` import.
import { EvmPlatform } from "@wormhole-foundation/sdk-evm";
import { SolanaPlatform } from "@wormhole-foundation/sdk-solana";
import type { Eip1193Provider } from "ethers";

import type { ChainSpec } from "./chains";
import { ButrEvmWormholeSigner } from "./wormhole-signer";
import { ButrSvmWormholeSigner } from "./wormhole-svm-signer";

const NETWORK: Network = "Testnet";

let instance: Wormhole<Network> | null = null;
const getWormhole = (): Wormhole<Network> => {
  instance ??= new Wormhole(NETWORK, [EvmPlatform, SolanaPlatform]);
  return instance;
};

const ensureChain = async (
  provider: Eip1193Provider,
  expectedChainIdHex: string,
): Promise<void> => {
  const rawChainId: unknown = await provider.request({ method: "eth_chainId" });
  const current = typeof rawChainId === "string" ? rawChainId : "";
  if (current.toLowerCase() === expectedChainIdHex.toLowerCase()) {
    return;
  }
  await provider.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: expectedChainIdHex }],
  });
};

// Build a Wormhole SignAndSendSigner for the given chain + butr wallet.
// EVM legs first switch the wallet to that chain's network so the burn
// (or the mint, on an EVM destination) lands on the correct chain.
const makeSigner = async (spec: ChainSpec, wallet: ConnectedWallet) => {
  if (spec.platform === "evm") {
    if (spec.evmChainIdHex === undefined || spec.evmChainIdHex === "") {
      throw new Error(`${spec.label} is missing an EVM chain id`);
    }
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- EVM adapter getSigner() returns the raw EIP-1193 provider
    const provider = (await wallet.connector.getSigner()) as Eip1193Provider;
    await ensureChain(provider, spec.evmChainIdHex);
    return new ButrEvmWormholeSigner(spec.chain, wallet.account.walletAddress, provider);
  }
  return new ButrSvmWormholeSigner(
    spec.chain,
    wallet.account.walletAddress,
    wallet.connector,
    spec.rpcUrl,
  );
};

export { getWormhole, makeSigner };
