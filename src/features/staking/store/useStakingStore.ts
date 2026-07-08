import { create } from 'zustand';
import { Chain } from '../../network/config/chains';
import { Validator, StakingService } from '../services/StakingService';

interface StakingState {
  validators: Validator[];
  isFetchingValidators: boolean;
  isDelegating: boolean;
  error: string | null;

  // Actions
  fetchValidators: (chain: Chain) => Promise<void>;
  delegateStake: (
    privateKeyHex: string,
    validatorAddress: string,
    amount: string,
    chain: Chain
  ) => Promise<string>;
}

export const useStakingStore = create<StakingState>((set) => ({
  validators: [],
  isFetchingValidators: false,
  isDelegating: false,
  error: null,

  fetchValidators: async (chain: Chain) => {
    set({ isFetchingValidators: true, error: null });
    try {
      const results = await StakingService.fetchValidators(chain);
      set({ validators: results, isFetchingValidators: false });
    } catch (err: any) {
      set({
        error: err.message || 'Failed to load validators',
        isFetchingValidators: false,
      });
    }
  },

  delegateStake: async (
    privateKeyHex: string,
    validatorAddress: string,
    amount: string,
    chain: Chain
  ) => {
    set({ isDelegating: true, error: null });
    try {
      const txHash = await StakingService.delegateStake(
        privateKeyHex,
        validatorAddress,
        amount,
        chain
      );
      set({ isDelegating: false });
      return txHash;
    } catch (err: any) {
      set({ error: err.message || 'Delegation failed', isDelegating: false });
      throw err;
    }
  },
}));
export default useStakingStore;
