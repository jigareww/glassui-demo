import { create } from 'zustand';
import { Chain } from '../../network/config/chains';
import { BalanceService, TokenBalance } from '../services/BalanceService';
import { Token, CURATED_TOKENS } from '../config/tokenList';

export interface ChartPoint {
  timestamp: number;
  value: number;
}

interface TokenStoreState {
  nativeBalance: string;
  tokenBalances: TokenBalance[];
  isFetchingBalances: boolean;
  priceCharts: Record<string, ChartPoint[]>; // Mapping token.id -> chart coordinates
  error: string | null;

  // Actions
  fetchBalances: (address: string, chain: Chain) => Promise<void>;
  fetchPriceHistory: (tokenId: string, range: '24H' | '1W' | '1M' | '1Y') => Promise<ChartPoint[]>;
}

export const useTokenStore = create<TokenStoreState>((set, get) => ({
  nativeBalance: '0',
  tokenBalances: [],
  isFetchingBalances: false,
  priceCharts: {},
  error: null,

  fetchBalances: async (address: string, chain: Chain) => {
    if (!address) return;
    set({ isFetchingBalances: true, error: null });
    try {
      const native = await BalanceService.getNativeBalance(address, chain);
      const tokens = await BalanceService.getTokenBalances(address, chain);

      set({
        nativeBalance: native,
        tokenBalances: tokens,
        isFetchingBalances: false,
      });
    } catch (err: any) {
      set({
        error: err.message || 'Failed to fetch balances',
        isFetchingBalances: false,
      });
    }
  },

  fetchPriceHistory: async (tokenId: string, range: '24H' | '1W' | '1M' | '1Y') => {
    // Return cached chart if exists in store
    const cacheKey = `${tokenId}_${range}`;
    const cached = get().priceCharts[cacheKey];
    if (cached) return cached;

    // Simulate high-fidelity historical data using standard sine/random fluctuations (Geometric Brownian Motion shape)
    let pointsCount = 30;
    let basePrice = 2480; // Defaults
    if (tokenId.includes('usdc') || tokenId.includes('usdt')) {
      basePrice = 1.0;
    } else if (tokenId.includes('link')) {
      basePrice = 18.5;
    }

    if (range === '24H') pointsCount = 24;
    if (range === '1W') pointsCount = 7;
    if (range === '1M') pointsCount = 30;
    if (range === '1Y') pointsCount = 365;

    const data: ChartPoint[] = [];
    const now = Date.now();
    const interval = {
      '24H': 3600 * 1000,
      '1W': 24 * 3600 * 1000,
      '1M': 24 * 3600 * 1000,
      '1Y': 30 * 24 * 3600 * 1000,
    }[range];

    let currentPrice = basePrice;

    for (let i = pointsCount - 1; i >= 0; i--) {
      const time = now - i * interval;
      // Deterministic price drift with slight random volatility
      const noise = (Math.sin(i * 0.5) * 0.05 + Math.cos(i * 0.1) * 0.02) * (basePrice > 10 ? 15 : 0.01);
      const drift = (pointsCount - i) * (basePrice > 10 ? 0.8 : 0.0001);
      const val = Math.max(0.01, parseFloat((currentPrice + noise + drift).toFixed(2)));
      data.push({ timestamp: time, value: val });
    }

    set((state) => ({
      priceCharts: {
        ...state.priceCharts,
        [cacheKey]: data,
      },
    }));

    return data;
  },
}));
export default useTokenStore;
