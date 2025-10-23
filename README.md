# Rift Finance Hub

A modern web3 finance platform built with React, TypeScript, and Solana blockchain integration.

## Features

- **Solana Integration**: Connect and interact with Solana wallets
- **Modern UI**: Built with React, shadcn/ui, and Tailwind CSS
- **Type-Safe**: Full TypeScript support
- **Supabase Backend**: Integrated with Supabase for data management
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Radix UI
- **Styling**: Tailwind CSS
- **Blockchain**: Solana Web3.js, Wallet Adapter, Anchor Framework
- **Smart Contract**: Rust (Anchor), SPL Token
- **Backend**: Node.js/Express, Supabase
- **State Management**: TanStack Query

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd rift-finance-hub-00-main
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```
Edit `.env` with your configuration

4. Start the development server
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Structure

```
├── public/             # Static assets
├── programs/           # Solana smart contracts (Anchor/Rust)
│   └── rift-finance/   # Main Anchor program
├── server/             # Backend server code
│   ├── config/         # Configuration (database, Solana)
│   ├── routes/         # API routes (including Solana integration)
│   └── middleware/     # Authentication & validation
├── src/                # Frontend source code
│   ├── components/     # React components
│   ├── contexts/       # React contexts (AuthContext)
│   ├── hooks/          # Custom hooks
│   └── integrations/   # Third-party integrations
├── supabase/           # Supabase configuration and migrations
└── docs/               # Documentation
```

## Smart Contract Architecture

### Overview

Rift Finance uses a **Solana Anchor program** written in Rust to manage on-chain liquidity pools and funding positions. The smart contract handles:

- **Pool Management**: Initialize and manage liquidity pools with different tenors (30, 60, 90 days)
- **Position Allocation**: Funders allocate USDC to pools and receive yield-bearing positions
- **Redemption**: Automated redemption of matured positions with principal + yield
- **Liquidity Operations**: Pool operators can add liquidity to ensure sufficient funds

### Smart Contract Components

#### Program ID
```
5CjDfyjxz3ydsWUworZbBTwkkuDX8PTefbfn7Bu3Uu3b
```

#### Core Instructions

1. **`initialize_pool`**
   - Creates a new liquidity pool with specified tenor and APR
   - Only callable by pool authority
   - Parameters: `tenor_days` (30/60/90), `apr` (basis points)

2. **`allocate_to_pool`**
   - Funders deposit USDC into a pool
   - Creates a position NFT tracking investment
   - Validates amount (min: 100 USDC, max: 250,000 USDC)
   - Calculates expected yield based on APR and tenor
   - Parameters: `amount`, `invoice_id`

3. **`redeem_position`**
   - Redeems matured positions
   - Transfers principal + yield back to funder
   - Only callable after maturity timestamp
   - Updates pool liquidity and position status

4. **`fund_pool`**
   - Pool operators add liquidity to pools
   - Ensures sufficient funds for redemptions
   - Parameters: `amount`

#### Data Structures

**Pool Account**
```rust
pub struct Pool {
    pub authority: Pubkey,           // Pool operator
    pub tenor_days: u8,              // 30, 60, or 90 days
    pub apr: u16,                    // Basis points (e.g., 750 = 7.5%)
    pub total_value_locked: u64,     // Total USDC locked
    pub available_liquidity: u64,    // Available for redemptions
    pub active_positions: u32,       // Number of active positions
}
```

**Position Account**
```rust
pub struct Position {
    pub funder: Pubkey,              // Position owner
    pub pool: Pubkey,                // Associated pool
    pub invoice_id: String,          // Optional invoice reference
    pub amount: u64,                 // Principal amount
    pub expected_yield: u64,         // Calculated yield
    pub actual_yield: u64,           // Realized yield
    pub entry_timestamp: i64,        // Allocation time
    pub maturity_timestamp: i64,     // Redemption time
    pub status: PositionStatus,      // Active/Redeemed/Defaulted
}
```

### Integration Flow

#### 1. Frontend → Backend → Blockchain

```
User Action (React)
    ↓
Wallet Connection (@solana/wallet-adapter-react)
    ↓
API Request (server/routes/solana.js)
    ↓
Transaction Building (Anchor/Web3.js)
    ↓
User Signs Transaction (Wallet)
    ↓
Blockchain Execution (Solana Program)
    ↓
Database Update (MySQL/Supabase)
    ↓
UI Update (React Query)
```

#### 2. Dual Mode Operation

The platform supports two operational modes:

**SIM Mode** (Development/Testing)
- Simulates blockchain transactions
- Stores data in database only
- No real blockchain interaction
- Faster development iteration

**ANCHOR Mode** (Production)
- Real Solana blockchain transactions
- On-chain state management
- Requires deployed Anchor program
- Full decentralization

Mode is determined by `ANCHOR_PROGRAM_ID` environment variable.

### API Integration

#### Key Endpoints

**`POST /api/solana/pool-allocate`**
- Allocates funds to a pool
- Creates position on-chain (ANCHOR) or in database (SIM)
- Returns transaction signature

**`POST /api/solana/position-redeem`**
- Redeems matured position
- Transfers principal + yield to funder
- Updates pool liquidity

**`GET /api/solana/config`**
- Returns Solana configuration
- Network, RPC URL, Program ID, Mode

**`GET /api/solana/balance/:address`**
- Fetches wallet balance
- Returns SOL and lamports

**`GET /api/solana/pool-accounts`**
- Fetches all pool accounts
- Returns TVL, liquidity, APR per pool

### Frontend Integration

#### Wallet Connection

```typescript
// SolanaWalletProvider.tsx
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
```

#### Transaction Signing

```typescript
// FundInvoiceModal.tsx
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, Transaction } from '@solana/web3.js';

const { publicKey, signTransaction } = useWallet();
// Build and sign transactions
```

### Environment Configuration

Required environment variables:

```bash
# Solana Configuration
SOLANA_NETWORK=devnet                    # devnet, testnet, or mainnet-beta
SOLANA_RPC_URL=https://api.devnet.solana.com
ANCHOR_PROGRAM_ID=5CjDfyjxz3ydsWUworZbBTwkkuDX8PTefbfn7Bu3Uu3b

# Database
DATABASE_URL=your_database_url

# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Deployment

#### Smart Contract Deployment

```bash
# Build the Anchor program
cd programs/rift-finance
anchor build

# Deploy to Solana devnet
anchor deploy --provider.cluster devnet

# Update program ID in lib.rs and .env
```

#### Application Deployment

```bash
# Install dependencies
npm install

# Build frontend
npm run build

# Start backend server
cd server
npm start
```

### Security Features

- **PDA (Program Derived Addresses)**: Deterministic account generation
- **Signer Verification**: All transactions require wallet signatures
- **Amount Validation**: Min/max limits enforced on-chain
- **Maturity Checks**: Positions can only be redeemed after maturity
- **Authority Checks**: Pool operations restricted to authorized accounts
- **Audit Logging**: All transactions logged for compliance

### Testing

```bash
# Run Anchor tests
anchor test

# Run integration tests
npm run test:integration
```

## License

Private project

## Contributing

This is a private project. Contact the maintainer for contribution guidelines.
