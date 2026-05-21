import type { WalletExtension } from "./types";

/**
 * Registry of wallet browser extensions used by butr's automated tests.
 *
 * Chrome Web Store IDs are mostly stable but can change when wallets
 * relaunch under a new listing. Before relying on these in CI, open the
 * `webStoreUrl` for each entry, copy the trailing 32-character identifier
 * from the URL path, and confirm it matches `chromeWebStoreId`. Entries
 * tagged with `TODO_VERIFY` need a manual lookup before first use.
 */

const Backpack: WalletExtension = {
  chromeWebStoreId: "aflkmfhebedbjioipglgcbcmnbpgliof",
  name: "Backpack",
  platforms: ["evm", "svm"],
  slug: "backpack",
  webStoreUrl: "https://chromewebstore.google.com/detail/backpack/aflkmfhebedbjioipglgcbcmnbpgliof",
};

const SuiWallet: WalletExtension = {
  chromeWebStoreId: "opcgpfmipidbgpenhmajoajpbobppdil",
  name: "Sui Wallet",
  platforms: ["sui"],
  slug: "sui-wallet",
  webStoreUrl:
    "https://chromewebstore.google.com/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil",
};

const Suiet: WalletExtension = {
  chromeWebStoreId: "khpkpbbcccdmmclmpigdgddabeilkdpd",
  name: "Suiet",
  platforms: ["sui"],
  slug: "suiet",
  webStoreUrl: "https://chromewebstore.google.com/detail/suiet/khpkpbbcccdmmclmpigdgddabeilkdpd",
};

const Xverse: WalletExtension = {
  chromeWebStoreId: "idnnbdplmphpflfnlkomgpfbpcgelopg",
  name: "Xverse Wallet",
  platforms: ["bitcoin"],
  slug: "xverse",
  webStoreUrl:
    "https://chromewebstore.google.com/detail/xverse-wallet/idnnbdplmphpflfnlkomgpfbpcgelopg",
};

const Unisat: WalletExtension = {
  chromeWebStoreId: "ppbibelpcjmhbdihakflkdcoccbgbkpo",
  name: "Unisat",
  platforms: ["bitcoin"],
  slug: "unisat",
  webStoreUrl:
    "https://chromewebstore.google.com/detail/unisat-wallet/ppbibelpcjmhbdihakflkdcoccbgbkpo",
};

const Leather: WalletExtension = {
  chromeWebStoreId: "ldinpeekobnhjjdofggfgjlcehhmanlj",
  name: "Leather",
  platforms: ["bitcoin"],
  slug: "leather",
  webStoreUrl: "https://chromewebstore.google.com/detail/leather/ldinpeekobnhjjdofggfgjlcehhmanlj",
};

const BinanceWallet: WalletExtension = {
  // TODO_VERIFY: confirm this ID by opening the Web Store listing and
  // copying the trailing path segment. Binance has shipped multiple
  // browser-extension wallets over time (Binance Chain Wallet → Binance
  // Wallet) and the canonical listing has migrated.
  chromeWebStoreId: "fhbohimaelbohpjbbldcngcnapndodjp",
  name: "Binance Wallet",
  platforms: ["evm"],
  slug: "binance-wallet",
  webStoreUrl: "https://chromewebstore.google.com/search/binance%20wallet",
};

const CoinbaseWallet: WalletExtension = {
  chromeWebStoreId: "hnfanknocfeofbddgcijnmhnfnkdnaad",
  name: "Coinbase Wallet",
  platforms: ["evm", "svm"],
  slug: "coinbase-wallet",
  webStoreUrl:
    "https://chromewebstore.google.com/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad",
};

const JupiterWallet: WalletExtension = {
  // TODO_VERIFY: Jupiter ships several products (JUP token, Jupiter
  // Mobile, Jupiter Studio). Confirm which Chrome extension the team
  // wants tested and fill in the canonical ID + Web Store URL.
  chromeWebStoreId: "",
  name: "Jupiter Wallet",
  platforms: ["svm"],
  slug: "jupiter-wallet",
  webStoreUrl: "https://chromewebstore.google.com/search/jupiter%20wallet",
};

const MetaMask: WalletExtension = {
  chromeWebStoreId: "nkbihfbeogaeaoehlefnkodbefgpgknn",
  name: "MetaMask",
  platforms: ["evm"],
  slug: "metamask",
  webStoreUrl: "https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn",
};

const OkxWallet: WalletExtension = {
  chromeWebStoreId: "mcohilncbfahbmgdjkbpemcciiolgcge",
  name: "OKX Wallet",
  platforms: ["evm", "svm", "sui", "bitcoin"],
  slug: "okx-wallet",
  webStoreUrl:
    "https://chromewebstore.google.com/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge",
};

const Phantom: WalletExtension = {
  chromeWebStoreId: "bfnaelmomeimhlpmgjnjophhpkkoljpa",
  name: "Phantom",
  platforms: ["evm", "svm", "sui", "bitcoin"],
  slug: "phantom",
  webStoreUrl: "https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa",
};

const Rabby: WalletExtension = {
  chromeWebStoreId: "acmacodkjbdgmoleebolmdjonilkdbch",
  name: "Rabby Wallet",
  platforms: ["evm"],
  slug: "rabby",
  webStoreUrl:
    "https://chromewebstore.google.com/detail/rabby-wallet/acmacodkjbdgmoleebolmdjonilkdbch",
};

const Solflare: WalletExtension = {
  chromeWebStoreId: "bhhhlbepdkbapadjdnnojkbgioiodbic",
  name: "Solflare Wallet",
  platforms: ["svm"],
  slug: "solflare",
  webStoreUrl:
    "https://chromewebstore.google.com/detail/solflare-wallet/bhhhlbepdkbapadjdnnojkbgioiodbic",
};

const TrustWallet: WalletExtension = {
  chromeWebStoreId: "egjidjbpglichdcondbcbdnbeeppgdph",
  name: "Trust Wallet",
  platforms: ["evm", "svm"],
  slug: "trust-wallet",
  webStoreUrl:
    "https://chromewebstore.google.com/detail/trust-wallet/egjidjbpglichdcondbcbdnbeeppgdph",
};

/** Every wallet butr supports installing into a test browser, in
 *  alphabetical order. */
const ALL_WALLETS: ReadonlyArray<WalletExtension> = [
  Backpack,
  BinanceWallet,
  CoinbaseWallet,
  JupiterWallet,
  Leather,
  MetaMask,
  OkxWallet,
  Phantom,
  Rabby,
  Solflare,
  Suiet,
  SuiWallet,
  TrustWallet,
  Unisat,
  Xverse,
];

/** Wallets whose primary surface is EVM (some also serve other chains). */
const EVM_WALLETS: ReadonlyArray<WalletExtension> = ALL_WALLETS.filter((w) =>
  w.platforms.includes("evm"),
);

/** Wallets whose primary surface is SVM (some also serve other chains). */
const SVM_WALLETS: ReadonlyArray<WalletExtension> = ALL_WALLETS.filter((w) =>
  w.platforms.includes("svm"),
);

/** Wallets whose primary surface is Sui (some also serve other chains). */
const SUI_WALLETS: ReadonlyArray<WalletExtension> = ALL_WALLETS.filter((w) =>
  w.platforms.includes("sui"),
);

/** Wallets whose primary surface is Bitcoin (some also serve other chains). */
const BITCOIN_WALLETS: ReadonlyArray<WalletExtension> = ALL_WALLETS.filter((w) =>
  w.platforms.includes("bitcoin"),
);

/** Look up a wallet by its kebab-case slug. */
const findWallet = (slug: string): WalletExtension | undefined =>
  ALL_WALLETS.find((w) => w.slug === slug);

export {
  ALL_WALLETS,
  Backpack,
  BinanceWallet,
  BITCOIN_WALLETS,
  CoinbaseWallet,
  EVM_WALLETS,
  findWallet,
  JupiterWallet,
  Leather,
  MetaMask,
  OkxWallet,
  Phantom,
  Rabby,
  Solflare,
  Suiet,
  SUI_WALLETS,
  SuiWallet,
  SVM_WALLETS,
  TrustWallet,
  Unisat,
  Xverse,
};
