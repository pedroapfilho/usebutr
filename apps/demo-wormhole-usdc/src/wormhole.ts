import type { ConnectedWallet } from "@usebutr/core";
import { type Network, Wormhole } from "@wormhole-foundation/sdk-connect";
import { EvmPlatform } from "@wormhole-foundation/sdk-evm";
import { SolanaPlatform } from "@wormhole-foundation/sdk-solana";
import type { Eip1193Provider } from "ethers";
import { z } from "zod";

import type { ChainSpec } from "./chains";
import { ButrEvmWormholeSigner } from "./wormhole-signer";
import { ButrSvmWormholeSigner } from "./wormhole-svm-signer";

const NETWORK: Network = "Testnet";

let instance: Wormhole<Network> | null = null;
const requestSchema = z.custom<Eip1193Provider["request"]>((value) => typeof value === "function");
const eip1193ProviderSchema = z.object({ request: requestSchema });

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

const makeSigner = async (spec: ChainSpec, wallet: ConnectedWallet) => {
  if (spec.platform === "evm") {
    if (spec.evmChainIdHex === undefined || spec.evmChainIdHex === "") {
      throw new Error(`${spec.label} is missing an EVM chain id`);
    }
    const provider = eip1193ProviderSchema.parse(await wallet.connector.getSigner());
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
