/**
 * Wallet SDKs disagree on error shape (EIP-1193 codes, bare strings,
 * bespoke classes), so consumers branch on `kind` rather than regexing
 * messages. `cause` keeps the original value.
 */
type ConnectionErrorKind =
  | "ChainMismatch"
  | "NotConnected"
  | "RequestPending"
  | "Timeout"
  | "Unknown"
  | "UserRejected"
  | "WalletLocked"
  | "WalletNotFound";

class ConnectionError extends Error {
  readonly kind: ConnectionErrorKind;

  constructor(kind: ConnectionErrorKind, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ConnectionError";
    this.kind = kind;
  }
}

const readCode = (error: Error): number | string | undefined =>
  "code" in error && (typeof error.code === "number" || typeof error.code === "string")
    ? error.code
    : undefined;

/**
 * EIP-1193 codes: `4001` rejected, `-32002` pending, `4100`/`4900`/`4901`
 * unauthorized or disconnected. Message-substring matching is the last
 * resort for SDKs that ship no codes at all.
 */
const classify = (error: Error): ConnectionErrorKind => {
  const code = readCode(error);
  if (code === 4001) {
    return "UserRejected";
  }
  if (code === -32_002) {
    return "RequestPending";
  }
  if (code === 4100 || code === 4900 || code === 4901) {
    return "NotConnected";
  }
  const lower = error.message.toLowerCase();
  if (lower.includes("user rejected") || lower.includes("user denied")) {
    return "UserRejected";
  }
  if (lower.includes("not connected")) {
    return "NotConnected";
  }
  if (lower.includes("locked")) {
    return "WalletLocked";
  }
  if (lower.includes("chain") && (lower.includes("mismatch") || lower.includes("unsupported"))) {
    return "ChainMismatch";
  }
  return "Unknown";
};

/** The one boundary where a thrown value of unknown shape becomes typed. */
const toConnectionError = (raw: unknown): ConnectionError => {
  if (raw instanceof ConnectionError) {
    return raw;
  }
  if (raw instanceof Error) {
    return new ConnectionError(classify(raw), raw.message, { cause: raw });
  }
  const message = typeof raw === "string" && raw !== "" ? raw : "Connection failed";
  return new ConnectionError("Unknown", message, { cause: raw });
};

export type { ConnectionErrorKind };
export { ConnectionError, toConnectionError };
