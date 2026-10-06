import { describe, expect, it, vi } from "vitest";

import { createConnectorEmitter } from "../connector-emitter";
import type { ConnectorEvent } from "../types";

const listenerFn = () => vi.fn<(event: ConnectorEvent) => void>();

describe("createConnectorEmitter", () => {
  it("delivers each event to every current subscriber", () => {
    const emitter = createConnectorEmitter();
    const first = listenerFn();
    const second = listenerFn();
    emitter.subscribe(first);
    emitter.subscribe(second);

    emitter.emit({ type: "disconnected" });

    expect(first).toHaveBeenCalledWith({ type: "disconnected" });
    expect(second).toHaveBeenCalledWith({ type: "disconnected" });
  });

  it("stops delivering to a subscriber once it unsubscribes", () => {
    const emitter = createConnectorEmitter();
    const listener = listenerFn();
    const unsubscribe = emitter.subscribe(listener);

    expect(emitter.listenerCount()).toBe(1);
    unsubscribe();
    emitter.emit({ type: "disconnected" });

    expect(listener).not.toHaveBeenCalled();
    expect(emitter.listenerCount()).toBe(0);
  });
});
