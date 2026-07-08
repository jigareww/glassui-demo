import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNetworkStore, SUPPORTED_CHAINS, Chain } from '../../network';
import { Card } from '../../../shared/ui/Card';
import { toast } from '../../../shared/ui/Toast';

interface ProfileScreenProps {
  isDarkMode?: boolean;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = memo(({ isDarkMode = true }) => {
  const { activeChainId, selectChain } = useNetworkStore();
  
  const textColor = isDarkMode ? '#ffffff' : '#111827';
  const subtextColor = isDarkMode ? '#9ca3af' : '#4b5563';

  const handleNetworkSelect = (chain: Chain) => {
    selectChain(chain.id);
    toast.success(`Switched to ${chain.name}`);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.headerTitle, { color: textColor }]}>Profile & Settings</Text>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: subtextColor }]}>NETWORK SELECTION</Text>
        
        <Card style={styles.card} isDarkMode={isDarkMode}>
          {SUPPORTED_CHAINS.map((chain, idx) => (
            <TouchableOpacity 
              key={chain.id} 
              style={[
                styles.networkRow, 
                idx !== SUPPORTED_CHAINS.length - 1 && (isDarkMode ? styles.borderDark : styles.borderLight)
              ]}
              onPress={() => handleNetworkSelect(chain)}
              activeOpacity={0.7}
            >
              <Text style={[styles.networkName, { color: textColor }]}>{chain.name}</Text>
              {activeChainId === chain.id && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </Card>

        <Text style={[styles.sectionTitle, { color: subtextColor, marginTop: 24 }]}>SECURITY</Text>
        <Card style={styles.card} isDarkMode={isDarkMode}>
          <TouchableOpacity style={styles.securityRow} activeOpacity={0.7} onPress={() => toast.info('Export coming soon!')}>
            <Text style={[styles.securityText, { color: textColor }]}>Export Private Key</Text>
          </TouchableOpacity>
        </Card>

      </ScrollView>
    </View>
  );
});

ProfileScreen.displayName = 'ProfileScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 24,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 8,
  },
  card: {
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  networkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  borderDark: {
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  borderLight: {
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  networkName: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
  },
  securityRow: {
    paddingVertical: 16,
  },
  securityText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
export default ProfileScreen;
