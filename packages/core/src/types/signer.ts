/**
 * Filled by each transport package through module augmentation, e.g.
 * `interface WalletSignerRegistry { eip1193: { provider: Eip1193Provider } }`.
 * Keyed by transport, not platform: EVM through a Ledger is not EIP-1193.
 */
// Module augmentation requires `interface` (TypeScript can't merge type
// aliases), and the registry is empty until a transport package fills it.
// oxlint-disable-next-line typescript/consistent-type-definitions, typescript/no-empty-interface, typescript/no-empty-object-type -- registry for module augmentation
interface WalletSignerRegistry {}

/** Narrow with `switch (signer.kind)`; each branch is fully typed. */
type WalletSigner = {
  [K in keyof WalletSignerRegistry]: { kind: K } & WalletSignerRegistry[K];
}[keyof WalletSignerRegistry];

type WalletSignerKind = WalletSigner["kind"];

type WalletSignerOf<K extends WalletSignerKind> = Extract<WalletSigner, { kind: K }>;

export type { WalletSigner, WalletSignerKind, WalletSignerOf, WalletSignerRegistry };
