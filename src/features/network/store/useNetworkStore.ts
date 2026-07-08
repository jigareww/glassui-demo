import { create } from 'zustand';
import { Chain, SUPPORTED_CHAINS } from '../config/chains';

interface NetworkState {
  activeChainId: string;
  supportedChains: Chain[];
  
  // Actions
  selectChain: (chainId: string) => void;
  getActiveChain: () => Chain;
  isActiveChainSolana: () => boolean;
  isActiveChainEVM: () => boolean;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  activeChainId: 'ethereum',
  supportedChains: SUPPORTED_CHAINS,

  selectChain: (chainId: string) => {
    const exists = get().supportedChains.some((c) => c.id === chainId);
    if (exists) {
      set({ activeChainId: chainId });
    } else {
      console.warn(`[useNetworkStore] Attempted to select unsupported chain: ${chainId}`);
    }
  },

  getActiveChain: () => {
    const { activeChainId, supportedChains } = get();
    const chain = supportedChains.find((c) => c.id === activeChainId);
    if (!chain) {
      // Fallback
      return supportedChains[0];
    }
    return chain;
  },

  isActiveChainSolana: () => {
    return get().getActiveChain().type === 'solana';
  },

  isActiveChainEVM: () => {
    return get().getActiveChain().type === 'evm';
  },
}));
export default useNetworkStore;
