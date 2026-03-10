$ErrorActionPreference = "Stop"

# Use absolute paths
$DOTNET_EXE = "C:\Program Files\dotnet\dotnet.exe"
$NPM_CMD = "C:\Program Files\nodejs\npm.cmd"
$NODE_DIR = "C:\Program Files\nodejs"
$DOTNET_DIR = "C:\Program Files\dotnet"

Write-Host ">>> Starting Quran School SaaS..." -ForegroundColor Green

# 1. Check binaries
if (!(Test-Path $DOTNET_EXE)) { Write-Error "ERROR: .NET SDK not found at $DOTNET_EXE"; exit 1 }
if (!(Test-Path $NPM_CMD)) { Write-Error "ERROR: npm not found at $NPM_CMD"; exit 1 }

# 2. Kill existing processes
Write-Host ">>> Killing existing processes..." -ForegroundColor Yellow
Get-Process -Name dotnet, node -ErrorAction SilentlyContinue | Stop-Process -Force

# 3. Backend Setup & Start
Write-Host ">>> Starting Backend API..." -ForegroundColor Green
Start-Job -Name "Backend" -ScriptBlock {
    param($dotnet, $nodeDir, $dotnetDir, $root)
    $env:Path = "$nodeDir;$dotnetDir;" + $env:Path
    $env:ASPNETCORE_ENVIRONMENT = "Development"
    Set-Location $root
    & $dotnet run --project backend/src/QuranSchool.API --urls=http://0.0.0.0:5000 > "$root/backend.log" 2>&1
} -ArgumentList $DOTNET_EXE, $NODE_DIR, $DOTNET_DIR, $PSScriptRoot

# 4. Frontend Setup & Start
Write-Host ">>> Starting Frontend..." -ForegroundColor Green
Start-Job -Name "Frontend" -ScriptBlock {
    param($npm, $nodeDir, $dotnetDir, $root)
    $env:Path = "$nodeDir;$dotnetDir;" + $env:Path
    Set-Location "$root/frontend"
    # Ensure dependencies
    if (!(Test-Path "node_modules")) {
        & $npm install
    }
    & $npm run dev -- -H 0.0.0.0 > "../frontend.log" 2>&1
} -ArgumentList $NPM_CMD, $NODE_DIR, $DOTNET_DIR, $PSScriptRoot

Write-Host ">>> Application starting in background..." -ForegroundColor Green
Write-Host "Waiting for services to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

Write-Host "`nAPI: http://localhost:5000/swagger" -ForegroundColor White
Write-Host "Web: http://localhost:3000" -ForegroundColor White
Write-Host "`nPress Enter to stop the application and stop background jobs..." -ForegroundColor Yellow

Read-Host
Write-Host ">>> Stopping services..." -ForegroundColor Red
Stop-Job -Name Backend, Frontend -ErrorAction SilentlyContinue
Remove-Job -Name Backend, Frontend -ErrorAction SilentlyContinue
Get-Process -Name dotnet, node -ErrorAction SilentlyContinue | Stop-Process -Force
