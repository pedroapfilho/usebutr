import { describe, expect, it } from "vitest";

import { evmAdapter, svmAdapter, walletOf } from "../../__tests__/helpers";
import {
  BITCOIN_CHAINS,
  CHAINS_BY_PLATFORM,
  EVM_CHAINS,
  EVM_CHAINS_LIST,
  POLKADOT_CHAINS,
  SUI_CHAINS,
  SVM_CHAINS,
} from "../../chains";
import { buildAccount } from "../account";
import { resolveChain } from "../chain";
import { CHAIN_PLATFORMS, isChainPlatform } from "../platform";
import { isPlatformWallet } from "../wallet";

describe("resolveChain", () => {
  it("returns the registry entry for a known id", () => {
    expect(resolveChain("eip155:8453", EVM_CHAINS_LIST)).toBe(EVM_CHAINS.base);
  });

  it.each(["solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp", "solana:mainnet-beta", "solana:mainnet"])(
    "resolves %s to the one Solana mainnet entry",
    (id) => {
      expect(resolveChain(id, CHAINS_BY_PLATFORM.svm)).toBe(SVM_CHAINS.mainnet);
    },
  );

  it("names a chain outside the registry by its CAIP-2 id", () => {
    expect(resolveChain("eip155:31337", EVM_CHAINS_LIST)).toEqual({
      id: "eip155:31337",
      name: "eip155:31337",
      namespace: "eip155",
      reference: "31337",
    });
    expect(resolveChain("solana:devnet")).toEqual({
      id: "solana:devnet",
      name: "solana:devnet",
      namespace: "solana",
      reference: "devnet",
    });
  });
});

describe("buildAccount", () => {
  it("builds the composite id without touching the address's case", () => {
    expect(buildAccount("0xAbC", EVM_CHAINS.ethereum)).toEqual({
      chain: EVM_CHAINS.ethereum,
      id: "eip155:1:0xAbC",
      walletAddress: "0xAbC",
    });
  });
});

describe("chain registries", () => {
  it("key every platform to the list of its registry", () => {
    expect(Object.keys(CHAINS_BY_PLATFORM).toSorted()).toEqual([...CHAIN_PLATFORMS].toSorted());
    expect(CHAINS_BY_PLATFORM.evm).toEqual(Object.values(EVM_CHAINS));
    expect(CHAINS_BY_PLATFORM.svm).toEqual(Object.values(SVM_CHAINS));
    expect(CHAINS_BY_PLATFORM.sui).toEqual(Object.values(SUI_CHAINS));
    expect(CHAINS_BY_PLATFORM.bitcoin).toEqual(Object.values(BITCOIN_CHAINS));
    expect(CHAINS_BY_PLATFORM.polkadot).toEqual(Object.values(POLKADOT_CHAINS));
  });

  it("hold well-formed CAIP-2 chains", () => {
    for (const chain of Object.values(CHAINS_BY_PLATFORM).flat()) {
      expect(chain.id).toBe(`${chain.namespace}:${chain.reference}`);
      expect(chain.name).not.toBe(chain.id);

      for (const alias of chain.aliases ?? []) {
        expect(alias.startsWith(`${chain.namespace}:`)).toBe(true);
      }
    }
  });

  it("give every id and alias to exactly one chain", () => {
    const chains = Object.values(CHAINS_BY_PLATFORM).flat();
    const ids = [...chains.map((chain) => chain.id), ...chains.flatMap((c) => c.aliases ?? [])];
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("platform guards", () => {
  it("isChainPlatform accepts exactly the known platforms", () => {
    for (const platform of CHAIN_PLATFORMS) {
      expect(isChainPlatform(platform)).toBe(true);
    }

    expect(isChainPlatform("martian")).toBe(false);
  });

  it("isPlatformWallet narrows on the connector's platform", () => {
    const wallet = walletOf(svmAdapter("phantom"));
    expect(isPlatformWallet(wallet, "svm")).toBe(true);
    expect(isPlatformWallet(wallet, "evm")).toBe(false);
    const metamask = walletOf(evmAdapter("metamask"));
    expect(isPlatformWallet(metamask, "evm")).toBe(true);
  });
});
