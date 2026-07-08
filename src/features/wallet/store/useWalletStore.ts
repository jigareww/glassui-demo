import { create } from 'zustand';
import { Wallet, WalletAccount } from '../domain/model/Wallet';
import { WalletRepository } from '../domain/repository/WalletRepository';
import { DI, DI_KEYS } from '../../../shared/di';

interface WalletState {
  wallets: Wallet[];
  activeWalletId: string | null;
  activeAccountIndex: number;
  isLoading: boolean;
  hasInitialized: boolean;
  error: string | null;

  // Actions
  initializeStore: () => Promise<void>;
  createHDWallet: (name: string) => Promise<{ wallet: Wallet; mnemonic: string }>;
  importHDWallet: (name: string, mnemonic: string) => Promise<Wallet>;
  importPrivateKeyWallet: (name: string, privateKey: string, blockchain: 'evm' | 'solana') => Promise<Wallet>;
  importWatchWallet: (name: string, evmAddress: string, solanaAddress: string) => Promise<Wallet>;
  addNewAccount: () => Promise<WalletAccount>;
  setActiveWallet: (walletId: string) => void;
  setActiveAccountIndex: (index: number) => void;
  markAsBackedUp: (walletId: string) => Promise<void>;
  deleteWallet: (walletId: string) => Promise<void>;
  clearError: () => void;
  getPrivateKey: (blockchain: 'evm' | 'solana') => Promise<string | null>;
}

// Resolve repository strictly from DI container
const walletRepo = DI.resolve<WalletRepository>(DI_KEYS.WALLET_REPOSITORY);

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: [],
  activeWalletId: null,
  activeAccountIndex: 0,
  isLoading: false,
  hasInitialized: false,
  error: null,

  initializeStore: async () => {
    if (get().hasInitialized) return;
    set({ isLoading: true, error: null });
    try {
      const wallets = await walletRepo.getWallets();
      const activeWalletId = wallets.length > 0 ? wallets[0].id : null;
      set({
        wallets,
        activeWalletId,
        activeAccountIndex: 0,
        hasInitialized: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.message || 'Failed to initialize wallet store',
        isLoading: false,
        hasInitialized: true,
      });
    }
  },

  createHDWallet: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const { wallet, mnemonic } = await walletRepo.createHDWallet(name);
      const updatedWallets = await walletRepo.getWallets();
      set({
        wallets: updatedWallets,
        activeWalletId: wallet.id,
        activeAccountIndex: 0,
        isLoading: false,
      });
      return { wallet, mnemonic };
    } catch (err: any) {
      set({ error: err.message || 'Failed to create wallet', isLoading: false });
      throw err;
    }
  },

  importHDWallet: async (name: string, mnemonic: string) => {
    set({ isLoading: true, error: null });
    try {
      const wallet = await walletRepo.importHDWallet(name, mnemonic);
      const updatedWallets = await walletRepo.getWallets();
      set({
        wallets: updatedWallets,
        activeWalletId: wallet.id,
        activeAccountIndex: 0,
        isLoading: false,
      });
      return wallet;
    } catch (err: any) {
      set({ error: err.message || 'Failed to import wallet', isLoading: false });
      throw err;
    }
  },

  importPrivateKeyWallet: async (name: string, privateKey: string, blockchain: 'evm' | 'solana') => {
    set({ isLoading: true, error: null });
    try {
      const wallet = await walletRepo.importPrivateKeyWallet(name, privateKey, blockchain);
      const updatedWallets = await walletRepo.getWallets();
      set({
        wallets: updatedWallets,
        activeWalletId: wallet.id,
        activeAccountIndex: 0,
        isLoading: false,
      });
      return wallet;
    } catch (err: any) {
      set({ error: err.message || 'Failed to import private key', isLoading: false });
      throw err;
    }
  },

  importWatchWallet: async (name: string, evmAddress: string, solanaAddress: string) => {
    set({ isLoading: true, error: null });
    try {
      const wallet = await walletRepo.importWatchWallet(name, evmAddress, solanaAddress);
      const updatedWallets = await walletRepo.getWallets();
      set({
        wallets: updatedWallets,
        activeWalletId: wallet.id,
        activeAccountIndex: 0,
        isLoading: false,
      });
      return wallet;
    } catch (err: any) {
      set({ error: err.message || 'Failed to import watch wallet', isLoading: false });
      throw err;
    }
  },

  addNewAccount: async () => {
    const { activeWalletId, wallets } = get();
    if (!activeWalletId) throw new Error('No active wallet selected');

    const wallet = wallets.find((w) => w.id === activeWalletId);
    if (!wallet) throw new Error('Active wallet not found');

    set({ isLoading: true, error: null });
    try {
      const nextIndex = wallet.accounts.length;
      const newAccount = await walletRepo.deriveNewAccount(activeWalletId, nextIndex);
      const updatedWallets = await walletRepo.getWallets();
      set({
        wallets: updatedWallets,
        activeAccountIndex: nextIndex,
        isLoading: false,
      });
      return newAccount;
    } catch (err: any) {
      set({ error: err.message || 'Failed to derive account', isLoading: false });
      throw err;
    }
  },

  setActiveWallet: (walletId: string) => {
    const { wallets } = get();
    const exists = wallets.some((w) => w.id === walletId);
    if (exists) {
      set({ activeWalletId: walletId, activeAccountIndex: 0 });
    }
  },

  setActiveAccountIndex: (index: number) => {
    const { activeWalletId, wallets } = get();
    if (!activeWalletId) return;
    const wallet = wallets.find((w) => w.id === activeWalletId);
    if (wallet && index >= 0 && index < wallet.accounts.length) {
      set({ activeAccountIndex: index });
    }
  },

  markAsBackedUp: async (walletId: string) => {
    try {
      await walletRepo.markAsBackedUp(walletId);
      const updatedWallets = await walletRepo.getWallets();
      set({ wallets: updatedWallets });
    } catch (err: any) {
      set({ error: err.message || 'Failed to mark as backed up' });
    }
  },

  deleteWallet: async (walletId: string) => {
    set({ isLoading: true, error: null });
    try {
      await walletRepo.deleteWallet(walletId);
      const updatedWallets = await walletRepo.getWallets();
      const currentActive = get().activeWalletId;
      const nextActive =
        currentActive === walletId
          ? updatedWallets.length > 0
            ? updatedWallets[0].id
            : null
          : currentActive;

      set({
        wallets: updatedWallets,
        activeWalletId: nextActive,
        activeAccountIndex: 0,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete wallet', isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),

  getPrivateKey: async (blockchain: 'evm' | 'solana') => {
    const { activeWalletId, activeAccountIndex } = get();
    if (!activeWalletId) return null;
    return walletRepo.getAccountPrivateKey(activeWalletId, activeAccountIndex, blockchain);
  },
}));
