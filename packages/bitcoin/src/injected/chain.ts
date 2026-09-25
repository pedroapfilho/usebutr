import type { ChainBase } from "@usebutr/core";
import { ConnectionError } from "@usebutr/core";

const assertBitcoinChain = (chain: ChainBase): void => {
  if (chain.namespace !== "bip122") {
    throw new Error(
      `Bitcoin adapter received non-Bitcoin chain "${chain.id}". Pass a chain with namespace "bip122".`,
    );
  }
};

/** An injected wallet has one network for every call, so a target it cannot
 *  move to is refused rather than sent on the network it happens to be on. */
const chainMismatch = (wallet: string, current: ChainBase, target: ChainBase): ConnectionError =>
  new ConnectionError(
    "ChainMismatch",
    `Wallet ${wallet} is on ${current.name} and cannot switch to ${target.name}`,
  );

export { assertBitcoinChain, chainMismatch };
