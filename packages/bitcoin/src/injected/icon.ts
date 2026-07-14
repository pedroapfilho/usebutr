/**
 * Generic Bitcoin wallet icon, same purse SVG style as the EVM
 * package, recoloured. Inline so the picker doesn't flash.
 *
 * Lives in its own file because both injected adapters (UniSat-shape
 * and sats-connect) need the same fallback when the wallet doesn't
 * advertise its own icon, and there's no other "shared" thing they
 * both want; a one-line module beats a grab-bag.
 */
const GENERIC_BITCOIN_ICON =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2Y3OTMxYSIgc3Ryb2tlPSJub25lIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjx0ZXh0IHg9IjEyIiB5PSIxNyIgZm9udC1mYW1pbHk9InNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QjwvdGV4dD48L3N2Zz4=";

export { GENERIC_BITCOIN_ICON };
