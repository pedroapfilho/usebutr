/**
 * Tagged union of normalised connection errors.
 *
 * butr maps thrown values from connectors (which vary across wallet SDKs:
 * MetaMask uses EIP-1193 codes, Phantom throws stringly-typed errors,
 * embedded SDKs throw their own classes) into a small set of UX-meaningful
 * variants. Consumers branch on `kind` instead of regexing message strings.
 *
 * `message` is always present and human-readable. `cause` preserves the
 * original thrown value so callers can inspect raw connector errors when
 * the variant is `Unknown`.
 */
type ConnectionError =
  | { kind: "UserRejected"; message: string }
  | { kind: "RequestPending"; message: string }
  | { kind: "WalletLocked"; message: string }
  | { actualChain?: string; expectedChain?: string; kind: "ChainMismatch"; message: string }
  | { kind: "NotConnected"; message: string }
  | { kind: "Timeout"; message: string }
  | { cause?: unknown; kind: "Unknown"; message: string };

type ConnectionErrorKind = ConnectionError["kind"];

/**
 * Normalise a thrown value into a `ConnectionError`.
 *
 * Recognises:
 *  - butr's own `Error("Connection timeout")` (from the 90s connect timeout)
 *  - butr's own `Error("Failed to get account")` (from the connect flow)
 *  - EIP-1193 numeric `code` properties (`4001` → UserRejected,
 *    `-32002` → RequestPending, `4100`/`4900`/`4901` → NotConnected —
 *    unauthorized / disconnected from all-or-one chains)
 *  - common message substrings: "user rejected" / "user denied",
 *    "locked", "chain", etc.
 *  - anything else → `Unknown` with `cause` set to the original value.
 */
const mapConnectionError = (raw: unknown): ConnectionError => {
  if (raw instanceof Error) {
    const message = raw.message;
    const lower = message.toLowerCase();

    if (message === "Connection timeout") {
      return { kind: "Timeout", message };
    }
    if (message === "Failed to get account" || lower.includes("not connected")) {
      return { kind: "NotConnected", message };
    }

    const code = (raw as { code?: unknown }).code;
    if (code === 4001) {
      return { kind: "UserRejected", message };
    }
    if (code === -32_002) {
      return { kind: "RequestPending", message };
    }
    if (code === 4100 || code === 4900 || code === 4901) {
      return { kind: "NotConnected", message };
    }

    if (lower.includes("user rejected") || lower.includes("user denied")) {
      return { kind: "UserRejected", message };
    }
    if (lower.includes("locked")) {
      return { kind: "WalletLocked", message };
    }
    if (lower.includes("chain") && (lower.includes("mismatch") || lower.includes("unsupported"))) {
      return { kind: "ChainMismatch", message };
    }

    return { cause: raw, kind: "Unknown", message };
  }

  if (typeof raw === "string") {
    return { kind: "Unknown", message: raw };
  }

  return { cause: raw, kind: "Unknown", message: "Connection failed" };
};

export type { ConnectionError, ConnectionErrorKind };
export { mapConnectionError };
