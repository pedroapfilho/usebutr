import { act } from "@testing-library/react";
import { ConnectionError } from "@usebutr/core";
import { createFakeAdapter } from "@usebutr/testing";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useConnect } from "../hooks/connect";

import { renderWithManager, settle } from "./render";

const rejecting = () =>
  createFakeAdapter({
    id: "metamask",
    overrides: { connect: () => Promise.reject(new Error("User rejected the request")) },
  });

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useConnect", () => {
  it("connectAsync resolves the connected wallet and reports success", async () => {
    const adapter = createFakeAdapter({ id: "metamask" });
    const { result } = renderWithManager(() => useConnect(), { adapters: [adapter] });
    await settle();
    expect(result.current.value).toMatchObject({ connectingId: null, error: null, status: "idle" });

    const wallet = await act(() => result.current.value.connectAsync("metamask"));

    expect(wallet.connector).toBe(adapter);
    expect(result.current.value).toMatchObject({ error: null, status: "success" });
  });

  it("connect starts an attempt whose progress shows in the state", async () => {
    const gate = Promise.withResolvers<undefined>();
    const adapter = createFakeAdapter({ id: "slow", overrides: { connect: () => gate.promise } });
    const { result } = renderWithManager(() => useConnect(), { adapters: [adapter] });
    await settle();

    act(() => {
      result.current.value.connect("slow");
    });
    expect(result.current.value).toMatchObject({ connectingId: "slow", status: "connecting" });

    gate.resolve(undefined);
    await settle();
    expect(result.current.value).toMatchObject({ connectingId: null, status: "success" });
    expect(result.current.manager.getState().pool.has("slow")).toBe(true);
  });

  it("connect never rejects: the failure lands in error and status", async () => {
    const { result } = renderWithManager(() => useConnect(), { adapters: [rejecting()] });
    await settle();

    act(() => {
      result.current.value.connect("metamask");
    });
    await settle();

    expect(result.current.value.status).toBe("error");
    expect(result.current.value.error).toBeInstanceOf(ConnectionError);
    expect(result.current.value.error?.kind).toBe("UserRejected");
  });

  it("connectAsync rejects with the same ConnectionError, and reset clears it", async () => {
    const { result } = renderWithManager(() => useConnect(), { adapters: [rejecting()] });
    await settle();

    const failure = act(() => result.current.value.connectAsync("metamask"));
    await expect(failure).rejects.toBeInstanceOf(ConnectionError);
    expect(result.current.value.error?.kind).toBe("UserRejected");

    act(() => {
      result.current.value.reset();
    });
    expect(result.current.value).toMatchObject({ error: null, status: "idle" });
  });

  it("hands out stable actions", async () => {
    const { rerender, result } = renderWithManager(() => useConnect());
    await settle();
    const { connect, connectAsync, reset } = result.current.value;

    await act(() => result.current.value.connectAsync("nope").catch(() => null));
    rerender();

    expect(result.current.value.connect).toBe(connect);
    expect(result.current.value.connectAsync).toBe(connectAsync);
    expect(result.current.value.reset).toBe(reset);
  });
});
