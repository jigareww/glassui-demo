import * as Keychain from 'react-native-keychain';

export class BiometricsService {
  private static BIOMETRIC_TEST_SERVICE = 'com.glassui.security.biometrics';

  /**
   * Check if biometrics (Face ID, Touch ID, or Android Fingerprint) is supported and enrolled.
   */
  public static async isBiometricsSupported(): Promise<boolean> {
    try {
      const type = await Keychain.getSupportedBiometryType();
      return type !== null && type !== undefined;
    } catch {
      return false;
    }
  }

  /**
   * Determine the type of biometrics enrolled.
   */
  public static async getBiometricsType(): Promise<string> {
    try {
      const type = await Keychain.getSupportedBiometryType();
      if (!type) return 'None';
      
      // Map to friendly names
      switch (type) {
        case Keychain.BIOMETRY_TYPE.FACE_ID:
          return 'Face ID';
        case Keychain.BIOMETRY_TYPE.TOUCH_ID:
          return 'Touch ID';
        case Keychain.BIOMETRY_TYPE.FINGERPRINT:
          return 'Fingerprint';
        case Keychain.BIOMETRY_TYPE.FACE:
          return 'Face Unlock';
        case Keychain.BIOMETRY_TYPE.IRIS:
          return 'Iris Scan';
        default:
          return 'Biometrics';
      }
    } catch {
      return 'None';
    }
  }

  /**
   * Request biometric prompt authorization from the user.
   * Leverages Keychain secure biometrics enclave.
   */
  public static async authenticateUser(reason: string): Promise<boolean> {
    try {
      const isSupported = await this.isBiometricsSupported();
      if (!isSupported) return false;

      // 1. Write a temporary dummy token locked with biometrics access rules
      await Keychain.setGenericPassword(
        'biometric_user',
        'auth_passed',
        {
          service: this.BIOMETRIC_TEST_SERVICE,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        }
      );

      // 2. Query the credential. This triggers the OS-level Face ID / Touch ID popup prompt.
      const credentials = await Keychain.getGenericPassword({
        service: this.BIOMETRIC_TEST_SERVICE,
        authenticationPrompt: {
          title: 'Unlock Glass Wallet',
          subtitle: reason,
          cancel: 'Use Passcode instead',
        },
      });

      // 3. Clean up credentials immediately
      await Keychain.resetGenericPassword({
        service: this.BIOMETRIC_TEST_SERVICE,
      });

      return credentials !== false && credentials !== null;
    } catch (error) {
      console.warn('[BiometricsService] Authentication failed or cancelled:', error);
      return false;
    }
  }
}
export default BiometricsService;
