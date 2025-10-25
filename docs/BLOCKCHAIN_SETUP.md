# Blockchain Integration Setup

## 1. Install Solana Wallet Adapter

Run these commands in your project root:

```bash
npm install @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/web3.js
```

## 2. Install Specific Wallet Adapters

```bash
npm install @solana/wallet-adapter-phantom @solana/wallet-adapter-solflare
```

## 3. Features to Implement

### A. Wallet Connection
- Connect Phantom/Solflare wallet
- Display wallet address in header
- Persist connection across sessions

### B. Invoice NFT Minting
- Mint compressed NFT (cNFT) for each approved invoice
- Store metadata on-chain
- Link invoice to NFT mint address

### C. Digital Signatures
- Seller signs invoice submission
- Operator signs approval
- Funder signs funding transaction

### D. Funding Workflow
1. Funder connects wallet
2. Funder reviews invoice details
3. Funder approves and transfers USDC
4. Smart contract holds funds in escrow
5. Funds released on due date or early payment

## 4. Smart Contract Functions Needed

```rust
// In your Solana program (programs/rift-finance/src/lib.rs)

pub fn mint_invoice_nft(ctx: Context<MintInvoiceNFT>, invoice_data: InvoiceData) -> Result<()>
pub fn fund_invoice(ctx: Context<FundInvoice>, amount: u64) -> Result<()>
pub fn release_funds(ctx: Context<ReleaseFunds>) -> Result<()>
pub fn repay_invoice(ctx: Context<RepayInvoice>, amount: u64) -> Result<()>
```

## 5. Database Updates Needed

```sql
-- Add wallet addresses to users table
ALTER TABLE users ADD COLUMN wallet_address VARCHAR(44);

-- Add blockchain transaction fields to invoices
ALTER TABLE invoices ADD COLUMN mint_signature VARCHAR(88);
ALTER TABLE invoices ADD COLUMN fund_signature VARCHAR(88);
ALTER TABLE invoices ADD COLUMN fund_amount DECIMAL(18,2);
ALTER TABLE invoices ADD COLUMN funder_wallet VARCHAR(44);
```

## 6. Implementation Order

1. ✅ Set up wallet provider
2. ✅ Create wallet connection button
3. ✅ Add wallet to user profile
4. ✅ Implement NFT minting
5. ✅ Build funding interface
6. ✅ Add escrow smart contract
7. ✅ Test complete flow

## Next Steps

Run the npm install commands above, then I'll create the wallet provider and connection components!
