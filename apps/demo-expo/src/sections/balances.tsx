import { Pressable, Text, View } from "react-native";
import { useActiveConnectorId, useBalance, useSigner } from "butr";

const BalancesSection = () => {
  const activeId = useActiveConnectorId();
  const signer = useSigner();
  const balance = useBalance();

  return (
    <View style={{ borderBottomWidth: 1, borderColor: "#ddd", padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Balances & Signer</Text>
      <Text style={{ color: "#666", fontSize: 12 }}>
        useSigner() and useBalance() for active wallet ({activeId ?? "none"}). Both invalidate on
        connectorId / address / chain changes.
      </Text>
      <Text>signer status: {signer.status}</Text>
      <Text>
        signer: {signer.status === "success" ? JSON.stringify(signer.data) : signer.status}
      </Text>
      <Text>balance status: {balance.status}</Text>
      <Text>
        balance:{" "}
        {balance.data ? `${balance.data.formatted} ${balance.data.symbol}` : balance.status}
      </Text>
      <Pressable
        onPress={() => balance.refetch()}
        style={{
          alignSelf: "flex-start",
          backgroundColor: "#eee",
          borderRadius: 4,
          marginTop: 8,
          padding: 8,
        }}
      >
        <Text>Refetch balance</Text>
      </Pressable>
    </View>
  );
};

export { BalancesSection };
