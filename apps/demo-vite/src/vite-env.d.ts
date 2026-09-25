/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DOCS_URL?: string;
  /** WalletConnect Cloud project id (https://cloud.reown.com). Optional;
   *  when unset the demo skips the WalletConnect connector. */
  readonly VITE_WC_PROJECT_ID?: string;
  readonly VITE_WEB_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
