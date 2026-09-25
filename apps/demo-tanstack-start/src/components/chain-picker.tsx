import type { ChainBase, ConnectedWallet } from "@usebutr/core";
import { EVM_CHAINS_LIST } from "@usebutr/core";
import { type ChangeEvent, useState } from "react";

const ChainPicker = ({
  switchChain,
  wallet,
}: {
  switchChain: (chain: ChainBase) => Promise<void>;
  wallet: ConnectedWallet;
}) => {
  // EVM-only discovery, so every connected wallet is on an EVM chain.
  const chains = EVM_CHAINS_LIST;
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
      await switchChain(target);
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
        className="border-border-strong w-full rounded-md border bg-white px-2 py-1 text-base"
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
        <p className="text-danger-accent mt-1 text-xs" role="alert">
          {switchError}
        </p>
      )}
    </div>
  );
};

export { ChainPicker };
