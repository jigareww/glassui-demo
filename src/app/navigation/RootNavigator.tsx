import React, { useState, useEffect } from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toast } from '../../shared/ui/Toast';
import { alert } from '../../shared/ui/Alert';
import { AuthScreen } from '../../features/auth';
import { HomeScreen } from '../../features/home';

export const RootNavigator: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [authenticatedEmail, setAuthenticatedEmail] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Load user session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('user_session');
        if (savedEmail) {
          setAuthenticatedEmail(savedEmail);
        }
      } catch (error) {
        console.warn('[Session] Failed to load session:', error);
      } finally {
        setIsLoadingSession(false);
      }
    };
    loadSession();
  }, []);

  const handleSignOut = () => {
    alert.show({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of your account?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('user_session');
            } catch (error) {
              console.warn('[Session] Failed to clear session:', error);
            }
            setAuthenticatedEmail(null);
            toast.info('Signed out successfully.');
          },
        },
      ],
    });
  };

  const handleAuthSuccess = async (email: string) => {
    try {
      await AsyncStorage.setItem('user_session', email);
    } catch (error) {
      console.warn('[Session] Failed to save session:', error);
    }
    setAuthenticatedEmail(email);
    toast.success(`Welcome back!`);
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.bgDark : styles.bgLight]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      {/* Global floating background elements for system-wide glass refraction */}
      <View style={styles.globalBg} pointerEvents="none">
        {/* Top-Right Royal Blue Sphere */}
        <LinearGradient
          colors={isDarkMode ? ['#1e40af', '#1e1b4b'] : ['#60a5fa', '#93c5fd']}
          style={styles.globalSphereTop}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        {/* Center-Left Violet/Pink Sphere */}
        <LinearGradient
          colors={isDarkMode ? ['#701a75', '#4a044e'] : ['#e9d5ff', '#f472b6']}
          style={styles.globalSphereMiddle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        {/* Bottom-Left Teal/Green Arc */}
        <LinearGradient
          colors={isDarkMode ? ['#0f766e', '#115e59'] : ['#2dd4bf', '#5eead4']}
          style={styles.globalSphereBottom}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        {isLoadingSession ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={isDarkMode ? '#60a5fa' : '#3b82f6'} />
          </View>
        ) : !authenticatedEmail ? (
          <View style={styles.authContainer}>
            <AuthScreen
              isDarkMode={isDarkMode}
              onAuthSuccess={handleAuthSuccess}
            />
          </View>
        ) : (
          <HomeScreen
            email={authenticatedEmail}
            isDarkMode={isDarkMode}
            onSignOut={handleSignOut}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgDark: {
    backgroundColor: '#050714',
  },
  bgLight: {
    backgroundColor: '#f3f4f6',
  },
  safeArea: {
    flex: 1,
  },
  globalBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  globalSphereTop: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    top: '10%',
    right: '-10%',
    opacity: 0.85,
  },
  globalSphereMiddle: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: '40%',
    left: '-10%',
    opacity: 0.75,
  },
  globalSphereBottom: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    bottom: '10%',
    left: '-15%',
    opacity: 0.9,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
