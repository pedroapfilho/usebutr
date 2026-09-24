import { vi } from "vitest";

import type { TransportFactory, TransportLike } from "../adapter-core";

type FakeTransport = {
  created: ReadonlyArray<TransportLike>;
  factory: TransportFactory;
  lastTransport: TransportLike | null;
};

const buildFakeTransport = (): FakeTransport => {
  const created: Array<TransportLike> = [];
  return {
    created,
    factory: {
      create: () => {
        const transport: TransportLike = { close: vi.fn().mockResolvedValue(undefined) };
        created.push(transport);
        return Promise.resolve(transport);
      },
    },
    get lastTransport() {
      return created.at(-1) ?? null;
    },
  };
};

/** The account index a fake device app derives from `path`: its last
 *  segment, hardened or not. */
const indexOfPath = (path: string): number =>
  Math.trunc(Number((path.split("/").pop() ?? "0").replace(/'$/v, "")));

export { buildFakeTransport, indexOfPath };
