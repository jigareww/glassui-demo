import { create } from 'zustand';
import { DI, DI_KEYS } from '../../../shared/di';
import { SecurityRepository } from '../domain/repository/SecurityRepository';

interface SecurityState {
  hasPasscode: boolean;
  isLocked: boolean;
  isLoading: boolean;
  useBiometrics: boolean;

  // Actions
  initializeSecurity: () => Promise<void>;
  setupPasscode: (pin: string) => Promise<boolean>;
  verifyPasscode: (pin: string) => Promise<boolean>;
  toggleBiometrics: (enabled: boolean) => Promise<void>;
  authenticateWithBiometrics: () => Promise<boolean>;
  lockApp: () => void;
  unlockApp: () => void;
}

// We resolve the Security Repository from the DI container to decouple the store
const securityRepo = DI.resolve<SecurityRepository>(DI_KEYS.SECURITY_REPOSITORY);

export const useSecurityStore = create<SecurityState>((set, get) => ({
  hasPasscode: false,
  isLocked: false, // Default false, initialized dynamically
  isLoading: true,
  useBiometrics: false,

  initializeSecurity: async () => {
    set({ isLoading: true });
    try {
      const hasPin = await securityRepo.hasPasscode();
      const hasBio = await securityRepo.hasBiometricsEnabled();
      set({ 
        hasPasscode: hasPin, 
        isLocked: hasPin, // If there's a PIN, the app starts locked
        useBiometrics: hasBio,
        isLoading: false 
      });
    } catch (e) {
      console.error('[SecurityStore] Error initializing:', e);
      set({ isLoading: false });
    }
  },

  setupPasscode: async (pin: string) => {
    try {
      const success = await securityRepo.savePasscode(pin);
      if (success) {
        set({ hasPasscode: true, isLocked: false });
      }
      return success;
    } catch (e) {
      console.error('[SecurityStore] Error saving passcode:', e);
      return false;
    }
  },

  verifyPasscode: async (pin: string) => {
    try {
      const isValid = await securityRepo.verifyPasscode(pin);
      if (isValid) {
        set({ isLocked: false });
      }
      return isValid;
    } catch (e) {
      console.error('[SecurityStore] Error verifying passcode:', e);
      return false;
    }
  },

  toggleBiometrics: async (enabled: boolean) => {
    await securityRepo.setBiometricsEnabled(enabled);
    set({ useBiometrics: enabled });
  },

  authenticateWithBiometrics: async () => {
    const success = await securityRepo.authenticateWithBiometrics();
    if (success) {
      set({ isLocked: false });
    }
    return success;
  },

  lockApp: () => {
    const { hasPasscode } = get();
    if (hasPasscode) {
      set({ isLocked: true });
    }
  },

  unlockApp: () => {
    set({ isLocked: false });
  },
}));
