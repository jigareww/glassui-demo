import React from 'react';
import { useColorScheme } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../../features/home/screens/HomeScreen';
import * as Placeholders from '../../features/home/screens/Placeholders';
import { PlaygroundScreen } from '../../features/home/screens/PlaygroundScreen';
import { ProfileScreen } from '../../features/wallet/screens/ProfileScreen';
import { GlassBottomTab } from '../../shared/ui/GlassBottomTab';

import { useWalletStore } from '@features/wallet';
import { useNetworkStore, SUPPORTED_CHAINS, Chain } from '@features/network';
import { useTokenStore, CURATED_TOKENS } from '@features/tokens';
import { alert } from '@shared/ui/Alert';
import { toast } from '@shared/ui/Toast';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const { wallets, activeWalletId, activeAccountIndex } = useWalletStore();
  const activeChainId = useNetworkStore((state) => state.activeChainId);
  const activeChain = SUPPORTED_CHAINS.find((c: Chain) => c.id === activeChainId) || SUPPORTED_CHAINS[0];
  const { nativeBalance, tokenBalances } = useTokenStore();

  const getActiveAddress = () => {
    if (wallets.length === 0 || !activeWalletId) return null;
    const wallet = wallets.find((w) => w.id === activeWalletId);
    if (!wallet) return null;
    const account = wallet.accounts[activeAccountIndex];
    if (!account) return null;
    return activeChain.type === 'evm' ? account.evmAddress : account.solanaAddress;
  };

  const getActiveAddressString = () => {
    const addr = getActiveAddress();
    if (!addr) return 'No Address';
    return activeChain.type === 'evm' ? `EVM: ${addr.slice(0, 6)}...${addr.slice(-4)}` : `SOL: ${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleSignOut = () => {
    alert.show({
      title: 'Lock Wallet',
      message: 'Are you sure you want to lock your wallet?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Lock',
          style: 'destructive',
          onPress: () => {
            toast.info('Wallet locked.');
          },
        },
      ],
    });
  };

  const chainTokens = CURATED_TOKENS[activeChain.id] || [];
  const activeToken = chainTokens[0] || { id: 'native', chainId: activeChain.id, address: 'native', symbol: 'ETH', name: 'Ether', decimals: 18 };
  const activeBalance = activeToken.address === 'native' ? nativeBalance : '0.0';

  const routeMap: Record<string, string> = {
    'token-detail': 'TokenDetail',
    'transfer': 'TransferToken',
    'swap': 'SwapTokens',
    'staking': 'Staking',
    'nfts': 'NftGallery',
    'walletconnect': 'WalletConnectSession',
    'receive': 'Receive',
  };

  return (
    <Tab.Navigator
      tabBar={(props) => (
        <GlassBottomTab
          tabs={[
            { id: 'Home', label: 'Home', icon: 'Home' },
            { id: 'Reels', label: 'Reels', icon: 'Play' },
            { id: 'Messages', label: 'Messages', icon: 'Send' },
            { id: 'Playground', label: 'Playground', icon: 'Settings' },
            { id: 'Profile', label: 'Profile', icon: 'profile' },
          ]}
          initialIndex={props.state.index}
          onTabPress={(idx) => {
            const routes = ['Home', 'Reels', 'Messages', 'Playground', 'Profile'];
            props.navigation.navigate(routes[idx]);
          }}
          isDarkMode={isDarkMode}
        />
      )}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}
    >
      <Tab.Screen name="Home">
        {(props) => (
          <HomeScreen
            email={getActiveAddressString()}
            isDarkMode={isDarkMode}
            onSignOut={handleSignOut}
            onNavigate={(screenStr) => {
              const routeName = routeMap[screenStr];
              if (routeName) {
                if (routeName === 'TokenDetail') {
                  props.navigation.navigate(routeName as never, { token: activeToken, balanceString: activeBalance, recipientAddress: getActiveAddress() || '' } as never);
                } else if (routeName === 'TransferToken') {
                  props.navigation.navigate(routeName as never, { token: activeToken, activeChain, senderAddress: getActiveAddress() || '', balanceString: activeBalance } as never);
                } else if (routeName === 'SwapTokens') {
                  props.navigation.navigate(routeName as never, { tokens: chainTokens, activeChain } as never);
                } else if (routeName === 'Staking') {
                  props.navigation.navigate(routeName as never, { activeChain, balanceString: activeBalance } as never);
                } else {
                  props.navigation.navigate(routeName as never);
                }
              }
            }}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Reels">
        {() => <Placeholders.ReelsScreen isDarkMode={isDarkMode} />}
      </Tab.Screen>
      <Tab.Screen name="Messages" component={Placeholders.MessagesScreen} />
      <Tab.Screen name="Playground" component={PlaygroundScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
