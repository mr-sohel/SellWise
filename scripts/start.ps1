# Windows PowerShell Startup Script for SellWise
$ErrorActionPreference = "Stop"

# Run from the repository root no matter where the script is started from.
Set-Location -Path (Join-Path $PSScriptRoot "..")

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "[INFO] Starting SellWise" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Start SQL Server Container (persistent volume)
Write-Host "[1/2] Starting SQL Server..." -ForegroundColor Yellow

$containerExists = docker ps -a --format '{{.Names}}' | Select-String -Pattern "^sellwise-sql$"
if ($containerExists) {
    # Container exists — just start it (data preserved via volume)
    docker start sellwise-sql 2>$null | Out-Null
} else {
    # First time — create container with named volume
    docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourPass123!" `
        -p 1433:1433 --name sellwise-sql `
        -v sellwise-data:/var/opt/mssql `
        -d mcr.microsoft.com/mssql/server:2022-latest | Out-Null
}

# Wait for SQL Server with timeout
$maxWait = 30
$waited = 0
Write-Host "Waiting for SQL Server..." -ForegroundColor Yellow -NoNewline
while ($waited -lt $maxWait) {
    $result = docker exec sellwise-sql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourPass123!" -Q "SELECT 1" -C -b 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host " Ready (${waited}s)" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 1
    $waited++
    Write-Host "." -NoNewline
}
if ($waited -ge $maxWait) {
    Write-Host " Timeout!" -ForegroundColor Red
    exit 1
}

try {
    # 2. Start the web app (it applies pending migrations itself on startup)
    Write-Host "[2/2] Starting web app (applies migrations on startup)..." -ForegroundColor Yellow
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host "[OK] http://localhost:5000" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop all services." -ForegroundColor Gray
    Write-Host "=================================================" -ForegroundColor Cyan

    Set-Location SellWise.Web
    dotnet watch run --urls "http://localhost:5000"
}
finally {
    Write-Host "`n[STOP] Shutting down..." -ForegroundColor Yellow
    # Stop container but do NOT remove — data persists in volume
    docker stop sellwise-sql 2>$null
    Write-Host "[OK] SQL Server stopped (data preserved)." -ForegroundColor Green
    Write-Host "Goodbye!" -ForegroundColor Cyan
}
