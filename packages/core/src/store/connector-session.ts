import { logWarn } from "../logger";
import type { ConnectedWallet, WalletAdapter } from "../types";
import { ConnectionError, toConnectionError } from "../types/errors";

const CONNECT_TIMEOUT_MS = 90_000;
const RESTORE_TIMEOUT_MS = 15_000;

const withTimeout = async <T>(promise: Promise<T>, ms: number): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new ConnectionError("Timeout", `Connection timed out after ${ms / 1000}s`));
        }, ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
};

const teardown = async (connector: WalletAdapter) => {
  try {
    await connector.disconnect?.();
  } catch (error) {
    logWarn(`[butr] disconnect of ${connector.id} failed:`, error);
  }
};

/** The accounts `connector` exposes, active first. None means it is not
 *  connected, whichever call asked. */
const readAccounts = async (
  connector: WalletAdapter,
): Promise<Pick<ConnectedWallet, "account" | "accounts">> => {
  const accounts = await connector.getAccounts();
  const account = accounts.at(0);

  if (account === undefined) {
    throw new ConnectionError("NotConnected", `${connector.name} exposed no accounts`);
  }

  return { account, accounts };
};

const closeAfterOpen = async (opening: Promise<void>, close: () => Promise<void>) => {
  try {
    await opening;
  } catch {
    return;
  }

  await close();
};

/**
 * The one way a session opens. A failure closes it unless the pool holds
 * it, except a declined silent connect: that opened nothing, and closing
 * would revoke the permission (EVM) or shared session (WalletConnect).
 */
const openSession = async (
  connector: WalletAdapter,
  { close, silent }: { close: () => Promise<void>; silent: boolean },
): Promise<ConnectedWallet> => {
  let opening: Promise<void> | undefined;

  try {
    opening = silent ? connector.connect({ silent }) : connector.connect();
    await withTimeout(opening, silent ? RESTORE_TIMEOUT_MS : CONNECT_TIMEOUT_MS);
  } catch (error) {
    const failure = toConnectionError(error);

    if (failure.kind === "Timeout" && opening !== undefined) {
      void closeAfterOpen(opening, close);
    }

    if (!silent || failure.kind === "Timeout") {
      await close();
    }

    throw failure;
  }

  try {
    return { ...(await readAccounts(connector)), connector };
  } catch (error) {
    await close();
    throw toConnectionError(error);
  }
};

export { openSession, readAccounts, teardown };
