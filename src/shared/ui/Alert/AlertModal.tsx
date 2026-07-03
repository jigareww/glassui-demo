import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  useColorScheme,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutUp,
} from 'react-native-reanimated';
import { BlurView } from '@react-native-community/blur';
import { AlertTriangle, Info } from 'lucide-react-native';
import { alertManager } from './AlertObserver';
import { AlertInstance } from './Alert.types';
import { Card } from '../Card/Card';

export const AlertModal: React.FC = () => {
  const [activeAlert, setActiveAlert] = useState<AlertInstance | null>(null);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    return alertManager.subscribe((alert) => {
      setActiveAlert(alert);
    });
  }, []);

  if (!activeAlert) return null;

  const handleButtonPress = (onPress?: () => void) => {
    alertManager.dismiss();
    if (onPress) {
      setTimeout(() => {
        onPress();
      }, 100);
    }
  };

  const buttons = activeAlert.buttons || [{ text: 'OK' }];

  const renderHeaderIcon = () => {
    const hasDestructive = buttons.some(btn => btn.style === 'destructive');
    if (hasDestructive) {
      return (
        <View style={[styles.iconBadge, isDarkMode ? styles.iconBadgeDestructiveDark : styles.iconBadgeDestructiveLight]}>
          <AlertTriangle size={24} color="#ef4444" />
        </View>
      );
    }
    return (
      <View style={[styles.iconBadge, isDarkMode ? styles.iconBadgeDefaultDark : styles.iconBadgeDefaultLight]}>
        <Info size={24} color="#3b82f6" />
      </View>
    );
  };

  return (
    <Modal
      transparent
      visible={!!activeAlert}
      animationType="none"
      onRequestClose={() => alertManager.dismiss()}
    >
      <View style={styles.overlay}>
        {/* Blur overlay background */}
        {Platform.OS === 'ios' ? (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType={isDarkMode ? 'dark' : 'light'}
            blurAmount={15}
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              styles.androidOverlay,
              isDarkMode ? styles.bgDarkOverlay : styles.bgLightOverlay,
            ]}
          />
        )}

        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={StyleSheet.absoluteFill}
        >
          <TouchableOpacity
            style={styles.dismissArea}
            activeOpacity={1}
            onPress={() => alertManager.dismiss()}
          />
        </Animated.View>

        <Animated.View
          entering={SlideInUp.duration(300)}
          exiting={SlideOutUp.duration(200)}
          style={styles.cardContainer}
        >
          {/* We apply a dedicated alertCard style to override default transparency and avoid bleeding */}
          <Card
            isDarkMode={isDarkMode}
            style={[styles.card, isDarkMode ? styles.cardDark : styles.cardLight]}
          >
            <View style={styles.innerContent}>
              {renderHeaderIcon()}
              
              <Text style={[styles.title, isDarkMode ? styles.textDark : styles.textLight]}>
                {activeAlert.title}
              </Text>
              
              <Text style={[styles.message, isDarkMode ? styles.descDark : styles.descLight]}>
                {activeAlert.message}
              </Text>

              <View style={[styles.buttonContainer, buttons.length > 2 ? styles.buttonContainerVertical : null]}>
                {buttons.map((btn, index) => {
                  const isDestructive = btn.style === 'destructive';
                  const isCancel = btn.style === 'cancel';
                  
                  let buttonStyle = isDarkMode ? styles.buttonDefaultDark : styles.buttonDefaultLight;
                  let textStyle = isDarkMode ? styles.btnTextDark : styles.btnTextLight;

                  if (isDestructive) {
                    buttonStyle = isDarkMode ? styles.buttonDestructiveDark : styles.buttonDestructiveLight;
                    textStyle = styles.btnTextDestructive;
                  } else if (isCancel) {
                    buttonStyle = isDarkMode ? styles.buttonCancelDark : styles.buttonCancelLight;
                    textStyle = isDarkMode ? styles.btnTextCancelDark : styles.btnTextCancelLight;
                  }

                  return (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.7}
                      onPress={() => handleButtonPress(btn.onPress)}
                      style={[
                        styles.button,
                        buttons.length > 2 ? styles.buttonVertical : styles.buttonHorizontal,
                        buttonStyle,
                        index > 0 && (buttons.length > 2 ? styles.buttonMarginTop : styles.buttonMarginLeft),
                      ]}
                    >
                      <Text style={[styles.btnText, textStyle]}>
                        {btn.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </Card>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  androidOverlay: {
    opacity: 0.75,
  },
  bgDarkOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  bgLightOverlay: {
    backgroundColor: 'rgba(55, 65, 81, 0.45)',
  },
  dismissArea: {
    flex: 1,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 320,
    zIndex: 10,
  },
  card: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  cardLight: {
    // Increase white opacity to block background bleeding and guarantee premium contrast
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
  },
  cardDark: {
    backgroundColor: 'rgba(18, 24, 38, 0.92)',
  },
  innerContent: {
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
  },
  iconBadgeDestructiveLight: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  iconBadgeDestructiveDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  iconBadgeDefaultLight: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  iconBadgeDefaultDark: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.35)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  textLight: {
    color: '#111827',
  },
  textDark: {
    color: '#ffffff',
  },
  descLight: {
    color: '#4b5563',
  },
  descDark: {
    color: '#9ca3af',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonContainerVertical: {
    flexDirection: 'column',
  },
  button: {
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    flexShrink: 1,
    borderWidth: 1,
  },
  buttonHorizontal: {
    flex: 1,
  },
  buttonVertical: {
    width: '100%',
  },
  buttonCancelLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  buttonCancelDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  buttonDefaultLight: {
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },
  buttonDefaultDark: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
  buttonDestructiveLight: {
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  buttonDestructiveDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  buttonMarginLeft: {
    marginLeft: 12,
  },
  buttonMarginTop: {
    marginTop: 10,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  btnTextLight: {
    color: '#3b82f6',
  },
  btnTextDark: {
    color: '#60a5fa',
  },
  btnTextCancelLight: {
    color: '#4b5563',
  },
  btnTextCancelDark: {
    color: '#9ca3af',
  },
  btnTextDestructive: {
    color: '#ef4444',
  },
});
