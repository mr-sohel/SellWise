# Windows PowerShell Startup Script for SellWise
$ErrorActionPreference = "Stop"

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "[INFO] Starting SellWise" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Start SQL Server Container (persistent volume)
Write-Host "[1/4] Starting SQL Server..." -ForegroundColor Yellow

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

$mlProcess = $null
try {
    # 2. Start ML Service
    Write-Host "[2/4] Starting ML Service..." -ForegroundColor Yellow
    if (Test-Path "SellWise.ML") {
        $mlProcess = Start-Process -FilePath "uv" -ArgumentList "run uvicorn app.main:app --port 8000" -WorkingDirectory "SellWise.ML" -WindowStyle Hidden -PassThru
        Write-Host "[OK] ML Service on port 8000." -ForegroundColor Green
    } else {
        Write-Host "[SKIP] SellWise.ML not found." -ForegroundColor DarkYellow
    }

    # 3. Apply Migrations (only if needed)
    Write-Host "[3/4] Checking database..." -ForegroundColor Yellow
    if (Test-Path "SellWise.Web") {
        Push-Location SellWise.Web
        dotnet ef database update --no-build 2>&1 | Out-Null
        Pop-Location
        Write-Host "[OK] Database ready." -ForegroundColor Green
    } else {
        Write-Host "[ERROR] SellWise.Web not found!" -ForegroundColor Red
        exit 1
    }

    # 4. Start ASP.NET Core MVC Application
    Write-Host "[4/4] Starting web app..." -ForegroundColor Yellow
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host "[OK] http://localhost:5000" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop all services." -ForegroundColor Gray
    Write-Host "=================================================" -ForegroundColor Cyan

    Set-Location SellWise.Web
    dotnet watch run --urls "http://localhost:5000"
}
finally {
    Write-Host "`n[STOP] Shutting down..." -ForegroundColor Yellow
    if ($mlProcess -ne $null) {
        Stop-Process -Id $mlProcess.Id -Force -ErrorAction SilentlyContinue
        Write-Host "[OK] ML Service stopped." -ForegroundColor Green
    }
    
    # Stop container but do NOT remove — data persists in volume
    docker stop sellwise-sql 2>$null
    Write-Host "[OK] SQL Server stopped (data preserved)." -ForegroundColor Green
    Write-Host "Goodbye!" -ForegroundColor Cyan
}
