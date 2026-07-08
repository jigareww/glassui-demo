import { Chain, SUPPORTED_CHAINS } from '../config/chains';

interface RpcHealth {
  url: string;
  latency: number;
  isHealthy: boolean;
}

export class RpcRouterService {
  private static healthyEndpointsCache: Record<string, string[]> = {};
  private static activeRpcCache: Record<string, string> = {};

  /**
   * Run health checks and find the fastest RPC endpoint for a chain.
   */
  public static async determineFastestRpc(chain: Chain): Promise<string> {
    const pings = chain.rpcUrls.map(async (url): Promise<RpcHealth> => {
      const start = Date.now();
      try {
        const payload =
          chain.type === 'evm'
            ? { jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 }
            : { jsonrpc: '2.0', method: 'getHealth', params: [], id: 1 };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout for healthcheck

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const resBody = await response.json();
          // Check if response has standard JSON-RPC error
          if (resBody.error) {
            return { url, latency: Infinity, isHealthy: false };
          }
          return { url, latency: Date.now() - start, isHealthy: true };
        }
      } catch (e) {
        // Fall through to unhealthy
      }
      return { url, latency: Infinity, isHealthy: false };
    });

    const results = await Promise.all(pings);
    const healthy = results
      .filter((r) => r.isHealthy)
      .sort((a, b) => a.latency - b.latency);

    if (healthy.length > 0) {
      this.healthyEndpointsCache[chain.id] = healthy.map((h) => h.url);
      this.activeRpcCache[chain.id] = healthy[0].url;
      console.log(`[RpcRouter] Fastest RPC for ${chain.id}: ${healthy[0].url} (${healthy[0].latency}ms)`);
      return healthy[0].url;
    }

    // Default Fallback to first configured url if all checks fail
    console.warn(`[RpcRouter] All healthchecks failed for ${chain.id}. Falling back to default URL.`);
    this.activeRpcCache[chain.id] = chain.rpcUrls[0];
    return chain.rpcUrls[0];
  }

  /**
   * Get the current active RPC endpoint for a chain, or discover a new one if not cached.
   */
  public static async getActiveRpc(chain: Chain): Promise<string> {
    if (this.activeRpcCache[chain.id]) {
      return this.activeRpcCache[chain.id];
    }
    return this.determineFastestRpc(chain);
  }

  /**
   * Execute an RPC transaction/call with automated failover handling.
   * If the primary connection throws a network failure, the router rotates
   * to the next sorted endpoint and retries the action.
   */
  public static async executeWithFailover<T>(
    chain: Chain,
    action: (rpcUrl: string) => Promise<T>
  ): Promise<T> {
    let currentRpc = await this.getActiveRpc(chain);
    
    // Get list of fallback candidate endpoints
    const candidates = this.healthyEndpointsCache[chain.id] || [...chain.rpcUrls];
    // Move current RPC to the front of candidate queue
    const queue = [currentRpc, ...candidates.filter((url) => url !== currentRpc)];

    let lastError: any = null;

    for (const rpcUrl of queue) {
      try {
        const result = await action(rpcUrl);
        // Successful call! Update cached active RPC if we recovered using a fallback
        if (rpcUrl !== currentRpc) {
          this.activeRpcCache[chain.id] = rpcUrl;
          console.info(`[RpcRouter] Flipped active RPC for ${chain.id} to healthy fallback: ${rpcUrl}`);
        }
        return result;
      } catch (error) {
        console.warn(`[RpcRouter] Failure on RPC endpoint: ${rpcUrl}. Retrying next...`);
        lastError = error;
      }
    }

    // If we exhausted all endpoints, check health again to update cache
    this.determineFastestRpc(chain).catch(() => {});
    
    throw new Error(
      `[RpcRouter] All RPC endpoints for ${chain.id} failed. Last error: ${
        lastError?.message || lastError
      }`
    );
  }

  /**
   * Force cache reset and rerun latency checks.
   */
  public static clearCache(): void {
    this.healthyEndpointsCache = {};
    this.activeRpcCache = {};
  }
}
export default RpcRouterService;
