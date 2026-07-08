import React, { memo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Card } from '@shared/ui/Card';
import { Input } from '@shared/ui/Input';
import { Button } from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { Token } from '../config/tokenList';
import { Chain } from '../../network/config/chains';
import { TransferService } from '../services/TransferService';
import { useWalletStore } from '../../wallet/store/useWalletStore';

interface TransferTokenScreenProps {
  token: Token;
  activeChain: Chain;
  senderAddress: string;
  balanceString: string;
  onBack: () => void;
  onSuccess: (txHash: string) => void;
  isDarkMode?: boolean;
}

export const TransferTokenScreen: React.FC<TransferTokenScreenProps> = memo(({
  token,
  activeChain,
  senderAddress,
  balanceString,
  onBack,
  onSuccess,
  isDarkMode = true,
}) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  
  // Fees estimation
  const [isEstimatingFee, setIsEstimatingFee] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState<string>('0');
  
  const [isSending, setIsSending] = useState(false);

  const getPrivateKey = useWalletStore((state) => state.getPrivateKey);

  const textColor = isDarkMode ? '#ffffff' : '#111827';
  const subtextColor = isDarkMode ? '#9ca3af' : '#4b5563';

  // Run fee pings when inputs change (debounced/deferred in production)
  useEffect(() => {
    const estimate = async () => {
      const rec = recipient.trim();
      const amt = amount.trim();
      if (!rec || !amt || isNaN(parseFloat(amt))) {
        setEstimatedFee('0');
        return;
      }
      setIsEstimatingFee(true);
      try {
        if (activeChain.type === 'evm') {
          const res = await TransferService.estimateEVMGasFee(
            senderAddress,
            rec,
            amt,
            token.address,
            activeChain
          );
          setEstimatedFee(res.totalFee);
        } else {
          const res = await TransferService.estimateSolanaFee(
            senderAddress,
            rec,
            amt,
            token.address,
            activeChain
          );
          setEstimatedFee(res.totalFee);
        }
      } catch (err) {
        // Fallback standard fee
        setEstimatedFee(activeChain.type === 'evm' ? '0.0006' : '0.000005');
      } finally {
        setIsEstimatingFee(false);
      }
    };

    estimate();
  }, [recipient, amount, activeChain, token.address, senderAddress]);

  const handleSend = async () => {
    const rec = recipient.trim();
    const amt = amount.trim();

    if (!rec) {
      toast.error('Please enter a recipient address');
      return;
    }

    if (!amt || isNaN(parseFloat(amt)) || parseFloat(amt) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const available = parseFloat(balanceString);
    const parsedAmt = parseFloat(amt);

    if (parsedAmt > available) {
      toast.error('Insufficient balance');
      return;
    }

    setIsSending(true);

    try {
      // Retrieve key securely from Keychain
      const pk = await getPrivateKey(activeChain.type);
      if (!pk) {
        throw new Error('Key retrieval failed. Please unlock your device.');
      }

      let txHash = '';
      if (activeChain.type === 'evm') {
        txHash = await TransferService.executeEVMTransfer(
          pk,
          rec,
          amt,
          token.address,
          activeChain
        );
      } else {
        txHash = await TransferService.executeSolanaTransfer(
          pk,
          rec,
          amt,
          token.address,
          activeChain
        );
      }

      toast.success('Transaction submitted successfully!');
      onSuccess(txHash);
    } catch (e: any) {
      toast.error(e.message || 'Transaction failed');
    } finally {
      setIsSending(false);
    }
  };

  const isFormValid = recipient.trim().length > 0 && amount.trim().length > 0 && !isSending;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: textColor }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Send {token.symbol}</Text>
        <View style={{ width: 60 }} />
      </View>

      <Card isDarkMode={isDarkMode} style={styles.formCard}>
        <View style={styles.balanceInfo}>
          <Text style={[styles.balanceLabel, { color: subtextColor }]}>Available Balance</Text>
          <Text style={[styles.balanceValue, { color: textColor }]}>
            {balanceString} {token.symbol}
          </Text>
        </View>

        {/* Inputs */}
        <Input
          label="Recipient Address"
          placeholder={activeChain.type === 'evm' ? '0x...' : 'Base58 Address...'}
          value={recipient}
          onChangeText={setRecipient}
          isDarkMode={isDarkMode}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSending}
        />

        <View style={{ height: 16 }} />

        <Input
          label="Amount"
          placeholder="0.0"
          value={amount}
          onChangeText={setAmount}
          isDarkMode={isDarkMode}
          keyboardType="numeric"
          editable={!isSending}
        />

        {/* Dynamic Fee Box */}
        <View style={[styles.feeBox, isDarkMode ? styles.feeBoxDark : styles.feeBoxLight]}>
          <Text style={[styles.feeLabel, { color: subtextColor }]}>Network Fee</Text>
          {isEstimatingFee ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : (
            <Text style={[styles.feeValue, { color: textColor }]}>
              {estimatedFee} {activeChain.type === 'evm' ? 'ETH/POL' : 'SOL'}
            </Text>
          )}
        </View>

        <Button
          title={isSending ? 'Sending...' : 'Send Transaction'}
          onPress={handleSend}
          isDarkMode={isDarkMode}
          disabled={!isFormValid}
          loading={isSending}
          style={styles.submitBtn}
          showIcon={false}
        />
      </Card>
    </View>
  );
});

TransferTokenScreen.displayName = 'TransferTokenScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
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
  formCard: {
    width: '100%',
    padding: 20,
    borderRadius: 20,
  },
  balanceInfo: {
    alignItems: 'flex-start',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 12,
    width: '100%',
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  feeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginVertical: 20,
    borderWidth: 1,
  },
  feeBoxDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  feeBoxLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  feeLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  feeValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  submitBtn: {
    width: '100%',
    borderRadius: 14,
  },
});
export default TransferTokenScreen;
