#!/usr/bin/env bash

# Exit immediately on unhandled errors for the setup part
set -e

echo -e "\033[0;36mStarting SellWise Development Environment...\033[0m"

# 1. Start Docker Containers
echo -e "\033[0;33mStarting Docker containers (PostgreSQL and Redis)...\033[0m"
docker-compose up -d postgres redis

# 2. Wait for DB to initialize
echo -e "\033[0;33mWaiting for Database to accept connections...\033[0m"
sleep 5

# 3. Install Dependencies, Build Shared Package & Run Migrations
echo -e "\033[0;33mInstalling NPM dependencies...\033[0m"
npm install

echo -e "\033[0;33mBuilding shared package...\033[0m"
npm run build:shared

echo -e "\033[0;33mRunning Database Migrations...\033[0m"
npm run migrate:up --workspace=@sellwise/server

# Disable exit on error for the polling section
set +e

# 4. Start ML Service first and wait for it to be healthy
echo -e "\033[0;33mStarting ML Service...\033[0m"
(
  cd packages/ml-service || exit
  uv venv --allow-existing
  uv pip install -r requirements.txt
  exec uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
) &
ML_PID=$!

echo -e "\033[0;33mWaiting for ML Service to be ready at http://127.0.0.1:8000/health ...\033[0m"
MAX_RETRIES=30
READY=false

for i in $(seq 1 $MAX_RETRIES); do
  sleep 2
  STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/health || echo "000")
  if [ "$STATUS_CODE" -eq 200 ]; then
    READY=true
    break
  fi
  echo -e "\033[1;30m  Attempt $i/$MAX_RETRIES - ML Service not ready yet...\033[0m"
done

if [ "$READY" = false ]; then
  echo -e "\033[0;31mERROR: ML Service failed to start within 60 seconds.\033[0m"
  kill -9 $ML_PID 2>/dev/null
  exit 1
fi
echo -e "\033[0;32mML Service is ready!\033[0m"

# 5. Start Server and Client (ML is already running)
echo -e "\033[0;36mStarting services (Ctrl+C to stop all)...\033[0m"
echo -e "\033[1;37m   - Frontend UI: http://localhost:5173\033[0m"
echo -e "\033[1;37m   - Backend API: http://localhost:5005/api/v1/health\033[0m"
echo -e "\033[1;37m   - ML Service:  http://127.0.0.1:8000/health (already running)\033[0m"
echo ""

# Cleanup function to stop ML process tree
cleanup() {
  echo -e "\n\033[0;33mStopping ML Service...\033[0m"
  kill -9 $ML_PID 2>/dev/null
  echo -e "\033[0;36mServices stopped.\033[0m"
}

trap cleanup EXIT INT TERM

# Run Server and Client together
npx concurrently --kill-others --names "SERVER,CLIENT" -c "bgBlue.bold,bgGreen.bold" \
  "npm run dev:server" \
  "npm run dev:client"
