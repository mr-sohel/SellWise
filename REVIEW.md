# Audit: SellWise

**Date:** 2026-08-19
**Scope:** Full codebase audit covering the ASP.NET Core Web MVC application (`SellWise.Web`) and Python FastAPI ML service (`SellWise.ML`).
**Files reviewed:** ~60 core application files (Controllers, Services, Views, ML Routers).
**Total issues found:** 9

---

## Critical Issues

Issues that block a release or pose immediate risk.

| # | File | Issue | Severity |
|---|------|-------|----------|
| 1 | `Controllers/*.cs` | **CSRF Vulnerability**: Missing `[ValidateAntiForgeryToken]` attribute on almost all state-changing `[HttpPost]` endpoints (e.g., `ProductController.Create/Edit/Delete`, `CustomerController.Edit`, `ExpenseController.Create`, `AuthController`, etc.). | Critical |
| 2 | `Services/OrderService.cs:40` | **Data Consistency Bug**: `CreateOrderAsync` does **not** update `Customer.TotalOrders` and `Customer.TotalSpent` when processing an order for an existing customer. These metrics will drift and become inaccurate. | Critical |

**Fix Suggestions:**
- **#1**: Add `[ValidateAntiForgeryToken]` to all `[HttpPost]` action methods that perform data mutations.
- **#2**: In `OrderService.CreateOrderAsync`, fetch the `Customer` record, increment `TotalOrders++`, and add the final order total to `TotalSpent` before saving the transaction.

---

## Architecture & Design

Pattern violations, structural problems, over-engineering, or missed simplifications.

- **Fat Controllers**: `ProductController`, `CustomerController`, and `ExpenseController` write directly to the database (e.g., `Db.Products.Add(...)`, `await Db.SaveChangesAsync()`). This violates the project convention: *"Controllers delegate to services — no business logic in action methods"*. These operations should be moved to dedicated services (e.g., `ProductService`, `CustomerService`).
- **Dangerous Background Tasks**: `DashboardController.Index` uses a fire-and-forget `Task.Run` to seed demo data. If the application pool recycles or the process shuts down, this task is abruptly terminated. Background seeding should ideally be handled via an `IHostedService` or background queue worker.

---

## Security

Vulnerabilities, missing auth, injection risks, secret exposure.

- **Hardcoded Secrets**: `SellWise.Web/appsettings.json` contains a hardcoded database password (`Password=YourPass123!`). Secrets should be moved to User Secrets (during development) or Environment Variables/Key Vaults (in production).
- *(See Critical Issue #1 regarding CSRF vulnerabilities)*.

---

## Performance

N+1 queries, unbounded operations, missing pagination, sync-in-async.

- **Sequential HTTP Calls**: `AnalyticsService.GetOverview` and `AnalyticsService.GetForecastsPageAsync` iterate over products using a `foreach` loop and sequentially `await GetProductForecastAsync`. This performs sequential, blocking HTTP calls to the ML service. This will cause severe dashboard latency.
  - **Fix**: Use `Task.WhenAll` to fetch ML forecasts concurrently.
- **Synchronous DB Query**: `DashboardController.Index` uses the synchronous `Db.Products.Any(...)` method inside an async action. 
  - **Fix**: Change it to `await Db.Products.AnyAsync(...)` to avoid blocking the thread pool.
- **Missing AsNoTracking**: Read-only endpoints such as `ReportController.ExportPdf` load tracked entities into memory. Using `.AsNoTracking()` would reduce memory allocation overhead.

---

## Dead Code & Tech Debt

Orphaned code, stale comments, TODO/FIXME items, unused dependencies.

- **Raw Print Statements**: In `SellWise.ML/app/services/prophet_service.py`, an exception during Prophet model fitting uses a raw `print(f"Prophet fitting failed: {e}")` instead of utilizing the standard Python `logging` module.
- **Missing Tests**: `dotnet test` and `uv run pytest` show exactly 0 tests executed. A baseline test suite covering critical paths (like `OrderService.CreateOrderAsync`) is highly recommended to prevent regressions.

---

## Convention Violations

Deviations from project conventions in AGENTS.md / CLAUDE.md.

- **Business Logic in Controllers**: Controllers handle DB modifications directly (`ProductController`, `CustomerController`, `ExpenseController`), violating the thin controller mandate.

---

## Nits & Suggestions

Minor cleanup opportunities — optional but worth considering.

- `AnalyticsService` does some heavy lifting in memory (e.g., calculating RFM segments/health scores based on fetched lists). Consider offloading some aggregations directly to SQL using `GROUP BY` to save application memory on larger stores.

---

## Verification

| Check | Status |
|-------|--------|
| `dotnet build` | ✅ Succeeded (0 warnings, 0 errors) |
| `dotnet test` | ❌ No test projects found |
| `uv run pytest` | ❌ 0 tests collected/ran |
| Multi-tenancy Checks | ✅ Passed (`StoreId` filters are consistently applied) |

---

## Summary

The `SellWise` project is structurally sound with a good foundational architecture (EF Core, strictly-typed ViewModels, multi-tenancy enforcement, and transactions). However, the codebase has accumulated some critical health issues that need immediate attention.

**Next Steps (Prioritized):**
1. Fix the `OrderService` customer metrics consistency bug to prevent data corruption.
2. Apply `[ValidateAntiForgeryToken]` to all `[HttpPost]` endpoints to secure the application against CSRF.
3. Remove the hardcoded database password from `appsettings.json`.
4. Refactor `ProductController`, `CustomerController`, and `ExpenseController` to extract database logic into dedicated services.
5. Optimize `AnalyticsService` to dispatch ML forecast HTTP calls concurrently (`Task.WhenAll`).