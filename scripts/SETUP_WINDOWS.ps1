# Rift Finance - Windows Setup Script
Write-Host "Setting up Solana development environment on Windows" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "WARNING: Please run this script as Administrator" -ForegroundColor Yellow
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Install Rust
Write-Host "Installing Rust..." -ForegroundColor Green
if (!(Get-Command rustc -ErrorAction SilentlyContinue)) {
    Write-Host "Downloading Rust installer..."
    Invoke-WebRequest -Uri "https://win.rustup.rs/x86_64" -OutFile "$env:TEMP\rustup-init.exe"
    Start-Process -FilePath "$env:TEMP\rustup-init.exe" -ArgumentList "-y" -Wait
    $machinePath = [System.Environment]::GetEnvironmentVariable("Path","Machine")
    $userPath = [System.Environment]::GetEnvironmentVariable("Path","User")
    $env:Path = $machinePath + ";" + $userPath
    Write-Host "Rust installed successfully" -ForegroundColor Green
} else {
    Write-Host "Rust already installed" -ForegroundColor Green
}

# Install Solana CLI
Write-Host ""
Write-Host "Installing Solana CLI..." -ForegroundColor Green
if (!(Get-Command solana -ErrorAction SilentlyContinue)) {
    Write-Host "Downloading Solana installer..."
    Invoke-WebRequest -Uri "https://release.solana.com/v1.18.18/solana-install-init-x86_64-pc-windows-msvc.exe" -OutFile "$env:TEMP\solana-install-init.exe"
    Start-Process -FilePath "$env:TEMP\solana-install-init.exe" -ArgumentList "v1.18.18" -Wait
    
    # Add to PATH
    $solanaPath = "$env:USERPROFILE\.local\share\solana\install\active_release\bin"
    [Environment]::SetEnvironmentVariable("Path", $env:Path + ";$solanaPath", [EnvironmentVariableTarget]::User)
    $env:Path += ";$solanaPath"
    
    Write-Host "Solana CLI installed successfully" -ForegroundColor Green
} else {
    Write-Host "Solana CLI already installed" -ForegroundColor Green
}

# Install Anchor
Write-Host ""
Write-Host "Installing Anchor Framework..." -ForegroundColor Green
if (!(Get-Command anchor -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Anchor Version Manager (AVM)..."
    cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
    
    Write-Host "Installing latest Anchor..."
    avm install latest
    avm use latest
    
    Write-Host "Anchor installed successfully" -ForegroundColor Green
} else {
    Write-Host "Anchor already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Close and reopen PowerShell/Terminal"
Write-Host "2. Run: solana config set --url https://api.devnet.solana.com"
Write-Host "3. Run: solana-keygen new"
Write-Host "4. Run: solana airdrop 2"
Write-Host "5. Run: .\DEPLOY_WINDOWS.ps1"
Write-Host ""
