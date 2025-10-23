# Rift Finance Hub - User Roles & Navigation Guide

## 🔐 User Roles

The platform supports **4 user roles**:

### 1. **Seller** (Invoice Sellers)
- **Dashboard**: `/dashboard/seller`
- **Features**:
  - Create and manage invoices
  - Upload invoices for tokenization
  - Track invoice status
  - View funding history
  - Analytics on invoice performance

**Navigation**:
- Dashboard
- Invoices (view all)
- Create Invoice
- Analytics
- Settings

---

### 2. **Funder** (Invoice Investors)
- **Dashboard**: `/dashboard/funder`
- **Features**:
  - Browse invoice marketplace
  - Fund invoices with Solana wallet
  - Track investment portfolio
  - View yields and returns
  - KYC verification (Didit integration)

**Navigation**:
- Dashboard
- Market (browse invoices)
- Portfolio (active positions)
- Analytics
- Settings

---

### 3. **Operator** (Platform Administrators)
- **Dashboard**: `/dashboard/operator`
- **Features**:
  - Manage all users (KYB verification)
  - Oversee all invoices
  - Monitor funder activity
  - Manage liquidity pools
  - Insurance management
  - Audit trail

**Navigation**:
- Dashboard
- KYB Management (`/ops/kyb`)
- Invoice Management (`/ops/invoices`)
- Funder Management (`/ops/funders`)
- Pool Management (`/ops/pools`)
- Insurance (`/ops/insurance`)
- Audit Trail (`/ops/audit`)

---

### 4. **Admin** (Super Admin)
- Full access to all features across all roles
- Can access seller, funder, and operator dashboards

---

## 🚪 How to Access Different Roles

### Method 1: Login with Different Accounts
1. Go to `/auth`
2. Login with credentials for each role:
   - **Seller**: `seller@test.com` / password
   - **Funder**: `funder@test.com` / password
   - **Operator**: `operator@test.com` / password

### Method 2: Role Selection Page
- After login, if no role is set, you'll be redirected to `/role-selection`
- Choose your role and get redirected to the appropriate dashboard

---

## 🔓 Logout

**Location**: Sidebar (bottom section)
- Click the **logout icon** (🚪) next to your profile avatar
- Located in the user info section at the bottom of the sidebar

---

## 📱 Current Implementation Status

### ✅ Fully Implemented:
- **Funder Dashboard** - Complete with gradient cards, dark mode
- **Market Page** - Browse and fund invoices
- **Portfolio Page** - Track investments
- **Analytics Page** - Performance metrics
- **Settings Page** - Profile, Wallet, KYC, Notifications
- **Solana Wallet Integration** - Connect, fund, view on explorer
- **Didit KYC** - Identity verification for funders
- **Dark Mode** - Full support across all pages
- **Collapsible Sidebar** - Better UX

### 🚧 Needs Polish:
- **Seller Dashboard** - Exists but needs UI improvements
- **Operator Dashboard** - Exists but needs UI improvements
- **Role-based navigation** - Works but could be more intuitive

---

## 🎯 Next Steps to Complete the App

1. **Polish Seller Dashboard**
   - Apply same gradient card design
   - Improve invoice creation flow
   - Better dark mode support

2. **Polish Operator Dashboard**
   - Apply consistent design system
   - Improve admin controls
   - Better data visualization

3. **Improve Role Switching**
   - Add role switcher in sidebar for admins
   - Better onboarding flow

4. **Backend Integration**
   - Connect to real API endpoints
   - Replace mock data with real data
   - Implement actual Solana transactions

---

## 🔑 Test Accounts

Create these in your database:

```sql
-- Seller
email: seller@test.com
role: seller

-- Funder  
email: funder@test.com
role: funder

-- Operator
email: operator@test.com
role: operator

-- Admin
email: admin@test.com
role: admin
```

---

## 📞 Support

For issues or questions, check:
- `SOLANA_INTEGRATION.md` - Blockchain integration guide
- `server/routes/` - API endpoints
- `src/contexts/AuthContext.tsx` - Authentication logic
