# AGENTS.md

SellWise: AI Sales Analytics & Inventory SaaS. ASP.NET Core 10 MVC + Python FastAPI ML.

## Quick Start

```bash
# Full stack (Docker SQL Server + ML service + migrations + ASP.NET app)
./start.sh          # macOS/Linux
.\start.ps1         # Windows
# URL: http://localhost:5000 | Login: admin@sellwise.com / Admin123!
```

## Project Structure

| Component | Path | Stack | Port |
|-----------|------|-------|------|
| Web App | `SellWise.Web/` | ASP.NET Core 10 MVC, EF Core 10, SQL Server, Razor Views | 5000 |
| ML Service | `SellWise.ML/` | Python, FastAPI, Prophet, scikit-learn | 8000 |
| SQL Server | Docker `sellwise-sql` | MSSQL 2022, named volume `sellwise-data` | 1433 |

`SellWise.slnx` references only SellWise.Web — ML service is standalone.

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
dotnet ef migrations add <Name>
dotnet ef database update

# Seed demo data (exits after seeding, does not start web server)
cd SellWise.Web && dotnet run --seed

# Reset DB fully (drop → migrate → seed)
.\reset-db.ps1          # Windows
./reset-db.sh           # macOS/Linux
```

## Architecture Notes

- **Auth**: ASP.NET Core Identity cookie-based sessions. Login: `/Auth/Login`. Cookie expires 7 days.
- **Multi-tenancy**: `BaseController.GetCurrentStoreId()` reads `ActiveStoreId` from session. All data queries filter by store ID. `BaseController` enforces `[Authorize]`, `[AutoValidateAntiforgeryToken]`, and store membership check.
- **Data passing**: Always use strictly typed ViewModels for controller-to-view data (prevents over-posting).
- **Transactions**: Order creation (`OrderService.CreateOrderAsync`) uses EF Core `BeginTransactionAsync()` for atomic stock deduction.
- **Frontend**: Bootstrap 5.3.3 + jQuery 3.7.1 + Chart.js via CDN. `wwwroot/lib/` contains only **license files**. Inline SVG icons (Lucide-style). No React/Vue — vanilla JS only.
- **PDF generation**: QuestPDF for reports.
- **Seed data**: `DemoSeederService` auto-seeds on first Dashboard visit for `admin@sellwise.com` only (background task). Creates 53 products, 200 customers, ~11K orders with trends/seasonality. Other users get a clean empty store.
- **`--seed` flag**: Handled in `Program.cs` before `app.Run()` — exits immediately after seeding (no web server).
- **ML integration**: `AnalyticsService` → `ForecastService` (5s timeout) → POST to `http://localhost:8000/api/v1/ml/forecast`. Falls back to moving average if ML service is down or unavailable.

## ML Service Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/ml/health` | Health check |
| POST | `/api/v1/ml/forecast` | Demand forecast (Prophet ≥30d history, EWMA <30d) |
| POST | `/api/v1/ml/backtest` | Backtest forecast against history |
| POST | `/api/v1/ml/churn` | Churn probability (heuristic + optional LR ensemble) |
| POST | `/api/v1/ml/churn/train` | Train + persist logistic regression churn model to `data/models/` |

## ML Data Flow

```
Dashboard loads
  → AnalyticsService.GetOverview()
    → Top 6 products by quantity sold (not revenue)
      → Check Forecasts table (cached < 24h?)
        → Use cached data
        → OR gather 90-day sales history from OrderItems
          → Pad missing days with zeros
          → Call ForecastService.GetForecastAsync()
            → POST http://localhost:8000/api/v1/ml/forecast
            → Python uses Prophet (≥30 days) or EWMA (<30 days)
          → Store results in Forecasts table
    → Aggregate product forecasts into demand chart
    → Calculate revenue growth (vs previous period of same length)
    → Calculate health score (order count + stock levels)
```

## Dev Gotchas

- `sellwise-sql` Docker container must be running first. Startup scripts handle this.
- SQL Server password: `YourPass123!` in both Docker and `appsettings.json`.
- Port 5000 is default. Port 8000 for ML. Check for conflicts before starting.
- Startup uses `dotnet watch run` — edits trigger auto-rebuild.
- `SellWise.Web/Views/Shared/_Layout.cshtml.css` must stay empty (previously contained conflicting default styles).
- ML service must be running for forecasts. Falls back to moving average if unavailable.
- `ForecastService` has a **5-second HttpClient timeout** (configured in `Program.cs`).
- Seed data generation takes ~15s on first Dashboard load (runs in background).
