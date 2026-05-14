import { Stack } from "expo-router";
import { WalletProvider } from "../src/wallet-provider";

const RootLayout = () => (
  <WalletProvider>
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  </WalletProvider>
);

export default RootLayout;
