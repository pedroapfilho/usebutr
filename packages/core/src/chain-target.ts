import type { Account } from "./types/account";
import type { ChainBase } from "./types/chain";
import { ConnectionError } from "./types/errors";

/** An exposed address, or a transport's account record that carries one. */
type ExposedAccount = string | { readonly address: string };

type ChainTargetInput = {
  /** CAIP-2 namespace the transport speaks: `eip155`, `solana`, `bip122`. */
  namespace: string;
  /** The wallet's name, for error messages. */
  wallet: string;
};

/** Whom one adapter call acts as. Rejects with `NotConnected` or
 *  `AccountNotExposed`. */
type AccountTarget = {
  /** The exposed entry to act as, an address or a record carrying one:
   *  `requested` when the wallet exposes it, else the active (first) entry.
   *  EVM addresses compare case-insensitively, since EIP-55 casing is only a
   *  checksum; every other namespace compares exactly. */
  account: <Exposed extends ExposedAccount>(
    exposed: ReadonlyArray<Exposed>,
    requested?: Account,
  ) => Exposed;
  /** The transport's session, or `NotConnected` when it has none. */
  connected: <Session>(session: Session | null | undefined) => Session;
};

/** Where one adapter call goes and whom it acts as. Also rejects with
 *  `ChainMismatch`. */
type ChainTarget<Reach> = AccountTarget & {
  /** Resolves the chain a call targets, given its `chain` option. */
  chain: (requested?: ChainBase) => Reach;
};

type RoutedChainTargetInput = ChainTargetInput & {
  /** CAIP-2 ids a call can name: the chains a Wallet Standard wallet
   *  advertises, or the chains a WalletConnect session approved. */
  advertised: () => ReadonlyArray<string>;
  /** The chain a call without `chain` goes to. */
  current: () => string;
};

type SwitchingChainTargetInput = ChainTargetInput & {
  /** Whether the wallet can be asked to move to `chain` at all. */
  canSwitch: (chain: ChainBase) => boolean;
  /** The wallet's network as a CAIP-2 id; `undefined` when it does not say. */
  current: () => Promise<string | undefined>;
  switchTo: (chain: ChainBase) => Promise<void>;
  /** Whether a `switchTo` rejection means the wallet does not know the chain
   *  (EIP-3326 `4902`), as opposed to the user declining the switch. */
  unknownChain?: (cause: unknown) => boolean;
};

type FixedChainTargetInput = ChainTargetInput & {
  chain: ChainBase;
};

const mismatch = (message: string, cause?: unknown) =>
  new ConnectionError("ChainMismatch", message, cause === undefined ? undefined : { cause });

const inNamespace = ({ namespace, wallet }: ChainTargetInput, chain: ChainBase): ChainBase => {
  if (chain.namespace !== namespace) {
    throw mismatch(`Wallet ${wallet} takes "${namespace}" chains, not "${chain.id}"`);
  }

  return chain;
};

/**
 * The account half of a chain target, for a transport where no call takes a
 * chain (injected Polkadot extensions).
 */
const createAccountTarget = ({ namespace, wallet }: ChainTargetInput): AccountTarget => {
  const sameAddress =
    namespace === "eip155"
      ? (a: string, b: string) => a.toLowerCase() === b.toLowerCase()
      : (a: string, b: string) => a === b;

  const notConnected = () =>
    new ConnectionError("NotConnected", `Wallet ${wallet} has no connected account`);

  return {
    account: (exposed, requested) => {
      const [active] = exposed;

      if (active === undefined) {
        throw notConnected();
      }

      if (requested === undefined) {
        return active;
      }

      const match = exposed.find((entry) =>
        sameAddress(typeof entry === "string" ? entry : entry.address, requested.walletAddress),
      );

      if (match === undefined) {
        throw new ConnectionError(
          "AccountNotExposed",
          `Wallet ${wallet} does not expose account ${requested.walletAddress}`,
        );
      }

      return match;
    },
    connected: (session) => {
      if (session === null || session === undefined) {
        throw notConnected();
      }

      return session;
    },
  };
};

/**
 * A transport that takes the chain per call (Wallet Standard, WalletConnect):
 * a call reaches any advertised chain without moving the wallet.
 */
const createRoutedChainTarget = ({
  advertised,
  current,
  ...input
}: RoutedChainTargetInput): ChainTarget<string> => {
  return {
    ...createAccountTarget(input),
    chain: (requested) => {
      if (requested === undefined) {
        return current();
      }

      const { id } = inNamespace(input, requested);
      const chains = advertised().filter((chain) => chain.startsWith(`${input.namespace}:`));

      if (!chains.includes(id)) {
        throw mismatch(
          `Wallet ${input.wallet} does not advertise chain "${id}". Advertised: ${chains.join(", ")}`,
        );
      }

      return id;
    },
  };
};

/**
 * A wallet with one global network (injected EVM, Unisat, sats-connect): a
 * call naming another chain moves the whole wallet there first.
 */
const createSwitchingChainTarget = ({
  canSwitch,
  current,
  switchTo,
  unknownChain,
  ...input
}: SwitchingChainTargetInput): ChainTarget<Promise<void>> => {
  return {
    ...createAccountTarget(input),
    chain: async (requested) => {
      if (requested === undefined) {
        return;
      }

      const { id } = inNamespace(input, requested);
      const from = await current();

      if (from === id) {
        return;
      }

      const cannotSwitch = (cause?: unknown) =>
        mismatch(
          `Wallet ${input.wallet} is on ${from ?? "an unreported chain"} and cannot switch to "${id}"`,
          cause,
        );

      if (!canSwitch(requested)) {
        throw cannotSwitch();
      }

      try {
        await switchTo(requested);
      } catch (error) {
        throw unknownChain?.(error) === true ? cannotSwitch(error) : error;
      }
    },
  };
};

/**
 * A transport bound to one chain (Ledger device apps): a call naming any other
 * chain is refused. Throws at construction for a chain outside `namespace`.
 */
const createFixedChainTarget = ({
  chain,
  ...input
}: FixedChainTargetInput): ChainTarget<string> => {
  inNamespace(input, chain);

  return {
    ...createAccountTarget(input),
    chain: (requested) => {
      if (requested !== undefined && inNamespace(input, requested).id !== chain.id) {
        throw mismatch(
          `Wallet ${input.wallet} signs for "${chain.id}" only, not "${requested.id}"`,
        );
      }

      return chain.id;
    },
  };
};

export type { AccountTarget, ChainTarget };

export {
  createAccountTarget,
  createFixedChainTarget,
  createRoutedChainTarget,
  createSwitchingChainTarget,
};
