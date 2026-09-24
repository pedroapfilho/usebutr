import type { Account, ChainBase, ConnectedWallet, WalletAdapter } from "@usebutr/core";
import { CHAINS_BY_PLATFORM } from "@usebutr/core";
import {
  useBalance,
  useConnect,
  useConnectedWallets,
  useConnectionStatus,
  useDiscoveredWallets,
  useWallet,
  useWalletManager,
} from "@usebutr/react";
import type { UseBalanceResult } from "@usebutr/react";
import { Image as ExpoImage } from "expo-image";
import { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { withUniwind } from "uniwind";

const Image = withUniwind(ExpoImage);

type SignState =
  | { kind: "idle" }
  | { kind: "signing" }
  | { kind: "ok" }
  | { kind: "error"; message: string };

type WalletBrand = {
  adapters: Array<WalletAdapter>;
  icon: string | undefined;
  name: string;
};

const SIGN_MESSAGE_TEXT = "Hello from the butr demo";

const getBalanceText = (balance: UseBalanceResult): string => {
  if (balance.status === "success") {
    return `${balance.data.formatted} ${balance.data.symbol}`;
  }
  if (balance.status === "loading") {
    return "…";
  }
  if (balance.status === "error") {
    return "error";
  }
  return "—";
};

const groupByBrand = (wallets: ReadonlyArray<WalletAdapter>): Array<WalletBrand> => {
  const byName = new Map<string, WalletBrand>();
  for (const wallet of wallets) {
    const key = wallet.name.toLowerCase();
    const existing = byName.get(key);
    if (existing) {
      existing.adapters.push(wallet);
      existing.icon ??= wallet.icon;
    } else {
      byName.set(key, {
        adapters: [wallet],
        icon: wallet.icon,
        name: wallet.name,
      });
    }
  }
  return [...byName.values()];
};

const AccountRow = ({ account, wallet }: { account: Account; wallet: ConnectedWallet }) => {
  const isCurrent = account.walletAddress === wallet.account.walletAddress;
  const { signMessage } = wallet.connector;
  const [state, setState] = useState<SignState>({ kind: "idle" });

  const handleSign = async (sign: NonNullable<typeof signMessage>) => {
    setState({ kind: "signing" });
    try {
      const bytes = new TextEncoder().encode(SIGN_MESSAGE_TEXT);
      await sign(bytes, { account });
      setState({ kind: "ok" });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  let signStatusNode: React.ReactNode = null;
  if (state.kind === "ok") {
    signStatusNode = <Text className="native-sign-ok">✓ signed</Text>;
  } else if (state.kind === "error") {
    signStatusNode = <Text className="native-sign-error">✗ failed</Text>;
  }

  return (
    <View
      className={isCurrent ? "native-account-row native-account-row-current" : "native-account-row"}
    >
      <Text className={isCurrent ? "native-account-address-active" : "native-account-address"}>
        {account.walletAddress}
      </Text>
      {signMessage ? (
        <View className="native-account-row-actions">
          {signStatusNode}
          <Pressable
            className="native-sign-button"
            disabled={state.kind === "signing"}
            onPress={() => {
              void handleSign(signMessage);
            }}
          >
            <Text className="native-sign-button-text">
              {state.kind === "signing" ? "…" : "Sign"}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

const AccountPicker = ({ wallet }: { wallet: ConnectedWallet }) => (
  <View className="native-account-list">
    {wallet.accounts.map((account) => (
      <AccountRow account={account} key={account.id} wallet={wallet} />
    ))}
    <Text className="native-muted">
      Active account is set in your wallet. Use Sign to test per-account signing.
    </Text>
  </View>
);

const ChainPicker = ({
  switchChain,
  wallet,
}: {
  switchChain: (chain: ChainBase) => Promise<void>;
  wallet: ConnectedWallet;
}) => {
  const chains = CHAINS_BY_PLATFORM[wallet.connector.chainPlatform];
  const [switchError, setSwitchError] = useState<string | null>(null);

  // switchChain rejects on user rejection (4001) and unknown network (4902),
  // both routine. The chip list reflects the wallet's current chain, so an
  // unhandled rejection would leave the tap looking like it did nothing.
  const handleSwitch = async (chain: ChainBase) => {
    setSwitchError(null);
    try {
      await switchChain(chain);
    } catch (error) {
      setSwitchError(error instanceof Error ? error.message : "Failed to switch chain");
    }
  };

  return (
    <View className="native-chain-list">
      {chains.map((chain) => {
        const isCurrent = chain.id === wallet.account.chain.id;
        return (
          <Pressable
            className={
              isCurrent ? "native-chain-chip native-chain-chip-current" : "native-chain-chip"
            }
            key={chain.id}
            onPress={() => {
              void handleSwitch(chain);
            }}
          >
            <Text
              className={isCurrent ? "native-chain-chip-text-current" : "native-chain-chip-text"}
            >
              {chain.name}
            </Text>
          </Pressable>
        );
      })}
      {switchError === null ? null : <Text className="native-sign-error">{switchError}</Text>}
    </View>
  );
};

const StatusBar = ({ status }: { status: string }) => (
  <View className="native-status-row">
    <Text className="native-status-label">Status:</Text>
    <View className="native-status-pill">
      <Text className="native-status-pill-text">{status}</Text>
    </View>
  </View>
);

const ConnectedWalletCard = ({ wallet }: { wallet: ConnectedWallet }) => {
  const active = useWallet();
  const { disconnect, requestAccounts, setActive } = useWalletManager();
  const balance = useBalance(wallet);
  const isActive = active?.connector.id === wallet.connector.id;
  const { switchChain } = wallet.connector;
  const balanceText = getBalanceText(balance);

  return (
    <View className="native-active-card">
      <View className="native-active-header">
        <View className="native-wallet-row-left">
          {wallet.connector.icon !== undefined && wallet.connector.icon !== "" ? (
            <Image className="native-active-icon" source={{ uri: wallet.connector.icon }} />
          ) : null}
          <View>
            <View className="native-title-row">
              <Text className="native-active-name">{wallet.connector.name}</Text>
              {isActive ? (
                <View className="native-active-badge">
                  <Text className="native-active-badge-text">active</Text>
                </View>
              ) : null}
            </View>
            <Text className="native-muted">{wallet.account.chain.name}</Text>
          </View>
        </View>
        <View className="native-action-row">
          {isActive ? null : (
            <Pressable
              className="native-outline-button"
              onPress={() => {
                setActive(wallet.connector.id);
              }}
            >
              <Text className="native-outline-button-text">Make active</Text>
            </Pressable>
          )}
          <Pressable
            className="native-outline-button"
            onPress={() => {
              disconnect(wallet.connector.id);
            }}
          >
            <Text className="native-outline-button-text">Disconnect</Text>
          </Pressable>
        </View>
      </View>
      <View className="native-dl-row">
        <Text className="native-dt">Address</Text>
        <AccountPicker wallet={wallet} />
      </View>
      <View className="native-dl-row">
        <Text className="native-dt">Balance</Text>
        <Text className="native-dd">{balanceText}</Text>
      </View>
      {switchChain ? (
        <View className="native-dl-row">
          <Text className="native-dt">Chain</Text>
          <View className="native-dd">
            <ChainPicker switchChain={switchChain} wallet={wallet} />
          </View>
        </View>
      ) : null}
      {wallet.connector.requestAccounts ? (
        <Pressable
          className="native-outline-button"
          onPress={() => {
            void requestAccounts(wallet.connector.id);
          }}
        >
          <Text className="native-outline-button-text">Request more accounts</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const ConnectedList = ({ wallets }: { wallets: ReadonlyArray<ConnectedWallet> }) => (
  <View>
    <View className="native-group-header">
      <Text className="native-h2">Connected</Text>
      <View className="native-count-pill">
        <Text className="native-count-pill-text">{wallets.length}</Text>
      </View>
    </View>
    <View className="native-stack-small">
      {wallets.map((wallet) => (
        <ConnectedWalletCard key={wallet.connector.id} wallet={wallet} />
      ))}
    </View>
  </View>
);

const WalletBrandRow = ({
  brand,
  connect,
}: {
  brand: WalletBrand;
  connect: (id: string) => void;
}) => (
  <View className="native-wallet-row">
    <View className="native-wallet-row-left">
      {brand.icon !== undefined && brand.icon !== "" ? (
        <Image className="native-wallet-icon" source={{ uri: brand.icon }} />
      ) : null}
      <Text className="native-wallet-name">{brand.name}</Text>
    </View>
    <View className="native-brand-platform-list">
      {brand.adapters.map((adapter) => (
        <Pressable
          className="native-platform-chip"
          key={adapter.id}
          onPress={() => {
            connect(adapter.id);
          }}
        >
          <Text className="native-platform-chip-text">{adapter.chainPlatform.toUpperCase()}</Text>
        </Pressable>
      ))}
    </View>
  </View>
);

const WalletPicker = ({
  available,
  hasConnected,
}: {
  available: ReadonlyArray<WalletAdapter>;
  hasConnected: boolean;
}) => {
  const { connect } = useConnect();

  if (available.length === 0 && !hasConnected) {
    return (
      <View className="native-empty-card">
        <Text className="native-h2">No wallets detected</Text>
        <Text className="native-body-small">
          Wallet discovery on native requires WalletConnect or a chain-specific SDK. The web target
          discovers browser-extension wallets via EIP-6963 and the Solana Wallet Standard.
        </Text>
        <Pressable
          className="native-outline-button"
          onPress={() => {
            void Linking.openURL("https://metamask.io/download");
          }}
        >
          <Text className="native-outline-button-text">Install MetaMask</Text>
        </Pressable>
      </View>
    );
  }
  if (available.length === 0) {
    return null;
  }

  const brands = groupByBrand(available);

  return (
    <View>
      <Text className="native-h2">{hasConnected ? "Connect another" : "Available wallets"}</Text>
      <View className="native-stack-small mt-3">
        {brands.map((brand) => (
          <WalletBrandRow brand={brand} connect={connect} key={brand.name} />
        ))}
      </View>
    </View>
  );
};

const Content = () => {
  const status = useConnectionStatus();
  const { error: connectionError } = useConnect();
  const connected = useConnectedWallets();
  const discovered = useDiscoveredWallets();

  const available = discovered.filter((d) => !connected.some((c) => c.connector.id === d.id));

  return (
    <View className="native-stack">
      <StatusBar status={status} />
      {connected.length > 0 ? <ConnectedList wallets={connected} /> : null}
      <WalletPicker available={available} hasConnected={connected.length > 0} />
      {connectionError ? (
        <View className="native-error-box">
          <Text className="native-error-text">
            {connectionError.kind}: {connectionError.message}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export { Content };
