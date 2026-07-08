import JailMonkey from 'jail-monkey';

export class JailbreakScanner {
  /**
   * Check if the device is rooted (Android) or jailbroken (iOS).
   * Now backed by the native JailMonkey SDK for production security.
   */
  public static isDeviceCompromised(): boolean {
    if (__DEV__) {
      // Return false in DEV so we don't block simulator testing
      return false;
    }
    
    // JailMonkey checks natively for Cydia, su binaries, and restricted path writing
    return JailMonkey.isJailBroken();
  }
}
export default JailbreakScanner;
