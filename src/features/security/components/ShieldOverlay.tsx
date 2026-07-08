import React, { memo } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { BlurView } from '@react-native-community/blur';

const { width, height } = Dimensions.get('window');

interface ShieldOverlayProps {
  isDarkMode?: boolean;
}

export const ShieldOverlay: React.FC<ShieldOverlayProps> = memo(({
  isDarkMode = true,
}) => {
  const textColor = isDarkMode ? '#ffffff' : '#111827';
  const subtextColor = isDarkMode ? '#9ca3af' : '#4b5563';

  return (
    <View style={styles.container}>
      {Platform.OS === 'ios' ? (
        <BlurView
          style={styles.absoluteFill}
          blurType={isDarkMode ? 'dark' : 'light'}
          blurAmount={20}
          reducedTransparencyFallbackColor={isDarkMode ? '#050714' : '#f3f4f6'}
        />
      ) : (
        <View
          style={[
            styles.absoluteFill,
            { backgroundColor: isDarkMode ? 'rgba(5, 7, 20, 0.95)' : 'rgba(243, 244, 246, 0.95)' },
          ]}
        />
      )}

      <View style={styles.content}>
        <View style={styles.logoBadge}>
          <Text style={styles.badgeText}>🛡️</Text>
        </View>
        <Text style={[styles.title, { color: textColor }]}>Glass Wallet Secured</Text>
        <Text style={[styles.subtitle, { color: subtextColor }]}>
          Biometrics or passcode is required to unlock.
        </Text>
      </View>
    </View>
  );
});

ShieldOverlay.displayName = 'ShieldOverlay';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Ensure it covers everything
  },
  absoluteFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  badgeText: {
    fontSize: 36,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
export default ShieldOverlay;
