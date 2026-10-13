import type {
  Account,
  ChainBase,
  ConnectorEvent,
  TransactionOptions,
  WalletAdapter,
} from "@usebutr/core";
import { buildAccount, EVM_CHAINS, SVM_CHAINS } from "@usebutr/core";
import type { Mock } from "vitest";
import { describe, expect, it, vi } from "vitest";

/** A signing or sending request as the wallet received it. */
type ObservedCall = {
  /** The address the wallet acted as. */
  address?: string;
  /** The CAIP-2 chain the request landed on. */
  chain?: string;
};

type ContractWallet<A extends WalletAdapter> = {
  adapter: A;
  /** The last signing or sending request the wallet received; `undefined`
   *  before any. Chain switches and account reads do not count. */
  lastCall: () => ObservedCall | undefined;
  /** Plays the wallet reporting a new account list, for transports whose
   *  wallet pushes account changes. */
  reportAccounts?: (addresses: ReadonlyArray<string>) => void;
};

/** A call to a method that takes `chain`, with a payload the fake accepts. */
type TransactionCall<A extends WalletAdapter> = (
  adapter: A,
  options: TransactionOptions,
) => Promise<object | string> | undefined;

type AdapterContractFixture<A extends WalletAdapter> = {
  /** The transport signs only as its active account (Unisat). */
  activeOnly?: boolean;
  /** Two addresses the wallet can expose on `chain`. Each must contain a
   *  letter, so a case-changed copy differs from it. */
  addresses: readonly [string, string];
  /** The chain the adapter is on once connected. */
  chain: ChainBase;
  /** An adapter whose wallet exposes `addresses`, active first, connected
   *  when the transport allows it. `[]` builds one that exposes nothing. */
  connect: (addresses: ReadonlyArray<string>) => Promise<ContractWallet<A>>;
  /** How a call reaches another chain: routed per call, by switching the
   *  wallet's network, or never (ADR 0004 section 2). */
  move: "fixed" | "route" | "switch";
  name: string;
  /** A chain in the namespace the transport reaches; omit for `fixed`. */
  reachable?: ChainBase;
  /** Every method the adapter defines that takes `chain`, keyed by name. */
  transactions?: Readonly<Record<string, TransactionCall<A>>>;
  /** A chain in the namespace the transport cannot reach. */
  unreachable: ChainBase;
};

type Listener = Mock<(event: ConnectorEvent) => void>;

const MESSAGE = new TextEncoder().encode("butr adapter contract");

const flipCase = (address: string): string =>
  address.replaceAll(/[a-z]/giv, (letter) =>
    letter === letter.toLowerCase() ? letter.toUpperCase() : letter.toLowerCase(),
  );

const settle = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

const addressesOf = (accounts: ReadonlyArray<Account>) =>
  accounts.map((account) => account.walletAddress);

const chainsOf = (accounts: ReadonlyArray<Account>) => accounts.map((account) => account.chain.id);

const heard = (listener: Listener, event: ConnectorEvent) =>
  vi.waitFor(() => {
    expect(listener).toHaveBeenCalledWith(event);
  });

const heardLast = (listener: Listener, event: ConnectorEvent) =>
  vi.waitFor(() => {
    expect(listener).toHaveBeenLastCalledWith(event);
  });

/** What every butr adapter does alike, whatever its transport: the account a
 *  call acts as, the chain it reaches, each refusal's `ConnectionError` kind,
 *  and what `getAccounts` and `subscribe` report. Call it at the top level of
 *  a Vitest file, once per adapter. */
const describeAdapterContract = <A extends WalletAdapter>(
  fixture: AdapterContractFixture<A>,
): void => {
  const [active, other] = fixture.addresses;
  const { chain, reachable } = fixture;
  const foreign =
    chain.namespace === EVM_CHAINS.ethereum.namespace ? SVM_CHAINS.mainnet : EVM_CHAINS.ethereum;
  const evm = chain.namespace === EVM_CHAINS.ethereum.namespace;
  const accountOf = (address: string) => buildAccount(address, chain);
  const title = (topic: string) => `${fixture.name} adapter contract: ${topic}`;

  const subscribed = async () => {
    const { adapter, reportAccounts } = await fixture.connect([active]);
    if (adapter.subscribe === undefined || reportAccounts === undefined) {
      return null;
    }
    const listener: Listener = vi.fn();
    const unsubscribe = adapter.subscribe(listener);
    return { listener, reportAccounts, unsubscribe };
  };

  describe(title("getAccounts"), () => {
    it("lists every exposed account, active first, on the current chain", async () => {
      const { adapter } = await fixture.connect([active, other]);
      const accounts = await adapter.getAccounts();
      expect(addressesOf(accounts)).toStrictEqual([active, other]);
      expect(chainsOf(accounts)).toStrictEqual([chain.id, chain.id]);
    });

    it("resolves an empty list when the wallet exposes nothing", async () => {
      const { adapter } = await fixture.connect([]);
      await expect(adapter.getAccounts()).resolves.toStrictEqual([]);
    });
  });

  describe(title("signMessage"), () => {
    it("acts as the active account when none is requested", async (context) => {
      const { adapter, lastCall } = await fixture.connect([active, other]);
      if (adapter.signMessage === undefined) {
        context.skip("signMessage is not defined");
        return;
      }
      await adapter.signMessage(MESSAGE);
      expect(lastCall()?.address).toBe(active);
    });

    it(
      fixture.activeOnly === true
        ? "refuses an exposed account other than the active one with AccountNotExposed"
        : "acts as a requested exposed account",
      async (context) => {
        const { adapter, lastCall } = await fixture.connect([active, other]);
        if (adapter.signMessage === undefined) {
          context.skip("signMessage is not defined");
          return;
        }
        const signing = adapter.signMessage(MESSAGE, { account: accountOf(other) });
        if (fixture.activeOnly === true) {
          await expect(signing).rejects.toMatchObject({ kind: "AccountNotExposed" });
          expect(lastCall()).toBeUndefined();
          return;
        }
        await signing;
        expect(lastCall()?.address).toBe(other);
      },
    );

    it("rejects an account the wallet does not expose with AccountNotExposed", async (context) => {
      const { adapter, lastCall } = await fixture.connect([active]);
      if (adapter.signMessage === undefined) {
        context.skip("signMessage is not defined");
        return;
      }
      await expect(
        adapter.signMessage(MESSAGE, { account: accountOf(other) }),
      ).rejects.toMatchObject({ kind: "AccountNotExposed" });
      expect(lastCall()).toBeUndefined();
    });

    it(
      evm
        ? "matches an address case-insensitively and acts in the wallet's casing"
        : "matches an address exactly, so a case-changed copy is not exposed",
      async (context) => {
        const { adapter, lastCall } = await fixture.connect([active]);
        if (adapter.signMessage === undefined) {
          context.skip("signMessage is not defined");
          return;
        }
        const signing = adapter.signMessage(MESSAGE, { account: accountOf(flipCase(active)) });
        if (evm) {
          await signing;
          expect(lastCall()?.address).toBe(active);
          return;
        }
        await expect(signing).rejects.toMatchObject({ kind: "AccountNotExposed" });
      },
    );

    it("rejects with NotConnected when the wallet exposes nothing", async (context) => {
      const { adapter, lastCall } = await fixture.connect([]);
      if (adapter.signMessage === undefined) {
        context.skip("signMessage is not defined while nothing is exposed");
        return;
      }
      await expect(adapter.signMessage(MESSAGE)).rejects.toMatchObject({ kind: "NotConnected" });
      expect(lastCall()).toBeUndefined();
    });
  });

  for (const [method, call] of Object.entries(fixture.transactions ?? {})) {
    describe(title(method), () => {
      it("goes to the current chain when no chain is passed", async () => {
        const { adapter, lastCall } = await fixture.connect([active]);
        await call(adapter, {});
        expect(lastCall()?.chain).toBe(chain.id);
      });

      it("rejects a chain from another namespace with ChainMismatch", async () => {
        const { adapter, lastCall } = await fixture.connect([active]);
        await expect(call(adapter, { chain: foreign })).rejects.toMatchObject({
          kind: "ChainMismatch",
        });
        expect(lastCall()).toBeUndefined();
      });

      it("rejects a chain the transport cannot reach with ChainMismatch", async () => {
        const { adapter, lastCall } = await fixture.connect([active]);
        await expect(call(adapter, { chain: fixture.unreachable })).rejects.toMatchObject({
          kind: "ChainMismatch",
        });
        expect(lastCall()).toBeUndefined();
      });

      it("rejects an account the wallet does not expose with AccountNotExposed", async () => {
        const { adapter, lastCall } = await fixture.connect([active]);
        await expect(call(adapter, { account: accountOf(other) })).rejects.toMatchObject({
          kind: "AccountNotExposed",
        });
        expect(lastCall()).toBeUndefined();
      });

      if (fixture.move === "fixed" || reachable === undefined) {
        it("accepts the adapter's own chain", async () => {
          const { adapter, lastCall } = await fixture.connect([active]);
          await call(adapter, { chain });
          expect(lastCall()?.chain).toBe(chain.id);
        });
        return;
      }

      it(
        fixture.move === "route"
          ? "routes a reachable chain to this call without moving the adapter"
          : "moves the wallet to a reachable chain before the call",
        async () => {
          const { adapter, lastCall } = await fixture.connect([active]);
          await call(adapter, { chain: reachable });
          expect(lastCall()?.chain).toBe(reachable.id);
          const accounts = await adapter.getAccounts();
          expect(chainsOf(accounts)).toStrictEqual([
            fixture.move === "route" ? chain.id : reachable.id,
          ]);
        },
      );
    });
  }

  describe(title("switchChain"), () => {
    it("rejects a chain from another namespace with ChainMismatch", async (context) => {
      const { adapter } = await fixture.connect([active]);
      if (adapter.switchChain === undefined) {
        context.skip("switchChain is not defined");
        return;
      }
      await expect(adapter.switchChain(foreign)).rejects.toMatchObject({ kind: "ChainMismatch" });
    });

    it("rejects a chain the transport cannot reach with ChainMismatch", async (context) => {
      const { adapter } = await fixture.connect([active]);
      if (adapter.switchChain === undefined) {
        context.skip("switchChain is not defined");
        return;
      }
      await expect(adapter.switchChain(fixture.unreachable)).rejects.toMatchObject({
        kind: "ChainMismatch",
      });
    });

    it("moves the accounts to a reachable chain and tells subscribers", async (context) => {
      const { adapter } = await fixture.connect([active]);
      if (adapter.switchChain === undefined || reachable === undefined) {
        context.skip("switchChain is not defined");
        return;
      }
      const listener: Listener = vi.fn();
      const unsubscribe = adapter.subscribe?.(listener);
      await adapter.switchChain(reachable);

      const moved = [buildAccount(active, reachable)];
      await expect(adapter.getAccounts()).resolves.toStrictEqual(moved);
      if (unsubscribe !== undefined) {
        await heardLast(listener, { accounts: moved, type: "accountsChanged" });
        unsubscribe();
      }
    });
  });

  describe(title("subscribe"), () => {
    it("forwards a wallet account change as accountsChanged, active first", async (context) => {
      const reporter = await subscribed();
      if (reporter === null) {
        context.skip("the wallet pushes no account changes");
        return;
      }
      reporter.reportAccounts([other, active]);
      await heard(reporter.listener, {
        accounts: [accountOf(other), accountOf(active)],
        type: "accountsChanged",
      });
    });

    it("forwards an empty account list as accountsChanged, never as disconnected", async (context) => {
      const reporter = await subscribed();
      if (reporter === null) {
        context.skip("the wallet pushes no account changes");
        return;
      }
      reporter.reportAccounts([]);
      await heard(reporter.listener, { accounts: [], type: "accountsChanged" });
      expect(reporter.listener).not.toHaveBeenCalledWith({ type: "disconnected" });
    });

    it("stops delivering once unsubscribed", async (context) => {
      const reporter = await subscribed();
      if (reporter === null) {
        context.skip("the wallet pushes no account changes");
        return;
      }
      reporter.unsubscribe();
      reporter.reportAccounts([other]);
      await settle();
      expect(reporter.listener).not.toHaveBeenCalled();
    });
  });
};

export type { AdapterContractFixture, ContractWallet, ObservedCall, TransactionCall };
export { describeAdapterContract };
