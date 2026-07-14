/// <reference types="vite/client" />

// oxlint-disable-next-line typescript/consistent-type-definitions -- must declaration-merge with Vite's ImportMetaEnv from vite/client
interface ImportMetaEnv {
  /** WalletConnect Cloud project id (https://cloud.reown.com). Optional;
   *  when unset the demo skips the WalletConnect connector. */
  readonly VITE_WC_PROJECT_ID?: string;
}

// oxlint-disable-next-line typescript/consistent-type-definitions -- must declaration-merge with Vite's ImportMeta from vite/client
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
