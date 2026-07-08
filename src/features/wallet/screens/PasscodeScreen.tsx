import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScanFace } from 'lucide-react-native';
import * as Keychain from 'react-native-keychain';
import { toast } from '@shared/ui/Toast';
import { Card } from '@shared/ui/Card';
import { useSecurityStore } from '../../security/store/useSecurityStore';

const { width } = Dimensions.get('window');

interface PasscodeScreenProps {
  mode: 'set' | 'confirm' | 'unlock';
  onSuccess: (pin: string) => void;
  previousPin?: string;
  isDarkMode?: boolean;
}

export const PasscodeScreen: React.FC<PasscodeScreenProps> = ({
  mode,
  onSuccess,
  previousPin,
  isDarkMode = true,
}) => {
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState<string>('');
  const shakeOffset = useSharedValue(0);
  
  const { useBiometrics, authenticateWithBiometrics } = useSecurityStore();

  useEffect(() => {
    setPin('');
    // Auto-trigger biometric prompt when unlocking if enabled
    if (mode === 'unlock' && useBiometrics) {
      handleBiometricAuth();
    }
  }, [mode, useBiometrics]);

  const handleBiometricAuth = async () => {
    const success = await authenticateWithBiometrics();
    if (success) {
      // In a real flow, success triggers the store update which re-renders RootNavigator, 
      // but we can also fire onSuccess just in case.
      onSuccess('BIOMETRICS');
    }
  };

  const title = {
    set: 'Create Passcode',
    confirm: 'Confirm Passcode',
    unlock: 'Enter Passcode',
  }[mode];

  const subtitle = {
    set: 'Set a secure 6-digit PIN to protect your keys',
    confirm: 'Please re-enter your 6-digit passcode',
    unlock: 'Unlock your Web3 Super Wallet',
  }[mode];

  // Shake animation style for wrong pin entry
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeOffset.value }],
    };
  });

  const triggerShake = () => {
    shakeOffset.value = withSequence(
      withTiming(-12, { duration: 50 }),
      withTiming(12, { duration: 50 }),
      withTiming(-12, { duration: 50 }),
      withTiming(12, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 6) {
        // Debounce slightly to let the last dot fill
        setTimeout(() => {
          handlePinComplete(newPin);
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handlePinComplete = async (completedPin: string) => {
    if (mode === 'confirm' && previousPin) {
      if (completedPin === previousPin) {
        onSuccess(completedPin);
      } else {
        toast.error('Passcodes do not match');
        triggerShake();
        setPin('');
      }
    } else {
      onSuccess(completedPin);
    }
  };

  // Render Passcode dots
  const renderDots = () => {
    return (
      <Animated.View style={[styles.dotsContainer, animatedStyle]}>
        {[...Array(6)].map((_, i) => {
          const filled = i < pin.length;
          return (
            <View
              key={i}
              style={[
                styles.dot,
                filled ? styles.dotFilled : styles.dotEmpty,
                isDarkMode ? styles.dotDark : styles.dotLight,
              ]}
            />
          );
        })}
      </Animated.View>
    );
  };

  const renderKey = (val: string) => {
    return (
      <TouchableOpacity
        key={val}
        style={[styles.key, isDarkMode ? styles.keyDark : styles.keyLight]}
        onPress={() => handleKeyPress(val)}
        activeOpacity={0.7}
      >
        <Text style={[styles.keyText, isDarkMode ? styles.textWhite : styles.textDark]}>
          {val}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.title, isDarkMode ? styles.textWhite : styles.textDark]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, isDarkMode ? styles.textMutedDark : styles.textMutedLight]}>
          {subtitle}
        </Text>
      </View>

      <View style={styles.dotsWrapper}>
        {renderDots()}
      </View>

      <View style={styles.keyboardContainer}>
        <View style={styles.row}>
          {['1', '2', '3'].map(renderKey)}
        </View>
        <View style={styles.row}>
          {['4', '5', '6'].map(renderKey)}
        </View>
        <View style={styles.row}>
          {['7', '8', '9'].map(renderKey)}
        </View>
        <View style={styles.row}>
          {mode === 'unlock' && useBiometrics ? (
            <TouchableOpacity
              style={[styles.key, styles.backspaceKey]}
              onPress={handleBiometricAuth}
              activeOpacity={0.7}
            >
              <ScanFace size={32} color={isDarkMode ? '#ffffff' : '#111827'} />
            </TouchableOpacity>
          ) : (
            <View style={styles.keyPlaceholder} />
          )}
          {renderKey('0')}
          <TouchableOpacity
            style={[styles.key, styles.backspaceKey]}
            onPress={handleBackspace}
            activeOpacity={0.7}
          >
            <Text style={[styles.backspaceText, isDarkMode ? styles.textWhite : styles.textDark]}>
              ⌫
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  textWhite: {
    color: '#ffffff',
  },
  textDark: {
    color: '#111827',
  },
  textMutedDark: {
    color: '#9ca3af',
  },
  textMutedLight: {
    color: '#4b5563',
  },
  dotsWrapper: {
    height: 60,
    justifyContent: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 12,
    borderWidth: 1.5,
  },
  dotFilled: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  dotEmpty: {
    backgroundColor: 'transparent',
  },
  dotDark: {
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  dotLight: {
    borderColor: 'rgba(17, 24, 39, 0.3)',
  },
  keyboardContainer: {
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  key: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  keyDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  keyLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  keyText: {
    fontSize: 26,
    fontWeight: '600',
  },
  keyPlaceholder: {
    width: 75,
    height: 75,
  },
  backspaceKey: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  backspaceText: {
    fontSize: 22,
  },
});
export default PasscodeScreen;
