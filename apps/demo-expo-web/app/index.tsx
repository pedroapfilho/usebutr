import { ScrollView, Text, View } from "react-native";

import { Content } from "./_components";
import { styles } from "./_styles";

const Index = () => (
  <ScrollView style={styles.root}>
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.h1}>butr · Expo</Text>
        <Text style={styles.lede}>
          React Native target. EVM (EIP-6963) and SVM (Wallet Standard) discovery via
          @usebutr/wallets; persistence via an AsyncStorage-backed WalletStorage driver.
        </Text>
      </View>
      <Content />
    </View>
  </ScrollView>
);

export default Index;
