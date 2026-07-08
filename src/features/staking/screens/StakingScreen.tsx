import React, { memo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Card } from '@shared/ui/Card';
import { Input } from '@shared/ui/Input';
import { Button } from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { Chain } from '../../network/config/chains';
import { Validator } from '../services/StakingService';
import { useStakingStore } from '../store/useStakingStore';
import { useWalletStore } from '../../wallet/store/useWalletStore';

interface StakingScreenProps {
  activeChain: Chain;
  balanceString: string;
  onBack: () => void;
  isDarkMode?: boolean;
}

export const StakingScreen: React.FC<StakingScreenProps> = memo(({
  activeChain,
  balanceString,
  onBack,
  isDarkMode = true,
}) => {
  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  
  const {
    validators,
    isFetchingValidators,
    isDelegating,
    fetchValidators,
    delegateStake,
  } = useStakingStore();

  const getPrivateKey = useWalletStore((state) => state.getPrivateKey);

  const textColor = isDarkMode ? '#ffffff' : '#111827';
  const subtextColor = isDarkMode ? '#9ca3af' : '#4b5563';

  // Load validators list
  useEffect(() => {
    fetchValidators(activeChain);
  }, [activeChain]);

  const handleDelegateSubmit = async () => {
    if (!selectedValidator) return;
    
    const amt = stakeAmount.trim();
    if (!amt || isNaN(parseFloat(amt)) || parseFloat(amt) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const available = parseFloat(balanceString);
    if (parseFloat(amt) > available) {
      toast.error('Insufficient funds for delegation');
      return;
    }

    try {
      const pk = await getPrivateKey(activeChain.type);
      if (!pk) {
        throw new Error('Key retrieval failed. Please unlock your device.');
      }

      const txHash = await delegateStake(
        pk,
        selectedValidator.address,
        amt,
        activeChain
      );

      toast.success('Staking delegation transaction submitted!');
      setSelectedValidator(null);
      setStakeAmount('');
    } catch (err: any) {
      toast.error(err.message || 'Delegation transaction failed');
    }
  };

  const renderValidator = ({ item }: { item: Validator }) => {
    return (
      <Card isDarkMode={isDarkMode} style={styles.valCard}>
        <View style={styles.valHeader}>
          <Text style={[styles.valName, { color: textColor }]}>{item.name}</Text>
          <Text style={styles.valApy}>{item.apy}% APY</Text>
        </View>

        <Text style={[styles.valAddr, { color: subtextColor }]} numberOfLines={1}>
          {item.address}
        </Text>

        <View style={styles.valDetailsRow}>
          <Text style={[styles.valDetailText, { color: subtextColor }]}>
            Commission: {item.commission}%
          </Text>
          <TouchableOpacity
            style={styles.stakeBtn}
            onPress={() => setSelectedValidator(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.stakeBtnText}>Stake</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: textColor }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          {activeChain.type === 'solana' ? 'Native Staking' : 'Liquid Staking'}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Summary Yield Board */}
      <Card isDarkMode={isDarkMode} style={styles.yieldBoard}>
        <Text style={[styles.yieldLabel, { color: subtextColor }]}>Available Balance</Text>
        <Text style={[styles.yieldValue, { color: textColor }]}>
          {balanceString} {activeChain.type === 'solana' ? 'SOL' : 'ETH'}
        </Text>
        <Text style={styles.yieldPromo}>Earn up to 7.2% APY in safe validator nodes.</Text>
      </Card>

      {/* Validator lists */}
      <Text style={[styles.sectionTitle, { color: textColor }]}>Active Validators</Text>
      {isFetchingValidators ? (
        <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
      ) : (
        <FlatList
          data={validators}
          renderItem={renderValidator}
          keyExtractor={(item) => item.address}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Delegate Modal overlay */}
      {selectedValidator && (
        <View style={styles.modalBackdrop}>
          <Card isDarkMode={isDarkMode} style={styles.modalCard}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Delegate Stake</Text>
            <Text style={[styles.modalSubtitle, { color: subtextColor }]}>
              Delegate funds safely. You retain complete custody of your private keys.
            </Text>

            <View style={[styles.valSummaryBox, isDarkMode ? styles.boxDark : styles.boxLight]}>
              <Text style={[styles.boxValName, { color: textColor }]}>{selectedValidator.name}</Text>
              <Text style={styles.boxValApy}>{selectedValidator.apy}% APY</Text>
            </View>

            <Input
              label="Staking Amount"
              placeholder="0.0"
              value={stakeAmount}
              onChangeText={setStakeAmount}
              isDarkMode={isDarkMode}
              keyboardType="numeric"
              editable={!isDelegating}
            />

            <View style={styles.modalActions}>
              <Button
                title={isDelegating ? 'Delegating...' : 'Confirm Delegation'}
                onPress={handleDelegateSubmit}
                isDarkMode={isDarkMode}
                loading={isDelegating}
                disabled={isDelegating || stakeAmount.trim() === ''}
                style={styles.modalSubmitBtn}
                showIcon={false}
              />
              <Button
                title="Cancel"
                onPress={() => setSelectedValidator(null)}
                isDarkMode={isDarkMode}
                disabled={isDelegating}
                style={styles.modalCancelBtn}
                showIcon={false}
              />
            </View>
          </Card>
        </View>
      )}
    </View>
  );
});

StakingScreen.displayName = 'StakingScreen';

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
  yieldBoard: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  yieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  yieldValue: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 6,
  },
  yieldPromo: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    paddingBottom: 40,
  },
  valCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  valHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valName: {
    fontSize: 14,
    fontWeight: '800',
  },
  valApy: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '800',
  },
  valAddr: {
    fontSize: 11,
    marginTop: 4,
    marginBottom: 10,
  },
  valDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valDetailText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stakeBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  stakeBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  modalBackdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 7, 20, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 100,
  },
  modalCard: {
    width: '100%',
    padding: 20,
    borderRadius: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  valSummaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  boxDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  boxLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
  boxValName: {
    fontSize: 13,
    fontWeight: '800',
  },
  boxValApy: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '800',
  },
  modalActions: {
    marginTop: 20,
  },
  modalSubmitBtn: {
    width: '100%',
    borderRadius: 12,
    marginVertical: 4,
  },
  modalCancelBtn: {
    width: '100%',
    borderRadius: 12,
    marginVertical: 4,
  },
});
export default StakingScreen;
