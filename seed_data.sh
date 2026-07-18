#!/bin/bash
# seed_data.sh
# Run this script to manually seed dummy data into the database.

echo "================================================="
echo "🌱 Running SellWise Manual Data Seeder"
echo "================================================="

if [ -d "SellWise.Web" ]; then
    cd SellWise.Web
    dotnet run --seed
else
    echo "❌ Error: SellWise.Web directory not found! Please run this from the project root."
    exit 1
fi
