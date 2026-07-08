import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamList } from './types';
import { alert } from '@shared/ui/Alert';
import { toast } from '@shared/ui/Toast';
import { useWalletStore } from '@features/wallet';
import { useNetworkStore, SUPPORTED_CHAINS, Chain } from '@features/network';
import { useTokenStore, CURATED_TOKENS } from '@features/tokens';
import { useNftStore, NftGalleryScreen } from '@features/nfts';
import { BottomTabNavigator } from './BottomTabNavigator';
import { TokenDetailScreen, TransferTokenScreen, SwapTokensScreen } from '@features/tokens';
import { StakingScreen } from '@features/staking';
import { WCSessionScreen } from '@features/walletconnect';
import { ReceiveScreen } from '../../features/wallet/screens/ReceiveScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppStack = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const { wallets, activeWalletId, activeAccountIndex } = useWalletStore();
  const activeChainId = useNetworkStore((state) => state.activeChainId);
  const activeChain = SUPPORTED_CHAINS.find((c: Chain) => c.id === activeChainId) || SUPPORTED_CHAINS[0];

  const { fetchBalances, nativeBalance, tokenBalances } = useTokenStore();
  const { nfts, isFetchingNfts, fetchNfts } = useNftStore();

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

  useEffect(() => {
    const addr = getActiveAddress();
    if (addr) {
      fetchBalances(addr, activeChain);
      fetchNfts(addr, activeChain);
    }
  }, [activeWalletId, activeAccountIndex, activeChain]);

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
            // Root state manages app lock state, this will trigger the AuthStack UnlockPasscode
            // TODO: Add isLocked to WalletStore
            toast.info('Wallet locked.');
          },
        },
      ],
    });
  };

  const chainTokens = CURATED_TOKENS[activeChain.id] || [];
  const activeToken = chainTokens[0] || {
    id: 'native',
    chainId: activeChain.id,
    address: 'native',
    symbol: activeChain.type === 'evm' ? 'ETH' : 'SOL',
    name: activeChain.type === 'evm' ? 'Ether' : 'Solana',
    decimals: 9,
  };
  const activeBalance = activeToken.address === 'native'
    ? nativeBalance
    : (tokenBalances.find((t) => t.token.id === activeToken.id)?.balance || '0.0');

  // Map sub-screen names to React Navigation route names
  const routeMap: Record<string, keyof AppStackParamList> = {
    'token-detail': 'TokenDetail',
    'transfer': 'TransferToken',
    'swap': 'SwapTokens',
    'staking': 'Staking',
    'nfts': 'NftGallery',
    'walletconnect': 'WalletConnectSession',
    'receive': 'Receive',
  };

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false, 
        animation: 'fade',
        contentStyle: { backgroundColor: 'transparent' }
      }}
    >
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

      <Stack.Screen name="TokenDetail">
        {(props) => (
          <TokenDetailScreen
            token={props.route.params.token}
            balanceString={props.route.params.balanceString}
            recipientAddress={props.route.params.recipientAddress}
            onBack={() => props.navigation.goBack()}
            onNavigateToSend={() => props.navigation.navigate('TransferToken', {
              token: props.route.params.token,
              activeChain,
              senderAddress: getActiveAddress() || '',
              balanceString: props.route.params.balanceString
            })}
            isDarkMode={isDarkMode}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="TransferToken">
        {(props) => (
          <TransferTokenScreen
            token={props.route.params.token}
            activeChain={props.route.params.activeChain}
            senderAddress={props.route.params.senderAddress}
            balanceString={props.route.params.balanceString}
            onBack={() => props.navigation.goBack()}
            onSuccess={(txHash) => {
              props.navigation.navigate('MainTabs');
              const addr = getActiveAddress();
              if (addr) fetchBalances(addr, activeChain);
            }}
            isDarkMode={isDarkMode}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="SwapTokens">
        {(props) => (
          <SwapTokensScreen
            tokens={props.route.params.tokens}
            activeChain={props.route.params.activeChain}
            onBack={() => props.navigation.goBack()}
            isDarkMode={isDarkMode}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Staking">
        {(props) => (
          <StakingScreen
            activeChain={props.route.params.activeChain}
            balanceString={props.route.params.balanceString}
            onBack={() => props.navigation.goBack()}
            isDarkMode={isDarkMode}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="NftGallery">
        {(props) => (
          <NftGalleryScreen
            nfts={nfts}
            isFetching={isFetchingNfts}
            onBack={() => props.navigation.goBack()}
            isDarkMode={isDarkMode}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="WalletConnectSession">
        {(props) => (
          <WCSessionScreen
            activeAddresses={getActiveAddress() ? [getActiveAddress()!] : []}
            onBack={() => props.navigation.goBack()}
            isDarkMode={isDarkMode}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Receive">
        {(props) => (
          <ReceiveScreen
            onBack={() => props.navigation.goBack()}
            isDarkMode={isDarkMode}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
