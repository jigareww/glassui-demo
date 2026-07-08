import { SecurityRepository } from '../../domain/repository/SecurityRepository';
import { SecureStorage as SharedSecureStorage } from '../../../wallet/data/datasource/SecureStorage';
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_PREF_KEY = '@app_use_biometrics';
const BIOMETRIC_TOKEN_KEY = 'biometric_token_service';

export class SecurityRepositoryImpl implements SecurityRepository {
  public async hasPasscode(): Promise<boolean> {
    const pin = await SharedSecureStorage.getPasscode();
    return pin !== null;
  }

  public async savePasscode(pin: string): Promise<boolean> {
    return SharedSecureStorage.savePasscode(pin);
  }

  public async verifyPasscode(pin: string): Promise<boolean> {
    const savedPin = await SharedSecureStorage.getPasscode();
    return savedPin === pin;
  }

  public async deletePasscode(): Promise<boolean> {
    return SharedSecureStorage.deletePasscode();
  }

  public async hasBiometricsEnabled(): Promise<boolean> {
    const val = await AsyncStorage.getItem(BIOMETRIC_PREF_KEY);
    return val === 'true';
  }

  public async setBiometricsEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(BIOMETRIC_PREF_KEY, enabled ? 'true' : 'false');
    if (enabled) {
      // Save a dummy token protected by biometrics so we can request it later to trigger the prompt
      await Keychain.setGenericPassword('biometric_user', 'enabled', {
        service: BIOMETRIC_TOKEN_KEY,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } else {
      await Keychain.resetGenericPassword({ service: BIOMETRIC_TOKEN_KEY });
    }
  }

  public async authenticateWithBiometrics(): Promise<boolean> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: BIOMETRIC_TOKEN_KEY,
        authenticationPrompt: {
          title: 'Unlock Wallet',
          subtitle: 'Confirm your identity to access your Web3 Wallet',
        },
      });
      return !!credentials;
    } catch (e) {
      console.warn('[SecurityRepository] Biometric auth failed or canceled', e);
      return false;
    }
  }
}
