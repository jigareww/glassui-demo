export interface SecurityRepository {
  /**
   * Check if an application passcode is currently set.
   */
  hasPasscode(): Promise<boolean>;

  /**
   * Securely save the application passcode.
   */
  savePasscode(pin: string): Promise<boolean>;

  /**
   * Verify an entered passcode against the securely stored one.
   */
  verifyPasscode(pin: string): Promise<boolean>;

  /**
   * Delete the passcode from secure storage (e.g. for app reset).
   */
  deletePasscode(): Promise<boolean>;

  /**
   * Check if biometrics are natively enabled.
   */
  hasBiometricsEnabled(): Promise<boolean>;

  /**
   * Set biometrics preference.
   */
  setBiometricsEnabled(enabled: boolean): Promise<void>;

  /**
   * Attempt biometric authentication. Returns true if successful.
   */
  authenticateWithBiometrics(): Promise<boolean>;
}
