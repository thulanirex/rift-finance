# Install Visual Studio Build Tools for C++ compilation
Write-Host "Installing Visual Studio Build Tools..." -ForegroundColor Cyan
Write-Host "This is required for Rust and Anchor compilation" -ForegroundColor Yellow
Write-Host ""

# Download VS Build Tools installer
$installerUrl = "https://aka.ms/vs/17/release/vs_BuildTools.exe"
$installerPath = "$env:TEMP\vs_buildtools.exe"

Write-Host "Downloading Visual Studio Build Tools installer..." -ForegroundColor Green
Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath

Write-Host "Installing Build Tools with C++ workload..." -ForegroundColor Green
Write-Host "This may take 5-10 minutes..." -ForegroundColor Yellow

# Install with C++ workload
Start-Process -FilePath $installerPath -ArgumentList `
    "--quiet", `
    "--wait", `
    "--norestart", `
    "--nocache", `
    "--add", "Microsoft.VisualStudio.Workload.VCTools", `
    "--includeRecommended" `
    -Wait

Write-Host ""
Write-Host "Build Tools installed!" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Close ALL PowerShell windows and reopen as Administrator" -ForegroundColor Yellow
Write-Host "Then run: .\SETUP_WINDOWS.ps1" -ForegroundColor Cyan
Write-Host ""
