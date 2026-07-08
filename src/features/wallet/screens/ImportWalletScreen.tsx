import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from '@shared/ui/Card';
import { Input } from '@shared/ui/Input';
import { Button } from '@shared/ui/Button';
import { KeyDerivationService } from '../services/KeyDerivationService';
import { toast } from '@shared/ui/Toast';

interface ImportWalletScreenProps {
  onImportMnemonic: (mnemonic: string) => void;
  onImportPrivateKey: (key: string, blockchain: 'evm' | 'solana') => void;
  onImportWatch: (evmAddr: string, solAddr: string) => void;
  isDarkMode?: boolean;
}

type ImportType = 'mnemonic' | 'private-key' | 'watch';

export const ImportWalletScreen: React.FC<ImportWalletScreenProps> = memo(({
  onImportMnemonic,
  onImportPrivateKey,
  onImportWatch,
  isDarkMode = true,
}) => {
  const [importType, setImportType] = useState<ImportType>('mnemonic');
  
  // States
  const [mnemonicInput, setMnemonicInput] = useState('');
  const [privateKeyInput, setPrivateKeyInput] = useState('');
  const [blockchainTarget, setBlockchainTarget] = useState<'evm' | 'solana'>('evm');
  const [watchEvmAddress, setWatchEvmAddress] = useState('');
  const [watchSolanaAddress, setWatchSolanaAddress] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  const textColor = isDarkMode ? '#ffffff' : '#111827';
  const subtextColor = isDarkMode ? '#9ca3af' : '#4b5563';

  const handleMnemonicImport = async () => {
    const formatted = mnemonicInput.trim().toLowerCase();
    if (!KeyDerivationService.validateMnemonic(formatted)) {
      toast.error('Invalid recovery phrase. Please check spelling.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      onImportMnemonic(formatted);
      setIsLoading(false);
    }, 500);
  };

  const handlePrivateKeyImport = async () => {
    const formatted = privateKeyInput.trim();
    if (!formatted) {
      toast.error('Private key cannot be empty');
      return;
    }
    setIsLoading(true);
    try {
      if (blockchainTarget === 'evm') {
        KeyDerivationService.deriveEVMAddressFromPrivateKey(formatted);
      } else {
        KeyDerivationService.deriveSolanaAddressFromPrivateKey(formatted);
      }
      setTimeout(() => {
        onImportPrivateKey(formatted, blockchainTarget);
        setIsLoading(false);
      }, 500);
    } catch (e: any) {
      toast.error(`Invalid private key: ${e.message || 'Check hex format'}`);
      setIsLoading(false);
    }
  };

  const handleWatchImport = async () => {
    const evm = watchEvmAddress.trim();
    const sol = watchSolanaAddress.trim();

    if (!evm && !sol) {
      toast.error('Please enter at least one watch address');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      onImportWatch(evm, sol);
      setIsLoading(false);
    }, 500);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Import Wallet</Text>
        <Text style={[styles.subtitle, { color: subtextColor }]}>
          Recover your existing wallet using a seed phrase, raw private key, or import addresses in watch-only mode.
        </Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, isDarkMode ? styles.tabContainerDark : styles.tabContainerLight]}>
        {(['mnemonic', 'private-key', 'watch'] as ImportType[]).map((type) => {
          const isActive = importType === type;
          const label = {
            mnemonic: 'Seed Phrase',
            'private-key': 'Private Key',
            watch: 'Watch-only',
          }[type];

          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.tabButton,
                isActive && (isDarkMode ? styles.tabButtonActiveDark : styles.tabButtonActiveLight),
              ]}
              onPress={() => setImportType(type)}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? textColor : subtextColor },
                  isActive && styles.tabLabelActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content based on Tab */}
      <Card isDarkMode={isDarkMode} style={styles.inputCard}>
        {importType === 'mnemonic' && (
          <View style={styles.pane}>
            <Input
              label="Recovery Phrase (12 or 24 words)"
              placeholder="Enter recovery words separated by spaces..."
              value={mnemonicInput}
              onChangeText={setMnemonicInput}
              isDarkMode={isDarkMode}
              multiline
              numberOfLines={4}
              style={styles.textArea}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Button
              title="Import Wallet"
              onPress={handleMnemonicImport}
              isDarkMode={isDarkMode}
              loading={isLoading}
              style={styles.importBtn}
              showIcon={false}
            />
          </View>
        )}

        {importType === 'private-key' && (
          <View style={styles.pane}>
            <View style={styles.blockchainSelector}>
              <TouchableOpacity
                style={[
                  styles.selectionPill,
                  blockchainTarget === 'evm' && styles.selectionPillActive,
                ]}
                onPress={() => setBlockchainTarget('evm')}
              >
                <Text style={[styles.pillText, blockchainTarget === 'evm' && styles.pillTextActive]}>
                  EVM (Ethereum/Polygon)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.selectionPill,
                  blockchainTarget === 'solana' && styles.selectionPillActive,
                ]}
                onPress={() => setBlockchainTarget('solana')}
              >
                <Text style={[styles.pillText, blockchainTarget === 'solana' && styles.pillTextActive]}>
                  Solana
                </Text>
              </TouchableOpacity>
            </View>

            <Input
              label="Raw Private Key"
              placeholder="Enter raw private key in hex..."
              value={privateKeyInput}
              onChangeText={setPrivateKeyInput}
              isDarkMode={isDarkMode}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />

            <Button
              title="Import Private Key"
              onPress={handlePrivateKeyImport}
              isDarkMode={isDarkMode}
              loading={isLoading}
              style={styles.importBtn}
              showIcon={false}
            />
          </View>
        )}

        {importType === 'watch' && (
          <View style={styles.pane}>
            <Input
              label="EVM Address (Optional)"
              placeholder="0x..."
              value={watchEvmAddress}
              onChangeText={setWatchEvmAddress}
              isDarkMode={isDarkMode}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={{ height: 16 }} />
            <Input
              label="Solana Address (Optional)"
              placeholder="Enter public address base58..."
              value={watchSolanaAddress}
              onChangeText={setWatchSolanaAddress}
              isDarkMode={isDarkMode}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Button
              title="Import Watch Address"
              onPress={handleWatchImport}
              isDarkMode={isDarkMode}
              loading={isLoading}
              style={styles.importBtn}
              showIcon={false}
            />
          </View>
        )}
      </Card>
    </ScrollView>
  );
});

ImportWalletScreen.displayName = 'ImportWalletScreen';

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  tabContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 48,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tabContainerDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabContainerLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActiveDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabButtonActiveLight: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabLabelActive: {
    fontWeight: '800',
  },
  inputCard: {
    width: '100%',
    padding: 20,
    borderRadius: 20,
  },
  pane: {
    width: '100%',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  importBtn: {
    width: '100%',
    marginTop: 20,
    borderRadius: 14,
  },
  blockchainSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  selectionPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  selectionPillActive: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
  },
  pillTextActive: {
    color: '#3b82f6',
    fontWeight: '800',
  },
});
export default ImportWalletScreen;
