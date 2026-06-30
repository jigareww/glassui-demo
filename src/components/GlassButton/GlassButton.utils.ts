import { Platform, UIManager, TurboModuleRegistry } from 'react-native';
import { RenderMode, RENDER_MODES } from './GlassButton.constants';

export interface LiquidGlassAudit {
  isSupported: boolean;
  jsPackageInstalled: boolean;
  nativeComponentRegistered: boolean;
  nativeModuleAvailable: boolean;
  isIos: boolean;
  iosVersion: number;
  newArchEnabled: boolean;
  fabricEnabled: boolean;
  deviceSupported: boolean;
  fallbackReason?: string;
}

/**
 * Conducts a production-level audit of the Liquid Glass environment.
 * Verifies package, native TurboModule, native Fabric component registration,
 * iOS/SDK versions, and device hardware support under the New Architecture.
 */
export function auditLiquidGlassSupport(): LiquidGlassAudit {
  const audit: LiquidGlassAudit = {
    isSupported: false,
    jsPackageInstalled: false,
    nativeComponentRegistered: false,
    nativeModuleAvailable: false,
    isIos: Platform.OS === 'ios',
    iosVersion: 0,
    newArchEnabled: false,
    fabricEnabled: false,
    deviceSupported: false,
  };

  if (!audit.isIos) {
    audit.fallbackReason = 'Platform is not iOS';
    return audit;
  }

  // Parse iOS version string (e.g. "17.4" -> 17.4)
  const iosVersion = typeof Platform.Version === 'string'
    ? parseFloat(Platform.Version)
    : Platform.Version;
  audit.iosVersion = iosVersion;

  if (iosVersion < 26) {
    audit.fallbackReason = `iOS version ${iosVersion} is below the required iOS 26+`;
    return audit;
  }

  // Detect New Architecture & Fabric status via React Native global flags
  // global.RN$Bridgeless is set to true when Bridgeless mode is enabled in RN
  audit.newArchEnabled = (globalThis as any).RN$Bridgeless === true;
  // global.nativeFabricUIManager is available when Fabric is active
  audit.fabricEnabled = !!(globalThis as any).nativeFabricUIManager;

  if (!audit.fabricEnabled) {
    audit.fallbackReason = 'Fabric is not enabled (New Architecture is required)';
    return audit;
  }

  // 1. Verify JS Package and TurboModule registration safely using try-catch to prevent crash if unlinked
  try {
    const LiquidGlass = require('@callstack/liquid-glass');
    audit.jsPackageInstalled = !!LiquidGlass;

    // Check TurboModule directly via registry
    const NativeModule = TurboModuleRegistry.get('NativeLiquidGlassModule');
    audit.nativeModuleAvailable = !!NativeModule;

    if (LiquidGlass && LiquidGlass.isLiquidGlassSupported) {
      audit.deviceSupported = true;
    }
  } catch (error: any) {
    audit.fallbackReason = `Error requiring @callstack/liquid-glass or accessing TurboModule: ${error.message}`;
    return audit;
  }

  // 2. Verify native view manager registration
  try {
    if (audit.fabricEnabled) {
      // Under Fabric / Bridgeless mode, pure Fabric components do not register in the legacy UIManager.
      // If the TurboModule is available (indicating the native package is linked), the native component is registered.
      audit.nativeComponentRegistered = audit.nativeModuleAvailable;
    } else {
      const hasViewConfig = !!(
        UIManager &&
        UIManager.getViewManagerConfig &&
        UIManager.getViewManagerConfig('LiquidGlassView')
      );
      audit.nativeComponentRegistered = hasViewConfig;
    }
  } catch (e) {
    audit.nativeComponentRegistered = false;
  }

  // Evaluate final support
  if (!audit.jsPackageInstalled) {
    audit.fallbackReason = 'JS package is not installed or failed to load';
    return audit;
  }

  if (!audit.nativeModuleAvailable) {
    audit.fallbackReason = 'Native TurboModule NativeLiquidGlassModule is not registered in runtime';
    return audit;
  }

  if (!audit.nativeComponentRegistered) {
    audit.fallbackReason = 'Native component LiquidGlassView is not registered in UIManager';
    return audit;
  }

  if (!audit.deviceSupported) {
    audit.fallbackReason = 'Hardware or simulator does not support Apple Liquid Glass effect';
    return audit;
  }

  audit.isSupported = true;
  return audit;
}

/**
 * Checks if CocoaPods/npm dependencies for BlurView are linked and supported on the device.
 * For Android, we also check if the API version is 31+ (Android 12+) to guarantee hardware support.
 */
export function checkBlurSupport(): boolean {
  try {
    const Blur = require('@react-native-community/blur');
    const isModuleAvailable = !!(Blur && Blur.BlurView);
    
    if (!isModuleAvailable) {
      return false;
    }

    if (Platform.OS === 'ios') {
      return true;
    }

    if (Platform.OS === 'android') {
      // Android 12 (API 31) introduced native window-level blur and RenderEffect
      const androidVersion = typeof Platform.Version === 'string'
        ? parseInt(Platform.Version, 10)
        : Platform.Version;
      return androidVersion >= 31;
    }

    return false;
  } catch (e) {
    return false;
  }
}

export interface RenderResolution {
  renderMode: RenderMode;
  audit: LiquidGlassAudit;
  blurSupported: boolean;
}

/**
 * Derives the active rendering technology path based on hardware, OS version, and disable overrides.
 */
export function getGlassRenderMode(
  disableLiquidGlass = false,
  disableBlur = false
): RenderResolution {
  const audit = auditLiquidGlassSupport();
  const blurSupported = checkBlurSupport();

  if (Platform.OS === 'ios') {
    if (!disableLiquidGlass && audit.isSupported) {
      return { renderMode: RENDER_MODES.LIQUID_GLASS, audit, blurSupported };
    }
    if (!disableBlur && blurSupported) {
      return { renderMode: RENDER_MODES.BLUR, audit, blurSupported };
    }
    return { renderMode: RENDER_MODES.SOLID, audit, blurSupported };
  }

  if (Platform.OS === 'android') {
    if (!disableBlur && blurSupported) {
      return { renderMode: RENDER_MODES.BLUR, audit, blurSupported };
    }
    return { renderMode: RENDER_MODES.SOLID, audit, blurSupported };
  }

  return { renderMode: RENDER_MODES.SOLID, audit, blurSupported };
}
