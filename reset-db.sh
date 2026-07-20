#!/bin/bash
echo -e "\033[1;36mResetting SellWise Database...\033[0m"
cd "$(dirname "$0")/SellWise.Web" || exit

echo -e "\033[1;33mDropping existing database...\033[0m"
dotnet ef database drop -f

echo -e "\033[1;33mApplying migrations...\033[0m"
dotnet ef database update

echo -e "\033[1;33mSeeding new realistic demo data...\033[0m"
dotnet run --seed

echo -e "\033[1;32mDatabase reset complete!\033[0m"