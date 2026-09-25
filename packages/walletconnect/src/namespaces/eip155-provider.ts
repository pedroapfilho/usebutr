import type { Eip1193Listener, Eip1193Provider } from "@usebutr/evm";
import { chainIdDecimalToHex } from "@usebutr/evm";
import { z } from "zod";

import type { UniversalProviderLike } from "../loader";

const chainReferenceSchema = z
  .union([
    z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
    z.string().regex(/^(?:eip155:)?(?:0x[\da-f]+|\d+)$/iv),
  ])
  .transform((value) => chainIdDecimalToHex(String(value).replace(/^eip155:/v, "")));

const accountAddressSchema = z
  .string()
  .regex(/^(?:eip155:\d+:)?0x[\da-f]{40}$/iv)
  .transform((value) => value.slice(value.lastIndexOf(":") + 1));

const walletEventSchema = z.discriminatedUnion("name", [
  z.object({ data: z.array(accountAddressSchema), name: z.literal("accountsChanged") }),
  z.object({ data: chainReferenceSchema, name: z.literal("chainChanged") }),
]);
const sessionParamsSchema = z.object({
  chainId: z.string().regex(/^eip155:\d+$/v),
  event: walletEventSchema,
});

/** UniversalProvider forwards the original session_event as well as bare
 *  events. Its chainId identifies the namespace even when accounts is []. */
const sessionEventSchema = z.object({ params: sessionParamsSchema });

/** The session's eip155 side as EIP-1193. Requests use its current chain;
 *  remote account and chain events are scoped by their CAIP-2 envelope. */
const createEip155Provider = (
  provider: UniversalProviderLike,
  anchorChainId: string,
): Eip1193Provider => {
  const readReference = async (): Promise<string> => {
    const chainId = await provider.request({ method: "eth_chainId" }, anchorChainId);
    if (typeof chainId !== "number" && typeof chainId !== "string") {
      throw new TypeError("WalletConnect returned a malformed eth_chainId response");
    }
    return BigInt(chainId).toString(10);
  };

  const accountsChanged = new Set<Eip1193Listener>();
  const chainChanged = new Set<Eip1193Listener>();
  const scoped = new Map([
    ["accountsChanged", accountsChanged],
    ["chainChanged", chainChanged],
  ]);
  const hasListeners = () => accountsChanged.size + chainChanged.size > 0;
  let lastEmittedChain: string | null = null;

  const emitChain = (chain: string) => {
    if (chainChanged.size === 0 || chain === lastEmittedChain) {
      return;
    }
    lastEmittedChain = chain;
    for (const listener of chainChanged) {
      listener(chain);
    }
  };

  const onSessionEvent: Eip1193Listener = (payload) => {
    const parsed = sessionEventSchema.safeParse(payload);
    if (!parsed.success) {
      return;
    }
    const { event } = parsed.data.params;
    if (event.name === "chainChanged") {
      emitChain(event.data);
      return;
    }
    for (const listener of accountsChanged) {
      listener(event.data);
    }
  };

  return {
    on: (event, listener) => {
      const listeners = scoped.get(event);
      if (listeners === undefined) {
        provider.on(event, listener);
        return;
      }
      if (!hasListeners()) {
        provider.on("session_event", onSessionEvent);
      }
      listeners.add(listener);
    },
    removeListener: (event, listener) => {
      const listeners = scoped.get(event);
      if (listeners === undefined) {
        provider.removeListener(event, listener);
        return;
      }
      if (listeners.delete(listener) && !hasListeners()) {
        provider.removeListener("session_event", onSessionEvent);
        lastEmittedChain = null;
      }
    },
    async request(args) {
      const reference = await readReference();
      if (args.method === "eth_chainId") {
        return chainIdDecimalToHex(reference);
      }
      const result = await provider.request(args, `eip155:${reference}`);
      // A local switch can complete without a remote session_event. Publish
      // its confirmed chain too; emitChain deduplicates a wallet's echo.
      if (args.method === "wallet_switchEthereumChain") {
        emitChain(chainIdDecimalToHex(await readReference()));
      }
      return result;
    },
  };
};

export { createEip155Provider };
