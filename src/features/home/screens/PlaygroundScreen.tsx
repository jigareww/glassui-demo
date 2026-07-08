import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Card } from '../../../shared/ui/Card';
import { toast } from '../../../shared/ui/Toast';
import { KeyDerivationService } from '../../wallet/services/KeyDerivationService';
import { useWalletStore } from '../../wallet/store/useWalletStore';
import { ethers } from 'ethers';

interface PlaygroundScreenProps {
  isDarkMode?: boolean;
}

export const PlaygroundScreen: React.FC<PlaygroundScreenProps> = memo(({ isDarkMode = true }) => {
  const textColor = isDarkMode ? '#ffffff' : '#111827';
  const subColor = isDarkMode ? '#9ca3af' : '#4b5563';
  const inputBg = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

  const [mnemonic, setMnemonic] = useState('');
  const [messageToSign, setMessageToSign] = useState('Hello Web3!');
  const [signature, setSignature] = useState('');
  const [isSigning, setIsSigning] = useState(false);

  const { getPrivateKey } = useWalletStore();

  const handleGenerateMnemonic = async () => {
    try {
      const phrase = await KeyDerivationService.generateMnemonic();
      setMnemonic(phrase);
      toast.success('Generated new BIP-39 phrase');
    } catch (error: any) {
      toast.error('Failed to generate mnemonic');
    }
  };

  const handleSignMessage = async () => {
    try {
      setIsSigning(true);
      const privateKey = await getPrivateKey('evm');
      
      if (!privateKey) throw new Error('Wallet is locked or not found');

      const wallet = new ethers.Wallet(privateKey);
      const sig = await wallet.signMessage(messageToSign);
      setSignature(sig);
      toast.success('Message signed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Signing failed');
    } finally {
      setIsSigning(false);
    }
  };

  const handleTriggerError = () => {
    toast.error('Simulated Network Error: Insufficient funds for gas * price + value');
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.headerTitle, { color: textColor }]}>Playground</Text>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Section A: Cryptography */}
        <Text style={[styles.sectionTitle, { color: subColor }]}>CRYPTOGRAPHY & WALLETS</Text>
        <Card style={styles.card} isDarkMode={isDarkMode}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: textColor }]}>Generate Mnemonic</Text>
            <TouchableOpacity style={styles.btn} onPress={handleGenerateMnemonic}>
              <Text style={styles.btnText}>Generate</Text>
            </TouchableOpacity>
          </View>
          {mnemonic ? (
            <Text style={[styles.output, { color: subColor, backgroundColor: inputBg }]}>{mnemonic}</Text>
          ) : null}
        </Card>

        <Card style={styles.card} isDarkMode={isDarkMode}>
          <Text style={[styles.label, { color: textColor, marginBottom: 8 }]}>Sign Message (EVM)</Text>
          <TextInput
            style={[styles.input, { color: textColor, backgroundColor: inputBg }]}
            value={messageToSign}
            onChangeText={setMessageToSign}
            placeholder="Enter message..."
            placeholderTextColor={subColor}
          />
          <TouchableOpacity style={[styles.btn, { marginTop: 12, alignSelf: 'flex-start' }]} onPress={handleSignMessage}>
            {isSigning ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.btnText}>Sign</Text>}
          </TouchableOpacity>
          {signature ? (
            <Text style={[styles.output, { color: subColor, backgroundColor: inputBg, fontSize: 10 }]}>{signature}</Text>
          ) : null}
        </Card>

        {/* Section B: App Icons */}
        <Text style={[styles.sectionTitle, { color: subColor, marginTop: 24 }]}>APP ICONS</Text>
        <Card style={styles.card} isDarkMode={isDarkMode}>
          <Text style={[styles.label, { color: textColor, marginBottom: 12 }]}>Change Dynamic Icon</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {['default', 'premium', 'dark', 'gold', 'holiday', 'christmas', 'diwali'].map((iconName) => (
              <TouchableOpacity 
                key={iconName}
                style={[styles.btn, { backgroundColor: isDarkMode ? '#374151' : '#e5e7eb', marginBottom: 8 }]} 
                onPress={async () => {
                  try {
                    const AppIconModule = require('../../../native/AppIconModule').default;
                    await AppIconModule.changeIcon(iconName);
                    toast.success(`Icon changed to ${iconName}`);
                  } catch (e: any) {
                    toast.error(`Failed: ${e.message}`);
                  }
                }}
              >
                <Text style={[styles.btnText, { color: textColor }]}>{iconName}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity 
            style={[styles.btn, { marginTop: 12, backgroundColor: '#10b981', alignSelf: 'flex-start' }]} 
            onPress={async () => {
              try {
                const AppIconModule = require('../../../native/AppIconModule').default;
                const current = await AppIconModule.getCurrentIcon();
                toast.success(`Current Icon: ${current}`);
              } catch (e: any) {
                toast.error(`Failed: ${e.message}`);
              }
            }}
          >
            <Text style={styles.btnText}>Get Current Icon</Text>
          </TouchableOpacity>
        </Card>

        {/* Section C: Testing Mode */}
        <Text style={[styles.sectionTitle, { color: subColor, marginTop: 24 }]}>TESTING MODE</Text>
        <Card style={styles.card} isDarkMode={isDarkMode}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: textColor }]}>Simulate Transaction Error</Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#ef4444' }]} onPress={handleTriggerError}>
              <Text style={styles.btnText}>Trigger</Text>
            </TouchableOpacity>
          </View>
        </Card>

      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  headerTitle: { fontSize: 34, fontWeight: '800', marginBottom: 24 },
  scrollContent: { paddingBottom: 120 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginLeft: 8 },
  card: { borderRadius: 20, padding: 16, marginBottom: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 16, fontWeight: '600' },
  btn: { backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  btnText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  output: { marginTop: 12, padding: 12, borderRadius: 8, fontFamily: 'Courier', fontSize: 12, lineHeight: 18 },
  input: { borderRadius: 12, padding: 12, fontSize: 14, minHeight: 44 },
});
export default PlaygroundScreen;
