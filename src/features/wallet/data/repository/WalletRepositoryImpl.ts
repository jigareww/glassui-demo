import { WalletRepository } from '../../domain/repository/WalletRepository';
import { Wallet, WalletAccount } from '../../domain/model/Wallet';
import { SecureStorage } from '../datasource/SecureStorage';
import { WalletLocalStorage } from '../datasource/WalletLocalStorage';
import { KeyDerivationService } from '../../services/KeyDerivationService';
import { Buffer } from 'buffer';

export class WalletRepositoryImpl implements WalletRepository {
  private generateId(): string {
    // Generate a secure-enough unique identifier for wallet isolation
    const array = new Uint8Array(16);
    if (typeof global.crypto !== 'undefined' && global.crypto.getRandomValues) {
      global.crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < 16; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Buffer.from(array).toString('hex');
  }

  public async createHDWallet(name: string): Promise<{ wallet: Wallet; mnemonic: string }> {
    const mnemonic = KeyDerivationService.generateMnemonic();
    const wallet = await this.importHDWallet(name, mnemonic);
    return { wallet, mnemonic };
  }

  public async importHDWallet(name: string, mnemonic: string): Promise<Wallet> {
    const trimmedMnemonic = mnemonic.trim().toLowerCase();
    if (!KeyDerivationService.validateMnemonic(trimmedMnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }

    const walletId = this.generateId();
    
    // Derive initial account (index 0)
    const derived = KeyDerivationService.deriveKeysFromMnemonic(trimmedMnemonic, 0);

    const initialAccount: WalletAccount = {
      index: 0,
      name: 'Account 1',
      evmAddress: derived.evmAddress,
      solanaAddress: derived.solanaAddress,
    };

    const newWallet: Wallet = {
      id: walletId,
      name,
      type: 'hd',
      accounts: [initialAccount],
      isBackedUp: false,
    };

    // Save sensitive key material securely
    const secureSaved = await SecureStorage.saveMnemonic(walletId, trimmedMnemonic);
    if (!secureSaved) {
      throw new Error('Failed to securely store wallet seed phrase');
    }

    // Save non-sensitive metadata in async storage
    const currentWallets = await WalletLocalStorage.getWalletMetadata();
    currentWallets.push(newWallet);
    await WalletLocalStorage.saveWalletMetadata(currentWallets);

    return newWallet;
  }

  public async importPrivateKeyWallet(
    name: string,
    privateKey: string,
    blockchain: 'evm' | 'solana'
  ): Promise<Wallet> {
    const walletId = this.generateId();
    let evmAddr = '';
    let solAddr = '';

    if (blockchain === 'evm') {
      evmAddr = KeyDerivationService.deriveEVMAddressFromPrivateKey(privateKey);
    } else {
      solAddr = KeyDerivationService.deriveSolanaAddressFromPrivateKey(privateKey);
    }

    const newWallet: Wallet = {
      id: walletId,
      name,
      type: 'private-key',
      accounts: [
        {
          index: 0,
          name: 'Account 1',
          evmAddress: evmAddr,
          solanaAddress: solAddr,
        },
      ],
      isBackedUp: true, // Imported private keys don't require HD backup
    };

    // Save key securely
    const secureSaved = await SecureStorage.savePrivateKey(walletId, 0, privateKey);
    if (!secureSaved) {
      throw new Error('Failed to securely store private key');
    }

    const currentWallets = await WalletLocalStorage.getWalletMetadata();
    currentWallets.push(newWallet);
    await WalletLocalStorage.saveWalletMetadata(currentWallets);

    return newWallet;
  }

  public async importWatchWallet(
    name: string,
    evmAddress: string,
    solanaAddress: string
  ): Promise<Wallet> {
    const walletId = this.generateId();
    
    const newWallet: Wallet = {
      id: walletId,
      name,
      type: 'watch',
      accounts: [
        {
          index: 0,
          name: 'Watch Account',
          evmAddress: evmAddress.trim(),
          solanaAddress: solanaAddress.trim(),
        },
      ],
      isBackedUp: true, // Watch-only wallets do not have seeds
    };

    const currentWallets = await WalletLocalStorage.getWalletMetadata();
    currentWallets.push(newWallet);
    await WalletLocalStorage.saveWalletMetadata(currentWallets);

    return newWallet;
  }

  public async deriveNewAccount(walletId: string, index: number): Promise<WalletAccount> {
    const wallets = await WalletLocalStorage.getWalletMetadata();
    const walletIndex = wallets.findIndex((w) => w.id === walletId);
    if (walletIndex === -1) {
      throw new Error('Wallet not found');
    }

    const wallet = wallets[walletIndex];
    if (wallet.type !== 'hd') {
      throw new Error('Can only derive new accounts for HD seed-based wallets');
    }

    const mnemonic = await SecureStorage.getMnemonic(walletId);
    if (!mnemonic) {
      throw new Error('Mnemonic not found in secure storage');
    }

    const derived = KeyDerivationService.deriveKeysFromMnemonic(mnemonic, index);

    const newAccount: WalletAccount = {
      index,
      name: `Account ${index + 1}`,
      evmAddress: derived.evmAddress,
      solanaAddress: derived.solanaAddress,
    };

    wallet.accounts.push(newAccount);
    await WalletLocalStorage.saveWalletMetadata(wallets);

    return newAccount;
  }

  public async getWallets(): Promise<Wallet[]> {
    return WalletLocalStorage.getWalletMetadata();
  }

  public async getWalletMnemonic(walletId: string): Promise<string | null> {
    return SecureStorage.getMnemonic(walletId);
  }

  public async getAccountPrivateKey(
    walletId: string,
    index: number,
    blockchain: 'evm' | 'solana'
  ): Promise<string | null> {
    const wallets = await WalletLocalStorage.getWalletMetadata();
    const wallet = wallets.find((w) => w.id === walletId);
    if (!wallet) return null;

    if (wallet.type === 'private-key') {
      return SecureStorage.getPrivateKey(walletId, 0);
    }

    if (wallet.type === 'hd') {
      const mnemonic = await SecureStorage.getMnemonic(walletId);
      if (!mnemonic) return null;
      const derived = KeyDerivationService.deriveKeysFromMnemonic(mnemonic, index);
      return blockchain === 'evm' ? derived.evmPrivateKey : derived.solanaPrivateKey;
    }

    return null; // Watch-only wallets do not have private keys
  }

  public async markAsBackedUp(walletId: string): Promise<void> {
    const wallets = await WalletLocalStorage.getWalletMetadata();
    const walletIndex = wallets.findIndex((w) => w.id === walletId);
    if (walletIndex !== -1) {
      wallets[walletIndex].isBackedUp = true;
      await WalletLocalStorage.saveWalletMetadata(wallets);
    }
  }

  public async deleteWallet(walletId: string): Promise<void> {
    const wallets = await WalletLocalStorage.getWalletMetadata();
    const wallet = wallets.find((w) => w.id === walletId);
    if (!wallet) return;

    // Clean up Keychain secrets
    if (wallet.type === 'hd') {
      await SecureStorage.deleteMnemonic(walletId);
    } else if (wallet.type === 'private-key') {
      for (let i = 0; i < wallet.accounts.length; i++) {
        await SecureStorage.deletePrivateKey(walletId, i);
      }
    }

    // Filter and update local storage metadata
    const remaining = wallets.filter((w) => w.id !== walletId);
    await WalletLocalStorage.saveWalletMetadata(remaining);
  }

}
export default WalletRepositoryImpl;
