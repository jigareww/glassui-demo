import React, { useState, useEffect } from 'react';
import { View, StatusBar, StyleSheet, useColorScheme, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { alert } from '@shared/ui/Alert';
import { useWalletStore } from '@features/wallet';
import { useAppShield, ShieldOverlay } from '@features/security';
import TransferTokenScreen from '../../features/tokens/screens/TransferTokenScreen';
import NftGalleryScreen from '../../features/nfts/screens/NftGalleryScreen';
import { ReceiveScreen } from '../../features/wallet/screens/ReceiveScreen';
import JailbreakScanner from '../../features/security/services/JailbreakScanner';
import { useSecurityStore } from '../../features/security/store/useSecurityStore';
import { useAutoLock } from '../../features/security/services/AutoLockService';
import { AuthStack } from './AuthStack';
import { AppStack } from './AppStack';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // State
  const { initializeStore: initializeWallet, activeWalletId } = useWalletStore();
  const { initializeSecurity, hasPasscode, isLocked, isLoading: securityLoading } = useSecurityStore();

  // App Shielding & Auto-locking
  const { isShielded } = useAppShield(() => {
    // When shield is triggered, we lock the app.
    // In a real Redux/Zustand setup, we'd update a global 'isLocked' state.
    // For now, we will rely on AuthStack rendering the unlock screen.
  });
  
  // Mount the global Auto-Lock monitor
  useAutoLock();

  useEffect(() => {
    const startup = async () => {
      // Jailbreak Scanner compromised system check
      if (JailbreakScanner.isDeviceCompromised()) {
        alert.show({
          title: 'Security Compromise',
          message: 'Jailbreak/Root detection warning. Private keys are vulnerable on this device. Proceed at your own risk.',
          buttons: [{ text: 'Acknowledge', style: 'cancel' }],
        });
      }

      try {
        await initializeSecurity();
        await initializeWallet();
      } catch (error) {
        console.error('[Startup] Failed to initialize state:', error);
      }
    };
    startup();
  }, []);

  return (
    <View style={[styles.container, isDarkMode ? styles.bgDark : styles.bgLight]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      {/* Background Refraction Spheres (Kept the beautiful UI!) */}
      <View style={styles.globalBg} pointerEvents="none">
        <LinearGradient
          colors={isDarkMode ? ['#1e40af', '#1e1b4b'] : ['#60a5fa', '#93c5fd']}
          style={styles.globalSphereTop}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient
          colors={isDarkMode ? ['#701a75', '#4a044e'] : ['#e9d5ff', '#f472b6']}
          style={styles.globalSphereMiddle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient
          colors={isDarkMode ? ['#0f766e', '#115e59'] : ['#2dd4bf', '#5eead4']}
          style={styles.globalSphereBottom}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        {securityLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : (
          <NavigationContainer
            theme={{
              ...DefaultTheme,
              colors: {
                ...DefaultTheme.colors,
                background: 'transparent',
              },
            }}
          >
            <Stack.Navigator 
              screenOptions={{ 
                headerShown: false, 
                animation: 'fade',
                contentStyle: { backgroundColor: 'transparent' } 
              }}
            >
              {/* Dynamic Stack Rendering Based on Security & Wallet State */}
              {!hasPasscode || isLocked || !activeWalletId ? (
                <Stack.Screen name="Auth" component={AuthStack} />
              ) : (
                <Stack.Screen name="App" component={AppStack} />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        )}
      </SafeAreaView>

      {isShielded && <ShieldOverlay isDarkMode={isDarkMode} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgDark: { backgroundColor: '#050714' },
  bgLight: { backgroundColor: '#f3f4f6' },
  safeArea: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  globalBg: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, overflow: 'hidden' },
  globalSphereTop: { position: 'absolute', width: 250, height: 250, borderRadius: 125, top: '10%', right: '-10%', opacity: 0.85 },
  globalSphereMiddle: { position: 'absolute', width: 220, height: 220, borderRadius: 110, top: '40%', left: '-10%', opacity: 0.75 },
  globalSphereBottom: { position: 'absolute', width: 300, height: 300, borderRadius: 150, bottom: '10%', left: '-15%', opacity: 0.9 },
});

export default RootNavigator;
