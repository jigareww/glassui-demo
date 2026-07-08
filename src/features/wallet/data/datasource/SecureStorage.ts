import * as Keychain from 'react-native-keychain';

export class SecureStorage {
  private static SERVICE_PREFIX = 'com.glassui.wallet.secure.';

  /**
   * Save the mnemonic securely in the Keychain/Keystore.
   * Uses WHEN_UNLOCKED_THIS_DEVICE_ONLY to ensure it's not included in backups
   * and only accessible when the device is unlocked.
   */
  public static async saveMnemonic(
    walletId: string,
    mnemonic: string,
    requireBiometrics = false
  ): Promise<boolean> {
    try {
      await Keychain.setGenericPassword(
        'mnemonic',
        mnemonic,
        {
          service: `${this.SERVICE_PREFIX}mnemonic.${walletId}`,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          accessControl: requireBiometrics ? Keychain.ACCESS_CONTROL.BIOMETRY_ANY : undefined,
        }
      );
      return true;
    } catch (error) {
      console.error('[SecureStorage] Error saving mnemonic:', error);
      return false;
    }
  }

  /**
   * Retrieve the mnemonic from Keychain/Keystore.
   */
  public static async getMnemonic(walletId: string, promptReason?: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: `${this.SERVICE_PREFIX}mnemonic.${walletId}`,
        authenticationPrompt: promptReason
          ? {
              title: 'Decrypt Wallet Recovery Phrase',
              subtitle: promptReason,
            }
          : undefined,
      });
      if (credentials) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.error('[SecureStorage] Error loading mnemonic:', error);
      return null;
    }
  }

  /**
   * Delete the mnemonic from Keychain/Keystore.
   */
  public static async deleteMnemonic(walletId: string): Promise<boolean> {
    try {
      await Keychain.resetGenericPassword({
        service: `${this.SERVICE_PREFIX}mnemonic.${walletId}`,
      });
      return true;
    } catch (error) {
      console.error('[SecureStorage] Error deleting mnemonic:', error);
      return false;
    }
  }

  /**
   * Save a single private key (for imported wallets).
   */
  public static async savePrivateKey(
    walletId: string,
    accountIndex: number,
    privateKey: string,
    requireBiometrics = false
  ): Promise<boolean> {
    try {
      await Keychain.setGenericPassword(
        `privatekey_${accountIndex}`,
        privateKey,
        {
          service: `${this.SERVICE_PREFIX}pk.${walletId}.${accountIndex}`,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          accessControl: requireBiometrics ? Keychain.ACCESS_CONTROL.BIOMETRY_ANY : undefined,
        }
      );
      return true;
    } catch (error) {
      console.error('[SecureStorage] Error saving private key:', error);
      return false;
    }
  }

  /**
   * Retrieve a private key.
   */
  public static async getPrivateKey(
    walletId: string,
    accountIndex: number,
    promptReason?: string
  ): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: `${this.SERVICE_PREFIX}pk.${walletId}.${accountIndex}`,
        authenticationPrompt: promptReason
          ? {
              title: 'Decrypt Account Private Key',
              subtitle: promptReason,
            }
          : undefined,
      });
      if (credentials) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.error('[SecureStorage] Error loading private key:', error);
      return null;
    }
  }

  /**
   * Delete a private key.
   */
  public static async deletePrivateKey(walletId: string, accountIndex: number): Promise<boolean> {
    try {
      await Keychain.resetGenericPassword({
        service: `${this.SERVICE_PREFIX}pk.${walletId}.${accountIndex}`,
      });
      return true;
    } catch (error) {
      console.error('[SecureStorage] Error deleting private key:', error);
      return false;
    }
  }

  /**
   * Save app unlock passcode securely.
   */
  public static async savePasscode(pin: string): Promise<boolean> {
    try {
      await Keychain.setGenericPassword(
        'app_passcode',
        pin,
        {
          service: `${this.SERVICE_PREFIX}passcode`,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        }
      );
      return true;
    } catch (error) {
      console.error('[SecureStorage] Error saving passcode:', error);
      return false;
    }
  }

  /**
   * Retrieve app unlock passcode.
   */
  public static async getPasscode(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: `${this.SERVICE_PREFIX}passcode`,
      });
      if (credentials) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.error('[SecureStorage] Error loading passcode:', error);
      return null;
    }
  }

  /**
   * Delete passcode from secure storage.
   */
  public static async deletePasscode(): Promise<boolean> {
    try {
      await Keychain.resetGenericPassword({
        service: `${this.SERVICE_PREFIX}passcode`,
      });
      return true;
    } catch (error) {
      console.error('[SecureStorage] Error deleting passcode:', error);
      return false;
    }
  }
}
export default SecureStorage;
