import type { ConnectedWallet } from "@usebutr/core";
import { buildChainsByPlatform } from "@usebutr/core";
import { EVM_CHAINS_LIST } from "@usebutr/evm";
import { type ChangeEvent, useState } from "react";

const CHAINS_BY_PLATFORM = buildChainsByPlatform({ evm: EVM_CHAINS_LIST });

const ChainPicker = ({ wallet }: { wallet: ConnectedWallet }) => {
  const chains = CHAINS_BY_PLATFORM[wallet.connector.chainPlatform];
  const selectId = `chain-picker-${wallet.connector.id}`;
  const [switchError, setSwitchError] = useState<string | null>(null);

  // switchChain rejects on user rejection (4001) and unknown network (4902),
  // both routine. The select is controlled on the wallet's current chain, so
  // an unhandled rejection would silently snap it back with no explanation.
  const handleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const target = chains.find((c) => c.id === event.target.value);
    if (!target) {
      return;
    }
    setSwitchError(null);
    try {
      await wallet.connector.switchChain(target);
    } catch (error) {
      setSwitchError(error instanceof Error ? error.message : "Failed to switch chain");
    }
  };

  return (
    <div>
      <label className="sr-only" htmlFor={selectId}>
        Chain
      </label>
      <select
        className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs"
        id={selectId}
        onChange={(event) => {
          void handleChange(event);
        }}
        value={wallet.account.chain.id}
      >
        {chains.some((c) => c.id === wallet.account.chain.id) ? null : (
          <option value={wallet.account.chain.id}>{wallet.account.chain.name} (current)</option>
        )}
        {chains.map((chain) => (
          <option key={chain.id} value={chain.id}>
            {chain.name}
          </option>
        ))}
      </select>
      {switchError === null ? null : (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {switchError}
        </p>
      )}
    </div>
  );
};

export { ChainPicker };
