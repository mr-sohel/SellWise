# Windows PowerShell Startup Script for SellWise
$ErrorActionPreference = "Stop"

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "[INFO] Starting SellWise (ASP.NET Core Windows Mode) " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Start SQL Server Container
Write-Host "[1/4] Starting SQL Server Database Container..." -ForegroundColor Yellow
docker stop sellwise-sql 2>$null
docker rm sellwise-sql 2>$null

docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourPass123!" `
    -p 1433:1433 --name sellwise-sql -d `
    mcr.microsoft.com/mssql/server:2022-latest | Out-Null

Write-Host "Waiting for SQL Server to accept connections (15s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

$mlProcess = $null
try {
    # 2. Start ML Service
    Write-Host "[2/4] Starting Python ML Service (Background)..." -ForegroundColor Yellow
    if (Test-Path "SellWise.ML") {
        # Start ML service as a background process and capture it
        $mlProcess = Start-Process -FilePath "uv" -ArgumentList "run uvicorn app.main:app --port 8000" -WorkingDirectory "SellWise.ML" -WindowStyle Hidden -PassThru
        Write-Host "[SUCCESS] ML Service running on port 8000." -ForegroundColor Green
    } else {
        Write-Host "[WARNING] SellWise.ML not found. Forecasting features may fail." -ForegroundColor Red
    }

    # 3. Apply Migrations
    Write-Host "[3/4] Applying EF Core Database Migrations..." -ForegroundColor Yellow
    if (Test-Path "SellWise.Web") {
        Push-Location SellWise.Web
        dotnet ef database update
        Pop-Location
        Write-Host "[SUCCESS] Database schema is up to date." -ForegroundColor Green
    } else {
        Write-Host "[ERROR] SellWise.Web directory not found!" -ForegroundColor Red
        exit 1
    }

    # 4. Start ASP.NET Core MVC Application
    Write-Host "[4/4] Starting ASP.NET Core Application..." -ForegroundColor Yellow
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host "[SUCCESS] Everything is ready! Open your browser to:" -ForegroundColor Green
    Write-Host "-> http://localhost:5000" -ForegroundColor Green
    Write-Host "Press Ctrl+C to safely shut down all services." -ForegroundColor Gray
    Write-Host "=================================================" -ForegroundColor Cyan

    Set-Location SellWise.Web
    # Run the app with Hot Reload enabled (this will block until the user presses Ctrl+C)
    dotnet watch run --urls "http://localhost:5000"
}
finally {
    Write-Host "`n[STOP] Shutting down services safely..." -ForegroundColor Yellow
    if ($mlProcess -ne $null) {
        Stop-Process -Id $mlProcess.Id -Force -ErrorAction SilentlyContinue
        Write-Host "[SUCCESS] Python ML Service stopped." -ForegroundColor Green
    }
    
    Write-Host "[WAIT] Stopping SQL Server container..." -ForegroundColor Yellow
    docker stop sellwise-sql 2>$null
    Write-Host "[SUCCESS] SQL Server stopped." -ForegroundColor Green
    Write-Host "Goodbye!" -ForegroundColor Cyan
}
