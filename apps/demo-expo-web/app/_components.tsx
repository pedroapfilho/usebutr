import { useState } from "react";
import { Image, Linking, Pressable, Text, View } from "react-native";
import type { Account, ConnectedWallet, WalletAdapter } from "@butr/core";
import {
  useActiveWallet,
  useBalance,
  useConnectWallet,
  useConnectedWallets,
  useConnectionError,
  useConnectionStatus,
  useDiscoveredWallets,
  useDisconnectWallet,
  useIsHydrated,
  useRequestAccounts,
  useSetActiveConnector,
} from "@butr/react";
import type { UseBalanceResult } from "@butr/react";
import { CHAINS_BY_PLATFORM } from "@butr/wallets";
import { styles } from "./_styles";

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
  const canSign = wallet.connector.capabilities.signMessage;
  const [state, setState] = useState<SignState>({ kind: "idle" });

  const handleSign = async () => {
    setState({ kind: "signing" });
    try {
      const bytes = new TextEncoder().encode(SIGN_MESSAGE_TEXT);
      await wallet.connector.signMessage(bytes, account);
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
    signStatusNode = <Text style={styles.signOk}>✓ signed</Text>;
  } else if (state.kind === "error") {
    signStatusNode = <Text style={styles.signError}>✗ failed</Text>;
  }

  return (
    <View style={[styles.accountRow, isCurrent ? styles.accountRowCurrent : null]}>
      <Text style={isCurrent ? styles.accountAddressActive : styles.accountAddress}>
        {account.walletAddress}
      </Text>
      {canSign ? (
        <View style={styles.accountRowActions}>
          {signStatusNode}
          <Pressable
            disabled={state.kind === "signing"}
            onPress={() => {
              void handleSign();
            }}
            style={styles.signButton}
          >
            <Text style={styles.signButtonText}>{state.kind === "signing" ? "…" : "Sign"}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

const AccountPicker = ({ wallet }: { wallet: ConnectedWallet }) => (
  <View style={styles.accountList}>
    {wallet.accounts.map((account) => (
      <AccountRow account={account} key={account.id} wallet={wallet} />
    ))}
    <Text style={styles.muted}>
      Active account is set in your wallet. Use Sign to test per-account signing.
    </Text>
  </View>
);

const ChainPicker = ({ wallet }: { wallet: ConnectedWallet }) => {
  const chains = CHAINS_BY_PLATFORM[wallet.connector.chainPlatform];
  return (
    <View style={styles.chainList}>
      {chains.map((chain) => {
        const isCurrent = chain.id === wallet.account.chain.id;
        return (
          <Pressable
            key={chain.id}
            onPress={() => {
              void wallet.connector.switchChain(chain);
            }}
            style={[styles.chainChip, isCurrent ? styles.chainChipCurrent : null]}
          >
            <Text style={isCurrent ? styles.chainChipTextCurrent : styles.chainChipText}>
              {chain.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const StatusBar = ({ status }: { status: string }) => (
  <View style={styles.statusRow}>
    <Text style={styles.statusLabel}>Status:</Text>
    <View style={styles.statusPill}>
      <Text style={styles.statusPillText}>{status}</Text>
    </View>
  </View>
);

const ConnectedWalletCard = ({ wallet }: { wallet: ConnectedWallet }) => {
  const active = useActiveWallet();
  const setActive = useSetActiveConnector();
  const disconnect = useDisconnectWallet();
  const requestAccounts = useRequestAccounts();
  const balance = useBalance(wallet.connector.id);
  const isActive = active?.connector.id === wallet.connector.id;
  const { capabilities } = wallet.connector;
  const balanceText = getBalanceText(balance);

  return (
    <View style={styles.activeCard}>
      <View style={styles.activeHeader}>
        <View style={styles.walletRowLeft}>
          {wallet.connector.icon ? (
            <Image source={{ uri: wallet.connector.icon }} style={styles.activeIcon} />
          ) : null}
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.activeName}>{wallet.connector.name}</Text>
              {isActive ? (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>active</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.muted}>{wallet.account.chain.name}</Text>
          </View>
        </View>
        <View style={styles.actionRow}>
          {isActive ? null : (
            <Pressable onPress={() => setActive(wallet.connector.id)} style={styles.outlineButton}>
              <Text style={styles.outlineButtonText}>Make active</Text>
            </Pressable>
          )}
          <Pressable onPress={() => disconnect(wallet.connector.id)} style={styles.outlineButton}>
            <Text style={styles.outlineButtonText}>Disconnect</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.dlRow}>
        <Text style={styles.dt}>Address</Text>
        <AccountPicker wallet={wallet} />
      </View>
      <View style={styles.dlRow}>
        <Text style={styles.dt}>Balance</Text>
        <Text style={styles.dd}>{balanceText}</Text>
      </View>
      {capabilities.switchChain ? (
        <View style={styles.dlRow}>
          <Text style={styles.dt}>Chain</Text>
          <View style={styles.dd}>
            <ChainPicker wallet={wallet} />
          </View>
        </View>
      ) : null}
      {capabilities.requestAccounts ? (
        <Pressable
          onPress={() => {
            void requestAccounts(wallet.connector.id);
          }}
          style={styles.outlineButton}
        >
          <Text style={styles.outlineButtonText}>Request more accounts</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const ConnectedList = ({ wallets }: { wallets: ReadonlyArray<ConnectedWallet> }) => (
  <View>
    <View style={styles.groupHeader}>
      <Text style={styles.h2}>Connected</Text>
      <View style={styles.countPill}>
        <Text style={styles.countPillText}>{wallets.length}</Text>
      </View>
    </View>
    <View style={styles.stackSmall}>
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
  <View style={styles.walletRow}>
    <View style={styles.walletRowLeft}>
      {brand.icon ? <Image source={{ uri: brand.icon }} style={styles.walletIcon} /> : null}
      <Text style={styles.walletName}>{brand.name}</Text>
    </View>
    <View style={styles.brandPlatformList}>
      {brand.adapters.map((adapter) => (
        <Pressable key={adapter.id} onPress={() => connect(adapter.id)} style={styles.platformChip}>
          <Text style={styles.platformChipText}>{adapter.chainPlatform.toUpperCase()}</Text>
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
  const connect = useConnectWallet();

  if (available.length === 0 && !hasConnected) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.h2}>No wallets detected</Text>
        <Text style={styles.bodySmall}>
          Wallet discovery on native requires WalletConnect or a chain-specific SDK. The web target
          discovers browser-extension wallets via EIP-6963 and the Solana Wallet Standard.
        </Text>
        <Pressable
          onPress={() => Linking.openURL("https://metamask.io/download")}
          style={styles.outlineButton}
        >
          <Text style={styles.outlineButtonText}>Install MetaMask</Text>
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
      <Text style={styles.h2}>{hasConnected ? "Connect another" : "Available wallets"}</Text>
      <View style={[styles.stackSmall, { marginTop: 12 }]}>
        {brands.map((brand) => (
          <WalletBrandRow brand={brand} connect={connect} key={brand.name} />
        ))}
      </View>
    </View>
  );
};

const Content = () => {
  const isHydrated = useIsHydrated();
  const status = useConnectionStatus();
  const connectionError = useConnectionError();
  const connected = useConnectedWallets();
  const discovered = useDiscoveredWallets();

  if (!isHydrated) {
    return <Text style={styles.muted}>Loading…</Text>;
  }

  const available = discovered.filter((d) => !connected.some((c) => c.connector.id === d.id));

  return (
    <View style={styles.stack}>
      <StatusBar status={status} />
      {connected.length > 0 ? <ConnectedList wallets={connected} /> : null}
      <WalletPicker available={available} hasConnected={connected.length > 0} />
      {connectionError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {connectionError.kind} — {connectionError.message}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export { Content };
