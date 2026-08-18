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
ML layout: `app/routers/{health,forecast}.py`, `app/services/prophet_service.py`, Pydantic schemas in `app/models/schemas.py`.

## Key Commands

```bash
# Build C# app — no test projects exist in this repo, so `dotnet build` is the only verification step
cd SellWise.Web && dotnet build

# Run C# app standalone (startup scripts use `dotnet watch run` — edits auto-rebuild)
cd SellWise.Web && dotnet run

# Run Python ML service standalone
cd SellWise.ML && uv run uvicorn app.main:app --port 8000 --reload

# EF Core migrations
cd SellWise.Web
dotnet ef migrations add <Name>
dotnet ef database update

# Seed demo data for BOTH stores, then exit (no web server)
cd SellWise.Web && dotnet run --seed

# Reset DB fully (drop → migrate → seed both stores)
.\reset-db.ps1          # Windows
./reset-db.sh           # macOS/Linux
```

## Architecture Notes

- **Auth**: ASP.NET Core Identity cookie sessions. Login at `/Auth/Login`. Cookie expires 7 days; lockout 5 fails / 15 min (`Program.cs`).
- **Multi-tenancy**: `BaseController.GetCurrentStoreId()` reads `ActiveStoreId` from session; every data query filters by store ID. `BaseController` enforces `[Authorize]`, `[AutoValidateAntiforgeryToken]`, and store-membership on every action.
- **Data passing**: Strictly typed ViewModels only for controller→view (prevents over-posting). Controllers are thin; business logic lives in `Services/`.
- **Transactions**: `OrderService.CreateOrderAsync` uses EF `BeginTransactionAsync()` for atomic stock deduction/restoration.
- **Frontend**: Bootstrap 5.3.3 + jQuery 3.7.1 + Chart.js 4.4.7 via CDN. No `wwwroot/lib` — static assets are CDN only. Inline SVG icons, vanilla JS, no React/Vue.
- **PDF generation**: QuestPDF for reports (referenced in `SellWise.Web.csproj`).
- **Seed data**: Two demo stores. `--seed` (handled in `Program.cs`, exits before `app.Run()`) seeds **both**: SellWise Tech BD (electronics, 53 products / 300 customers) and StyleHub BD (fashion, 50 products / 250 customers), ~180 days of orders with growth trend + weekend seasonality. Dashboard auto-seed (background task) triggers only for `admin@sellwise.com` and only seeds store 1 (`SeedStoreAsync`). Other users get a clean empty store.
- **ML integration**: `AnalyticsService` → `ForecastService` (5s HttpClient timeout, base URL from `MlServiceUrl` config, default `http://localhost:8000`) → `POST /api/v1/ml/forecast`. Falls back to moving average when ML is down. The ML service accepts but **ignores** `business_type`.
- **RFM**: `RfmService` computes recency/frequency/monetary scores → segments (e.g. Loyal, At Risk, New Customer).

## ML Service Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/ml/health` | Health check |
| POST | `/api/v1/ml/forecast` | 30-day Prophet forecast (yearly + weekly seasonality, negatives clamped to 0) |

## ML Data Flow

```
Dashboard loads
  → AnalyticsService.GetOverview()
    → Top 6 products by quantity sold (not revenue)
      → Check Forecasts table (cached < 24h?)
        → Use cached data
        → OR gather 90-day sales history from OrderItems
          → Pad missing days with zeros (PadHistoryWithZeros)
          → If ≥7 history points, call ForecastService.GetForecastAsync()
            → POST http://localhost:8000/api/v1/ml/forecast
            → Python uses Prophet to generate 30-day forecast
          → Store results in Forecasts table (ModelUsed = "prophet" or "ewma")
    → Aggregate product forecasts into demand chart
    → Calculate revenue growth (vs previous period of same length)
    → Calculate health score (50 base + order-count bonus − low-stock penalty)
```

## Dev Gotchas

- `sellwise-sql` Docker container must be running first; startup scripts handle this and stop the container on exit (volume `sellwise-data` persists).
- SQL Server password: `YourPass123!` in both Docker and `appsettings.json`.
- Ports: 5000 (web), 8000 (ML), 1433 (SQL). Check for conflicts before starting.
- `SellWise.Web/Views/Shared/_Layout.cshtml.css` must stay effectively empty (comment only) — styling lives in `wwwroot/css/site.css`.
- ML service must be running for real forecasts; with the 5s HttpClient timeout, a cold Prophet first call can time out and silently fall back to moving average.
- Seed data generation takes ~15s on first Dashboard load and runs in the background — the view shows a "seeding in progress" state meanwhile.
