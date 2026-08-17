/**
 * Some wallets announce data-URI icons wrapped in whitespace, which
 * makes Next.js `<Image>` throw on a leading control character.
 * Discovery already applies this; only hand-built metadata needs it.
 */
const sanitizeIcon = (icon: string | undefined): string | undefined => {
  if (icon === undefined) {
    return undefined;
  }
  const trimmed = icon.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export { sanitizeIcon };
