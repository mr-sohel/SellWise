Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SellWise — Full Database Reset" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\SellWise.Web"

Write-Host ""
Write-Host "[1/3] Dropping existing database..." -ForegroundColor Yellow
dotnet ef database drop -f --no-build
if ($LASTEXITCODE -ne 0) {
    Write-Host "      Build required, running with build..." -ForegroundColor DarkYellow
    dotnet ef database drop -f
}

Write-Host ""
Write-Host "[2/3] Applying migrations..." -ForegroundColor Yellow
dotnet ef database update --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Migration failed. Is the SQL Server container running?" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[3/3] Seeding demo data for both stores..." -ForegroundColor Yellow
Write-Host "      Store 1: SellWise Tech BD  (Electronics — 53 products, 300 customers, 180 days)" -ForegroundColor DarkGray
Write-Host "      Store 2: StyleHub BD       (Fashion     — 50 products, 250 customers, 180 days)" -ForegroundColor DarkGray
Write-Host ""
dotnet run --seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Seeding failed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Reset complete!" -ForegroundColor Green
Write-Host "  Login : admin@sellwise.com" -ForegroundColor Green
Write-Host "  Pass  : Admin123!" -ForegroundColor Green
Write-Host "  Stores: SellWise Tech BD  |  StyleHub BD" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
