/**
 * Anchor Connector - Abstracts SIM vs on-chain Anchor program interactions
 * 
 * In SIM mode (no ANCHOR_PROGRAM_ID): returns mock txSig, logs activity
 * In Anchor mode: submits real transactions via relayer
 */

export interface AllocateParams {
  poolTenor: number;
  funderPubkey: string;
  amount: number;
}

export interface RedeemParams {
  positionId: string;
}

export interface PoolAccount {
  tenor: number;
  tvl: number;
  availableLiquidity: number;
}

class AnchorConnector {
  private mode: 'SIM' | 'ANCHOR';
  private programId?: string;
  private idl?: any;
  private rpcUrl: string;

  constructor() {
    // In browser context, these would come from env or config
    this.mode = 'SIM'; // Default to SIM mode
    this.rpcUrl = 'https://api.devnet.solana.com';
    
    console.log(`[AnchorConnector] Initialized in ${this.mode} mode`);
  }

  /**
   * Allocate funds to a pool
   */
  async allocate(params: AllocateParams): Promise<{ txSig: string; mode: string }> {
    if (this.mode === 'SIM') {
      // Generate deterministic mock signature
      const mockSig = this.generateMockTxSig('allocate', params.poolTenor, params.amount);
      console.log(`[AnchorConnector SIM] Allocate ${params.amount} to ${params.poolTenor}d pool`, { mockSig });
      
      return { txSig: mockSig, mode: 'SIM' };
    }

    // TODO: Anchor mode implementation
    // Would call through relayer: POST /api/relayer/submit
    throw new Error('Anchor mode not yet implemented');
  }

  /**
   * Redeem a position
   */
  async redeem(params: RedeemParams): Promise<{ txSig: string; mode: string }> {
    if (this.mode === 'SIM') {
      const mockSig = this.generateMockTxSig('redeem', params.positionId);
      console.log(`[AnchorConnector SIM] Redeem position ${params.positionId}`, { mockSig });
      
      return { txSig: mockSig, mode: 'SIM' };
    }

    // TODO: Anchor mode implementation
    throw new Error('Anchor mode not yet implemented');
  }

  /**
   * Get pool accounts (for verification/monitoring)
   */
  async getPoolAccounts(): Promise<PoolAccount[]> {
    if (this.mode === 'SIM') {
      console.log('[AnchorConnector SIM] getPoolAccounts - returning empty (use DB instead)');
      return [];
    }

    // TODO: Anchor mode implementation
    throw new Error('Anchor mode not yet implemented');
  }

  /**
   * Generate deterministic mock transaction signature
   */
  private generateMockTxSig(...parts: any[]): string {
    const seed = parts.join('-');
    const hash = this.simpleHash(seed + Date.now());
    return `SIM${hash.substring(0, 60)}`;
  }

  /**
   * Simple hash function for mock signatures
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).padStart(10, '0');
  }
}

export const anchorConnector = new AnchorConnector();
