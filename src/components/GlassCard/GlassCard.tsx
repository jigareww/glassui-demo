import React, {
  memo,
  useMemo,
  Component,
  ErrorInfo,
  ReactNode,
} from 'react';
import {
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { RENDER_MODES } from '../GlassButton/GlassButton.constants';
import { getGlassRenderMode } from '../GlassButton/GlassButton.utils';
import { GlassCardProps } from './GlassCard.types';
import { styles } from './GlassCard.styles';

// Dynamic lazy imports to prevent compile-time/runtime crashes if native packages are not linked
let NativeLiquidGlassView: React.ComponentType<any> | null = null;
try {
  const lib = require('@callstack/liquid-glass');
  if (lib && lib.LiquidGlassView) {
    NativeLiquidGlassView = lib.LiquidGlassView;
  }
} catch (e) {
  // Not installed or not supported in this architecture
}

let NativeBlurView: React.ComponentType<any> | null = null;
try {
  const lib = require('@react-native-community/blur');
  if (lib && lib.BlurView) {
    NativeBlurView = lib.BlurView;
  }
} catch (e) {
  // Not installed
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
    console.warn('[GlassCard] SafeView caught a rendering crash. Falling back dynamically:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

let lastLoggedHash = '';

export const GlassCard: React.FC<GlassCardProps> = memo(({
  children,
  style,
  isDarkMode = false,
  disableLiquidGlass = false,
  disableBlur = false,
  interactive = false,
  effect = 'clear',
  contentStyle,
}) => {
  // 1. Audit and resolve target render mode based on native environment support
  const { renderMode, audit, blurSupported } = useMemo(() => {
    return getGlassRenderMode(disableLiquidGlass, disableBlur);
  }, [disableLiquidGlass, disableBlur]);

  // 2. Perform detailed diagnostics logging on component mount/render mode changes
  React.useEffect(() => {
    const configHash = `card-${renderMode}-${audit.isSupported}-${audit.fallbackReason || 'no-reason'}`;
    if (lastLoggedHash === configHash) return;
    lastLoggedHash = configHash;

    console.log('[GlassCard] Production Integration Diagnostics Audit:');
    console.log(` - Selected Render Mode: "${renderMode}"`);
    console.log(` - JS Package Installed: ${audit.jsPackageInstalled ? 'YES' : 'NO'}`);
    console.log(` - Native TurboModule Registered: ${audit.nativeModuleAvailable ? 'YES' : 'NO'}`);
    console.log(` - Native Component Registered: ${audit.nativeComponentRegistered ? 'YES' : 'NO'}`);
    console.log(` - New Architecture / Fabric: ${audit.fabricEnabled ? 'Fabric Active (New Arch)' : 'Paper Active (Old Arch)'}`);
    console.log(` - iOS Version: ${audit.isIos ? audit.iosVersion : 'N/A (Android/Web)'}`);
    console.log(` - Device Supported: ${audit.deviceSupported ? 'YES' : 'NO'}`);
    console.log(` - Blur View Supported: ${blurSupported ? 'YES' : 'NO'}`);
    
    if (renderMode !== RENDER_MODES.LIQUID_GLASS && audit.isIos) {
      console.warn(`[GlassCard] Liquid Glass card disabled. Fallback Reason: ${audit.fallbackReason || 'Disabled via props'}`);
    }
  }, [renderMode, audit, blurSupported]);

  // 3. Style computation with shadow separation and custom borderRadius extraction
  const activeBorderRadius = useMemo(() => {
    const flattened = StyleSheet.flatten(style) || {};
    return flattened.borderRadius !== undefined ? flattened.borderRadius : 24;
  }, [style]);

  const containerStyle = useMemo(() => {
    const flattened = StyleSheet.flatten(style) || {};
    return [
      styles.container,
      {
        borderRadius: activeBorderRadius,
      },
      style,
      // Remove clipping/background rules from outer container to keep shadows clean
      {
        backgroundColor: undefined,
        borderWidth: undefined,
        borderColor: undefined,
        overflow: undefined,
      },
    ];
  }, [style, activeBorderRadius]);

  // 4. Sub-rendering helper configurations for each rendering technology mode
  const renderLiquidGlass = () => {
    if (!NativeLiquidGlassView) {
      return renderBlurFallback();
    }
    return (
      <SafeView fallback={renderBlurFallback()}>
        <NativeLiquidGlassView
          style={[
            styles.innerContainer,
            isDarkMode ? styles.innerContainerDark : styles.innerContainerLight,
            { borderRadius: activeBorderRadius },
          ]}
          interactive={interactive}
          effect={effect}
          colorScheme={isDarkMode ? 'dark' : 'light'}
          tintColor={isDarkMode ? 'rgba(8, 17, 44, 0.65)' : 'rgba(255, 255, 255, 0.45)'}
          pointerEvents="none"
        >
          {/* Glossy border gradient overlay inside content container */}
          <LinearGradient
            colors={
              isDarkMode
                ? ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0.05)']
                : ['rgba(255, 255, 255, 0.35)', 'rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.15)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, styles.borderOverlay, { borderRadius: activeBorderRadius }]}
            pointerEvents="none"
          />
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
        <View
          style={[
            styles.innerContainer,
            isDarkMode ? styles.innerContainerDark : styles.innerContainerLight,
            { borderRadius: activeBorderRadius },
          ]}
          pointerEvents="none"
        >
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
                ? ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0.05)']
                : ['rgba(255, 255, 255, 0.35)', 'rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.15)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, styles.borderOverlay, { borderRadius: activeBorderRadius }]}
            pointerEvents="none"
          />
        </View>
      </SafeView>
    );
  };

  const renderSolidFallback = () => (
    <View
      style={[
        styles.innerContainer,
        isDarkMode ? styles.innerContainerDark : styles.innerContainerLight,
        isDarkMode ? styles.solidDark : styles.solidLight,
        { borderRadius: activeBorderRadius },
      ]}
      pointerEvents="none"
    />
  );

  // 5. Select appropriate renderer based on final renderMode
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
    <View style={containerStyle}>
      {/* Background layer */}
      {renderLayers()}
      {/* Relative-positioned Content layer dictates the height of the card container */}
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </View>
  );
});

GlassCard.displayName = 'GlassCard';
