import { CHAINS_BY_PLATFORM } from "./chains";
import type { Account } from "./types/account";
import type { ChainBase } from "./types/chain";
import { resolveChain } from "./types/chain";
import { ConnectionError } from "./types/errors";
import type { ChainPlatform } from "./types/platform";
import { CHAIN_NAMESPACES } from "./types/platform";

/** An exposed address, or a transport's account record that carries one. */
type ExposedAccount = string | { readonly address: string };

type ChainTargetInput = {
  /** The platform the transport speaks; its chains are in that platform's
   *  CAIP-2 namespace. */
  platform: ChainPlatform;
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
   *  advertises, or the chains a WalletConnect session approved. Aliases
   *  count as the registry chain they name. */
  advertised: () => ReadonlyArray<string>;
  /** The chain a call without `chain` goes to, by id or alias. */
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

/** The registry id of a chain a caller or wallet may name by an alias. */
const toRegistryId = (platform: ChainPlatform, id: string): string =>
  resolveChain(id, CHAINS_BY_PLATFORM[platform]).id;

/** `chain`'s registry id; rejects a chain outside the platform's namespace. */
const registryId = ({ platform, wallet }: ChainTargetInput, chain: ChainBase): string => {
  const namespace = CHAIN_NAMESPACES[platform];

  if (chain.namespace !== namespace) {
    throw mismatch(`Wallet ${wallet} takes "${namespace}" chains, not "${chain.id}"`);
  }

  return toRegistryId(platform, chain.id);
};

/**
 * The account half of a chain target, for a transport where no call takes a
 * chain (injected Polkadot extensions).
 */
const createAccountTarget = ({ platform, wallet }: ChainTargetInput): AccountTarget => {
  const sameAddress =
    platform === "evm"
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
        return toRegistryId(input.platform, current());
      }

      const id = registryId(input, requested);
      const prefix = `${CHAIN_NAMESPACES[input.platform]}:`;

      const chains = advertised().flatMap((chain) =>
        chain.startsWith(prefix) ? [toRegistryId(input.platform, chain)] : [],
      );

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

      const id = registryId(input, requested);
      const from = await current();

      if (from !== undefined && toRegistryId(input.platform, from) === id) {
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
 * chain is refused. Throws at construction for a chain outside `platform`.
 */
const createFixedChainTarget = ({
  chain,
  ...input
}: FixedChainTargetInput): ChainTarget<string> => {
  const id = registryId(input, chain);

  return {
    ...createAccountTarget(input),
    chain: (requested) => {
      if (requested !== undefined && registryId(input, requested) !== id) {
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
