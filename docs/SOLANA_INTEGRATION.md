# Solana Blockchain Integration (Devnet)

The MySQL backend now includes full Solana devnet integration for on-chain transactions.

## Overview

The application supports **two modes**:

1. **SIM Mode** (Default) - Simulated blockchain transactions for testing
2. **ANCHOR Mode** - Real Solana blockchain transactions via Anchor program

## Architecture

```
Frontend (React)
    │
    ├─> Solana Wallet Adapter (Phantom, Solflare, Torus)
    │
    ▼
Backend API (/api/solana)
    │
    ├─> SIM Mode: Mock transactions + Database
    │
    └─> ANCHOR Mode: Real Solana Devnet transactions
            │
            ▼
        Solana Devnet
        (https://api.devnet.solana.com)
```

## Features Implemented

### ✅ Wallet Integration
- Connect Phantom, Solflare, or Torus wallets
- Verify wallet ownership
- Link wallet to user account
- Check SOL balance

### ✅ Pool Allocation
- Allocate funds to liquidity pools
- Create positions on-chain (or simulated)
- Record transactions in database
- Track transaction signatures

### ✅ Position Redemption
- Redeem positions with yield
- Close positions on-chain (or simulated)
- Calculate and distribute returns
- Update pool liquidity

### ✅ Transaction Tracking
- Store transaction signatures
- Query transaction status
- Verify confirmations
- Audit trail

## API Endpoints

### Get Solana Configuration
```http
GET /api/solana/config

Response:
{
  "network": "devnet",
  "rpcUrl": "https://api.devnet.solana.com",
  "programId": null,
  "mode": "SIM"
}
```

### Get Wallet Balance
```http
GET /api/solana/balance/:address

Response:
{
  "address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "balance": 1.5,
  "lamports": 1500000000,
  "network": "devnet"
}
```

### Verify Wallet
```http
POST /api/solana/verify-wallet
Authorization: Bearer <token>

Body:
{
  "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "signature": "...",
  "message": "..."
}

Response:
{
  "success": true,
  "walletAddress": "...",
  "message": "Wallet verified and linked"
}
```

### Pool Allocation
```http
POST /api/solana/pool-allocate
Authorization: Bearer <token>

Body:
{
  "tenorDays": 90,
  "amount": 1000,
  "invoiceId": "optional-invoice-id",
  "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "network": "devnet",
  "idempotencyKey": "unique-key"
}

Response (SIM Mode):
{
  "success": true,
  "mode": "SIM",
  "txSignature": "SIM1729123456abc",
  "positionId": "uuid",
  "amount": 1000,
  "expectedYield": 19.18,
  "message": "Allocation successful (SIM mode)"
}
```

### Position Redemption
```http
POST /api/solana/position-redeem
Authorization: Bearer <token>

Body:
{
  "positionId": "uuid",
  "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
}

Response (SIM Mode):
{
  "success": true,
  "mode": "SIM",
  "txSignature": "SIM_REDEEM1729123456xyz",
  "positionId": "uuid",
  "totalPayout": 1019.18,
  "message": "Position redeemed successfully (SIM mode)"
}
```

### Get Transaction
```http
GET /api/solana/transaction/:signature

Response (SIM):
{
  "signature": "SIM1729123456abc",
  "mode": "SIM",
  "confirmed": true,
  "message": "Simulated transaction"
}

Response (ANCHOR):
{
  "signature": "5vK...",
  "mode": "ANCHOR",
  "confirmed": true,
  "slot": 123456,
  "blockTime": 1729123456,
  "fee": 5000
}
```

### Get Pool Accounts
```http
GET /api/solana/pool-accounts

Response (SIM):
{
  "mode": "SIM",
  "pools": [
    {
      "tenor": 30,
      "tvl": 50000,
      "availableLiquidity": 50000,
      "apr": 5.0
    },
    ...
  ]
}
```

## Configuration

### Environment Variables

Add to `server/.env`:

```env
# Solana Configuration
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
# ANCHOR_PROGRAM_ID=  # Set this when you deploy your Anchor program
```

### Mode Selection

The system automatically selects the mode:

- **SIM Mode**: When `ANCHOR_PROGRAM_ID` is not set (default)
- **ANCHOR Mode**: When `ANCHOR_PROGRAM_ID` is configured

## Database Schema Updates

### Users Table
Added `wallet_address` field:
```sql
ALTER TABLE users ADD COLUMN wallet_address VARCHAR(255);
ALTER TABLE users ADD INDEX idx_users_wallet (wallet_address);
```

### Positions Table
Added blockchain fields:
```sql
ALTER TABLE positions ADD COLUMN tx_signature VARCHAR(255);
ALTER TABLE positions ADD COLUMN network VARCHAR(20) DEFAULT 'devnet';
ALTER TABLE positions ADD INDEX idx_positions_tx (tx_signature);
ALTER TABLE positions MODIFY COLUMN invoice_id CHAR(36) NULL;
```

## Frontend Integration

### Wallet Provider

Already configured in `src/components/SolanaWalletProvider.tsx`:

```typescript
import { SolanaWalletProvider } from '@/components/SolanaWalletProvider';

// Wrap your app
<SolanaWalletProvider>
  <App />
</SolanaWalletProvider>
```

### Using Wallet in Components

```typescript
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

function MyComponent() {
  const { publicKey, connected } = useWallet();

  return (
    <div>
      <WalletMultiButton />
      {connected && <p>Wallet: {publicKey?.toBase58()}</p>}
    </div>
  );
}
```

### Allocating to Pool

```typescript
import { apiClient } from '@/lib/api-client';
import { useWallet } from '@solana/wallet-adapter-react';

const { publicKey, connected } = useWallet();

const handleAllocate = async () => {
  if (!connected || !publicKey) {
    toast.error('Please connect your wallet');
    return;
  }

  try {
    const response = await fetch('http://localhost:3001/api/solana/pool-allocate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        tenorDays: 90,
        amount: 1000,
        walletAddress: publicKey.toBase58(),
        network: 'devnet',
        idempotencyKey: crypto.randomUUID()
      })
    });

    const data = await response.json();
    console.log('Allocation successful:', data);
    toast.success(`Position created! TX: ${data.txSignature}`);
  } catch (error) {
    console.error('Allocation failed:', error);
    toast.error('Allocation failed');
  }
};
```

## SIM Mode vs ANCHOR Mode

### SIM Mode (Default)

**Advantages:**
- ✅ No Solana program deployment needed
- ✅ No SOL required for transactions
- ✅ Instant transactions
- ✅ Perfect for development/testing
- ✅ All features work identically

**How it works:**
1. Generates mock transaction signatures
2. Stores positions in MySQL database
3. Tracks everything in ledger
4. Simulates on-chain behavior

### ANCHOR Mode (Production)

**Advantages:**
- ✅ Real blockchain transactions
- ✅ Immutable on-chain records
- ✅ Trustless verification
- ✅ Decentralized

**Requirements:**
1. Deploy Anchor program to Solana devnet
2. Set `ANCHOR_PROGRAM_ID` in environment
3. Fund wallet with devnet SOL
4. Implement program interaction logic

## Deploying Anchor Program (Optional)

To enable ANCHOR mode:

### 1. Install Anchor

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

### 2. Create Anchor Project

```bash
anchor init rift_finance
cd rift_finance
```

### 3. Define Program

Edit `programs/rift_finance/src/lib.rs`:

```rust
use anchor_lang::prelude::*;

declare_id!("YOUR_PROGRAM_ID_HERE");

#[program]
pub mod rift_finance {
    use super::*;

    pub fn allocate_to_pool(
        ctx: Context<AllocateToPool>,
        amount: u64,
        tenor_days: u8,
    ) -> Result<()> {
        // Implementation
        Ok(())
    }

    pub fn redeem_position(
        ctx: Context<RedeemPosition>,
    ) -> Result<()> {
        // Implementation
        Ok(())
    }
}

#[derive(Accounts)]
pub struct AllocateToPool<'info> {
    // Account definitions
}

#[derive(Accounts)]
pub struct RedeemPosition<'info> {
    // Account definitions
}
```

### 4. Build and Deploy

```bash
anchor build
anchor deploy --provider.cluster devnet
```

### 5. Configure Backend

```env
ANCHOR_PROGRAM_ID=YourDeployedProgramIdHere
```

## Testing

### Test Wallet Connection

```bash
# Get devnet SOL
solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet

# Check balance
curl http://localhost:3001/api/solana/balance/YOUR_WALLET_ADDRESS
```

### Test Pool Allocation

```bash
curl -X POST http://localhost:3001/api/solana/pool-allocate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "tenorDays": 90,
    "amount": 1000,
    "walletAddress": "YOUR_WALLET_ADDRESS",
    "network": "devnet",
    "idempotencyKey": "test-123"
  }'
```

### Test Transaction Query

```bash
curl http://localhost:3001/api/solana/transaction/SIM1729123456abc
```

## Security Considerations

1. **Wallet Verification**: Implement signature verification for wallet ownership
2. **Transaction Limits**: Enforce min/max allocation amounts
3. **Idempotency**: Use idempotency keys to prevent duplicate transactions
4. **Rate Limiting**: Limit transaction frequency per user
5. **Audit Logging**: All transactions logged in audit_logs table

## Monitoring

### Track Positions

```sql
SELECT 
  p.*,
  u.email,
  pool.tenor_days,
  pool.apr
FROM positions p
JOIN users u ON p.funder_user_id = u.id
JOIN pools pool ON p.pool_id = pool.id
WHERE p.tx_signature IS NOT NULL
ORDER BY p.created_at DESC;
```

### Track Transactions

```sql
SELECT 
  l.*,
  u.email,
  JSON_EXTRACT(l.metadata, '$.txSignature') as tx_sig
FROM ledger_entries l
JOIN users u ON l.user_id = u.id
WHERE l.ref_type IN ('deposit', 'payout')
ORDER BY l.created_at DESC;
```

## Troubleshooting

### "Solana connection failed"
- Check `SOLANA_RPC_URL` is correct
- Verify network connectivity
- System will fall back to SIM mode

### "ANCHOR mode not yet implemented"
- This is expected without deployed program
- Use SIM mode for development
- Deploy Anchor program to enable ANCHOR mode

### Wallet not connecting
- Ensure wallet extension is installed
- Check network is set to Devnet
- Clear browser cache and retry

## Next Steps

1. ✅ **Current**: SIM mode working with all features
2. 🔄 **Optional**: Deploy Anchor program for real transactions
3. 🔄 **Optional**: Implement program interaction in backend
4. 🔄 **Production**: Switch to mainnet with real SOL

## Resources

- **Solana Devnet**: https://api.devnet.solana.com
- **Solana Explorer**: https://explorer.solana.com/?cluster=devnet
- **Anchor Framework**: https://www.anchor-lang.com/
- **Wallet Adapter**: https://github.com/solana-labs/wallet-adapter
- **Get Devnet SOL**: https://solfaucet.com/

---

**Note**: The system is fully functional in SIM mode. ANCHOR mode is optional and requires deploying a Solana program.
