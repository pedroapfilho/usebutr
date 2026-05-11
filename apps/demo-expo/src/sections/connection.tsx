import { Pressable, Text, View } from "react-native";
import {
  useActiveConnectorId,
  useConnectingConnectorId,
  useConnectionError,
  useConnectionStatus,
  useConnectWallet,
  useDisconnectWallet,
  useIsConnecting,
  useIsHydrated,
  useIsUserDisconnected,
  useRefreshWallet,
  useResetConnectionStatus,
  useResetWallet,
  useWalletConnected,
} from "butr";

const Btn = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable
    onPress={onPress}
    style={{ backgroundColor: "#eee", borderRadius: 4, margin: 4, padding: 8 }}
  >
    <Text>{label}</Text>
  </Pressable>
);

const ConnectionSection = () => {
  const status = useConnectionStatus();
  const isConnecting = useIsConnecting();
  const error = useConnectionError();
  const activeId = useActiveConnectorId();
  const connectingId = useConnectingConnectorId();
  const connected = useWalletConnected();
  const isUserDisconnected = useIsUserDisconnected();
  const isHydrated = useIsHydrated();

  const connect = useConnectWallet();
  const disconnect = useDisconnectWallet();
  const refresh = useRefreshWallet();
  const reset = useResetWallet();
  const resetStatus = useResetConnectionStatus();

  return (
    <View style={{ borderBottomWidth: 1, borderColor: "#ddd", padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Connection</Text>
      <Text>
        status: {status}
        {isConnecting && " (connecting…)"}
      </Text>
      <Text>connected: {String(connected)}</Text>
      <Text>hydrated: {String(isHydrated)}</Text>
      <Text>active connector: {activeId ?? "none"}</Text>
      <Text>connecting connector: {connectingId ?? "none"}</Text>
      <Text>error: {error ? `${error.kind} — ${error.message}` : "none"}</Text>
      <Text>user-disconnected flag: {String(isUserDisconnected)}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
        <Btn label="Connect EVM" onPress={() => connect("mock-evm")} />
        <Btn label="Connect SVM" onPress={() => connect("mock-svm")} />
        <Btn label="Disconnect EVM" onPress={() => disconnect("mock-evm")} />
        <Btn label="Disconnect SVM" onPress={() => disconnect("mock-svm")} />
        <Btn label="Refresh EVM" onPress={() => refresh("mock-evm")} />
        <Btn label="Reset" onPress={() => reset()} />
        <Btn label="Reset status" onPress={resetStatus} />
      </View>
    </View>
  );
};

export { ConnectionSection };
