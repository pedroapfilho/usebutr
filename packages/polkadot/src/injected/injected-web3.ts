/**
 * Minimal local types for the `@polkadot/extension-dapp` injectedWeb3
 * standard. Declared here (rather than depending on
 * `@polkadot/extension-inject`) so the connector stays lean — same
 * posture as `@usebutr/bitcoin`'s `UnisatProvider`. These narrow the
 * spec to only the fields butr reads.
 */

/** A single account the extension exposes. Addresses are SS58; accounts
 *  are chain-agnostic across Substrate. */
type InjectedAccount = {
  address: string;
  genesisHash?: string | null;
  name?: string;
  type?: string;
};

/** The polkadot-js `Signer`: butr only uses `signRaw` for message
 *  signing. `signPayload` is consumer territory (via polkadot-api). */
type InjectedSigner = {
  signRaw?: (raw: {
    address: string;
    data: string;
    type: "bytes" | "payload";
  }) => Promise<{ id: number; signature: string }>;
};

/** The object returned by `enable()`. */
type Injected = {
  accounts: {
    get: () => Promise<ReadonlyArray<InjectedAccount>>;
    subscribe?: (cb: (accounts: ReadonlyArray<InjectedAccount>) => void) => () => void;
  };
  signer: InjectedSigner;
};

/** What lives at `window.injectedWeb3[key]`. */
type InjectedWindowProvider = {
  enable: (origin: string) => Promise<Injected>;
  version?: string;
};

type InjectedWindow = {
  injectedWeb3?: Record<string, InjectedWindowProvider>;
};

// `<Bytes>` / `</Bytes>` wrapper polkadot-js, Talisman, and SubWallet add
// around raw messages before signing (prevents signed messages from being
// replayed as transaction payloads). Verifiers must check signatures
// against the wrapped bytes, which is why butr returns them as
// `signedMessage`.
const BYTES_PREFIX = new TextEncoder().encode("<Bytes>");
const BYTES_SUFFIX = new TextEncoder().encode("</Bytes>");

const wrapBytes = (message: Uint8Array): Uint8Array => {
  const out = new Uint8Array(BYTES_PREFIX.length + message.length + BYTES_SUFFIX.length);
  out.set(BYTES_PREFIX, 0);
  out.set(message, BYTES_PREFIX.length);
  out.set(BYTES_SUFFIX, BYTES_PREFIX.length + message.length);
  return out;
};

const bytesToHex = (bytes: Uint8Array): string => {
  let hex = "0x";
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, "0");
  }
  return hex;
};

const hexToBytes = (hex: string): Uint8Array => {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
};

const readInjectedWindow = (target?: InjectedWindow | null): InjectedWindow | null => {
  if (target !== undefined) {
    return target;
  }
  return typeof window === "undefined" ? null : (window as unknown as InjectedWindow);
};

export type { Injected, InjectedAccount, InjectedSigner, InjectedWindow, InjectedWindowProvider };
export { bytesToHex, hexToBytes, readInjectedWindow, wrapBytes };
