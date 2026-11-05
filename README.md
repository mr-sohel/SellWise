# SellWise

[![CI](https://github.com/mr-sohel/SellWise/actions/workflows/ci.yml/badge.svg)](https://github.com/mr-sohel/SellWise/actions/workflows/ci.yml)

A point-of-sale and inventory web app for small retail shops, with sales analytics and
30-day demand forecasting from a separate Python service.

**Stack:** ASP.NET Core 10 MVC · Entity Framework Core 10 · SQL Server · ASP.NET Core Identity ·
Python FastAPI + Prophet · Bootstrap 5 + Chart.js · xUnit + pytest · Docker Compose + Caddy · GitHub Actions

---

## Features

- **POS checkout:** sell products, attach or create a customer, walk-in or online orders, printable invoices.
- **Inventory:** products, restocking, and low-stock alerts generated from current stock levels.
- **Multiple stores per account:** an owner can run several stores and switch between them; data is isolated per store.
- **Two roles:** the *owner* sees everything; *staff* can only use the POS, orders and customers.
- **Dashboard:** revenue, orders, average order value, revenue trend, category split, top products.
- **Demand forecasting:** per-product 30-day forecast from Prophet, with restock suggestions.
- **Customer segmentation:** RFM (Recency, Frequency, Monetary) scoring into segments such as *Champion* or *At Risk*.
- **PDF sales report** generated with QuestPDF.

## Architecture

```text
Browser ──HTTP──▶ SellWise.Web (ASP.NET Core MVC) ──EF Core──▶ SQL Server
                          │
                          └──HTTP/JSON──▶ SellWise.ML (FastAPI + Prophet)
```

- **SellWise.Web**: controllers stay thin. Business rules live in `Services/` (orders, products, analytics, RFM, alerts).
- **SellWise.ML**: a stateless forecasting API. It gets 90 days of daily sales for a product and returns a 30-day forecast.
- **SellWise.Tests**: xUnit tests for the order rules, RFM scoring and forecast helpers.

## Design decisions

These are the parts I'd point to in a code review.

**Store isolation.** Every row belongs to a store (`StoreId`). Before each action, `BaseController` loads the
user's membership for the active store (kept in session) and exposes `StoreId` and `IsOwner`. Every query
filters by `StoreId`, including lookups by id, so a user can't open another store's order by guessing its id.

**Authorization in one place.** Owner-only pages are marked with `[OwnerOnly]` (see `Authorization/`).
`BaseController` enforces it, so the actions don't repeat role checks.

**Stock can't be oversold.** Checkout decrements stock with one conditional `UPDATE`:

```csharp
_db.Products
    .Where(p => p.Id == productId && p.StockQuantity >= quantity)
    .ExecuteUpdateAsync(s => s.SetProperty(p => p.StockQuantity, p => p.StockQuantity - quantity));
```

If it updates 0 rows, there wasn't enough stock. The database runs the check and the decrement together,
so two cashiers selling the last item at the same moment can't both succeed. A read-then-write version can't
give that guarantee. The order, the stock changes and the customer totals are saved in one transaction.
Cancelling an order puts the stock back.

**Forecasts degrade gracefully.** Results are cached in the `Forecasts` table for 24 hours, so Prophet doesn't
run on every dashboard load. If the ML service is down or slow (10-second timeout), the dashboard falls back
to repeating the last 14 days of sales instead of failing.

**RFM scoring is a pure function.** `RfmScoring` has no database access, which makes the segment rules easy
to unit-test.

**Soft delete for products.** Deleted products are hidden (`IsActive = false`), not removed, so past orders and
reports stay correct.

## Running locally

**Prerequisites:** .NET 10 SDK, Docker, Python 3.11 and [uv](https://github.com/astral-sh/uv).

```bash
./start.ps1      # Windows
./start.sh       # macOS / Linux
```

The script starts SQL Server in Docker, the ML service on `:8000` and the web app on **http://localhost:5000**.
In Development, the database is migrated and seeded on first run with two demo stores and 180 days of orders.

| Demo login | |
|---|---|
| Email | `admin@sellwise.com` |
| Password | `Admin123!` |

To start the demo data again from scratch, run `./reset-db.ps1` or `./reset-db.sh`.

<details>
<summary>Running the parts by hand</summary>

```bash
docker run -d --name sellwise-sql -e ACCEPT_EULA=Y -e "MSSQL_SA_PASSWORD=YourPass123!" \
  -p 1433:1433 -v sellwise-data:/var/opt/mssql mcr.microsoft.com/mssql/server:2022-latest

cd SellWise.ML && uv venv && uv pip install -r requirements.txt
uv run uvicorn app.main:app --port 8000          # API docs: http://localhost:8000/docs

cd ../SellWise.Web && dotnet run                  # http://localhost:5000
```
</details>

## Tests

```bash
dotnet test SellWise.slnx                                   # .NET tests
cd SellWise.ML && pip install -r requirements-dev.txt && pytest   # ML service tests
```

GitHub Actions runs both suites on every push and pull request.

## Deployment

`docker-compose.yml` runs SQL Server, the ML service and the web app on a private network, behind Caddy
(automatic HTTPS). Only Caddy is exposed.

```bash
cp .env.example .env    # set SA_PASSWORD and DOMAIN (and optionally a demo account)
docker compose up -d --build
```

## Project structure

```text
SellWise.Web/
  Authorization/   StoreRoles, [OwnerOnly]
  Controllers/     thin MVC controllers; BaseController resolves store + role
  Data/            AppDbContext, startup migration/seeding
  Migrations/      EF Core migrations
  Models/          entities
  Services/        business logic (orders, analytics, forecasting client, RFM, alerts)
  ViewModels/      form/view models (entities are never bound directly)
  Views/           Razor views
SellWise.ML/       FastAPI + Prophet forecasting service and its tests
SellWise.Tests/    xUnit tests
docs/              original project report (describes an earlier, larger version)
```

## Known limitations

- Dates are stored and grouped in UTC, so "today" follows UTC rather than the store's time zone.
- Staff accounts are created by the owner with a password; there are no email invitations.
- The forecast assumes demand is driven by past sales only (no promotions, price changes or holidays).
