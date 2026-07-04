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

# 4. Start Services using Concurrently
Write-Host "Starting services (Ctrl+C to stop all)..." -ForegroundColor Cyan
Write-Host "   - Frontend UI: http://localhost:5173" -ForegroundColor White
Write-Host "   - Backend API: http://localhost:5000/api/v1/health" -ForegroundColor White
Write-Host "   - ML Service:  http://localhost:8000/health" -ForegroundColor White
Write-Host ""

# Define the ML command
$mlCommand = "cd packages/ml-service && uv venv --allow-existing && uv pip install -r requirements.txt && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

# Run all 3 services together. Concurrently will perfectly handle Ctrl+C cleanup!
npx concurrently --kill-others --names "SERVER,CLIENT,ML" -c "bgBlue.bold,bgGreen.bold,bgYellow.bold" `
    "npm run dev:server" `
    "npm run dev:client" `
    $mlCommand
