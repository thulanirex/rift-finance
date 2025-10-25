# 🚀 Blockchain Implementation Guide

## Current Status

✅ **Already Implemented:**
- Solana wallet adapter in AppLayout
- Wallet connection in sidebar
- FundInvoiceModal component exists
- Basic Solana program structure

## 📦 Step 1: Install Required Packages

Run these commands:

```bash
npm install @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/web3.js @solana/wallet-adapter-phantom @solana/wallet-adapter-solflare
```

## 🗄️ Step 2: Database Updates

Run this SQL in your MySQL database:

```sql
USE rift_finance_hub;

-- Add wallet address to users
ALTER TABLE users 
ADD COLUMN wallet_address VARCHAR(44) AFTER email;

-- Add blockchain fields to invoices
ALTER TABLE invoices 
ADD COLUMN mint_signature VARCHAR(88) AFTER cnft_mint,
ADD COLUMN fund_signature VARCHAR(88) AFTER mint_signature,
ADD COLUMN fund_amount DECIMAL(18,2) AFTER fund_signature,
ADD COLUMN funder_wallet VARCHAR(44) AFTER fund_amount,
ADD COLUMN funder_id CHAR(36) AFTER funder_wallet;

-- Add foreign key for funder
ALTER TABLE invoices
ADD CONSTRAINT fk_invoices_funder 
FOREIGN KEY (funder_id) REFERENCES users(id) ON DELETE SET NULL;

-- Create signatures table for tracking all blockchain signatures
CREATE TABLE IF NOT EXISTS blockchain_signatures (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  entity_type ENUM('invoice', 'user', 'organization') NOT NULL,
  entity_id CHAR(36) NOT NULL,
  signer_wallet VARCHAR(44) NOT NULL,
  signature_type ENUM('submission', 'approval', 'funding', 'repayment') NOT NULL,
  signature VARCHAR(88) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_signer (signer_wallet)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 🔧 Step 3: Backend API Endpoints

Add these routes to your backend:

### `server/routes/blockchain.js`

```javascript
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';

const router = express.Router();

// Mint invoice cNFT
router.post('/invoices/:id/mint', authenticateToken, async (req, res) => {
  // Implementation for minting compressed NFT
});

// Record blockchain signature
router.post('/signatures', authenticateToken, async (req, res) => {
  const { entityType, entityId, signatureType, signature, message } = req.body;
  
  // Store signature in database
  const [result] = await db.query(
    `INSERT INTO blockchain_signatures 
     (entity_type, entity_id, signer_wallet, signature_type, signature, message) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [entityType, entityId, req.user.wallet_address, signatureType, signature, message]
  );
  
  res.json({ success: true, id: result.insertId });
});

// Get signatures for an entity
router.get('/signatures/:entityType/:entityId', authenticateToken, async (req, res) => {
  const { entityType, entityId } = req.params;
  
  const [signatures] = await db.query(
    `SELECT * FROM blockchain_signatures 
     WHERE entity_type = ? AND entity_id = ? 
     ORDER BY created_at DESC`,
    [entityType, entityId]
  );
  
  res.json(signatures);
});

export default router;
```

## 🎨 Step 4: Frontend Components

### A. Update Main App to Include Wallet Provider

Edit `src/main.tsx` or `src/App.tsx`:

```tsx
import { SolanaWalletProvider } from './contexts/WalletProvider';

// Wrap your app with SolanaWalletProvider
<SolanaWalletProvider>
  <AuthProvider>
    <App />
  </AuthProvider>
</SolanaWalletProvider>
```

### B. Add Mint NFT Button to Operator Invoice Page

In `src/pages/OperatorInvoices.tsx`, add a mint button after approval:

```tsx
import { useWallet } from '@solana/wallet-adapter-react';
import { solanaService } from '@/lib/solana';

// In the component:
const wallet = useWallet();

const handleMintNFT = async (invoice) => {
  try {
    const result = await solanaService.mintInvoiceNFT(wallet, invoice.id, {
      invoiceNumber: invoice.invoice_number,
      amount: invoice.amount_eur,
      dueDate: invoice.due_date,
      seller: invoice.org_name,
      buyer: invoice.counterparty,
    });
    
    toast.success('NFT minted successfully!');
    loadInvoices();
  } catch (error) {
    toast.error('Failed to mint NFT: ' + error.message);
  }
};
```

### C. Add Fund Button to Market Page

In `src/pages/Market.tsx`:

```tsx
import { FundInvoiceModal } from '@/components/FundInvoiceModal';

const [selectedInvoice, setSelectedInvoice] = useState(null);
const [fundModalOpen, setFundModalOpen] = useState(false);

// In the invoice card:
<Button onClick={() => {
  setSelectedInvoice(invoice);
  setFundModalOpen(true);
}}>
  Fund Invoice
</Button>

<FundInvoiceModal
  open={fundModalOpen}
  onOpenChange={setFundModalOpen}
  invoice={selectedInvoice}
/>
```

## 🔐 Step 5: Digital Signatures

### Sign Invoice Submission (Seller)

```tsx
const signInvoiceSubmission = async (invoiceId: string) => {
  const message = `I confirm submission of invoice ${invoiceId}`;
  const { signature, publicKey } = await solanaService.signMessage(wallet, message);
  
  await apiClient.request('/api/blockchain/signatures', {
    method: 'POST',
    body: JSON.stringify({
      entityType: 'invoice',
      entityId: invoiceId,
      signatureType: 'submission',
      signature: Buffer.from(signature).toString('base64'),
      message,
    }),
  });
};
```

### Sign Invoice Approval (Operator)

```tsx
const signInvoiceApproval = async (invoiceId: string) => {
  const message = `I approve invoice ${invoiceId} for funding`;
  const { signature, publicKey } = await solanaService.signMessage(wallet, message);
  
  await apiClient.request('/api/blockchain/signatures', {
    method: 'POST',
    body: JSON.stringify({
      entityType: 'invoice',
      entityId: invoiceId,
      signatureType: 'approval',
      signature: Buffer.from(signature).toString('base64'),
      message,
    }),
  });
};
```

## 🎯 Step 6: Complete Workflow

### Invoice Lifecycle with Blockchain:

1. **Seller Submits Invoice**
   - Upload PDF
   - Fill details
   - Sign submission with wallet ✍️
   - Status: `pending`

2. **Operator Reviews & Approves**
   - Review documents
   - Approve invoice
   - Sign approval with wallet ✍️
   - Mint cNFT 🎨
   - Status: `approved` → `listed`

3. **Funder Funds Invoice**
   - Browse market
   - Select invoice
   - Connect wallet
   - Transfer funds (USDC/SOL)
   - Sign funding transaction ✍️
   - Status: `listed` → `funded`

4. **Repayment**
   - Buyer pays on due date
   - Funds released from escrow
   - Status: `funded` → `repaid`

## 🧪 Step 7: Testing

1. **Install Phantom Wallet** (browser extension)
2. **Get Devnet SOL** from https://faucet.solana.com
3. **Test the flow:**
   - Connect wallet as seller
   - Submit invoice with signature
   - Connect wallet as operator
   - Approve and mint NFT
   - Connect wallet as funder
   - Fund the invoice

## 📝 Next Steps

Run the commands in order:

```bash
# 1. Install packages
npm install @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/web3.js @solana/wallet-adapter-phantom @solana/wallet-adapter-solflare

# 2. Run database migrations (SQL above)

# 3. Restart backend
cd server && npm run dev

# 4. Restart frontend
cd .. && npm run dev

# 5. Test wallet connection
```

## 🎉 You're Ready!

Once packages are installed and database is updated, the blockchain features will be fully functional!
