import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
// @ts-ignore
import { wordlist } from '@scure/bip39/wordlists/english';
import { HDNodeWallet, Mnemonic, Wallet, getBytes, computeHmac } from 'ethers';
import { Keypair } from '@solana/web3.js';
import { Buffer } from 'buffer';

export interface DerivedKeys {
  evmPrivateKey: string;
  evmAddress: string;
  solanaPrivateKey: string; // Base58 encoded secret key
  solanaAddress: string;
}

export class KeyDerivationService {
  /**
   * Generate a secure 12-word BIP-39 mnemonic phrase.
   */
  public static generateMnemonic(): string {
    // 128 bits of entropy = 12 words
    return generateMnemonic(wordlist, 128);
  }

  /**
   * Validate a BIP-39 mnemonic phrase.
   */
  public static validateMnemonic(mnemonic: string): boolean {
    return validateMnemonic(mnemonic.trim(), wordlist);
  }

  /**
   * Derive EVM and Solana keypairs for a given mnemonic and account index.
   * Path configurations:
   * - EVM: m/44'/60'/0'/0/{index}
   * - Solana: m/44'/501'/{index}'/0' (Phantom standard)
   */
  public static deriveKeysFromMnemonic(mnemonic: string, index: number): DerivedKeys {
    const trimmedMnemonic = mnemonic.trim().toLowerCase();
    if (!this.validateMnemonic(trimmedMnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }

    // 1. Derive EVM Address and Private Key (secp256k1)
    const evmDerivationPath = `m/44'/60'/0'/0/${index}`;
    const ethersMnemonic = Mnemonic.fromPhrase(trimmedMnemonic);
    const evmNode = HDNodeWallet.fromMnemonic(ethersMnemonic, evmDerivationPath);

    // 2. Derive Solana Address and Private Key (ed25519 via SLIP-0010)
    const seed = mnemonicToSeedSync(trimmedMnemonic);
    const solanaSeed = this.deriveSolanaSeed(seed, index);
    const solanaKeypair = Keypair.fromSeed(solanaSeed);

    return {
      evmPrivateKey: evmNode.privateKey,
      evmAddress: evmNode.address,
      solanaPrivateKey: Buffer.from(solanaKeypair.secretKey).toString('hex'), // Or base58
      solanaAddress: solanaKeypair.publicKey.toBase58(),
    };
  }

  /**
   * SLIP-0010 Derivation algorithm for Solana (ed25519)
   * Phantom/Solana path: m/44'/501'/index'/0'
   */
  private static deriveSolanaSeed(seed: Uint8Array, index: number): Uint8Array {
    // Initialize Master Node
    const ED25519_KEY = Buffer.from('ed25519 seed', 'utf-8');
    let I = getBytes(computeHmac('sha512', ED25519_KEY, seed));
    let IL = I.slice(0, 32);
    let IR = I.slice(32, 64);

    // Derivation segments: 44', 501', index', 0'
    // Hardened indices have 0x80000000 added
    const path = [44, 501, index, 0];

    for (let i = 0; i < path.length; i++) {
      const childIndex = path[i] + 0x80000000;
      const buffer = Buffer.alloc(37);
      buffer.writeUInt8(0, 0);
      Buffer.from(IL).copy(buffer, 1);
      buffer.writeUInt32BE(childIndex, 33);

      I = getBytes(computeHmac('sha512', IR, buffer));
      IL = I.slice(0, 32);
      IR = I.slice(32, 64);
    }

    return IL;
  }

  /**
   * Direct derivation from an EVM private key.
   */
  public static deriveEVMAddressFromPrivateKey(privateKey: string): string {
    const cleanKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    const wallet = new Wallet(cleanKey);
    return wallet.address;
  }

  /**
   * Direct derivation from a Solana private key (hex format).
   */
  public static deriveSolanaAddressFromPrivateKey(privateKey: string): string {
    const rawKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    const bytes = Uint8Array.from(Buffer.from(rawKey, 'hex'));
    if (bytes.length === 32) {
      const keypair = Keypair.fromSeed(bytes);
      return keypair.publicKey.toBase58();
    } else if (bytes.length === 64) {
      const keypair = Keypair.fromSecretKey(bytes);
      return keypair.publicKey.toBase58();
    } else {
      throw new Error('Invalid Solana private key length (must be 32 or 64 bytes)');
    }
  }
}
export default KeyDerivationService;
