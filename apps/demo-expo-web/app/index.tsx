import { ScrollView, Text, View } from "react-native";

import { Content } from "./_components";

const Index = () => (
  <ScrollView className="native-root">
    <View className="native-container">
      <View className="native-header">
        <Text className="native-h1">butr · Expo</Text>
        <Text className="native-lede">
          React Native target. EVM (EIP-6963) and SVM (Wallet Standard) discovery via
          @usebutr/wallets; persistence via an AsyncStorage-backed WalletStorage driver.
        </Text>
      </View>
      <Content />
    </View>
  </ScrollView>
);

export default Index;
