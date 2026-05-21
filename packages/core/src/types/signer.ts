/**
 * Per-platform signer type registry.
 *
 * `Connector.getSigner()` returns `Promise<unknown>` because the actual
 * signer shape lives in the platform-specific packages — `@usebutr/evm`
 * returns an EIP-1193 provider, `@usebutr/svm` returns a Wallet
 * Standard wallet, `@usebutr/sui` returns the same Wallet Standard
 * wallet narrowed to Sui features, `@usebutr/bitcoin` returns either a
 * Wallet Standard wallet or an injected provider depending on which
 * adapter discovered it.
 *
 * Consumers cast the `unknown` to whichever signer their integration
 * library expects. This registry exists so the cast target is sourced
 * from one place — when a platform package renames its signer type,
 * consumer code keeps working through the registry without an explicit
 * patch.
 *
 * **How to extend.** Each platform package declares a module-augmentation
 * block that adds its key to this interface. For example,
 * `@usebutr/evm` ships:
 *
 * ```ts
 * declare module "@usebutr/core" {
 *   interface SignerForPlatform {
 *     evm: Eip1193Provider;
 *   }
 * }
 * ```
 *
 * Consumers that import the EVM package get the typed entry for free;
 * the augmentation is transitive through TypeScript's structural
 * declaration merging.
 *
 * **Usage.**
 *
 * ```ts
 * import type { SignerForPlatform } from "@usebutr/core";
 *
 * const signer = (await wallet.connector.getSigner()) as SignerForPlatform["evm"];
 * ```
 *
 * The cast is still there — `getSigner` itself stays type-erased to
 * keep the cross-package boundary loose — but the cast target lives in
 * one canonical place.
 *
 * **Why not make `getSigner` generic.** Generic-on-platform `getSigner`
 * would require `Connector` to be a discriminated union by
 * `chainPlatform`, which is a public-API breaking change held for a
 * future major release. The registry is the small step you can take
 * today; the union is the larger step that makes the cast obsolete.
 */
// Empty by design — each platform package augments this interface via
// `declare module "@usebutr/core" { interface SignerForPlatform { … } }`.
// Module augmentation requires `interface` (TypeScript can't merge type
// aliases), so the rules that prefer `type` over `interface` and forbid
// empty interfaces don't apply here.
// oxlint-disable-next-line typescript/consistent-type-definitions, typescript/no-empty-interface, typescript/no-empty-object-type -- registry for module augmentation
interface SignerForPlatform {}

/** Convenience alias for narrowing a single platform's signer type. */
type SignerOf<P extends keyof SignerForPlatform> = SignerForPlatform[P];

export type { SignerForPlatform, SignerOf };
