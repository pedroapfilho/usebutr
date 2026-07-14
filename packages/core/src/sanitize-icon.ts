/**
 * Normalize a wallet-announced icon string.
 *
 * Wallets announce their icon through external metadata; EIP-6963
 * `providerInfo.icon`, Wallet Standard `wallet.icon`. That value is
 * not under butr's control, and some wallets ship data-URI icons with
 * surrounding whitespace (a newline left over from a pretty-printed
 * manifest). Strict consumers reject it: Next.js's `<Image>` throws
 * because `src` must not start with a control character.
 *
 * Trims surrounding whitespace and treats an all-whitespace (or empty)
 * icon as absent, so consumers get either a usable string or
 * `undefined`: never a blank or malformed one. `undefined` passes
 * through untouched.
 */
const sanitizeIcon = (icon: string | undefined): string | undefined => {
  if (icon === undefined) {
    return undefined;
  }
  const trimmed = icon.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export { sanitizeIcon };
