import AsyncStorage from '@react-native-async-storage/async-storage';
import { Wallet } from '../../domain/model/Wallet';

export class WalletLocalStorage {
  private static STORAGE_KEY = 'com.glassui.wallet.metadata';

  /**
   * Save non-sensitive wallet metadata (addresses, names, indexes).
   * Mnemonics and Private Keys MUST NOT be stored here.
   */
  public static async saveWalletMetadata(wallets: Wallet[]): Promise<void> {
    try {
      const json = JSON.stringify(wallets);
      await AsyncStorage.setItem(this.STORAGE_KEY, json);
    } catch (error) {
      console.error('[WalletLocalStorage] Error saving wallet metadata:', error);
      throw error;
    }
  }

  /**
   * Get non-sensitive wallet metadata.
   */
  public static async getWalletMetadata(): Promise<Wallet[]> {
    try {
      const json = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (json) {
        return JSON.parse(json) as Wallet[];
      }
      return [];
    } catch (error) {
      console.error('[WalletLocalStorage] Error loading wallet metadata:', error);
      return [];
    }
  }

  /**
   * Delete all metadata (useful for app reset/logout).
   */
  public static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('[WalletLocalStorage] Error clearing metadata:', error);
    }
  }
}
export default WalletLocalStorage;
