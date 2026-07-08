export type ChainType = 'evm' | 'solana';

export interface Chain {
  id: string;
  name: string;
  type: ChainType;
  chainId: number | null; // For EVM compatibility (null for Solana)
  symbol: string;
  decimals: number;
  rpcUrls: string[];
  explorerUrl: string;
}

export const SUPPORTED_CHAINS: Chain[] = [
  // ==================== EVM ECOSYSTEM ====================
  {
    id: 'ethereum',
    name: 'Ethereum Mainnet',
    type: 'evm',
    chainId: 1,
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: [
      'https://cloudflare-eth.com',
      'https://rpc.ankr.com/eth',
      'https://eth-mainnet.public.blastapi.io',
    ],
    explorerUrl: 'https://etherscan.io',
  },
  {
    id: 'polygon',
    name: 'Polygon PoS',
    type: 'evm',
    chainId: 137,
    symbol: 'POL', // Previously MATIC
    decimals: 18,
    rpcUrls: [
      'https://polygon-rpc.com',
      'https://rpc-mainnet.maticvigil.com',
      'https://polygon-bor-rpc.publicnode.com',
    ],
    explorerUrl: 'https://polygonscan.com',
  },
  {
    id: 'bsc',
    name: 'BNB Smart Chain',
    type: 'evm',
    chainId: 56,
    symbol: 'BNB',
    decimals: 18,
    rpcUrls: [
      'https://bsc-dataseed.binance.org',
      'https://bsc-dataseed1.defibit.io',
      'https://binance.llamarpc.com',
    ],
    explorerUrl: 'https://bscscan.com',
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum One',
    type: 'evm',
    chainId: 42161,
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: [
      'https://arb1.arbitrum.io/rpc',
      'https://arbitrum-one.publicnode.com',
      'https://arbitrum.llamarpc.com',
    ],
    explorerUrl: 'https://arbiscan.io',
  },
  {
    id: 'optimism',
    name: 'Optimism Mainnet',
    type: 'evm',
    chainId: 10,
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: [
      'https://mainnet.optimism.io',
      'https://optimism-mainnet.publicnode.com',
      'https://optimism.llamarpc.com',
    ],
    explorerUrl: 'https://optimistic.etherscan.io',
  },
  {
    id: 'base',
    name: 'Base Mainnet',
    type: 'evm',
    chainId: 8453,
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: [
      'https://mainnet.base.org',
      'https://base-mainnet.public.blastapi.io',
      'https://base.llamarpc.com',
    ],
    explorerUrl: 'https://basescan.org',
  },
  {
    id: 'avalanche',
    name: 'Avalanche C-Chain',
    type: 'evm',
    chainId: 43114,
    symbol: 'AVAX',
    decimals: 18,
    rpcUrls: [
      'https://api.avax.network/ext/bc/C/rpc',
      'https://avalanche-c-chain.publicnode.com',
    ],
    explorerUrl: 'https://snowtrace.io',
  },
  // ==================== SOLANA ECOSYSTEM ====================
  {
    id: 'solana-mainnet',
    name: 'Solana Mainnet',
    type: 'solana',
    chainId: null,
    symbol: 'SOL',
    decimals: 9,
    rpcUrls: [
      'https://api.mainnet-beta.solana.com',
      'https://solana-mainnet.rpc.extrnode.com',
    ],
    explorerUrl: 'https://solscan.io',
  },
  {
    id: 'solana-devnet',
    name: 'Solana Devnet',
    type: 'solana',
    chainId: null,
    symbol: 'SOL',
    decimals: 9,
    rpcUrls: [
      'https://api.devnet.solana.com',
    ],
    explorerUrl: 'https://solscan.io?cluster=devnet',
  },
];
