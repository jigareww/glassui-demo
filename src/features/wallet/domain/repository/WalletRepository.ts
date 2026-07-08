import { Wallet, WalletAccount, WalletType } from '../model/Wallet';

export interface WalletRepository {
  /**
   * Create a new HD wallet by generating a secure mnemonic.
   */
  createHDWallet(name: string): Promise<{ wallet: Wallet; mnemonic: string }>;

  /**
   * Import an existing HD wallet using its mnemonic.
   */
  importHDWallet(name: string, mnemonic: string): Promise<Wallet>;

  /**
   * Import a single account wallet using a private key (supports EVM and Solana keys).
   */
  importPrivateKeyWallet(name: string, privateKey: string, blockchain: 'evm' | 'solana'): Promise<Wallet>;

  /**
   * Create a watch-only account wallet (addresses only).
   */
  importWatchWallet(name: string, evmAddress: string, solanaAddress: string): Promise<Wallet>;

  /**
   * Add a new derived account to an existing HD wallet.
   */
  deriveNewAccount(walletId: string, index: number): Promise<WalletAccount>;

  /**
   * Get all wallet metadata saved on device.
   */
  getWallets(): Promise<Wallet[]>;

  /**
   * Retrieve the mnemonic for a specific wallet (requires security checks in app).
   */
  getWalletMnemonic(walletId: string): Promise<string | null>;

  /**
   * Retrieve the private key for a specific account inside a wallet.
   */
  getAccountPrivateKey(walletId: string, index: number, blockchain: 'evm' | 'solana'): Promise<string | null>;

  /**
   * Mark a wallet as successfully backed up.
   */
  markAsBackedUp(walletId: string): Promise<void>;

  /**
   * Delete a wallet and its secure credentials completely.
   */
  deleteWallet(walletId: string): Promise<void>;

}
