import type { Eip1193Provider } from "./eip1193";

/**
 * `getSigner()` itself still returns `Promise<unknown>` (see
 * `packages/core/src/types/signer.ts` for why); this only changes what
 * `SignerForPlatform["evm"]` evaluates to.
 */
declare module "@usebutr/core" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentation requires interface
  interface SignerForPlatform {
    evm: Eip1193Provider;
  }
}
