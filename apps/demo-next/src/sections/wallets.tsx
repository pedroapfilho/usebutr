"use client";

import {
  useActiveWallet,
  useConnectedWallets,
  useGetSelectedWallet,
  useGetWallet,
  useIsPlatformConnected,
  usePool,
  useSelectedWallet,
  useSelection,
  useSetActiveConnector,
  useSetSelection,
  useUpdateWalletAccount,
  type Account,
  type ChainBase,
  type ConnectedWallet,
} from "butr";

const ROTATING_CHAIN: ChainBase = {
  id: "eip155:1",
  name: "Ethereum",
  namespace: "eip155",
  reference: "1",
};

const formatWallet = (w: ConnectedWallet | undefined) =>
  w ? `${w.connector.id} → ${w.account.walletAddress}` : "none";

const WalletsSection = () => {
  const wallets = useConnectedWallets();
  const pool = usePool();
  const selection = useSelection();
  const activeWallet = useActiveWallet();
  const selectedEvm = useSelectedWallet("evm");
  const selectedSvm = useSelectedWallet("svm");
  const isEvm = useIsPlatformConnected("evm");
  const isSvm = useIsPlatformConnected("svm");
  const getWallet = useGetWallet();
  const getSelected = useGetSelectedWallet();
  const setActive = useSetActiveConnector();
  const setSelection = useSetSelection();
  const updateAccount = useUpdateWalletAccount();

  const rotateAccount = () => {
    const next: Account = {
      chain: ROTATING_CHAIN,
      id: `evm:${Date.now()}`,
      walletAddress: `0x${Date.now().toString(16).padStart(40, "0")}`.slice(0, 42),
    };
    updateAccount("mock-evm", next);
  };

  return (
    <section style={{ borderBottom: "1px solid #ddd", padding: 16 }}>
      <h2>Wallets</h2>
      <ul>
        <li>has any: {String(wallets.length > 0)}</li>
        <li>is evm connected: {String(isEvm)}</li>
        <li>is svm connected: {String(isSvm)}</li>
        <li>
          list ({wallets.length}): {wallets.map((w) => w.connector.id).join(", ") || "none"}
        </li>
        <li>pool keys: {[...pool.keys()].join(", ") || "none"}</li>
        <li>
          selection: {[...selection.entries()].map(([p, id]) => `${p}=${id}`).join(", ") || "none"}
        </li>
        <li>active wallet: {formatWallet(activeWallet)}</li>
        <li>selected (evm): {formatWallet(selectedEvm)}</li>
        <li>selected (svm): {formatWallet(selectedSvm)}</li>
        <li>get(mock-evm): {formatWallet(getWallet("mock-evm"))}</li>
        <li>getSelected(svm): {formatWallet(getSelected("svm"))}</li>
      </ul>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button onClick={rotateAccount} type="button">
          Rotate active EVM account
        </button>
        <button onClick={() => setActive("mock-evm")} type="button">
          Activate EVM
        </button>
        <button onClick={() => setActive("mock-svm")} type="button">
          Activate SVM
        </button>
        <button onClick={() => setSelection("evm", "mock-evm")} type="button">
          Select EVM=mock-evm
        </button>
        <button onClick={() => setSelection("evm", null)} type="button">
          Clear EVM selection
        </button>
      </div>
    </section>
  );
};

export { WalletsSection };
