# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) or other AI agents when working with code in this repository.

## SellWise
AI Sales Analytics & Inventory SaaS. ASP.NET Core MVC + Python FastAPI ML service.

## Project Structure
- `SellWise.slnx`: The master solution file.
- `SellWise.Web/`: ASP.NET Core 10 MVC application (`net10.0`).
- `SellWise.ML/`: Python FastAPI ML forecasting service.
- `start.sh` / `start.ps1`: Master startup scripts (macOS/Linux and Windows).

## Commands
- **Start Everything:** `./start.sh` or `.\start.ps1`
- **Build C# App:** `cd SellWise.Web && dotnet build`
- **Run C# App Manually:** `cd SellWise.Web && dotnet run`
- **Run Database Migrations:** `cd SellWise.Web && dotnet ef migrations add <Name>` then `dotnet ef database update`
- **Seed Demo Data:** `cd SellWise.Web && dotnet run --seed` (exits after seeding)
- **Run ML Tests:** `cd SellWise.ML && uv run pytest`
- **Run ML Service Standalone:** `cd SellWise.ML && uv run uvicorn app.main:app --port 8000 --reload`

## Architecture & Rules
- **C# Framework:** ASP.NET Core 10 MVC (`net10.0`).
- **Database:** Entity Framework Core 10 with SQL Server (Docker `sellwise-sql`, password `YourPass123!`).
- **Auth:** ASP.NET Core Identity. Cookie-based sessions. Login path: `/Auth/Login`.
- **Multi-tenancy:** `BaseController.GetCurrentStoreId()` reads `ActiveStoreId` from session. All data queries filter by store ID.
- **Views:** Razor Views (`.cshtml`) styled with Bootstrap 5.3.3 via CDN. Inline SVG icons (Lucide-style). No React/Vue — vanilla JS only.
- **Data Passing:** Always use strictly typed `ViewModels` when passing data from Controllers to Views.
- **Transactions:** Complex operations (like creating an Order and deducting stock) MUST use EF Core transactions (`BeginTransactionAsync()`).
- **Services:** Business logic belongs in `SellWise.Web/Services/` — keep controllers thin.
- **Frontend:** CDN-loaded (`bootstrap@5.3.3`, `jquery@3.7.1`, `chart.js`). Do not assume local `wwwroot/lib/` contains anything.
- **ML Integration:** `AnalyticsService` → `ForecastService` → Python ML API (`http://localhost:8000/api/v1/ml/forecast`). Forecasts cached in `Forecasts` table (24h). Falls back to moving average if ML service is down.

## Design Pattern
- Keep Controllers thin.
- Do not introduce complex front-end frameworks (like React or Vue) into the `SellWise.Web` project. Stick to vanilla JavaScript and Bootstrap 5 inside the Razor views to maintain the simplicity required for the university defense.
