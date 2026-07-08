export type WalletType = 'hd' | 'private-key' | 'watch';

export interface WalletAccount {
  index: number;
  name: string;
  evmAddress: string;
  solanaAddress: string;
}

export interface Wallet {
  id: string; // Unique identifier (e.g., UUID or hash)
  name: string;
  type: WalletType;
  accounts: WalletAccount[];
  isBackedUp: boolean;
}

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  tag: string;
}
