import type { Eip1193Provider } from "./eip1193";

/**
 * Augment `@usebutr/core`'s `SignerForPlatform` registry with the EVM
 * entry. Consumers that import anything from `@usebutr/evm` get the
 * `evm` key typed as `Eip1193Provider` transitively.
 *
 * `getSigner()` itself still returns `Promise<unknown>` (see
 * `packages/core/src/types/signer.ts` for why); this declaration only
 * affects what `SignerForPlatform["evm"]` evaluates to.
 */
declare module "@usebutr/core" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentation requires interface
  interface SignerForPlatform {
    evm: Eip1193Provider;
  }
}
