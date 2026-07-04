import type { ConnectedWallet } from "@usebutr/core";
import { buildChainsByPlatform } from "@usebutr/core";
import { EVM_CHAINS_LIST } from "@usebutr/evm";

// EVM-only — only @usebutr/evm's chain table enters the bundle.
const CHAINS_BY_PLATFORM = buildChainsByPlatform({ evm: EVM_CHAINS_LIST });

const ChainPicker = ({ wallet }: { wallet: ConnectedWallet }) => {
  const chains = CHAINS_BY_PLATFORM[wallet.connector.chainPlatform];
  const selectId = `chain-picker-${wallet.connector.id}`;
  return (
    <div>
      <label className="sr-only" htmlFor={selectId}>
        Chain
      </label>
      <select
        className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs"
        id={selectId}
        onChange={(e) => {
          const target = chains.find((c) => c.id === e.target.value);
          if (target) {
            void wallet.connector.switchChain(target);
          }
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
    </div>
  );
};

export { ChainPicker };
