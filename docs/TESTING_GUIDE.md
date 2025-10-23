# Testing Guide - Rift Finance Hub

## ✅ WHAT NOW WORKS

### 1. Invoice Upload (REAL)
- ✅ Frontend form connected to backend
- ✅ Creates invoice in MySQL database
- ✅ Calculates SHA-256 hash
- ✅ Stores all metadata
- ✅ Audit logging

### 2. Invoice Funding (SIM MODE)
- ✅ Fund button calls real API
- ✅ Creates position in database
- ✅ Generates transaction signature
- ✅ Calculates yield correctly
- ✅ Updates pool TVL
- ✅ Returns viewable transaction ID

---

## 🧪 HOW TO TEST

### Prerequisites
1. Backend server running: `cd server && npm run dev`
2. Frontend running: `npm run dev`
3. MySQL database running
4. At least 2 test accounts created

---

### Test 1: Create Invoice (Seller)

**Login as Seller:**
```
Email: seller@test.com
Password: (your password)
```

**Steps:**
1. Navigate to `/invoices/new`
2. Upload a PDF file (any PDF, max 10MB)
3. Fill in details:
   - Invoice Number: `INV-TEST-001`
   - Amount: `50000`
   - Due Date: (7+ days from now)
   - Tenor: Select `90 days`
   - Buyer Name: `Acme Corp GmbH`
   - Buyer Country: `Germany`
4. Check confirmation box
5. Click "Submit for Review"

**Expected Result:**
- ✅ Success toast appears
- ✅ Redirects to `/invoices`
- ✅ Invoice appears in database
- ✅ Check MySQL:
```sql
SELECT * FROM invoices ORDER BY created_at DESC LIMIT 1;
```

---

### Test 2: Fund Invoice (Funder)

**Login as Funder:**
```
Email: funder@test.com
Password: (your password)
```

**Steps:**
1. Navigate to `/market`
2. Connect Phantom wallet (sidebar)
3. Find an invoice in the marketplace
4. Click "Fund Invoice" button
5. Review details in modal
6. Enter funding amount (e.g., `10000`)
7. Click "Confirm & Fund"

**Expected Result:**
- ✅ Loading spinner appears
- ✅ Success modal shows
- ✅ Transaction signature displayed (e.g., `SIM1729123456abc`)
- ✅ Expected yield calculated
- ✅ Check MySQL:
```sql
SELECT * FROM positions ORDER BY created_at DESC LIMIT 1;
SELECT * FROM ledger_entries ORDER BY created_at DESC LIMIT 2;
```

---

### Test 3: View Portfolio

**Still logged in as Funder:**

**Steps:**
1. Navigate to `/portfolio`
2. View "Active Positions" tab

**Expected Result:**
- ✅ Your funded position appears
- ✅ Shows amount, yield, APR
- ✅ "View on Explorer" link present
- ✅ Position details match what you funded

---

### Test 4: Check Transaction

**Steps:**
1. Copy transaction signature from funding success modal
2. Navigate to: `http://localhost:3001/api/solana/transaction/SIM1729123456abc`
   (replace with your actual signature)

**Expected Result:**
```json
{
  "signature": "SIM1729123456abc",
  "mode": "SIM",
  "confirmed": true,
  "message": "Simulated transaction"
}
```

---

## 🔍 DATABASE VERIFICATION

### Check Invoice Created:
```sql
SELECT 
  i.*,
  o.name as org_name
FROM invoices i
LEFT JOIN organizations o ON i.org_id = o.id
ORDER BY i.created_at DESC
LIMIT 5;
```

### Check Position Created:
```sql
SELECT 
  p.*,
  u.email as funder_email,
  i.invoice_number,
  pool.tenor_days,
  pool.apr
FROM positions p
JOIN users u ON p.funder_user_id = u.id
LEFT JOIN invoices i ON p.invoice_id = i.id
JOIN pools pool ON p.pool_id = pool.id
ORDER BY p.created_at DESC
LIMIT 5;
```

### Check Ledger Entries:
```sql
SELECT 
  l.*,
  u.email,
  JSON_EXTRACT(l.metadata, '$.txSignature') as tx_sig
FROM ledger_entries l
JOIN users u ON l.user_id = u.id
WHERE l.ref_type = 'deposit'
ORDER BY l.created_at DESC
LIMIT 5;
```

### Check Pool TVL Updated:
```sql
SELECT * FROM pools;
```

---

## 📊 WHAT YOU'LL SEE

### Invoice Upload Success:
```
✅ Invoice created successfully!
Invoice INV-TEST-001 has been submitted for review
```

### Funding Success:
```
✅ Invoice Funded!
Successfully funded €10,000 to INV-001

Transaction Signature: SIM1729123456abc
Funded Amount: €10,000
Expected Yield: €205.48
```

### Portfolio Display:
```
Active Positions (1)
┌─────────────────────────────────────┐
│ INV-TEST-001                        │
│ Acme Corp GmbH                      │
│                                     │
│ Invested: €10,000                   │
│ Current Value: €10,205.48           │
│ Yield: +€205.48 (2.05%)            │
│ APR: 7.5%                           │
│ Days Remaining: 90                  │
│                                     │
│ [View on Solana Explorer]           │
└─────────────────────────────────────┘
```

---

## ⚠️ CURRENT LIMITATIONS

### What's Simulated:
1. ❌ Blockchain transactions (SIM mode)
2. ❌ NFT minting
3. ❌ Real SOL/USDC transfers
4. ❌ File upload to IPFS

### What's Real:
1. ✅ Database operations
2. ✅ API calls
3. ✅ Authentication
4. ✅ Business logic
5. ✅ Yield calculations
6. ✅ Pool management

---

## 🚀 NEXT STEPS TO GO LIVE

### Phase 1: File Storage (1 day)
- Integrate AWS S3 or IPFS
- Upload PDFs to permanent storage
- Store URLs in database

### Phase 2: Smart Contract (3-5 days)
- Deploy Anchor program to devnet
- Implement pool allocation
- Implement position redemption
- Test with real SOL

### Phase 3: NFT Minting (2-3 days)
- Integrate Metaplex
- Mint invoice NFTs
- Display in marketplace

### Phase 4: Real Transactions (2-3 days)
- Integrate USDC token program
- Implement real transfers
- Test end-to-end flow

---

## 🐛 TROUBLESHOOTING

### "Not authenticated" error:
- Check localStorage has `auth_token`
- Re-login if token expired

### "User must belong to an organization":
- Check user has `org_id` in database
- Create organization if needed:
```sql
INSERT INTO organizations (name, country) VALUES ('Test Org', 'Germany');
UPDATE users SET org_id = (SELECT id FROM organizations WHERE name = 'Test Org') WHERE email = 'seller@test.com';
```

### Invoice doesn't appear in marketplace:
- Marketplace currently shows mock data
- Need to connect to real database (next step)

### Funding fails:
- Check wallet is connected
- Check amount is between €100 and invoice amount
- Check backend server is running
- Check MySQL connection

---

## 📞 SUPPORT

Check these files for more info:
- `BUSINESS_LOGIC_AUDIT.md` - What's implemented
- `SOLANA_INTEGRATION.md` - Blockchain details
- `USER_ROLES_GUIDE.md` - User roles and navigation

---

**Status:** Invoice creation and funding are NOW FUNCTIONAL with database persistence. Blockchain integration is in SIM mode.
