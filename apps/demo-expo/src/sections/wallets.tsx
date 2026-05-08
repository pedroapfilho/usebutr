import { Pressable, Text, View } from "react-native";
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

const Btn = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable
    onPress={onPress}
    style={{ backgroundColor: "#eee", borderRadius: 4, margin: 4, padding: 8 }}
  >
    <Text>{label}</Text>
  </Pressable>
);

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
    <View style={{ borderBottomWidth: 1, borderColor: "#ddd", padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Wallets</Text>
      <Text>has any: {String(wallets.length > 0)}</Text>
      <Text>is evm connected: {String(isEvm)}</Text>
      <Text>is svm connected: {String(isSvm)}</Text>
      <Text>
        list ({wallets.length}): {wallets.map((w) => w.connector.id).join(", ") || "none"}
      </Text>
      <Text>pool keys: {[...pool.keys()].join(", ") || "none"}</Text>
      <Text>
        selection: {[...selection.entries()].map(([p, id]) => `${p}=${id}`).join(", ") || "none"}
      </Text>
      <Text>active wallet: {formatWallet(activeWallet)}</Text>
      <Text>selected (evm): {formatWallet(selectedEvm)}</Text>
      <Text>selected (svm): {formatWallet(selectedSvm)}</Text>
      <Text>get(mock-evm): {formatWallet(getWallet("mock-evm"))}</Text>
      <Text>getSelected(svm): {formatWallet(getSelected("svm"))}</Text>
      <Text>
        mock-evm accounts ({evmAccounts.length}):{" "}
        {evmAccounts.map((a) => a.walletAddress).join(", ") || "none"}
      </Text>
      <Text>
        active accounts ({activeAccounts.length}):{" "}
        {activeAccounts.map((a) => a.walletAddress).join(", ") || "none"}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
        <Btn label="Rotate EVM account" onPress={rotateAccount} />
        <Btn label="Activate EVM" onPress={() => setActive("mock-evm")} />
        <Btn label="Activate SVM" onPress={() => setActive("mock-svm")} />
        <Btn label="Select EVM=mock-evm" onPress={() => setSelection("evm", "mock-evm")} />
        <Btn label="Clear EVM selection" onPress={() => setSelection("evm", null)} />
        <Btn label="Emit accountChanged" onPress={triggerWalletAccountSwap} />
        <Btn label="Emit disconnected" onPress={triggerExternalDisconnect} />
      </View>
    </View>
  );
};

export { WalletsSection };
