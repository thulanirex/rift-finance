#!/bin/bash

echo "🚀 Deploying Rift Finance Smart Contracts to Solana Devnet"
echo ""

# Check if Anchor is installed
if ! command -v anchor &> /dev/null; then
    echo "❌ Anchor not found. Installing..."
    cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
    avm install latest
    avm use latest
fi

# Check Solana CLI
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Please install from https://docs.solana.com/cli/install-solana-cli-tools"
    exit 1
fi

# Set to devnet
echo "📡 Configuring Solana CLI for devnet..."
solana config set --url https://api.devnet.solana.com

# Check balance
echo "💰 Checking SOL balance..."
BALANCE=$(solana balance | awk '{print $1}')
echo "Current balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 2" | bc -l) )); then
    echo "⚠️  Low balance. Requesting airdrop..."
    solana airdrop 2
    sleep 5
fi

# Build program
echo "🔨 Building Anchor program..."
anchor build

# Get program ID
PROGRAM_ID=$(solana address -k target/deploy/rift_finance-keypair.json)
echo "📝 Program ID: $PROGRAM_ID"

# Update lib.rs with actual program ID
echo "✏️  Updating program ID in lib.rs..."
sed -i "s/RiFT1111111111111111111111111111111111111111/$PROGRAM_ID/g" programs/rift-finance/src/lib.rs

# Rebuild with correct ID
echo "🔨 Rebuilding with correct program ID..."
anchor build

# Deploy
echo "🚀 Deploying to devnet..."
anchor deploy

# Verify deployment
echo "✅ Verifying deployment..."
solana program show $PROGRAM_ID

echo ""
echo "✅ Deployment complete!"
echo "Program ID: $PROGRAM_ID"
echo ""
echo "Next steps:"
echo "1. Update server/.env with: ANCHOR_PROGRAM_ID=$PROGRAM_ID"
echo "2. Restart backend server"
echo "3. Test funding flow"
