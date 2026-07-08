/**
 * Lightweight Dependency Injection Container
 * 
 * In a production Web3 app, you must decouple business logic (Key derivation, RPC calls)
 * from React components. This simple DI registry allows us to swap implementations
 * for testing (e.g., using a MockRpcProvider instead of real network calls).
 */

type ClassType<T = any> = new (...args: any[]) => T;

class DependencyContainer {
  private instances = new Map<string, any>();
  private factories = new Map<string, () => any>();

  // Register a singleton instance
  public registerInstance<T>(key: string, instance: T) {
    this.instances.set(key, instance);
  }

  // Register a factory for lazy instantiation
  public registerFactory<T>(key: string, factory: () => T) {
    this.factories.set(key, factory);
  }

  // Resolve an instance
  public resolve<T>(key: string): T {
    if (this.instances.has(key)) {
      return this.instances.get(key) as T;
    }
    
    if (this.factories.has(key)) {
      const instance = this.factories.get(key)!();
      this.instances.set(key, instance); // Cache as singleton
      return instance as T;
    }

    throw new Error(`[DI Error] Dependency '${key}' not registered.`);
  }

  // Clear all instances (useful for test tear-downs or wallet resets)
  public clear() {
    this.instances.clear();
  }
}

export const DI = new DependencyContainer();

export const DI_KEYS = {
  KEY_DERIVATION_SERVICE: 'KeyDerivationService',
  SECURE_STORAGE: 'SecureStorageService',
  RPC_PROVIDER: 'RpcProviderService',
  WALLET_REPOSITORY: 'WalletRepository',
  SECURITY_REPOSITORY: 'SecurityRepository',
};

// Imports for registration
import { WalletRepositoryImpl } from '../../features/wallet/data/repository/WalletRepositoryImpl';
import { SecurityRepositoryImpl } from '../../features/security/data/repository/SecurityRepositoryImpl';

// Register singletons
DI.registerInstance(DI_KEYS.WALLET_REPOSITORY, new WalletRepositoryImpl());
DI.registerInstance(DI_KEYS.SECURITY_REPOSITORY, new SecurityRepositoryImpl());
