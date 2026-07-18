# AGENTS.md

SellWise: AI Sales Analytics & Inventory SaaS. ASP.NET Core MVC + Python FastAPI ML service.

## Quick Start

```bash
# Full stack (SQL Server Docker + ML service + migrations + ASP.NET app)
./start.sh          # macOS/Linux
.\start.ps1         # Windows

# URL: http://localhost:5000
```

## Project Structure

| Component | Path | Stack | Port |
|-----------|------|-------|------|
| Web App | `SellWise.Web/` | ASP.NET Core 10 MVC, EF Core, SQL Server, Razor Views | 5000 |
| ML Service | `SellWise.ML/` | Python, FastAPI, Prophet, scikit-learn | 8000 |
| SQL Server | Docker `sellwise-sql` | MSSQL 2022 | 1433 |

## Key Commands

```bash
# Build C# app
cd SellWise.Web && dotnet build

# Run C# app standalone
cd SellWise.Web && dotnet run

# Run Python ML service standalone
cd SellWise.ML && uv run uvicorn app.main:app --port 8000 --reload

# EF Core migrations
cd SellWise.Web
dotnet ef migrations add <MigrationName>
dotnet ef database update

# Seed demo data manually
cd SellWise.Web && dotnet run --seed

# Run ML tests
cd SellWise.ML && uv run pytest
```

## Architecture Notes

- **MVC pattern**: Controllers are thin, views use Razor `.cshtml`, models are POCOs in `SellWise.Web/Models/`
- **Auth**: ASP.NET Core Identity. Cookie-based sessions (not JWT). Login path: `/Auth/Login`
- **DB context**: `SellWise.Web/Data/AppDbContext.cs` inherits `IdentityDbContext<ApplicationUser>`
- **Multi-tenancy**: `BaseController.GetCurrentStoreId()` reads `ActiveStoreId` from session. All data queries filter by store ID.
- **ML integration**: `AnalyticsService` calls `ForecastService` which POSTs to Python ML service at `http://localhost:8000/api/v1/ml/forecast`. Forecasts are cached in the `Forecasts` table (24h TTL).
- **Seed data**: `DemoSeederService.cs` auto-seeds on first Dashboard visit (checks `if Products.Any(p => p.StoreId == storeId)`). Can also be triggered via `dotnet run --seed`.
- **Frontend**: Bootstrap 5 + Chart.js via CDN (not local `wwwroot/lib/`). Inline SVG icons (Lucide-style) in sidebar. No frontend framework (React/Vue) — vanilla JS only.
- **Transactions**: Order creation uses EF Core transactions (`BeginTransactionAsync`) for stock deduction consistency.

## ML Data Flow

```
Dashboard loads
  → AnalyticsService.GetOverview()
    → For each top 5 product by revenue:
      → Check Forecasts table (cached < 24h?)
        → Use cached data
        → OR gather 90-day sales history from OrderItems
          → Pad missing days with zeros
          → Call ForecastService.GetForecastAsync()
            → POST http://localhost:8000/api/v1/ml/forecast
            → Python uses Prophet (≥30 days history) or EWMA (<30 days)
          → Store results in Forecasts table
    → Aggregate product forecasts into demand chart
    → Calculate real revenue growth (vs previous period)
    → Calculate health score (order count + stock levels)
```

## Dev Gotchas

- `sellwise-sql` Docker container must be running before the app starts. The startup scripts handle this.
- SQL Server password is hardcoded: `YourPass123!`. Connection string in `appsettings.json`.
- Port 5000 is used by default. If already in use, kill the old process before starting.
- The app uses `dotnet watch run` in startup scripts for hot reload — changes trigger auto-rebuild.
- `SellWise.Web/Views/Shared/_Layout.cshtml.css` should stay empty or cleared — it previously contained conflicting default styles.
- Frontend assets are CDN-loaded (`bootstrap@5.3.3`, `jquery@3.7.1`, `chart.js`). Do not assume local `wwwroot/lib/` contains anything.
- The `--seed` flag on `dotnet run` exits after seeding (doesn't start the web server).
- ML service must be running on port 8000 for forecasts to work. If unavailable, fallback to moving average.

## Constraints

- Keep controllers thin. Business logic belongs in services (`SellWise.Web/Services/`).
- No React/Vue/Angular — stick to vanilla JS + Bootstrap 5 + Razor views.
- Use ViewModels for controller-to-view data passing (prevents over-posting).
- EF Core transactions required for multi-table writes (e.g., order creation).
