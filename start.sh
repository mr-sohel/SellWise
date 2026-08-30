#!/bin/bash
set -e

echo "================================================="
echo "[INFO] Starting SellWise"
echo "================================================="

cleanup() {
    echo ""
    echo "[STOP] Shutting down..."
    if [ -n "$ML_PID" ]; then
        kill $ML_PID 2>/dev/null || true
        echo "[OK] ML Service stopped."
    fi
    # Stop container but do NOT remove — data persists in volume
    docker stop sellwise-sql 2>/dev/null || true
    echo "[OK] SQL Server stopped (data preserved)."
    echo "Goodbye!"
}

trap cleanup EXIT

echo "[1/4] Starting SQL Server..."

if docker ps -a --format '{{.Names}}' | grep -q "^sellwise-sql$"; then
    # Container exists — just start it
    docker start sellwise-sql 2>/dev/null
else
    # First time — create container with named volume
    docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourPass123!" \
        -p 1433:1433 --name sellwise-sql \
        -v sellwise-data:/var/opt/mssql \
        -d mcr.microsoft.com/mssql/server:2022-latest > /dev/null
fi

# Wait for SQL Server with timeout
max_wait=30
waited=0
printf "Waiting for SQL Server..."
while [ $waited -lt $max_wait ]; do
    if docker exec sellwise-sql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourPass123!" -Q "SELECT 1" -C -b > /dev/null 2>&1; then
        echo " Ready (${waited}s)"
        break
    fi
    sleep 1
    waited=$((waited + 1))
    printf "."
done
if [ $waited -ge $max_wait ]; then
    echo " Timeout!"
    exit 1
fi

echo "[2/4] Starting ML Service..."
if [ -d "SellWise.ML" ]; then
    cd SellWise.ML
    if [ ! -d ".venv" ]; then
        echo "Setting up ML virtual environment..."
        uv venv > /dev/null 2>&1
        uv pip install -r requirements.txt > /dev/null 2>&1
    fi
    uv run uvicorn app.main:app --port 8000 --reload > /dev/null 2>&1 &
    ML_PID=$!
    cd ..
    echo "[OK] ML Service on port 8000."
else
    echo "[SKIP] SellWise.ML not found."
fi

echo "[3/4] Checking database..."
if [ -d "SellWise.Web" ]; then
    cd SellWise.Web
    dotnet ef database update --no-build > /dev/null 2>&1 || dotnet ef database update > /dev/null 2>&1 || true
    echo "[OK] Database ready."
else
    echo "[ERROR] SellWise.Web not found!"
    exit 1
fi

echo "[4/4] Starting web app..."
echo "================================================="
echo "[OK] http://localhost:5000"
echo "Press Ctrl+C to stop all services."
echo "================================================="

dotnet watch run --urls "http://localhost:5000"
