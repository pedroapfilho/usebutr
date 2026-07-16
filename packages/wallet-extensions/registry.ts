import type { WalletExtension } from "./types";

/**
 * Registry of wallet browser extensions used by butr's automated tests.
 *
 * **Scope.** This list is the set of extensions butr's Playwright /
 * Chrome-extension test infrastructure can install via the Web Store
 * preferences file. Three classes of wallet are intentionally NOT
 * here:
 *
 *  - **Built-in browser wallets** (Brave Wallet, Opera Crypto Wallet).
 *    Ship as native browser features; no Chrome Web Store extension
 *    exists to load. Tested by running the host browser, not by
 *    installing an extension.
 *  - **Mobile-only wallets** (Trust Wallet mobile, Rainbow mobile,
 *    Zerion mobile). Reach the dapp through WalletConnect rather than
 *    as injected browser extensions. Covered by `@usebutr/walletconnect`,
 *    not by this registry.
 *  - **Discontinued / regional builds** (Slope, old Binance Chain
 *    Wallet, Bitkeep). Not actively maintained or unverifiable.
 *
 * **Runtime discovery is independent.** This registry is only consulted
 * by the test installer. The runtime discovery layer (EIP-6963,
 * Wallet Standard, the injected fallback) picks up *any* compliant
 * wallet without consulting this file; a wallet doesn't need to be
 * listed here to work in production.
 *
 * Chrome Web Store IDs are mostly stable but can change when wallets
 * relaunch under a new listing. Before relying on these in CI, open
 * the `webStoreUrl` for each entry, copy the trailing 32-character
 * identifier from the URL path, and confirm it matches
 * `chromeWebStoreId`. Entries tagged with `TODO_VERIFY` need a manual
 * lookup before first use.
 */

const Backpack: WalletExtension = {
  chromeWebStoreId: "aflkmfhebedbjioipglgcbcmnbpgliof",
  name: "Backpack",
  platforms: ["evm", "svm"],
  slug: "backpack",
  webStoreUrl: "https://chromewebstore.google.com/detail/backpack/aflkmfhebedbjioipglgcbcmnbpgliof",
};

const BinanceWallet: WalletExtension = {
  // Verified 2026-05-21: listing exists at this ID on chromewebstore.google.com.
  // Binance has shipped multiple browser-extension wallets over time (Binance
  // Chain Wallet → Binance Wallet); this is the current canonical listing.
  chromeWebStoreId: "fhbohimaelbohpjbbldcngcnapndodjp",
  name: "Binance Wallet",
  platforms: ["evm"],
  slug: "binance-wallet",
  webStoreUrl:
    "https://chromewebstore.google.com/detail/binance-wallet/fhbohimaelbohpjbbldcngcnapndodjp",
};

const CoinbaseWallet: WalletExtension = {
  chromeWebStoreId: "hnfanknocfeofbddgcijnmhnfnkdnaad",
  name: "Coinbase Wallet",
  platforms: ["evm", "svm"],
  slug: "coinbase-wallet",
  webStoreUrl:
    "https://chromewebstore.google.com/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad",
};

const Leather: WalletExtension = {
  chromeWebStoreId: "ldinpeekobnhjjdofggfgjlcehhmanlj",
  name: "Leather",
  platforms: ["bitcoin"],
  slug: "leather",
  webStoreUrl: "https://chromewebstore.google.com/detail/leather/ldinpeekobnhjjdofggfgjlcehhmanlj",
};

const MagicEdenWallet: WalletExtension = {
  // Verified 2026-05-21: "Magic Eden Wallet" by Barcom Trading, Inc.
  // Advertises SVM (NFT-focused) and Bitcoin (Ordinals + BRC-20) via
  // Wallet Standard. Cross-chain swaps SVM <> BTC are an in-wallet
  // feature; butr discovers each chain as a separate WalletAdapter.
  chromeWebStoreId: "mkpegjkblkkefacfnmkajcjmabijhclg",
  name: "Magic Eden Wallet",
  platforms: ["svm", "bitcoin"],
  slug: "magic-eden-wallet",
  webStoreUrl:
    "https://chromewebstore.google.com/detail/magic-eden-wallet/mkpegjkblkkefacfnmkajcjmabijhclg",
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

const Surf: WalletExtension = {
  // Verified 2026-05-21: "Surf Wallet" by surflabs.wallet. Sui-only;
  // advertises MPC encryption, multi-sig, streaming payments. Mentioned
  // by name in apps/demo-with-sui/src/app.tsx's empty-state copy.
  chromeWebStoreId: "emeeapjkbcbpbpgaagfchmcgglmebnen",
  name: "Surf Wallet",
  platforms: ["sui"],
  slug: "surf",
  webStoreUrl:
    "https://chromewebstore.google.com/detail/surf-the-leading-sui-wall/emeeapjkbcbpbpgaagfchmcgglmebnen",
};

const TrustWallet: WalletExtension = {
  chromeWebStoreId: "egjidjbpglichdcondbcbdnbeeppgdph",
  name: "Trust Wallet",
  platforms: ["evm", "svm"],
  slug: "trust-wallet",
  webStoreUrl:
    "https://chromewebstore.google.com/detail/trust-wallet/egjidjbpglichdcondbcbdnbeeppgdph",
};

const Unisat: WalletExtension = {
  chromeWebStoreId: "ppbibelpcjmhbdihakflkdcoccbgbkpo",
  name: "Unisat",
  platforms: ["bitcoin"],
  slug: "unisat",
  webStoreUrl:
    "https://chromewebstore.google.com/detail/unisat-wallet/ppbibelpcjmhbdihakflkdcoccbgbkpo",
};

const Xverse: WalletExtension = {
  chromeWebStoreId: "idnnbdplmphpflfnlkomgpfbpcgelopg",
  name: "Xverse Wallet",
  platforms: ["bitcoin"],
  slug: "xverse",
  webStoreUrl:
    "https://chromewebstore.google.com/detail/xverse-wallet/idnnbdplmphpflfnlkomgpfbpcgelopg",
};

/** Every wallet butr supports installing into a test browser, in
 *  alphabetical order. */
const ALL_WALLETS: ReadonlyArray<WalletExtension> = [
  Backpack,
  BinanceWallet,
  CoinbaseWallet,
  Leather,
  MagicEdenWallet,
  MetaMask,
  OkxWallet,
  Phantom,
  Rabby,
  Solflare,
  Suiet,
  SuiWallet,
  Surf,
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
  Leather,
  MagicEdenWallet,
  MetaMask,
  OkxWallet,
  Phantom,
  Rabby,
  Solflare,
  Suiet,
  SUI_WALLETS,
  SuiWallet,
  Surf,
  SVM_WALLETS,
  TrustWallet,
  Unisat,
  Xverse,
};
