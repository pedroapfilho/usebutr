import {
  useAccounts,
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
import { getMockConnectorHandle } from "../mock-connector";

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
  const evmAccounts = useAccounts("mock-evm");
  const activeAccounts = useAccounts();

  const rotateAccount = () => {
    const next: Account = {
      chain: ROTATING_CHAIN,
      id: `evm:${Date.now()}`,
      walletAddress: `0x${Date.now().toString(16).padStart(40, "0")}`.slice(0, 42),
    };
    updateAccount("mock-evm", next);
  };

  const triggerWalletAccountSwap = () => {
    const handle = getMockConnectorHandle("mock-evm");
    if (!handle || evmAccounts.length < 2) {
      return;
    }
    // Pick whichever known account isn't currently active and emit an
    // accountChanged event — exercises the subscription bridge path.
    const current = pool.get("mock-evm")?.account.walletAddress;
    const other = evmAccounts.find((a) => a.walletAddress !== current);
    if (other) {
      handle.__emit({ account: other, type: "accountChanged" });
    }
  };

  const triggerExternalDisconnect = () => {
    const handle = getMockConnectorHandle("mock-evm");
    handle?.__emit({ type: "disconnected" });
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
        <li>
          mock-evm accounts ({evmAccounts.length}):{" "}
          {evmAccounts.map((a) => a.walletAddress).join(", ") || "none"}
        </li>
        <li>
          active wallet accounts ({activeAccounts.length}):{" "}
          {activeAccounts.map((a) => a.walletAddress).join(", ") || "none"}
        </li>
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
        <button onClick={triggerWalletAccountSwap} type="button">
          Wallet-side: emit accountChanged
        </button>
        <button onClick={triggerExternalDisconnect} type="button">
          Wallet-side: emit disconnected
        </button>
      </div>
    </section>
  );
};

export { WalletsSection };
