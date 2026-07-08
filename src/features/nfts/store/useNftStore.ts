import { create } from 'zustand';
import { Chain } from '../../network/config/chains';
import { NftItem, NftService } from '../services/NftService';

interface NftState {
  nfts: NftItem[];
  isFetchingNfts: boolean;
  error: string | null;

  // Actions
  fetchNfts: (address: string, chain: Chain) => Promise<void>;
}

export const useNftStore = create<NftState>((set) => ({
  nfts: [],
  isFetchingNfts: false,
  error: null,

  fetchNfts: async (address: string, chain: Chain) => {
    if (!address) return;
    set({ isFetchingNfts: true, error: null });
    try {
      const results = await NftService.fetchNfts(address, chain);
      set({ nfts: results, isFetchingNfts: false });
    } catch (err: any) {
      set({
        error: err.message || 'Failed to fetch NFTs',
        isFetchingNfts: false,
      });
    }
  },
}));
export default useNftStore;
