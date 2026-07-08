import {
  PublicKey,
  StakeProgram,
  Authorized,
  Lockup,
  Keypair,
  Transaction,
} from '@solana/web3.js';
import { Buffer } from 'buffer';
import { Chain } from '../../network/config/chains';
import { NetworkConnection } from '../../network/services/NetworkConnection';

export interface Validator {
  address: string;
  name: string;
  commission: number; // Percentage (e.g. 5)
  apy: number; // Percentage (e.g. 7.2)
  status: 'active' | 'inactive';
}

export class StakingService {
  /**
   * Fetch active validators available for native staking delegation.
   */
  public static async fetchValidators(chain: Chain): Promise<Validator[]> {
    if (chain.type === 'solana') {
      return [
        {
          address: 'Val1ndSol9X49Q5vK6f1S4s4D8s7F6g1D9jK2l3m4n5',
          name: 'Solana Foundation Validator',
          commission: 8,
          apy: 6.8,
          status: 'active',
        },
        {
          address: 'Val2ndSol9X49Q5vK6f1S4s4D8s7F6g1D9jK2l3m4n5',
          name: 'Chorus One Validator',
          commission: 5,
          apy: 7.1,
          status: 'active',
        },
      ];
    } else {
      return [
        {
          address: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84', // Lido stETH
          name: 'Lido Liquid Staking',
          commission: 10,
          apy: 3.4,
          status: 'active',
        },
      ];
    }
  }

  /**
   * Delegate native funds to a validator (Solana native delegation or EVM Lido deposit).
   */
  public static async delegateStake(
    privateKeyHex: string,
    validatorAddress: string,
    amount: string,
    chain: Chain
  ): Promise<string> {
    if (chain.type === 'solana') {
      const connection = await NetworkConnection.getSolanaConnection(chain);
      const rawKey = privateKeyHex.startsWith('0x') ? privateKeyHex.slice(2) : privateKeyHex;
      const seed = Buffer.from(rawKey, 'hex');
      
      const keypair = Keypair.fromSeed(Uint8Array.from(seed));
      const senderPubKey = keypair.publicKey;
      const validatorPubKey = new PublicKey(validatorAddress);

      // 1. Generate a new ephemeral keypair for the Stake Account
      const stakeAccount = Keypair.generate();
      const lamports = Math.round(parseFloat(amount) * 1e9);

      // Derive transaction to create and delegate stake account
      const transaction = StakeProgram.createAccount({
        fromPubkey: senderPubKey,
        stakePubkey: stakeAccount.publicKey,
        authorized: new Authorized(senderPubKey, senderPubKey),
        lockup: new Lockup(0, 0, senderPubKey),
        lamports,
      });

      // Append delegation instruction
      const delegateInstruction = StakeProgram.delegate({
        stakePubkey: stakeAccount.publicKey,
        authorizedPubkey: senderPubKey,
        votePubkey: validatorPubKey,
      });

      transaction.add(delegateInstruction);

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = senderPubKey;

      transaction.sign(keypair, stakeAccount);

      const signature = await connection.sendRawTransaction(transaction.serialize());
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      return signature;
    } else {
      // EVM Lido staking deposit (simulated)
      return new Promise((resolve) => {
        setTimeout(() => {
          const hash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
          resolve(hash);
        }, 1800);
      });
    }
  }
}
export default StakingService;
