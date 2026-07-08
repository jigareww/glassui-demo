import {
  Wallet,
  Contract,
  parseUnits,
  formatUnits,
  toBeHex,
} from 'ethers';
import {
  PublicKey,
  Transaction,
  SystemProgram,
  TransactionInstruction,
  Keypair,
} from '@solana/web3.js';
import { Buffer } from 'buffer';
import { Chain } from '../../network/config/chains';
import { NetworkConnection } from '../../network/services/NetworkConnection';

const ERC20_TRANSFER_ABI = [
  'function transfer(address to, uint256 value) returns (bool)',
  'function decimals() view returns (uint8)',
];

const SOLANA_TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const SOLANA_ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

export class TransferService {
  /**
   * Estimate EVM transaction fee.
   */
  public static async estimateEVMGasFee(
    from: string,
    to: string,
    amount: string,
    tokenAddress: string | null,
    chain: Chain
  ): Promise<{ gasLimit: string; gasPrice: string; totalFee: string }> {
    const provider = await NetworkConnection.getEVMProvider(chain);

    try {
      let gasLimit = 21000n; // Standard transfer gas limit
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || feeData.maxFeePerGas || 30000000000n;

      if (tokenAddress && tokenAddress !== 'native') {
        const contract = new Contract(tokenAddress, ERC20_TRANSFER_ABI, provider);
        // Estimate token transfer gas
        const decimals = await contract.decimals();
        const parsedAmount = parseUnits(amount, decimals);
        gasLimit = await contract.transfer.estimateGas(to, parsedAmount, { from });
      } else {
        // Native coin transfer gas estimation
        const parsedAmount = parseUnits(amount, chain.decimals);
        gasLimit = await provider.estimateGas({
          from,
          to,
          value: parsedAmount,
        });
      }

      const totalFee = gasLimit * gasPrice;

      return {
        gasLimit: gasLimit.toString(),
        gasPrice: gasPrice.toString(),
        totalFee: formatUnits(totalFee, 18), // standard EVM chains use 18 decimals for fee calculation
      };
    } catch (e: any) {
      console.warn('[TransferService] EVM fee estimation failed:', e);
      return {
        gasLimit: '21000',
        gasPrice: '30000000000',
        totalFee: '0.00063',
      };
    }
  }

  /**
   * Estimate Solana transaction fee.
   */
  public static async estimateSolanaFee(
    from: string,
    to: string,
    amount: string,
    tokenAddress: string | null,
    chain: Chain
  ): Promise<{ totalFee: string }> {
    // Solana has static fee of 5000 lamports for most transactions, plus ATA creation fee if recipient ATA is missing
    const connection = await NetworkConnection.getSolanaConnection(chain);
    try {
      let totalLamports = 5000;
      
      if (tokenAddress && tokenAddress !== 'native') {
        const recipientPubKey = new PublicKey(to);
        const mintPubKey = new PublicKey(tokenAddress);
        const recipientATA = this.findAssociatedTokenAddress(recipientPubKey, mintPubKey);

        // Check if recipient ATA exists on chain
        const info = await connection.getAccountInfo(recipientATA);
        if (!info) {
          // If ATA is missing, recipient needs rent-exemption fee (~2,039,280 lamports)
          const rentExemptBalance = await connection.getMinimumBalanceForRentExemption(165);
          totalLamports += rentExemptBalance;
        }
      }

      return {
        totalFee: (totalLamports / 1e9).toString(),
      };
    } catch (e) {
      return { totalFee: '0.000005' };
    }
  }

  /**
   * Execute EVM Native or ERC20 Transfer.
   */
  public static async executeEVMTransfer(
    privateKey: string,
    to: string,
    amount: string,
    tokenAddress: string | null,
    chain: Chain
  ): Promise<string> {
    const provider = await NetworkConnection.getEVMProvider(chain);
    const wallet = new Wallet(privateKey, provider);

    if (tokenAddress && tokenAddress !== 'native') {
      const contract = new Contract(tokenAddress, ERC20_TRANSFER_ABI, wallet);
      const decimals = await contract.decimals();
      const parsedAmount = parseUnits(amount, decimals);
      const tx = await contract.transfer(to, parsedAmount);
      return tx.hash;
    } else {
      const parsedAmount = parseUnits(amount, chain.decimals);
      const tx = await wallet.sendTransaction({
        to,
        value: parsedAmount,
      });
      return tx.hash;
    }
  }

  /**
   * Execute Solana Native (SOL) or SPL Token Transfer.
   */
  public static async executeSolanaTransfer(
    privateKeyHex: string,
    to: string,
    amount: string,
    tokenAddress: string | null,
    chain: Chain
  ): Promise<string> {
    const connection = await NetworkConnection.getSolanaConnection(chain);
    const rawKey = privateKeyHex.startsWith('0x') ? privateKeyHex.slice(2) : privateKeyHex;
    const seed = Buffer.from(rawKey, 'hex');
    const keypair = Keypair.fromSeed(Uint8Array.from(seed));
    
    const senderPubKey = keypair.publicKey;
    const recipientPubKey = new PublicKey(to);
    const transaction = new Transaction();

    if (tokenAddress && tokenAddress !== 'native') {
      const mintPubKey = new PublicKey(tokenAddress);
      
      const senderATA = this.findAssociatedTokenAddress(senderPubKey, mintPubKey);
      const recipientATA = this.findAssociatedTokenAddress(recipientPubKey, mintPubKey);

      // Check if receiver ATA exists
      const receiverAtaInfo = await connection.getAccountInfo(recipientATA);
      if (!receiverAtaInfo) {
        // Append creation instruction for ATA
        transaction.add(
          this.createAssociatedTokenAccountInstruction(
            senderPubKey,
            recipientATA,
            recipientPubKey,
            mintPubKey
          )
        );
      }

      // Convert amount based on decimals (hardcoded default 6 decimals for curated SPL tokens)
      const parsedAmount = Math.round(parseFloat(amount) * 1e6);
      transaction.add(
        this.createSplTransferInstruction(
          senderATA,
          recipientATA,
          senderPubKey,
          parsedAmount
        )
      );
    } else {
      // Standard SOL transfer
      const lamports = Math.round(parseFloat(amount) * 1e9);
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: senderPubKey,
          toPubkey: recipientPubKey,
          lamports,
        })
      );
    }

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderPubKey;

    transaction.sign(keypair);
    
    const signature = await connection.sendRawTransaction(transaction.serialize());
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });

    return signature;
  }

  /**
   * Helper to derive Associated Token Account (ATA) address on Solana.
   */
  private static findAssociatedTokenAddress(walletAddress: PublicKey, tokenMintAddress: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [
        walletAddress.toBuffer(),
        SOLANA_TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
      ],
      SOLANA_ASSOCIATED_TOKEN_PROGRAM_ID
    )[0];
  }

  /**
   * Manually craft Solana Associated Token Account creation instruction.
   */
  private static createAssociatedTokenAccountInstruction(
    payer: PublicKey,
    associatedTokenAddress: PublicKey,
    walletAddress: PublicKey,
    tokenMintAddress: PublicKey
  ): TransactionInstruction {
    const keys = [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
      { pubkey: walletAddress, isSigner: false, isWritable: false },
      { pubkey: tokenMintAddress, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SOLANA_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ];

    return new TransactionInstruction({
      keys,
      programId: SOLANA_ASSOCIATED_TOKEN_PROGRAM_ID,
      data: Buffer.alloc(0),
    });
  }

  /**
   * Manually craft Solana SPL Token Transfer instruction.
   */
  private static createSplTransferInstruction(
    source: PublicKey,
    destination: PublicKey,
    owner: PublicKey,
    amount: number
  ): TransactionInstruction {
    const keys = [
      { pubkey: source, isSigner: false, isWritable: true },
      { pubkey: destination, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ];

    // Layout of SPL Transfer: 1 byte instruction code (3), 8 bytes amount (uint64)
    const data = Buffer.alloc(9);
    data.writeUInt8(3, 0); // 3 = Transfer index
    // Write 64-bit amount (write double-word for low 32-bits, high 32-bits zero since number is small)
    data.writeUInt32LE(amount, 1);
    data.writeUInt32LE(0, 5);

    return new TransactionInstruction({
      keys,
      programId: SOLANA_TOKEN_PROGRAM_ID,
      data,
    });
  }
}
export default TransferService;
