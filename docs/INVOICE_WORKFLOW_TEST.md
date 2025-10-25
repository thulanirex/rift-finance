# Invoice Workflow Testing Guide

## Complete Flow: Seller → Operator → Funder

### 1. **Seller Submits Invoice** ✅
**Path:** `/invoices/new` (Seller Dashboard → Invoices → New Invoice)

**Steps:**
1. Log in as seller
2. Navigate to "Invoices" from sidebar
3. Click "New Invoice" button
4. Fill in invoice details:
   - Invoice Number
   - Amount (EUR)
   - Due Date
   - Buyer Name
   - Buyer Country
   - Tenor (30/90/120 days)
   - Upload PDF file
5. Submit invoice
6. **Status:** `pending` → Should change to `submitted` after upload

**Expected Result:**
- Invoice created in database
- PDF uploaded to `/uploads` folder
- Invoice appears in seller's invoice list
- Status shows as "Submitted" or "Pending"

---

### 2. **Operator Reviews & Approves** ✅
**Path:** `/ops/invoices` (Operator Dashboard → Invoices)

**Steps:**
1. Log in as operator/admin
2. Navigate to "Invoices" from sidebar
3. See list of all submitted invoices
4. Click on an invoice to review
5. View invoice details and PDF
6. Click "Approve" button
7. **Status:** `pending` → `approved`

**Expected Result:**
- Invoice status changes to "approved"
- Invoice now visible in funder market
- Seller can see status changed to "Approved"

---

### 3. **Funder Views & Funds** ✅
**Path:** `/market` (Funder Dashboard → Market)

**Steps:**
1. Log in as funder
2. Navigate to "Market" from sidebar
3. See list of **approved** invoices only
4. Filter by:
   - Tenor (30/90/120 days)
   - Risk Grade (A/B/C)
   - Country
5. Click on invoice to view details
6. Click "Fund" button
7. **Status:** `approved` → `funded`

**Expected Result:**
- Only approved invoices appear in market
- Funder can fund invoice
- Invoice status changes to "funded"
- Position created for funder

---

## Status Flow

```
draft → pending → submitted → approved → listed → funded → repaid/defaulted
```

### Status Definitions:
- **draft**: Invoice created but not submitted
- **pending**: Invoice submitted, waiting for review
- **submitted**: Same as pending (for compatibility)
- **approved**: Operator approved, ready for market
- **listed**: Available in funder market (same as approved)
- **funded**: Funder has funded the invoice
- **repaid**: Invoice paid back
- **defaulted**: Invoice not paid

---

## Navigation Fixed ✅

### Seller Navigation:
- Dashboard → `/dashboard/seller`
- Invoices → `/invoices`
- Analytics → `/analytics`
- Settings → `/settings`

### Funder Navigation:
- Dashboard → `/dashboard/funder`
- Market → `/market`
- Portfolio → `/portfolio`
- Analytics → `/analytics`
- Settings → `/settings`

### Operator Navigation:
- Dashboard → `/dashboard/operator`
- KYB Review → `/ops/kyb`
- Invoices → `/ops/invoices` ✅ FIXED
- Pools → `/ops/pools` ✅ FIXED
- Settings → `/settings`

---

## UI/UX Consistency ✅

All pages now use **AppLayout** with:
- ✅ Consistent sidebar navigation
- ✅ Gradient headers
- ✅ Modern card designs
- ✅ Proper spacing and typography
- ✅ Dark mode support

---

## Testing Checklist

### Prerequisites:
- [ ] MySQL database running
- [ ] Backend server running (`node server/index.js`)
- [ ] Frontend running (`npm run dev`)
- [ ] Test users created (seller, operator, funder)

### Test Flow:
1. [ ] Seller can create and submit invoice
2. [ ] Invoice appears in operator's review console
3. [ ] Operator can approve invoice
4. [ ] Approved invoice appears in funder market
5. [ ] Funder can view and fund invoice
6. [ ] All navigation links work correctly
7. [ ] UI is consistent across all pages

---

## Known Issues to Fix:

1. **Invoice Status:** Need to ensure status changes from `pending` to `submitted` on creation
2. **Market Filter:** Ensure only `approved` or `listed` invoices show in funder market
3. **PDF Viewing:** Operator needs to view uploaded PDF (currently using Supabase functions)

---

## Next Steps:

1. Test complete flow with real data
2. Fix any remaining status issues
3. Ensure PDF viewing works in operator console
4. Add funding mechanism for funders
5. Test all navigation links
