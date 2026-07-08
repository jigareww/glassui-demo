import { JsonRpcProvider } from 'ethers';
import { Connection } from '@solana/web3.js';
import { Chain } from '../config/chains';
import { RpcRouterService } from './RpcRouterService';

export class NetworkConnection {
  private static cachedEvmProvider: { rpcUrl: string; provider: JsonRpcProvider } | null = null;
  private static cachedSolConnection: { rpcUrl: string; connection: Connection } | null = null;

  /**
   * Get an Ethers JSON-RPC Provider for the selected EVM chain.
   * Caches the provider instance and only creates a new one if the RPC rotates.
   */
  public static async getEVMProvider(chain: Chain): Promise<JsonRpcProvider> {
    if (chain.type !== 'evm') {
      throw new Error(`[NetworkConnection] Cannot get EVM provider for Solana chain: ${chain.id}`);
    }

    const rpcUrl = await RpcRouterService.getActiveRpc(chain);

    if (this.cachedEvmProvider && this.cachedEvmProvider.rpcUrl === rpcUrl) {
      return this.cachedEvmProvider.provider;
    }

    // Initialize new provider instance
    // We pass staticNetwork configuration to prevent checking network on every request (speeds up mobile execution)
    const chainIdNumber = Number(chain.chainId);
    const provider = new JsonRpcProvider(rpcUrl, chainIdNumber, {
      staticNetwork: true,
    });

    this.cachedEvmProvider = { rpcUrl, provider };
    console.info(`[NetworkConnection] Initialized new EVM JsonRpcProvider for ${chain.id} at ${rpcUrl}`);
    return provider;
  }

  /**
   * Get a Solana Connection object for the selected Solana chain.
   * Caches the Connection instance.
   */
  public static async getSolanaConnection(chain: Chain): Promise<Connection> {
    if (chain.type !== 'solana') {
      throw new Error(`[NetworkConnection] Cannot get Solana Connection for EVM chain: ${chain.id}`);
    }

    const rpcUrl = await RpcRouterService.getActiveRpc(chain);

    if (this.cachedSolConnection && this.cachedSolConnection.rpcUrl === rpcUrl) {
      return this.cachedSolConnection.connection;
    }

    // Configure connection with standard 15-second RPC timeout
    const connection = new Connection(rpcUrl, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 15000,
    });

    this.cachedSolConnection = { rpcUrl, connection };
    console.info(`[NetworkConnection] Initialized new Solana Connection for ${chain.id} at ${rpcUrl}`);
    return connection;
  }

  /**
   * Reset provider caches (useful on network toggle or connection reset).
   */
  public static resetCachedConnections(): void {
    this.cachedEvmProvider = null;
    this.cachedSolConnection = null;
    RpcRouterService.clearCache();
    console.log('[NetworkConnection] Connections caches cleared.');
  }
}
export default NetworkConnection;
