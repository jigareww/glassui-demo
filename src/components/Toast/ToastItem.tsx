import React, { memo, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  SlideInUp,
  SlideOutUp,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { GlassCard } from '../GlassCard';
import { ToastInstance } from './Toast.types';
import { DEFAULT_DURATIONS, TOAST_COLORS, TOAST_LAYOUT } from './Toast.constants';

interface ToastItemProps {
  toast: ToastInstance;
  onDismiss: (id: string) => void;
}

// Crisp outline SVG icons matching Apple UI standard
const ToastIcon: React.FC<{ type: string; color: string }> = ({ type, color }) => {
  switch (type) {
    case 'success':
      return (
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <Path
            d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M22 4L12 14.01l-3-3"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'error':
      return (
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <Path
            d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M12 9v4"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M12 17h.01"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'warning':
      return (
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M12 8v4"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M12 16h.01"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'info':
      return (
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M12 16v-4"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M12 8h.01"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    default:
      return null;
  }
};

export const ToastItem: React.FC<ToastItemProps> = memo(({ toast, onDismiss }) => {
  const { id, message, type, options } = toast;
  const isSystemDark = useColorScheme() === 'dark';
  const isDarkMode = options.style ? false : isSystemDark;

  const position = options.position || 'top-floating';
  const duration = options.duration !== undefined ? options.duration : DEFAULT_DURATIONS[type];
  const isDismissible = options.dismissible !== false && type !== 'loading';

  // 1. Gesture swipe setup (Pan)
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .enabled(isDismissible)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      if (position !== 'bottom') {
        translateY.value = Math.min(0, event.translationY);
      } else {
        translateY.value = Math.max(0, event.translationY);
      }
    })
    .onEnd((event) => {
      const dismissThreshold = 80;
      const velocityThreshold = 500;

      const shouldDismissLeft =
        event.translationX < -dismissThreshold || event.velocityX < -velocityThreshold;
      const shouldDismissRight =
        event.translationX > dismissThreshold || event.velocityX > velocityThreshold;
      const shouldDismissUp =
        position !== 'bottom' &&
        (event.translationY < -dismissThreshold || event.velocityY < -velocityThreshold);
      const shouldDismissDown =
        position === 'bottom' &&
        (event.translationY > dismissThreshold || event.velocityY > velocityThreshold);

      if (shouldDismissLeft) {
        translateX.value = withTiming(-400, { duration: 150 }, () => {
          runOnJS(onDismiss)(id);
        });
      } else if (shouldDismissRight) {
        translateX.value = withTiming(400, { duration: 150 }, () => {
          runOnJS(onDismiss)(id);
        });
      } else if (shouldDismissUp) {
        translateY.value = withTiming(-150, { duration: 150 }, () => {
          runOnJS(onDismiss)(id);
        });
      } else if (shouldDismissDown) {
        translateY.value = withTiming(150, { duration: 150 }, () => {
          runOnJS(onDismiss)(id);
        });
      } else {
        translateX.value = withSpring(0, { damping: 15 });
        translateY.value = withSpring(0, { damping: 15 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    opacity: 1 - Math.min(0.5, Math.max(Math.abs(translateX.value) / 300, Math.abs(translateY.value) / 150)),
  }));

  // 2. Auto-dismiss timer implementation
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [id, duration, onDismiss]);

  // 3. Progress countdown indicator animation
  const progress = useSharedValue(1);
  useEffect(() => {
    if (duration > 0 && options.showProgress !== false) {
      progress.value = 1;
      progress.value = withTiming(0, { duration });
    }
  }, [duration, options.showProgress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  // Render icons dynamically
  const renderIcon = () => {
    if (options.icon) return options.icon;
    if (type === 'loading') {
      return (
        <ActivityIndicator
          size="small"
          color={isDarkMode ? '#ffffff' : '#000000'}
        />
      );
    }
    const color = TOAST_COLORS[type as keyof typeof TOAST_COLORS] || '#3B82F6';
    return <ToastIcon type={type} color={color} />;
  };

  // Layout Entering/Exiting selectors
  const enteringAnim = position === 'bottom'
    ? SlideInDown.springify().damping(18).stiffness(130)
    : SlideInUp.springify().damping(18).stiffness(130);

  const exitingAnim = position === 'bottom'
    ? SlideOutDown.duration(200)
    : SlideOutUp.duration(200);

  const toastThemeStyles = isDarkMode ? styles.toastDark : styles.toastLight;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        entering={enteringAnim}
        exiting={exitingAnim}
        style={[styles.toastItem, animatedStyle, options.style]}
      >
        <GlassCard
          isDarkMode={isDarkMode}
          style={styles.card}
          contentStyle={styles.cardContent}
        >
          {/* Main layout contents */}
          <View style={styles.body}>
            <View style={styles.iconWrapper}>{renderIcon()}</View>
            <Text
              style={[
                styles.message,
                isDarkMode ? styles.textDark : styles.textLight,
                options.textStyle,
              ]}
              allowFontScaling={true}
              numberOfLines={2}
              adjustsFontSizeToFit={true}
            >
              {message}
            </Text>

            {/* Custom Interactive Action button */}
            {options.action && (
              <TouchableOpacity
                onPress={() => options.action?.onPress(id)}
                activeOpacity={0.7}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>{options.action.label}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Elegant Linear progress indicator bar at the bottom */}
          {duration > 0 && options.showProgress !== false && type !== 'loading' && (
            <View style={styles.progressBarBg}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor:
                      TOAST_COLORS[type as keyof typeof TOAST_COLORS] || '#3B82F6',
                  },
                  progressStyle,
                ]}
              />
            </View>
          )}
        </GlassCard>
      </Animated.View>
    </GestureDetector>
  );
});

ToastItem.displayName = 'ToastItem';

const styles = StyleSheet.create({
  toastItem: {
    width: TOAST_LAYOUT.WIDTH_PCT,
    maxWidth: TOAST_LAYOUT.MAX_WIDTH,
    alignSelf: 'center',
    marginVertical: 4,
    // Soft shadow system
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  card: {
    width: '100%',
    borderRadius: TOAST_LAYOUT.BORDER_RADIUS,
    overflow: 'hidden',
  },
  cardContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 2,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  iconWrapper: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
    }),
  },
  textLight: {
    color: '#1f2937',
  },
  textDark: {
    color: '#ffffff',
  },
  actionButton: {
    marginLeft: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
  },
  progressBarBg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  progressBar: {
    height: '100%',
  },
  toastLight: {},
  toastDark: {},
});
