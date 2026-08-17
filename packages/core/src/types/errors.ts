/**
 * Wallet SDKs disagree on error shape (EIP-1193 codes, bare strings,
 * bespoke classes), so consumers branch on `kind` rather than regexing
 * messages. `cause` keeps the original value for the `Unknown` case.
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
 * EIP-1193 codes: `4001` rejected, `-32002` pending, `4100`/`4900`/`4901`
 * unauthorized or disconnected. Message-substring matching is the last
 * resort for SDKs that ship no codes at all.
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

    const code = "code" in raw ? raw.code : undefined;
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
