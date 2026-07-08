import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Copy } from 'lucide-react-native';
import { Card } from '../../../shared/ui/Card';
import { toast } from '../../../shared/ui/Toast';
import { useWalletStore } from '../store/useWalletStore';
import { useNetworkStore, SUPPORTED_CHAINS } from '../../network';
import { BalanceService } from '../../tokens/services/BalanceService';
import { ActivityIndicator } from 'react-native';

interface ReceiveScreenProps {
  onBack: () => void;
  isDarkMode?: boolean;
}

export const ReceiveScreen: React.FC<ReceiveScreenProps> = memo(({ onBack, isDarkMode = true }) => {
  const { wallets, activeWalletId, activeAccountIndex } = useWalletStore();
  const { activeChainId } = useNetworkStore();
  const [isAirdropping, setIsAirdropping] = React.useState(false);
  
  const textColor = isDarkMode ? '#ffffff' : '#111827';
  const subtextColor = isDarkMode ? '#9ca3af' : '#4b5563';

  const wallet = wallets.find((w) => w.id === activeWalletId);
  const account = wallet?.accounts[activeAccountIndex];

  const handleCopy = (address: string, network: string) => {
    Clipboard.setString(address);
    toast.success(`${network} address copied!`);
  };

  const handleAirdrop = async () => {
    if (!account) return;
    try {
      setIsAirdropping(true);
      const chain = SUPPORTED_CHAINS.find(c => c.id === 'solana-devnet')!;
      await BalanceService.requestSolanaAirdrop(account.solanaAddress, chain);
      toast.success('Successfully airdropped 1 SOL!');
    } catch (error: any) {
      toast.error(error.message || 'Airdrop failed. Faucet might be rate-limited.');
    } finally {
      setIsAirdropping(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: textColor }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Receive Funds</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.instruction, { color: subtextColor }]}>
          Send supported assets to the matching address below. Do not mix networks!
        </Text>

        {account ? (
          <>
            <Card isDarkMode={isDarkMode} style={styles.addressCard}>
              <View style={styles.cardHeader}>
                <Text style={[styles.networkLabel, { color: textColor }]}>EVM (Ethereum / Polygon)</Text>
              </View>
              <Text style={[styles.addressText, { color: subtextColor }]} selectable>
                {account.evmAddress}
              </Text>
              <TouchableOpacity 
                style={[styles.copyBtn, isDarkMode ? styles.copyBtnDark : styles.copyBtnLight]}
                onPress={() => handleCopy(account.evmAddress, 'EVM')}
                activeOpacity={0.7}
              >
                <Copy size={16} color={textColor} />
                <Text style={[styles.copyBtnText, { color: textColor }]}>Copy Address</Text>
              </TouchableOpacity>
            </Card>

            <Card isDarkMode={isDarkMode} style={styles.addressCard}>
              <View style={styles.cardHeader}>
                <Text style={[styles.networkLabel, { color: textColor }]}>Solana</Text>
              </View>
              <Text style={[styles.addressText, { color: subtextColor }]} selectable>
                {account.solanaAddress}
              </Text>
              <TouchableOpacity 
                style={[styles.copyBtn, isDarkMode ? styles.copyBtnDark : styles.copyBtnLight]}
                onPress={() => handleCopy(account.solanaAddress, 'Solana')}
                activeOpacity={0.7}
              >
                <Copy size={16} color={textColor} />
                <Text style={[styles.copyBtnText, { color: textColor }]}>Copy Address</Text>
              </TouchableOpacity>

              {activeChainId === 'solana-devnet' && (
                <TouchableOpacity 
                  style={[styles.airdropBtn, isDarkMode ? styles.airdropBtnDark : styles.airdropBtnLight]}
                  onPress={handleAirdrop}
                  disabled={isAirdropping}
                  activeOpacity={0.7}
                >
                  {isAirdropping ? (
                    <ActivityIndicator size="small" color={textColor} />
                  ) : (
                    <Text style={[styles.copyBtnText, { color: textColor }]}>🎁 Airdrop 1 SOL (Devnet)</Text>
                  )}
                </TouchableOpacity>
              )}
            </Card>
          </>
        ) : (
          <Text style={[styles.errorText, { color: textColor }]}>No active wallet found.</Text>
        )}
      </View>
    </View>
  );
});

ReceiveScreen.displayName = 'ReceiveScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  backBtn: {
    paddingVertical: 8,
    width: 60,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: 8,
  },
  instruction: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  addressCard: {
    width: '100%',
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
  },
  cardHeader: {
    marginBottom: 12,
  },
  networkLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'Courier',
    marginBottom: 20,
    lineHeight: 20,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  copyBtnDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  copyBtnLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  copyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  airdropBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  airdropBtnDark: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)', // Blue tint for airdrop
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  airdropBtnLight: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});
export default ReceiveScreen;
