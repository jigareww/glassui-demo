import React, {
  memo,
  useMemo,
} from 'react';
import {
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { RENDER_MODES } from '../Button/Button.constants';
import { getGlassRenderMode } from '../Button/Button.utils';
import { CardProps } from './Card.types';
import { styles } from './Card.styles';

let NativeLiquidGlassView: React.ComponentType<any> | null = null;
try {
  const lib = require('@callstack/liquid-glass');
  if (lib && lib.LiquidGlassView) {
    NativeLiquidGlassView = lib.LiquidGlassView;
  }
} catch {
  // Fallback
}

let NativeBlurView: React.ComponentType<any> | null = null;
try {
  const lib = require('@react-native-community/blur');
  if (lib && lib.BlurView) {
    NativeBlurView = lib.BlurView;
  }
} catch {
  // Fallback
}


let lastLoggedHash = '';

export const Card: React.FC<CardProps> = memo(({
  children,
  style,
  isDarkMode = false,
  disableLiquidGlass = false,
  disableBlur = false,
  interactive = false,
  effect = 'clear',
  contentStyle,
}) => {
  const { renderMode, audit, blurSupported } = useMemo(() => {
    return getGlassRenderMode(disableLiquidGlass, disableBlur);
  }, [disableLiquidGlass, disableBlur]);

  React.useEffect(() => {
    const configHash = `card-${renderMode}-${audit.isSupported}-${audit.fallbackReason || 'no-reason'}`;
    if (lastLoggedHash === configHash) return;
    lastLoggedHash = configHash;

    console.log('[Card] Production Integration Diagnostics Audit:');
    console.log(` - Selected Render Mode: "${renderMode}"`);
    console.log(` - JS Package Installed: ${audit.jsPackageInstalled ? 'YES' : 'NO'}`);
    console.log(` - Native TurboModule Registered: ${audit.nativeModuleAvailable ? 'YES' : 'NO'}`);
    console.log(` - Native Component Registered: ${audit.nativeComponentRegistered ? 'YES' : 'NO'}`);
    console.log(` - New Architecture / Fabric: ${audit.fabricEnabled ? 'Fabric Active (New Arch)' : 'Paper Active (Old Arch)'}`);
    console.log(` - iOS Version: ${audit.isIos ? audit.iosVersion : 'N/A (Android/Web)'}`);
    console.log(` - Device Supported: ${audit.deviceSupported ? 'YES' : 'NO'}`);
    console.log(` - Blur View Supported: ${blurSupported ? 'YES' : 'NO'}`);
    
    if (renderMode !== RENDER_MODES.LIQUID_GLASS && audit.isIos) {
      console.warn(`[Card] Liquid Glass card disabled. Fallback Reason: ${audit.fallbackReason || 'Disabled via props'}`);
    }
  }, [renderMode, audit, blurSupported]);

  const activeBorderRadius = useMemo(() => {
    const flattened = StyleSheet.flatten(style) || {};
    return flattened.borderRadius !== undefined ? flattened.borderRadius : 24;
  }, [style]);

  const containerStyle = useMemo(() => {
    return [
      styles.container,
      {
        borderRadius: activeBorderRadius,
      },
      style,
      {
        backgroundColor: undefined,
        borderWidth: undefined,
        borderColor: undefined,
        overflow: undefined,
      },
    ];
  }, [style, activeBorderRadius]);

  const renderLiquidGlass = () => {
    if (!NativeLiquidGlassView) {
      return renderBlurFallback();
    }
    return (
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
    );
  };

  const renderBlurFallback = () => {
    if (!NativeBlurView) {
      return renderSolidFallback();
    }
    return (
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
    <View
      style={containerStyle}
      renderToHardwareTextureAndroid={false}
    >
      {renderLayers()}
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </View>
  );
});

Card.displayName = 'Card';
