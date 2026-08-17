/**
 * Canonical cast target for `getSigner()`'s `unknown`, which stays
 * type-erased to keep the cross-package boundary loose. Platform
 * packages add their key by augmenting this interface.
 */
// Empty by design; each platform package augments this interface via
// `declare module "@usebutr/core" { interface SignerForPlatform { … } }`.
// Module augmentation requires `interface` (TypeScript can't merge type
// aliases), so the rules that prefer `type` over `interface` and forbid
// empty interfaces don't apply here.
// oxlint-disable-next-line typescript/consistent-type-definitions, typescript/no-empty-interface, typescript/no-empty-object-type -- registry for module augmentation
interface SignerForPlatform {}

/** Convenience alias for narrowing a single platform's signer type. */
type SignerOf<P extends keyof SignerForPlatform> = SignerForPlatform[P];

export type { SignerForPlatform, SignerOf };
