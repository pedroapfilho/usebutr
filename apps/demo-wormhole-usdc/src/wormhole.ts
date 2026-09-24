import type { ConnectedWallet } from "@usebutr/core";
import { type Network, Wormhole } from "@wormhole-foundation/sdk-connect";
import { EvmPlatform } from "@wormhole-foundation/sdk-evm";
import { SolanaPlatform } from "@wormhole-foundation/sdk-solana";

import type { ChainSpec } from "./chains";
import { ButrEvmWormholeSigner } from "./wormhole-signer";
import { ButrSvmWormholeSigner } from "./wormhole-svm-signer";

const NETWORK: Network = "Testnet";

/** The selected wallet for one side of the bridge. */
type BridgeWallet = ConnectedWallet<"evm"> | ConnectedWallet<"svm">;

let instance: Wormhole<Network> | null = null;

const getWormhole = (): Wormhole<Network> => {
  instance ??= new Wormhole(NETWORK, [EvmPlatform, SolanaPlatform]);
  return instance;
};

const makeSigner = async (spec: ChainSpec, { account, accounts, connector }: BridgeWallet) => {
  if (connector.chainPlatform === "svm") {
    return new ButrSvmWormholeSigner(
      spec.chain,
      { account, accounts, connector },
      spec.walletChain,
      spec.rpcUrl,
    );
  }
  // An EVM wallet has one global network, so move it before ethers signs.
  if (connector.switchChain === undefined) {
    throw new Error(`${connector.name} cannot switch to ${spec.label}`);
  }
  await connector.switchChain(spec.walletChain);
  const signer = await connector.getSigner();
  if (signer.kind !== "eip1193") {
    throw new Error(`${connector.name} did not hand back an EIP-1193 provider`);
  }
  return new ButrEvmWormholeSigner(spec.chain, account.walletAddress, signer.provider);
};

export type { BridgeWallet };
export { getWormhole, makeSigner };
