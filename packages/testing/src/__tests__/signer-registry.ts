import type { WalletAdapter } from "@usebutr/core";

// A signer kind for these tests only: the package itself registers none, so
// apps compiling it never see a test kind in their `WalletSigner` union.
declare module "@usebutr/core" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentation requires interface
  interface WalletSignerRegistry {
    test: { connectorId: WalletAdapter["id"] };
  }
}
