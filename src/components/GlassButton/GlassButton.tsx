import React, {
  memo,
  useMemo,
  useCallback,
  Component,
  ErrorInfo,
  ReactNode,
} from 'react';
import {
  Text,
  View,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { RENDER_MODES, COLORS, ANIMATION, LAYOUT } from './GlassButton.constants';
import { GlassButtonProps } from './GlassButton.types';
import { getGlassRenderMode } from './GlassButton.utils';
import { styles } from './GlassButton.styles';
import { ScribbleIcon } from '../ScribbleIcon';

// Dynamic lazy imports to prevent compile-time/runtime crashes if native packages are not linked
let NativeLiquidGlassView: React.ComponentType<any> | null = null;
try {
  const lib = require('@callstack/liquid-glass');
  if (lib && lib.LiquidGlassView) {
    NativeLiquidGlassView = lib.LiquidGlassView;
  }
} catch (e) {
  // Graceful fallback
}

let NativeBlurView: React.ComponentType<any> | null = null;
try {
  const lib = require('@react-native-community/blur');
  if (lib && lib.BlurView) {
    NativeBlurView = lib.BlurView;
  }
} catch (e) {
  // Graceful fallback
}

// React Error Boundary to catch UI/native instantiation crashes and render a clean fallback
interface SafeViewProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface SafeViewState {
  hasError: boolean;
}

class SafeView extends Component<SafeViewProps, SafeViewState> {
  state: SafeViewState = { hasError: false };

  static getDerivedStateFromError(): SafeViewState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[GlassButton] SafeView caught a rendering crash. Falling back dynamically:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

let lastLoggedHash = '';

const SPRING_CONFIG = {
  mass: 1,
  damping: 15,
  stiffness: 150,
};

export const GlassButton: React.FC<GlassButtonProps> = memo(({
  title,
  onPress,
  disabled = false,
  loading = false,
  icon,
  iconColor,
  isDarkMode = false,
  style,
  textStyle,
  accessibilityLabel,
  showIcon = true,
  disableLiquidGlass = false,
  disableBlur = false,
}) => {
  // 1. Resolve target render mode based on native environment support
  const { renderMode, audit, blurSupported } = useMemo(() => {
    return getGlassRenderMode(disableLiquidGlass, disableBlur);
  }, [disableLiquidGlass, disableBlur]);

  // 2. Perform detailed diagnostics logging on component mount/render mode changes
  React.useEffect(() => {
    const configHash = `${renderMode}-${audit.isSupported}-${audit.fallbackReason || 'no-reason'}`;
    if (lastLoggedHash === configHash) return;
    lastLoggedHash = configHash;

    console.log('[GlassButton] Production Integration Diagnostics Audit:');
    console.log(` - Selected Render Mode: "${renderMode}"`);
    console.log(` - JS Package Installed: ${audit.jsPackageInstalled ? 'YES' : 'NO'}`);
    console.log(` - Native TurboModule Registered: ${audit.nativeModuleAvailable ? 'YES' : 'NO'}`);
    console.log(` - Native Component Registered: ${audit.nativeComponentRegistered ? 'YES' : 'NO'}`);
    console.log(` - New Architecture / Fabric: ${audit.fabricEnabled ? 'Fabric Active (New Arch)' : 'Paper Active (Old Arch)'}`);
    console.log(` - iOS Version: ${audit.isIos ? audit.iosVersion : 'N/A (Android/Web)'}`);
    console.log(` - Device Supported: ${audit.deviceSupported ? 'YES' : 'NO'}`);
    console.log(` - Blur View Supported: ${blurSupported ? 'YES' : 'NO'}`);
    
    if (renderMode !== RENDER_MODES.LIQUID_GLASS && audit.isIos) {
      console.warn(`[GlassButton] Liquid Glass disabled. Fallback Reason: ${audit.fallbackReason || 'Disabled via props'}`);
    }
  }, [renderMode, audit, blurSupported]);

  // 3. Spring animations for press states (scale and opacity depth)
  const scale = useSharedValue<number>(ANIMATION.SCALE_NORMAL);
  const opacity = useSharedValue<number>(1.0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(ANIMATION.SCALE_PRESSED, SPRING_CONFIG);
    opacity.value = withSpring(0.9, SPRING_CONFIG);
  }, [scale, opacity]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(ANIMATION.SCALE_NORMAL, SPRING_CONFIG);
    opacity.value = withSpring(1.0, SPRING_CONFIG);
  }, [scale, opacity]);

  // 4. Style computation with layout separations
  const activeBorderRadius = useMemo(() => {
    const flattened = StyleSheet.flatten(style) || {};
    return flattened.borderRadius !== undefined ? flattened.borderRadius : LAYOUT.BORDER_RADIUS;
  }, [style]);

  // Outer Pressable defines layout bounds, margins, and width constraints on screen
  const pressableStyle = useMemo(() => {
    const flattened = StyleSheet.flatten(style) || {};
    return [
      style,
      {
        width: flattened.width || '100%',
        height: flattened.height || LAYOUT.HEIGHT,
      },
      disabled && styles.disabled,
    ];
  }, [style, disabled]);

  // Inner Animated.View handles the actual button presentation, padding, alignment, and shadows
  const animatedStyleWrapper = useMemo(() => {
    return [
      styles.container,
      {
        width: '100%',
        height: '100%',
        borderRadius: activeBorderRadius,
      },
      animatedStyle,
    ];
  }, [activeBorderRadius, animatedStyle]);

  // 5. Memoized icon and text color configurations
  const activeIconColor = useMemo(() => {
    if (iconColor) return iconColor;
    return isDarkMode ? COLORS.TEXT_DARK : COLORS.TEXT_LIGHT;
  }, [iconColor, isDarkMode]);

  const activeIcon = useMemo(() => {
    if (icon) return icon;
    if (showIcon) {
      return <ScribbleIcon color={activeIconColor} />;
    }
    return null;
  }, [icon, showIcon, activeIconColor]);

  // 6. Core inner content renderer
  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={isDarkMode ? COLORS.TEXT_DARK : COLORS.TEXT_LIGHT}
        />
      );
    }

    return (
      <View style={styles.contentContainer}>
        {activeIcon && <View style={styles.iconWrapper}>{activeIcon}</View>}
        <Text
          style={[
            styles.text,
            isDarkMode ? styles.textDark : styles.textLight,
            textStyle,
          ]}
          allowFontScaling={true}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
    );
  };

  // 7. Sub-rendering helper configurations for each rendering technology mode
  const renderLiquidGlass = () => {
    if (!NativeLiquidGlassView) {
      return renderBlurFallback();
    }
    return (
      <SafeView fallback={renderBlurFallback()}>
        <NativeLiquidGlassView
          style={[styles.innerContainer, { borderRadius: activeBorderRadius }]}
          interactive={true}
          effect="clear"
          colorScheme={isDarkMode ? 'dark' : 'light'}
          tintColor={isDarkMode ? 'rgba(8, 17, 44, 0.65)' : 'rgba(255, 255, 255, 0.45)'}
          pointerEvents="none"
        >
          {/* Glossy border gradient outline */}
          <LinearGradient
            colors={
              isDarkMode
                ? ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.08)']
                : ['rgba(255, 255, 255, 0.55)', 'rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.25)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, styles.borderOverlay, { borderRadius: activeBorderRadius }]}
            pointerEvents="none"
          />
          {renderContent()}
        </NativeLiquidGlassView>
      </SafeView>
    );
  };

  const renderBlurFallback = () => {
    if (!NativeBlurView) {
      return renderSolidFallback();
    }
    return (
      <SafeView fallback={renderSolidFallback()}>
        <View style={[styles.innerContainer, { borderRadius: activeBorderRadius }]}>
          <NativeBlurView
            style={StyleSheet.absoluteFill}
            blurType={isDarkMode ? 'dark' : 'light'}
            blurAmount={Platform.OS === 'ios' ? 20 : 15}
            overlayColor="transparent"
          />
          {/* Tint overlay layer */}
          <View
            style={[
              StyleSheet.absoluteFill,
              isDarkMode
                ? Platform.OS === 'ios'
                  ? styles.overlayDark
                  : styles.overlayDarkAndroid
                : Platform.OS === 'ios'
                  ? styles.overlayLight
                  : styles.overlayLightAndroid,
            ]}
            pointerEvents="none"
          />
          {/* Glossy border highlight */}
          <LinearGradient
            colors={
              isDarkMode
                ? ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.08)']
                : ['rgba(255, 255, 255, 0.55)', 'rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.25)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, styles.borderOverlay, { borderRadius: activeBorderRadius }]}
            pointerEvents="none"
          />
          {renderContent()}
        </View>
      </SafeView>
    );
  };

  const renderSolidFallback = () => (
    <View
      style={[
        styles.innerContainer,
        isDarkMode ? styles.solidDark : styles.solidLight,
        styles.solidContainer,
        { borderRadius: activeBorderRadius },
      ]}
    >
      {renderContent()}
    </View>
  );

  // 8. Select appropriate renderer based on final renderMode
  const renderLayers = () => {
    switch (renderMode) {
      case RENDER_MODES.LIQUID_GLASS:
        return renderLiquidGlass();
      case RENDER_MODES.BLUR:
        return renderBlurFallback();
      case RENDER_MODES.SOLID:
      default:
        return renderSolidFallback();
    }
  };

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled, busy: loading }}
      style={pressableStyle}
    >
      <Animated.View style={animatedStyleWrapper as any}>
        {renderLayers()}
      </Animated.View>
    </Pressable>
  );
});

GlassButton.displayName = 'GlassButton';
