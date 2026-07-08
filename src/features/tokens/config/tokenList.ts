export interface Token {
  id: string;
  chainId: string; // References chain id (e.g., 'ethereum', 'polygon', 'solana-mainnet')
  address: string; // Contract address for ERC20, Mint address for Solana SPL (use 'native' for native coins)
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
}

export const CURATED_TOKENS: Record<string, Token[]> = {
  ethereum: [
    {
      id: 'eth-usdc',
      chainId: 'ethereum',
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC on Mainnet
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
    {
      id: 'eth-usdt',
      chainId: 'ethereum',
      address: '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT on Mainnet
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
    },
    {
      id: 'eth-link',
      chainId: 'ethereum',
      address: '0x514910771af9ca656af840dff83e8264ecf986ca', // LINK on Mainnet
      symbol: 'LINK',
      name: 'Chainlink',
      decimals: 18,
    },
  ],
  polygon: [
    {
      id: 'poly-usdc',
      chainId: 'polygon',
      address: '0x3c499c542cEF5e3811e1192ce70d8cC03d5c3359', // USDC on Polygon
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
    {
      id: 'poly-usdt',
      chainId: 'polygon',
      address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // USDT on Polygon
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
    },
  ],
  base: [
    {
      id: 'base-usdc',
      chainId: 'base',
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
  ],
  'solana-mainnet': [
    {
      id: 'sol-usdc',
      chainId: 'solana-mainnet',
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC on Solana
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
    {
      id: 'sol-usdt',
      chainId: 'solana-mainnet',
      address: 'Es9vMFrzaSVjJ4t6V281MFTeeA7XXvD79Gx8fvBi6f6c', // USDT on Solana
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
    },
  ],
};
export default CURATED_TOKENS;
