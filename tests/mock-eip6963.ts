import type { Page } from "@playwright/test";

type MockMode = "pending" | "reject-once" | "success";
type MockProviderResult = Array<string> | string | null;

const MOCK_ACCOUNT = "0x1111111111111111111111111111111111111111";
const MOCK_CONNECT_BUTTON = "Mock Wallet (evm)";

const mockWalletInitScript = ({ account, behavior }: { account: string; behavior: MockMode }) => {
  let connectAttempts = 0;
  let connected = false;
  let resolvePending: (() => void) | undefined;
  const listeners = new Map<string, Set<(...args: Array<unknown>) => void>>();

  const emit = (event: string, ...args: Array<unknown>) => {
    for (const listener of listeners.get(event) ?? []) {
      listener(...args);
    }
  };

  const connect = () => {
    connected = true;
    emit("accountsChanged", [account]);
  };

  const provider = {
    on: (event: string, listener: (...args: Array<unknown>) => void) => {
      const eventListeners = listeners.get(event) ?? new Set();
      eventListeners.add(listener);
      listeners.set(event, eventListeners);
    },
    removeListener: (event: string, listener: (...args: Array<unknown>) => void) => {
      listeners.get(event)?.delete(listener);
    },
    request: ({ method }: { method: string }): Promise<MockProviderResult> => {
      if (method === "eth_requestAccounts") {
        connectAttempts += 1;
        if (behavior === "reject-once" && connectAttempts === 1) {
          return Promise.reject(
            Object.assign(new Error("User rejected the request"), { code: 4001 }),
          );
        }
        if (behavior === "pending" && connectAttempts === 1) {
          return new Promise<Array<string>>((resolve) => {
            resolvePending = () => {
              connect();
              resolve([account]);
            };
          });
        }
        connect();
        return Promise.resolve([account]);
      }
      if (method === "eth_accounts") {
        return Promise.resolve(connected ? [account] : []);
      }
      if (method === "eth_chainId") {
        return Promise.resolve("0x1");
      }
      if (method === "eth_getBalance") {
        return Promise.resolve("0x0");
      }
      if (method === "wallet_revokePermissions") {
        connected = false;
        emit("accountsChanged", []);
        return Promise.resolve(null);
      }
      return Promise.resolve(null);
    },
  };

  const announce = () => {
    window.dispatchEvent(
      new CustomEvent("eip6963:announceProvider", {
        detail: {
          info: {
            icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E",
            name: "Mock Wallet",
            rdns: "com.example.mock-wallet",
            uuid: "00000000-0000-4000-8000-000000000001",
          },
          provider,
        },
      }),
    );
  };

  window.addEventListener("eip6963:requestProvider", announce);
  window.addEventListener("mock-wallet:resolve-connect", () => {
    resolvePending?.();
  });
  setTimeout(announce, 0);
};

const installMockEip6963Wallet = (page: Page, mode: MockMode) =>
  page.addInitScript(mockWalletInitScript, { account: MOCK_ACCOUNT, behavior: mode });

export { MOCK_ACCOUNT, MOCK_CONNECT_BUTTON, installMockEip6963Wallet };
