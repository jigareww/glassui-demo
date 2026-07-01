import React, { memo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface AuthLogoProps {
  isDarkMode: boolean;
  subtitle: string;
}

export const AuthLogo: React.FC<AuthLogoProps> = memo(({ isDarkMode, subtitle }) => {
  return (
    <View style={styles.header}>
      <View style={{ marginBottom: 16 }}>
        <Svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke={isDarkMode ? '#60a5fa' : '#3b82f6'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M2 17L12 22L22 17"
            stroke={isDarkMode ? '#3b82f6' : '#1d4ed8'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M2 12L12 17L22 12"
            stroke={isDarkMode ? '#60a5fa' : '#3b82f6'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.5"
          />
        </Svg>
      </View>
      <Text style={[styles.logo, isDarkMode ? styles.logoDark : styles.logoLight]}>
        NEO GLASS
      </Text>
      <Text style={[styles.subtitle, isDarkMode ? styles.subtitleDark : styles.subtitleLight]}>
        {subtitle}
      </Text>
    </View>
  );
});

AuthLogo.displayName = 'AuthLogo';

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif-condensed',
    }),
  },
  logoLight: {
    color: '#111827',
  },
  logoDark: {
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  subtitleLight: {
    color: '#4b5563',
  },
  subtitleDark: {
    color: '#9ca3af',
  },
});
