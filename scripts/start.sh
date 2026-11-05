#!/bin/bash
set -e

# Run from the repository root no matter where the script is started from.
cd "$(dirname "$0")/.." || exit 1

echo "================================================="
echo "[INFO] Starting SellWise"
echo "================================================="

cleanup() {
    echo ""
    echo "[STOP] Shutting down..."
    # Stop container but do NOT remove — data persists in volume
    docker stop sellwise-sql 2>/dev/null || true
    echo "[OK] SQL Server stopped (data preserved)."
    echo "Goodbye!"
}

trap cleanup EXIT

echo "[1/2] Starting SQL Server..."

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

if [ ! -d "SellWise.Web" ]; then
    echo "[ERROR] SellWise.Web not found!"
    exit 1
fi
cd SellWise.Web

echo "[2/2] Starting web app (applies migrations on startup)..."
echo "================================================="
echo "[OK] http://localhost:5000"
echo "Press Ctrl+C to stop all services."
echo "================================================="

dotnet watch run --urls "http://localhost:5000"
