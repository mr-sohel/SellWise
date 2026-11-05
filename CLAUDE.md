# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

SellWise is a multi-store retail POS / inventory / analytics web app, kept deliberately small as a portfolio project:

- **SellWise.Web**: ASP.NET Core 10 MVC (Razor, Bootstrap 5, Chart.js), EF Core 10 on SQL Server, ASP.NET Core Identity, QuestPDF.
- **SellWise.ML**: FastAPI service wrapping Prophet (`POST /api/v1/ml/forecast`, `GET /api/v1/ml/health`).
- **SellWise.Tests**: xUnit tests. The order logic runs against in-memory **SQLite** (not the EF InMemory provider) because it needs real transactions and `ExecuteUpdate`.

## Commands

```bash
./start.ps1 | ./start.sh            # SQL Server container (sellwise-sql) + ML (:8000) + dotnet watch (:5000)
./reset-db.ps1 | ./reset-db.sh      # drop DB, migrate, reseed demo data

dotnet build SellWise.slnx
dotnet test SellWise.slnx                                   # all .NET tests
dotnet test SellWise.slnx --filter "FullyQualifiedName~OrderServiceTests.CreateOrder_MergesDuplicateLines"   # single test

cd SellWise.Web
dotnet run                                  # Development: migrates + seeds demo data on first run
dotnet run --seed                           # migrate + seed, then exit
dotnet ef migrations add <Name>

cd SellWise.ML
uv run uvicorn app.main:app --port 8000 --reload
pip install -r requirements-dev.txt && python -m pytest -q          # ML tests (pinned deps)
python -m pytest tests/test_api.py::test_health                      # single ML test

docker compose up -d --build                # production stack; needs .env (see .env.example)
```

Local demo login: `admin@sellwise.com` / `Admin123!`. SQL Server: `sa` / `YourPass123!` on `localhost,1433`.

CI (`.github/workflows/ci.yml`) runs `dotnet test SellWise.slnx` and the ML pytest suite.

## Architecture

### Store isolation and authorization
- Users belong to stores via `StoreMember` (key `StoreId`+`UserId`). There are two roles, in `Authorization/StoreRoles`: `owner` and `staff`.
- `BaseController.OnActionExecutionAsync` resolves the active store from session key `ActiveStoreId` and loads the membership once per request. If the session expired, it falls back to the user's first store. It then exposes `StoreId`, `Role` and `IsOwner`, and sets `ViewData["CurrentStoreRole"]` for views.
- Mark owner-only controllers/actions with `[OwnerOnly]`; `BaseController` enforces it (redirect, or 403 JSON for AJAX). Don't add per-action role checks.
- **There are no EF global query filters.** Every query on store-owned entities must filter `StoreId == StoreId`, including lookups by id.
- `AuthController` doesn't inherit `BaseController` (login/signup/store switching).

### Startup
`Program.cs` calls `Data/DatabaseInitializer`: it retries until SQL Server is up, creates the DB through `master`, runs migrations, then seeds the demo account if `DemoData` is enabled. That is always the case in Development; in production it needs `DemoData__Enabled=true` plus `DemoData__AdminPassword`. **Don't add `EnableRetryOnFailure`**: it conflicts with the explicit `BeginTransactionAsync` transactions in the services.

### Orders and stock (`Services/OrderService.cs`)
- Checkout merges duplicate product lines, then decrements stock with a conditional `ExecuteUpdateAsync(... StockQuantity >= qty)` inside a transaction. 0 rows updated means insufficient stock and the transaction rolls back.
- Stock only changes through sales, status changes and `RestockProductAsync` (an atomic increment). Product edit deliberately doesn't change stock.
- `cancelled`/`returned` don't count as sales (`OrderService.CountsAsSale`). Moving into or out of them adjusts stock and customer totals. Statuses are plain strings; walk-in orders use `OrderType = "offline"` and have no delivery charge.

### Forecasting (Web ↔ ML)
- `AnalyticsService.GetForecastsPageAsync` ranks active products by units sold and builds cards for one page.
- `BuildForecastCardsAsync` uses `Forecasts` rows newer than 24h. Otherwise it calls `ForecastService` (typed HttpClient, base address `MlServiceUrl`, 10s timeout, returns null on failure), and if that fails it uses `FallbackForecast` (repeats the last 14 days).
- `SaveForecastsAsync` deletes a product's old rows before inserting new ones. This is required: the unique index `(StoreId, ProductId, TargetDate)` and consecutive-day forecasts overlap on 29 dates.
- C# DTOs at the bottom of `ForecastService.cs` mirror `SellWise.ML/app/models/schemas.py` (snake_case). Change both together.

### Other
- `RfmScoring` holds the pure RFM rules (unit-tested). `RfmService` aggregates order stats and applies them. Segment names are in `RfmSegments`.
- `AlertService.ScanAndGenerateAlertsAsync` derives low-stock alerts from current stock each time the Alerts page is visited.
- Views must not put user data inside inline JS strings. Pass it through `data-*` attributes (see `openRestockFromButton` in `_Layout.cshtml`). Query values that end up in inline JS (e.g. the dashboard `range`) are normalized to an allow-list in the controller.

### Deployment
`docker-compose.yml`: SQL Server, ML and the web app on a private network behind Caddy (`Caddyfile`, `{$DOMAIN}`). Only Caddy publishes ports. The web app trusts `X-Forwarded-*` and persists Data Protection keys to the `sellwise-keys` volume (`DataProtection__KeysPath`). Both Dockerfiles honor `$PORT`.
