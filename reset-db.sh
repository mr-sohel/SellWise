#!/bin/bash
set -e

echo -e "\033[1;36m========================================\033[0m"
echo -e "\033[1;36m  SellWise — Full Database Reset\033[0m"
echo -e "\033[1;36m========================================\033[0m"

cd "$(dirname "$0")/SellWise.Web" || exit 1

echo ""
echo -e "\033[1;33m[1/3] Dropping existing database...\033[0m"
dotnet ef database drop -f --no-build 2>/dev/null || dotnet ef database drop -f

echo ""
echo -e "\033[1;33m[2/3] Applying migrations...\033[0m"
if ! dotnet ef database update --quiet; then
    echo -e "\033[1;31m[ERROR] Migration failed. Is the SQL Server container running?\033[0m"
    exit 1
fi

echo ""
echo -e "\033[1;33m[3/3] Seeding demo data for both stores...\033[0m"
echo -e "\033[0;90m      Store 1: SellWise Tech BD  (Electronics — 53 products, 300 customers, 180 days)\033[0m"
echo -e "\033[0;90m      Store 2: StyleHub BD       (Fashion     — 50 products, 250 customers, 180 days)\033[0m"
echo ""
if ! dotnet run --seed; then
    echo -e "\033[1;31m[ERROR] Seeding failed.\033[0m"
    exit 1
fi

echo ""
echo -e "\033[1;32m========================================\033[0m"
echo -e "\033[1;32m  Reset complete!\033[0m"
echo -e "\033[1;32m  Login : admin@sellwise.com\033[0m"
echo -e "\033[1;32m  Pass  : Admin123!\033[0m"
echo -e "\033[1;32m  Stores: SellWise Tech BD  |  StyleHub BD\033[0m"
echo -e "\033[1;32m========================================\033[0m"
