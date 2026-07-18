#!/bin/bash

# Exit on error for critical steps
set -e

echo "================================================="
echo "[INFO] Starting SellWise (ASP.NET Core Defense Mode) "
echo "================================================="

# Function to clean up background processes on exit
cleanup() {
    echo ""
    echo "[STOP] Shutting down services safely..."
    if [ -n "$ML_PID" ]; then
        kill $ML_PID 2>/dev/null || true
        echo "[SUCCESS] Python ML Service stopped."
    fi
    
    echo "[WAIT] Stopping SQL Server container (this may take a few seconds)..."
    docker stop sellwise-sql 2>/dev/null || true
    echo "[SUCCESS] SQL Server stopped."
    echo "Goodbye!"
    exit 0
}

# Trap SIGINT (Ctrl+C)
trap cleanup SIGINT

echo "[1/4] Starting SQL Server Database..."
# Stop and remove any existing container with the same name
docker stop sellwise-sql 2>/dev/null || true
docker rm sellwise-sql 2>/dev/null || true

# Run SQL Server Docker Container
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourPass123!" \
    -p 1433:1433 --name sellwise-sql -d \
    mcr.microsoft.com/mssql/server:2022-latest > /dev/null

echo "Waiting for SQL Server to accept connections (15s)..."
sleep 15

echo "[2/4] Starting Python ML Service (Background)..."
if [ -d "SellWise.ML" ]; then
    cd SellWise.ML
    # Start ML service and suppress its noisy output so it doesn't clutter the terminal
    uv run uvicorn app.main:app --port 8000 > /dev/null 2>&1 &
    ML_PID=$!
    cd ..
    echo "[SUCCESS] ML Service running on port 8000."
else
    echo "[WARNING] SellWise.ML not found. Forecasting features may fail."
fi

echo "[3/4] Applying EF Core Database Migrations..."
if [ -d "SellWise.Web" ]; then
    cd SellWise.Web
    dotnet ef database update
else
    echo "[ERROR] SellWise.Web directory not found!"
    exit 1
fi

echo "[4/4] Starting ASP.NET Core Application..."
echo "================================================="
echo "[SUCCESS] Everything is ready! Open your browser to:"
echo "-> http://localhost:5000"
echo "Press Ctrl+C to safely shut down all services."
echo "================================================="

# Run the app with Hot Reload enabled
dotnet watch run --urls "http://localhost:5000"
