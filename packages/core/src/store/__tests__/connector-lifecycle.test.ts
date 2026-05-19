import { describe, expect, it, vi } from "vitest";
import { createConnectorLifecycle } from "../connector-lifecycle";
import type { Connector, ConnectorEvent } from "../../types";
import { createMockAccount, createMockConnector } from "../../__tests__/helpers";

type EmitFn = (event: ConnectorEvent) => void;

const createSubscribableConnector = (id = "wallet-a", chainPlatform: "evm" | "svm" = "evm") => {
  let emit: EmitFn | null = null;
  const unsubscribe = vi.fn();
  const connector: Connector = {
    ...createMockConnector({ chainPlatform, id }),
    subscribe: vi.fn().mockImplementation((listener: EmitFn) => {
      emit = listener;
      return unsubscribe;
    }),
  };
  return {
    connector,
    emit: (event: ConnectorEvent) => {
      if (!emit) {
        throw new Error("subscribe was never called");
      }
      emit(event);
    },
    unsubscribe,
  };
};

describe("createConnectorLifecycle", () => {
  it("subscribes to the connector on attach", () => {
    const { connector } = createSubscribableConnector();
    const lifecycle = createConnectorLifecycle({
      onAccountChanged: vi.fn(),
      onDisconnected: vi.fn(),
    });
    lifecycle.attach("wallet-a", connector);
    expect(connector.subscribe).toHaveBeenCalledTimes(1);
  });

  it("no-op when the connector doesn't implement subscribe", () => {
    const connector: Connector = {
      ...createMockConnector(),
      subscribe: undefined,
    };
    const lifecycle = createConnectorLifecycle({
      onAccountChanged: vi.fn(),
      onDisconnected: vi.fn(),
    });
    expect(() => lifecycle.attach("wallet-a", connector)).not.toThrow();
  });

  it("routes accountChanged events to onAccountChanged with the full accounts list", () => {
    const { connector, emit } = createSubscribableConnector();
    const onAccountChanged = vi.fn();
    const lifecycle = createConnectorLifecycle({ onAccountChanged, onDisconnected: vi.fn() });
    lifecycle.attach("wallet-a", connector);

    const account = createMockAccount({ walletAddress: "0xabc" });
    const accounts = [account, createMockAccount({ walletAddress: "0xdef" })];
    emit({ account, accounts, type: "accountChanged" });

    expect(onAccountChanged).toHaveBeenCalledWith("wallet-a", accounts, account);
  });

  it("routes disconnected events to onDisconnected and tears down the subscription first", () => {
    const { connector, emit, unsubscribe } = createSubscribableConnector("wallet-a", "svm");
    const onDisconnected = vi.fn();
    const lifecycle = createConnectorLifecycle({ onAccountChanged: vi.fn(), onDisconnected });
    lifecycle.attach("wallet-a", connector);

    emit({ type: "disconnected" });

    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(onDisconnected).toHaveBeenCalledWith("wallet-a", "svm");
  });

  it("attach is idempotent — re-attaching the same id detaches the prior subscription", () => {
    const first = createSubscribableConnector("wallet-a");
    const second = createSubscribableConnector("wallet-a");
    const lifecycle = createConnectorLifecycle({
      onAccountChanged: vi.fn(),
      onDisconnected: vi.fn(),
    });

    lifecycle.attach("wallet-a", first.connector);
    lifecycle.attach("wallet-a", second.connector);

    expect(first.unsubscribe).toHaveBeenCalledTimes(1);
    expect(second.connector.subscribe).toHaveBeenCalledTimes(1);
  });

  it("detach is a no-op when no subscription is registered for the id", () => {
    const lifecycle = createConnectorLifecycle({
      onAccountChanged: vi.fn(),
      onDisconnected: vi.fn(),
    });
    expect(() => lifecycle.detach("never-attached")).not.toThrow();
  });

  it("detach calls the connector's unsubscribe", () => {
    const { connector, unsubscribe } = createSubscribableConnector();
    const lifecycle = createConnectorLifecycle({
      onAccountChanged: vi.fn(),
      onDisconnected: vi.fn(),
    });
    lifecycle.attach("wallet-a", connector);
    lifecycle.detach("wallet-a");
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("detachAll tears down every registered subscription", () => {
    const a = createSubscribableConnector("a");
    const b = createSubscribableConnector("b");
    const lifecycle = createConnectorLifecycle({
      onAccountChanged: vi.fn(),
      onDisconnected: vi.fn(),
    });
    lifecycle.attach("a", a.connector);
    lifecycle.attach("b", b.connector);

    lifecycle.detachAll();

    expect(a.unsubscribe).toHaveBeenCalledTimes(1);
    expect(b.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("swallows + logs subscribe() throws so one bad connector can't poison the lifecycle", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const connector: Connector = {
      ...createMockConnector(),
      subscribe: vi.fn().mockImplementation(() => {
        throw new Error("subscribe blew up");
      }),
    };
    const lifecycle = createConnectorLifecycle({
      onAccountChanged: vi.fn(),
      onDisconnected: vi.fn(),
    });

    expect(() => lifecycle.attach("wallet-a", connector)).not.toThrow();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("subscribe failed for wallet-a"),
      expect.any(Error),
    );
    warn.mockRestore();
  });

  it("swallows + logs unsubscribe() throws on detach", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const connector: Connector = {
      ...createMockConnector(),
      subscribe: vi.fn().mockImplementation(() => () => {
        throw new Error("unsubscribe blew up");
      }),
    };
    const lifecycle = createConnectorLifecycle({
      onAccountChanged: vi.fn(),
      onDisconnected: vi.fn(),
    });
    lifecycle.attach("wallet-a", connector);

    expect(() => lifecycle.detach("wallet-a")).not.toThrow();
    expect(warn).toHaveBeenCalledWith("[butr] unsubscribe threw:", expect.any(Error));
    warn.mockRestore();
  });

  it("detaches before invoking onDisconnected handler", () => {
    const { connector, emit, unsubscribe } = createSubscribableConnector();
    let unsubAtCallTime = 0;
    const onDisconnected = vi.fn().mockImplementation(() => {
      unsubAtCallTime = (unsubscribe as unknown as { mock: { calls: Array<unknown> } }).mock.calls
        .length;
    });
    const lifecycle = createConnectorLifecycle({ onAccountChanged: vi.fn(), onDisconnected });
    lifecycle.attach("wallet-a", connector);

    emit({ type: "disconnected" });

    // unsubscribe must have been called BEFORE the handler ran.
    expect(unsubAtCallTime).toBe(1);
  });
});
