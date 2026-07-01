import { Platform, UIManager, TurboModuleRegistry } from 'react-native';
import { RenderMode, RENDER_MODES } from './Button.constants';

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

  const iosVersion = typeof Platform.Version === 'string'
    ? parseFloat(Platform.Version)
    : Platform.Version;
  audit.iosVersion = iosVersion;

  if (iosVersion < 26) {
    audit.fallbackReason = `iOS version ${iosVersion} is below the required iOS 26+`;
    return audit;
  }

  audit.newArchEnabled = (globalThis as any).RN$Bridgeless === true;
  audit.fabricEnabled = !!(globalThis as any).nativeFabricUIManager;

  if (!audit.fabricEnabled) {
    audit.fallbackReason = 'Fabric is not enabled (New Architecture is required)';
    return audit;
  }

  try {
    const LiquidGlass = require('@callstack/liquid-glass');
    audit.jsPackageInstalled = !!LiquidGlass;

    const NativeModule = TurboModuleRegistry.get('NativeLiquidGlassModule');
    audit.nativeModuleAvailable = !!NativeModule;

    if (LiquidGlass && LiquidGlass.isLiquidGlassSupported) {
      audit.deviceSupported = true;
    }
  } catch (error: any) {
    audit.fallbackReason = `Error requiring @callstack/liquid-glass or accessing TurboModule: ${error.message}`;
    return audit;
  }

  try {
    if (audit.fabricEnabled) {
      audit.nativeComponentRegistered = audit.nativeModuleAvailable;
    } else {
      const hasViewConfig = !!(
        UIManager &&
        UIManager.getViewManagerConfig &&
        UIManager.getViewManagerConfig('LiquidGlassView')
      );
      audit.nativeComponentRegistered = hasViewConfig;
    }
  } catch {
    audit.nativeComponentRegistered = false;
  }

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
      const androidVersion = typeof Platform.Version === 'string'
        ? parseInt(Platform.Version, 10)
        : Platform.Version;
      return androidVersion >= 31;
    }

    return false;
  } catch {
    return false;
  }
}

export interface RenderResolution {
  renderMode: RenderMode;
  audit: LiquidGlassAudit;
  blurSupported: boolean;
}

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
