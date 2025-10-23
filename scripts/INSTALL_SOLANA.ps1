# Install Solana CLI on Windows
Write-Host "Installing Solana CLI v1.18.18..." -ForegroundColor Cyan
Write-Host ""

# Download Solana installer
$version = "v1.18.18"
$installerUrl = "https://github.com/solana-labs/solana/releases/download/$version/solana-install-init-x86_64-pc-windows-msvc.exe"
$installerPath = "$env:TEMP\solana-install-init.exe"

Write-Host "Downloading Solana installer..." -ForegroundColor Green
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "Download complete!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Download failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Trying alternative method..." -ForegroundColor Yellow
    
    # Try with curl
    curl.exe -L $installerUrl -o $installerPath
}

# Run installer
Write-Host "Running Solana installer..." -ForegroundColor Green
Start-Process -FilePath $installerPath -ArgumentList "$version" -Wait -NoNewWindow

# Add to PATH
$solanaPath = "$env:USERPROFILE\.local\share\solana\install\active_release\bin"
Write-Host "Adding Solana to PATH..." -ForegroundColor Green

# Add to user PATH permanently
$currentPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)
if ($currentPath -notlike "*$solanaPath*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$solanaPath", [EnvironmentVariableTarget]::User)
}

# Add to current session
$env:Path += ";$solanaPath"

Write-Host ""
Write-Host "Solana CLI installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Verifying installation..." -ForegroundColor Yellow
& "$solanaPath\solana.exe" --version

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Close and reopen PowerShell"
Write-Host "2. Run: solana config set --url https://api.devnet.solana.com"
Write-Host "3. Run: solana-keygen new"
Write-Host "4. Run: solana airdrop 2"
Write-Host ""
