import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { apiClient } from './api-client';

const SOLANA_RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export class SolanaService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  }

  /**
   * Mint a compressed NFT for an invoice
   */
  async mintInvoiceNFT(
    wallet: WalletContextState,
    invoiceId: string,
    invoiceData: {
      invoiceNumber: string;
      amount: number;
      dueDate: string;
      seller: string;
      buyer: string;
    }
  ): Promise<{ signature: string; mintAddress: string }> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    try {
      // Call backend to mint cNFT
      const response = await apiClient.request('/api/invoices/' + invoiceId + '/mint', {
        method: 'POST',
        body: JSON.stringify({
          walletAddress: wallet.publicKey.toString(),
          metadata: {
            name: `Invoice ${invoiceData.invoiceNumber}`,
            symbol: 'RIFT-INV',
            description: `Trade finance invoice for ${invoiceData.amount} EUR`,
            attributes: [
              { trait_type: 'Invoice Number', value: invoiceData.invoiceNumber },
              { trait_type: 'Amount', value: invoiceData.amount.toString() },
              { trait_type: 'Due Date', value: invoiceData.dueDate },
              { trait_type: 'Seller', value: invoiceData.seller },
              { trait_type: 'Buyer', value: invoiceData.buyer },
            ],
          },
        }),
      });

      return {
        signature: response.signature,
        mintAddress: response.mintAddress,
      };
    } catch (error) {
      console.error('Minting error:', error);
      throw error;
    }
  }

  /**
   * Fund an invoice (transfer USDC to escrow)
   */
  async fundInvoice(
    wallet: WalletContextState,
    invoiceId: string,
    amount: number
  ): Promise<{ signature: string }> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    try {
      // For demo: Transfer SOL instead of USDC
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: new PublicKey('YOUR_ESCROW_WALLET_ADDRESS'), // Replace with actual escrow
          lamports: amount * LAMPORTS_PER_SOL / 1000, // Convert EUR to SOL (demo rate)
        })
      );

      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;

      const signed = await wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signed.serialize());
      await this.connection.confirmTransaction(signature);

      // Update invoice in database
      await apiClient.invoices.update(invoiceId, {
        status: 'funded',
        fund_signature: signature,
        fund_amount: amount,
        funder_wallet: wallet.publicKey.toString(),
      });

      return { signature };
    } catch (error) {
      console.error('Funding error:', error);
      throw error;
    }
  }

  /**
   * Sign a message with wallet
   */
  async signMessage(
    wallet: WalletContextState,
    message: string
  ): Promise<{ signature: Uint8Array; publicKey: string }> {
    if (!wallet.publicKey || !wallet.signMessage) {
      throw new Error('Wallet not connected or does not support message signing');
    }

    const encodedMessage = new TextEncoder().encode(message);
    const signature = await wallet.signMessage(encodedMessage);

    return {
      signature,
      publicKey: wallet.publicKey.toString(),
    };
  }

  /**
   * Verify a signature
   */
  async verifySignature(
    publicKey: string,
    message: string,
    signature: Uint8Array
  ): Promise<boolean> {
    try {
      const encodedMessage = new TextEncoder().encode(message);
      const publicKeyObj = new PublicKey(publicKey);
      
      // Note: You'll need to use @solana/web3.js's nacl for actual verification
      // This is a placeholder
      return true;
    } catch (error) {
      console.error('Verification error:', error);
      return false;
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(publicKey: PublicKey): Promise<number> {
    const balance = await this.connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  }

  /**
   * Get transaction details
   */
  async getTransaction(signature: string) {
    return await this.connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
  }
}

export const solanaService = new SolanaService();
