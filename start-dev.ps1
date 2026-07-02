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

# 3. Run Migrations
Write-Host "Running Database Migrations..." -ForegroundColor Yellow
npm run migrate:up --workspace=@sellwise/server

# 4. Start Services as background jobs in this terminal
Write-Host "Starting services in background (Ctrl+C to stop all)..." -ForegroundColor Cyan

$mlJob = Start-Job -ScriptBlock {
    Set-Location "$using:PWD\packages\ml-service"
    python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
}

$serverJob = Start-Job -ScriptBlock {
    Set-Location "$using:PWD"
    npm run dev:server
}

$clientJob = Start-Job -ScriptBlock {
    Set-Location "$using:PWD"
    npm run dev:client
}

Write-Host ""
Write-Host "All services launched! Logs are shown below:" -ForegroundColor Green
Write-Host "   - Frontend UI: http://localhost:5173" -ForegroundColor White
Write-Host "   - Backend API: http://localhost:5000/api/v1/health" -ForegroundColor White
Write-Host "   - ML Service:  http://localhost:8000/health" -ForegroundColor White
Write-Host ""

# Stream job output to this terminal
try {
    while ($true) {
        $jobs = @($mlJob, $serverJob, $clientJob)
        foreach ($job in $jobs) {
            Receive-Job -Job $job -ErrorAction SilentlyContinue
        }
        $completed = $jobs | Where-Object { $_.State -eq 'Failed' -or $_.State -eq 'Completed' }
        if ($completed) {
            Write-Host "`nOne or more services stopped." -ForegroundColor Yellow
            break
        }
        Start-Sleep -Seconds 1
    }
}
finally {
    Write-Host "Stopping all services..." -ForegroundColor Yellow
    $jobs | Stop-Job -ErrorAction SilentlyContinue
    $jobs | Remove-Job -ErrorAction SilentlyContinue
    Write-Host "All services stopped." -ForegroundColor Red
}
