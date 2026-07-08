import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Card } from '@shared/ui/Card';
import { Input } from '@shared/ui/Input';
import { Button } from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { WalletConnectService, WCSessionProposal } from '../services/WalletConnectService';

interface WCSessionScreenProps {
  activeAddresses: string[]; // List of addresses in the active wallet
  onBack: () => void;
  isDarkMode?: boolean;
}

export const WCSessionScreen: React.FC<WCSessionScreenProps> = memo(({
  activeAddresses,
  onBack,
  isDarkMode = true,
}) => {
  const [pairingUri, setPairingUri] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [proposal, setProposal] = useState<WCSessionProposal | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const textColor = isDarkMode ? '#ffffff' : '#111827';
  const subtextColor = isDarkMode ? '#9ca3af' : '#4b5563';

  const handlePair = async () => {
    const uri = pairingUri.trim();
    if (!uri) {
      toast.error('Please enter a valid WalletConnect URI');
      return;
    }

    setIsLoading(true);
    try {
      const prop = await WalletConnectService.parsePairingUri(uri);
      setProposal(prop);
    } catch (err: any) {
      toast.error(err.message || 'Failed to parse WalletConnect URI');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!proposal) return;
    setIsConnecting(true);
    try {
      await WalletConnectService.approveSession(proposal, activeAddresses);
      toast.success(`Connected to ${proposal.dAppMetadata.name}!`);
      setProposal(null);
      setPairingUri('');
    } catch (err: any) {
      toast.error(err.message || 'Session approval failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleReject = () => {
    setProposal(null);
    setPairingUri('');
    toast.info('Connection request rejected');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: textColor }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>dApp Connection</Text>
        <View style={{ width: 60 }} />
      </View>

      {!proposal ? (
        <Card isDarkMode={isDarkMode} style={styles.inputCard}>
          <Text style={[styles.cardTitle, { color: textColor }]}>Connect with WalletConnect</Text>
          <Text style={[styles.cardSubtitle, { color: subtextColor }]}>
            Paste a WalletConnect QR code URI link to connect your wallet to any dApp.
          </Text>

          <Input
            label="Pairing URI"
            placeholder="wc:proposal_topic..."
            value={pairingUri}
            onChangeText={setPairingUri}
            isDarkMode={isDarkMode}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          {isLoading ? (
            <ActivityIndicator size="small" color="#3b82f6" style={styles.loader} />
          ) : (
            <Button
              title="Pair dApp"
              onPress={handlePair}
              isDarkMode={isDarkMode}
              disabled={pairingUri.trim() === ''}
              style={styles.pairBtn}
              showIcon={false}
            />
          )}
        </Card>
      ) : (
        <Card isDarkMode={isDarkMode} style={styles.proposalCard}>
          {/* dApp Info */}
          <View style={styles.dAppRow}>
            <Image source={{ uri: proposal.dAppMetadata.icon }} style={styles.dAppIcon} />
            <View style={styles.dAppInfo}>
              <Text style={[styles.dAppName, { color: textColor }]}>
                {proposal.dAppMetadata.name}
              </Text>
              <Text style={[styles.dAppUrl, { color: '#3b82f6' }]}>
                {proposal.dAppMetadata.url}
              </Text>
            </View>
          </View>

          <Text style={[styles.dAppDesc, { color: subtextColor }]}>
            {proposal.dAppMetadata.description}
          </Text>

          {/* Scopes & Permissions */}
          <View style={[styles.scopesBox, isDarkMode ? styles.boxDark : styles.boxLight]}>
            <Text style={[styles.scopesTitle, { color: textColor }]}>Requested Permissions</Text>
            
            <View style={styles.scopeItem}>
              <Text style={[styles.scopeLabel, { color: subtextColor }]}>Chains:</Text>
              <Text style={[styles.scopeValue, { color: textColor }]}>
                {proposal.requiredNamespaces.chains.join(', ')}
              </Text>
            </View>

            <View style={styles.scopeItem}>
              <Text style={[styles.scopeLabel, { color: subtextColor }]}>Methods:</Text>
              <Text style={[styles.scopeValue, { color: textColor }]}>
                {proposal.requiredNamespaces.methods.join(', ')}
              </Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <Button
              title={isConnecting ? 'Connecting...' : 'Approve Connection'}
              onPress={handleApprove}
              isDarkMode={isDarkMode}
              loading={isConnecting}
              disabled={isConnecting}
              style={styles.actionBtn}
              showIcon={false}
            />
            <Button
              title="Reject"
              onPress={handleReject}
              isDarkMode={isDarkMode}
              disabled={isConnecting}
              style={styles.actionBtn}
              showIcon={false}
            />
          </View>
        </Card>
      )}
    </View>
  );
});

WCSessionScreen.displayName = 'WCSessionScreen';

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
  inputCard: {
    padding: 20,
    borderRadius: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
  pairBtn: {
    width: '100%',
    borderRadius: 12,
    marginTop: 20,
  },
  proposalCard: {
    padding: 20,
    borderRadius: 20,
  },
  dAppRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dAppIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  dAppInfo: {
    marginLeft: 14,
  },
  dAppName: {
    fontSize: 16,
    fontWeight: '800',
  },
  dAppUrl: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  dAppDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 20,
  },
  scopesBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  boxDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  boxLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
  scopesTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
  },
  scopeItem: {
    marginVertical: 4,
  },
  scopeLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  scopeValue: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  actions: {
    width: '100%',
  },
  actionBtn: {
    width: '100%',
    borderRadius: 12,
    marginVertical: 4,
  },
});
export default WCSessionScreen;
