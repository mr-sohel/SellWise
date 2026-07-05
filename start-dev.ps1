<#
.SYNOPSIS
Starts the complete SellWise local development environment.
#>

Write-Host "Starting SellWise Development Environment..." -ForegroundColor Cyan

# 1. Start Docker Containers
Write-Host "Starting Docker containers (PostgreSQL and Redis)..." -ForegroundColor Yellow
docker-compose up -d postgres redis

# 2. Wait for DB to initialize
Write-Host "Waiting for Database to accept connections..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 3. Build Shared Package & Run Migrations
Write-Host "Building shared package..." -ForegroundColor Yellow
npm run build:shared

Write-Host "Running Database Migrations..." -ForegroundColor Yellow
npm run migrate:up --workspace=@sellwise/server

# 4. Start ML Service first and wait for it to be healthy
Write-Host "Starting ML Service..." -ForegroundColor Yellow
$mlCommand = "cd packages\ml-service && uv venv --allow-existing && uv pip install -r requirements.txt && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
$mlProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "`"$mlCommand`"" -PassThru -NoNewWindow

Write-Host "Waiting for ML Service to be ready at http://127.0.0.1:8000/health ..." -ForegroundColor Yellow
$maxRetries = 30
$ready = $false
for ($i = 1; $i -le $maxRetries; $i++) {
    Start-Sleep -Seconds 2
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $ready = $true
            break
        }
    } catch {
        Write-Host "  Attempt $i/$maxRetries - ML Service not ready yet..." -ForegroundColor DarkGray
    }
}

if (-not $ready) {
    Write-Host "ERROR: ML Service failed to start within 60 seconds." -ForegroundColor Red
    taskkill /PID $mlProcess.Id /T /F 2>$null
    exit 1
}
Write-Host "ML Service is ready!" -ForegroundColor Green

# 5. Start Server and Client (ML is already running)
Write-Host "Starting services (Ctrl+C to stop all)..." -ForegroundColor Cyan
Write-Host "   - Frontend UI: http://localhost:5173" -ForegroundColor White
Write-Host "   - Backend API: http://localhost:5005/api/v1/health" -ForegroundColor White
Write-Host "   - ML Service:  http://127.0.0.1:8000/health (already running)" -ForegroundColor White
Write-Host ""

# Cleanup function to stop ML process tree
function Cleanup-Processes {
    Write-Host "`nStopping ML Service..." -ForegroundColor Yellow
    taskkill /PID $mlProcess.Id /T /F 2>$null
    Write-Host "Services stopped." -ForegroundColor Cyan
}

try {
    # Run Server and Client together
    npx concurrently --kill-others --names "SERVER,CLIENT" -c "bgBlue.bold,bgGreen.bold" `
        "npm run dev:server" `
        "npm run dev:client"
}
finally {
    Cleanup-Processes
}
