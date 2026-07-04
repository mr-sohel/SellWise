@echo off
echo ===================================================
echo   Starting SellWise Development Environment
echo ===================================================

echo.
echo [1/4] Starting Docker containers (PostgreSQL & Redis)...
docker-compose up -d postgres redis

echo.
echo [2/4] Waiting for Database to accept connections...
timeout /t 5 /nobreak > NUL

echo.
echo [3/4] Running Database Migrations...
call npm run migrate:up --workspace=@sellwise/server

echo.
echo [4/4] Launching Microservices in separate windows...

:: Start ML Service
start "SellWise: ML Service" cmd /k "cd packages\ml-service && echo Starting ML Service... && uv venv --allow-existing && uv pip install -r requirements.txt && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

:: Start Backend API
start "SellWise: Backend API" cmd /k "echo Starting Backend API... && npm run dev:server"

:: Start Frontend UI
start "SellWise: Frontend Client" cmd /k "echo Starting Frontend UI... && npm run dev:client"

echo.
echo All services have been launched successfully!
echo   - Frontend UI: http://localhost:5173
echo   - Backend API: http://localhost:5000/api/v1/health
echo   - ML Service:  http://localhost:8000/health
echo.
pause