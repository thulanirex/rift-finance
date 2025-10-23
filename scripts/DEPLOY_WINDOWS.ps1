# Rift Finance - Windows Deployment Script
Write-Host "Deploying Rift Finance Smart Contracts to Solana Devnet" -ForegroundColor Cyan
Write-Host ""

# Check if Anchor is installed
if (!(Get-Command anchor -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Anchor not found. Please run SETUP_WINDOWS.ps1 first" -ForegroundColor Red
    exit 1
}

# Check Solana CLI
if (!(Get-Command solana -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Solana CLI not found. Please run SETUP_WINDOWS.ps1 first" -ForegroundColor Red
    exit 1
}

# Set to devnet
Write-Host "Configuring Solana CLI for devnet..." -ForegroundColor Green
solana config set --url https://api.devnet.solana.com

# Check balance
Write-Host "Checking SOL balance..." -ForegroundColor Green
$balance = solana balance
Write-Host "Current balance: $balance" -ForegroundColor Yellow

if ($balance -match "^0") {
    Write-Host "WARNING: Low balance. Requesting airdrop..." -ForegroundColor Yellow
    solana airdrop 2
    Start-Sleep -Seconds 5
}

# Build program
Write-Host "Building Anchor program..." -ForegroundColor Green
anchor build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    exit 1
}

# Get program ID
Write-Host "Getting program ID..." -ForegroundColor Green
$programId = solana address -k target\deploy\rift_finance-keypair.json
Write-Host "Program ID: $programId" -ForegroundColor Cyan

# Update lib.rs with actual program ID
Write-Host "Updating program ID in lib.rs..." -ForegroundColor Green
$libPath = "programs\rift-finance\src\lib.rs"
$content = Get-Content $libPath -Raw
$content = $content -replace 'RiFT1111111111111111111111111111111111111111', $programId
Set-Content $libPath $content

# Rebuild with correct ID
Write-Host "Rebuilding with correct program ID..." -ForegroundColor Green
anchor build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Rebuild failed" -ForegroundColor Red
    exit 1
}

# Deploy
Write-Host "Deploying to devnet..." -ForegroundColor Green
anchor deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Deployment failed" -ForegroundColor Red
    exit 1
}

# Verify deployment
Write-Host "Verifying deployment..." -ForegroundColor Green
solana program show $programId

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Program ID: $programId" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Add to server\.env: ANCHOR_PROGRAM_ID=$programId"
Write-Host "2. Restart backend server: cd server && npm run dev"
Write-Host "3. Test funding flow in the app"
Write-Host ""
