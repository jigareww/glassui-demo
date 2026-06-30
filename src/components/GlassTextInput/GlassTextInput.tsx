import React, {
  memo,
  useMemo,
  useState,
  Component,
  ErrorInfo,
  ReactNode,
} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { RENDER_MODES } from '../GlassButton/GlassButton.constants';
import { getGlassRenderMode } from '../GlassButton/GlassButton.utils';
import { GlassTextInputProps } from './GlassTextInput.types';
import { styles } from './GlassTextInput.styles';

// Dynamic lazy imports to prevent crashes
let NativeLiquidGlassView: React.ComponentType<any> | null = null;
try {
  const lib = require('@callstack/liquid-glass');
  if (lib && lib.LiquidGlassView) {
    NativeLiquidGlassView = lib.LiquidGlassView;
  }
} catch (e) {
  // Safe fallback
}

let NativeBlurView: React.ComponentType<any> | null = null;
try {
  const lib = require('@react-native-community/blur');
  if (lib && lib.BlurView) {
    NativeBlurView = lib.BlurView;
  }
} catch (e) {
  // Safe fallback
}

// React Error Boundary to catch UI/native instantiation crashes
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
    console.warn('[GlassTextInput] SafeView caught a rendering crash. Falling back dynamically:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Custom simple outline SVG icons matching showcase aesthetics
interface AuthIconProps {
  name: 'email' | 'lock' | 'user' | 'eye' | 'eye-off';
  color: string;
  size?: number;
}

const AuthIcon: React.FC<AuthIconProps> = memo(({ name, color, size = 20 }) => {
  switch (name) {
    case 'email':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 8L10.89 13.26C11.56 13.72 12.44 13.72 13.11 13.26L21 8M5 19H19C20.1 19 21 18.1 21 17V7C21 5.9 20.1 5 19 5H5C3.9 5 3 5.9 3 7V17C3 18.1 3.9 19 5 19Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'lock':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M19 11H5C3.9 11 3 11.9 3 13V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V13C21 11.9 20.1 11 19 11Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M7 11V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7V11"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'user':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M20 21V19C20 17.94 19.58 16.92 18.83 16.17C18.08 15.42 17.06 15 16 15H8C6.94 15 5.92 15.42 5.17 16.17C4.42 16.92 4 17.94 4 19V21"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'eye':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'eye-off':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M17.94 17.94C16.2 19.24 14.18 20 12 20C5 20 1 12 1 12C2.24 9.87 4.1 8.08 6.06 6.88M9.9 4.24C10.58 4.08 11.28 4 12 4C19 4 23 12 23 12C22.25 13.27 21.05 15.02 19.52 16.48M1 1L23 23"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M9.88 9.88C9.32 10.36 9 11.08 9 12C9 13.66 10.34 15 12 15C12.92 15 13.64 14.68 14.12 14.12"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    default:
      return null;
  }
});

let lastLoggedHash = '';

export const GlassTextInput: React.FC<GlassTextInputProps> = memo(({
  label,
  isDarkMode = false,
  iconName,
  disableLiquidGlass = false,
  disableBlur = false,
  containerStyle,
  secureTextEntry,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 1. Audit and resolve target render mode based on native environment support
  const { renderMode, audit, blurSupported } = useMemo(() => {
    return getGlassRenderMode(disableLiquidGlass, disableBlur);
  }, [disableLiquidGlass, disableBlur]);

  // 2. Perform detailed diagnostics logging on component mount/render mode changes
  React.useEffect(() => {
    const configHash = `input-${renderMode}-${audit.isSupported}-${audit.fallbackReason || 'no-reason'}`;
    if (lastLoggedHash === configHash) return;
    lastLoggedHash = configHash;

    console.log('[GlassTextInput] Production Integration Diagnostics Audit:');
    console.log(` - Selected Render Mode: "${renderMode}"`);
    console.log(` - JS Package Installed: ${audit.jsPackageInstalled ? 'YES' : 'NO'}`);
    console.log(` - Native TurboModule Registered: ${audit.nativeModuleAvailable ? 'YES' : 'NO'}`);
    console.log(` - Native Component Registered: ${audit.nativeComponentRegistered ? 'YES' : 'NO'}`);
    console.log(` - New Architecture / Fabric: ${audit.fabricEnabled ? 'Fabric Active (New Arch)' : 'Paper Active (Old Arch)'}`);
    console.log(` - iOS Version: ${audit.isIos ? audit.iosVersion : 'N/A (Android/Web)'}`);
    console.log(` - Device Supported: ${audit.deviceSupported ? 'YES' : 'NO'}`);
    console.log(` - Blur View Supported: ${blurSupported ? 'YES' : 'NO'}`);
    
    if (renderMode !== RENDER_MODES.LIQUID_GLASS && audit.isIos) {
      console.warn(`[GlassTextInput] Liquid Glass input disabled. Fallback Reason: ${audit.fallbackReason || 'Disabled via props'}`);
    }
  }, [renderMode, audit, blurSupported]);

  // 3. Focus handlers
  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  // 4. Color theme computations
  const themeColor = useMemo(() => {
    return isDarkMode ? '#ffffff' : '#111827';
  }, [isDarkMode]);

  const placeholderColor = useMemo(() => {
    return isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)';
  }, [isDarkMode]);

  const activeIconColor = useMemo(() => {
    if (isFocused) {
      return isDarkMode ? '#60a5fa' : '#3b82f6';
    }
    return isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';
  }, [isFocused, isDarkMode]);

  // Combined input wrapper style containing focus borders
  const wrapperStyle = useMemo(() => {
    return [
      styles.inputWrapper,
      isDarkMode ? styles.inputWrapperDark : styles.inputWrapperLight,
      isFocused && (isDarkMode ? styles.inputWrapperFocusedDark : styles.inputWrapperFocusedLight),
    ];
  }, [isFocused, isDarkMode]);

  // 5. Sub-rendering helper configurations for each rendering technology mode
  const renderLiquidGlass = () => {
    if (!NativeLiquidGlassView) {
      return renderBlurFallback();
    }
    return (
      <SafeView fallback={renderBlurFallback()}>
        <NativeLiquidGlassView
          style={[styles.innerContainer, { borderRadius: 16 }]}
          interactive={false}
          effect="clear"
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
            style={[StyleSheet.absoluteFill, styles.borderOverlay, { borderRadius: 16 }]}
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
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
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
            style={[StyleSheet.absoluteFill, styles.borderOverlay, { borderRadius: 16 }]}
            pointerEvents="none"
          />
        </View>
      </SafeView>
    );
  };

  const renderSolidFallback = () => (
    <View
      style={[
        StyleSheet.absoluteFill,
        isDarkMode ? styles.solidDark : styles.solidLight,
        { borderRadius: 16 },
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
    <View style={[styles.outerContainer, containerStyle]}>
      {label && (
        <Text style={[styles.label, isDarkMode ? styles.labelDark : styles.labelLight]}>
          {label}
        </Text>
      )}

      <View style={wrapperStyle}>
        {/* Background Render Mode Layer */}
        {renderLayers()}

        {/* Left Side Icon Vector */}
        {iconName && (
          <View style={styles.iconLeft}>
            <AuthIcon name={iconName} color={activeIconColor} />
          </View>
        )}

        {/* TextInput Box */}
        <TextInput
          {...props}
          placeholderTextColor={placeholderColor}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !showPassword}
          style={[
            styles.textInput,
            isDarkMode ? styles.textInputDark : styles.textInputLight,
            style,
          ]}
        />

        {/* Right Side Secure Eye Toggle */}
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
            style={styles.iconRight}
          >
            <AuthIcon
              name={showPassword ? 'eye-off' : 'eye'}
              color={activeIconColor}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

GlassTextInput.displayName = 'GlassTextInput';
