import React, { memo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';

const { height } = Dimensions.get('window');

interface WalletOnboardingScreenProps {
  onCreateNew: () => void;
  onImport: () => void;
  isDarkMode?: boolean;
}

export const WalletOnboardingScreen: React.FC<WalletOnboardingScreenProps> = memo(({
  onCreateNew,
  onImport,
  isDarkMode = true,
}) => {
  const textColor = isDarkMode ? '#ffffff' : '#111827';
  const subtextColor = isDarkMode ? '#9ca3af' : '#4b5563';

  return (
    <View style={styles.container}>
      {/* Visual Header / Brand Representation */}
      <Animated.View
        entering={FadeInUp.delay(100).duration(500)}
        style={styles.logoSection}
      >
        <View style={[styles.glassIconContainer, isDarkMode ? styles.bgDark : styles.bgLight]}>
          <Text style={styles.iconEmblem}>💎</Text>
        </View>
        <Text style={[styles.brandTitle, { color: textColor }]}>Glass Wallet</Text>
        <Text style={[styles.brandSubtitle, { color: subtextColor }]}>
          Your gateway to EVM & Solana ecosystems. Secure, fast, and gorgeous.
        </Text>
      </Animated.View>

      {/* Interactive Hub Options */}
      <Animated.View
        entering={FadeIn.delay(300).duration(500)}
        style={styles.actionsCardWrapper}
      >
        <Card isDarkMode={isDarkMode} style={styles.card}>
          <Text style={[styles.cardTitle, { color: textColor }]}>Get Started</Text>
          <Text style={[styles.cardDescription, { color: subtextColor }]}>
            Secure your assets with standard BIP-39 mnemonic recovery keys or import your existing portfolio.
          </Text>

          <Button
            title="Create New Wallet"
            onPress={onCreateNew}
            isDarkMode={isDarkMode}
            style={styles.actionBtn}
            showIcon={false}
          />

          <Button
            title="Import Existing Wallet"
            onPress={onImport}
            isDarkMode={isDarkMode}
            style={styles.actionBtn}
            showIcon={false}
          />
        </Card>
      </Animated.View>
    </View>
  );
});

WalletOnboardingScreen.displayName = 'WalletOnboardingScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: height * 0.1,
  },
  glassIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  bgDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  bgLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  iconEmblem: {
    fontSize: 42,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  brandSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  actionsCardWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  actionBtn: {
    width: '100%',
    marginVertical: 6,
    borderRadius: 14,
  },
});
export default WalletOnboardingScreen;
