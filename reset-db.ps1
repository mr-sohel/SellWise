Write-Host "Resetting SellWise Database..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\SellWise.Web"

Write-Host "Dropping existing database..." -ForegroundColor Yellow
dotnet ef database drop -f

Write-Host "Applying migrations..." -ForegroundColor Yellow
dotnet ef database update --quiet

Write-Host "Seeding new realistic demo data..." -ForegroundColor Yellow
dotnet run --seed

Write-Host "Database reset complete!" -ForegroundColor Green
