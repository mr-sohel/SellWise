# Team Roles & Feature Split (Defense Guide)

**Project:** SellWise — AI Sales Analytics & Inventory SaaS
**Stack:** ASP.NET Core 10 MVC · Entity Framework Core · SQL Server (Docker) · Python FastAPI (Prophet ML)

---

## Member 1 — Full-Stack .NET Developer
**Focus:** Authentication, Multi-Tenancy, Settings, Dashboard & Analytics

### Features & Responsibilities
- **Login & Signup** — Cookie-based auth via ASP.NET Core Identity. Signup atomically creates `ApplicationUser` + `Store` + `StoreMember(role=owner)` inside a single EF Core transaction.
- **Store Switching** — `SwitchStore` action writes the chosen `StoreId` to session; all downstream queries resolve to that tenant.
- **Multi-Tenancy Foundation** — `BaseController.GetCurrentStoreId()` reads `ActiveStoreId` from session. Every controller inherits this, scoping all DB queries per store automatically.
- **Account Settings** — Update store name (`UpdateProfile`), change password via `UserManager.ChangePasswordAsync`.
- **Staff Management** — Owner-only: invite new or existing users as employee/manager (`InviteEmployee`), remove staff (`RemoveEmployee`), view staff list with roles and join dates.
- **Dashboard & KPIs** — `DashboardController` calls `AnalyticsService.GetOverview` which aggregates: total revenue, order count, average order value, gross profit, net profit (revenue − expenses), revenue growth %, Business Health Score (0–100).
- **Revenue Trend & Category Charts** — `AnalyticsService` groups orders by date (time-series) and `OrderItem` by `Product.Category` (doughnut chart); serialized into `DashboardViewModel` for Chart.js.
- **Top Products & Forecast Cards** — Ranks products by revenue/units; pulls per-product 30-day Prophet forecast from `ForecastService` (or fallback) into `ProductForecastCard` objects.
- **Global Quick Search** — `SearchController.QuickSearch` queries Products, Orders, Customers (top 5 each) filtered by `StoreId`, returns JSON consumed by the navbar search box via `fetch`.
- **Auto-Seeding on First Login** — `DashboardController` detects empty store for `admin@sellwise.com` and fires `DemoSeederService` as a background `Task.Run`.
- **Program.cs & DI Setup** — Registers Identity, session middleware, cookie policy, `HttpClient` for ML, all services in DI.

### Key Files
| File | Responsibility |
|---|---|
| `Controllers/AuthController.cs` | Login, Signup (transactional), Logout, SwitchStore |
| `Controllers/BaseController.cs` | `GetCurrentStoreId()` — multi-tenancy enforcer inherited by all controllers |
| `Controllers/SettingsController.cs` | Profile update, password change, staff invite/remove |
| `Controllers/DashboardController.cs` | Calls `AnalyticsService.GetOverview`, triggers background seed |
| `Controllers/SearchController.cs` | `QuickSearch` — JSON results across products, orders, customers |
| `Services/AnalyticsService.cs` | All KPI aggregation, revenue trend, category sales, health score, forecast integration, moving-average fallback |
| `Services/ForecastService.cs` | HTTP client: POSTs history to Python ML → deserializes forecast response |
| `ViewModels/Auth/LoginViewModel.cs` | Login form binding |
| `ViewModels/Auth/SignupViewModel.cs` | Signup form binding (Email, Password, StoreName) |
| `ViewModels/Settings/ProfileViewModel.cs` | Profile update form binding |
| `ViewModels/Settings/ChangePasswordViewModel.cs` | Password change form binding |
| `ViewModels/Settings/EmployeeViewModel.cs` | Staff list row display |
| `ViewModels/Settings/InviteEmployeeViewModel.cs` | Invite employee form binding |
| `ViewModels/Dashboard/DashboardViewModel.cs` | Typed VM: all KPIs + chart data lists passed to dashboard view |
| `Models/ApplicationUser.cs` | Identity user entity |
| `Models/Store.cs` | Store entity (Name, Currency) |
| `Models/StoreMember.cs` | Join table: UserId + StoreId + Role |
| `Models/Forecast.cs` | Cached forecast entity (StoreId, ProductId, GeneratedAt, PredictedDemand) |
| `Models/ErrorViewModel.cs` | Generic error page model (shared, scaffolded by framework) |
| `appsettings.json` | DB connection string, `MlServiceUrl`, logging config |
| `Properties/launchSettings.json` | Dev server ports and launch profiles |
| `Program.cs` | Identity config, session, cookie policy, DI registrations |

### Defense Q&A
- **How is multi-tenancy enforced?** `BaseController` reads `ActiveStoreId` from the HTTP session. Every EF Core query is wrapped with `.Where(x => x.StoreId == storeId)` — users physically cannot access another store's data.
- **How is signup safe?** `AuthController.Signup` wraps `CreateAsync(user)` + `Stores.Add()` + `StoreMembers.Add()` in one `BeginTransactionAsync()`. Any failure triggers `RollbackAsync()` — no orphan users or stores.
- **How does the health score work?** `AnalyticsService.CalculateHealthScore` starts at 50, adds points for high order count, subtracts points per low-stock alert. Clamped 0–100.
- **What happens when the ML service is down?** `ForecastService.GetForecastAsync` catches any HTTP exception and returns `null`. `AnalyticsService` detects `null` and falls back to a 7-day moving average computed locally in C#.

---

## Member 2 — Full-Stack .NET Developer
**Focus:** Inventory, POS Orders, CRM, Expenses, Alerts & Reports

### Features & Responsibilities
- **Product Catalog (CRUD)** — Create, edit, soft-delete products. Soft delete sets `IsActive = false` to preserve historical `OrderItem` FK references.
- **CSV Bulk Import (Products)** — Upload CSV to batch-create products; custom `ParseCsvLine` handles quoted fields. Aborts on malformed numeric data.
- **POS Order Creation** — Dynamic cart: products and customers are embedded as JSON in the view; vanilla JS calculates live subtotal/discount/delivery/total. Submits to `OrderService.CreateOrderAsync`.
- **ACID Order Transaction** — `OrderService` uses `BeginTransactionAsync`: validates stock per line item, deducts `StockQuantity`, saves `Order` + `OrderItem` rows, updates `Customer.TotalSpent` and `TotalOrders`, all atomically.
- **Order List & Status Management** — Paginated list with search, status filter (pending/processing/completed/cancelled/returned), date-range filter. `ChangeStatus` and `Cancel` actions.
- **Order Details & Invoice** — Full breakdown: line items, customer info, store name, currency. Separate print-ready Invoice view.
- **CSV Bulk Import (Orders)** — Historical order import; auto-creates customers from phone numbers if not already present.
- **Customer Management** — Paginated list with search (name, phone, email), sort by spend/orders/RFM/date. Edit customer profile (name, phone, email, address).
- **RFM Segmentation** — `RfmService.RecalculateAllAsync` groups last-365-days orders by customer, uses 25th/75th percentile breakpoints to assign R/F/M scores (1–5), maps combinations to segments: Champion, Loyal, Potential Loyalist, At Risk, Can't Lose Them, Lost, etc.
- **Expense Tracking** — Log expenses by category (Rent, Utilities, Salaries) with date and notes. Paginated list with date-range filter. Inline Bootstrap modal for fast entry.
- **PDF Sales Report** — `ReportController` uses **QuestPDF** to generate an A4 PDF: date-range header, total orders/revenue summary, table of up to 50 recent orders, paginated footer. Returned as a file download.
- **Low-Stock Alerts** — `AlertService.ScanAndGenerateAlertsAsync`: finds products where `StockQuantity <= LowStockThreshold`, creates `InventoryAlert` records (Critical/Warning). Deduplicates by checking existing `Type == "Low Stock"` alerts. Resolves stale alerts when stock is replenished.

### Key Files
| File | Responsibility |
|---|---|
| `Controllers/ProductController.cs` | Product CRUD + CSV bulk import |
| `Controllers/OrderController.cs` | Order list, create (POS), details, invoice, status change, CSV import |
| `Controllers/CustomerController.cs` | Customer list (search/filter/sort/paginate), edit, trigger RFM recalc |
| `Controllers/ExpenseController.cs` | Expense list + create |
| `Controllers/ReportController.cs` | Report summary page + `ExportPdf` (QuestPDF) |
| `Controllers/AlertController.cs` | Alert list, scan inventory, mark all read, dismiss |
| `Services/OrderService.cs` | ACID transaction: stock deduction + order save + customer totals update |
| `Services/IOrderService.cs` | `CreateOrderAsync` + `GetDashboardKpisAsync` interface |
| `Services/RfmService.cs` | Percentile-based R/F/M scoring + segment label assignment |
| `Services/IRfmService.cs` | `RecalculateAllAsync(storeId)` interface |
| `Services/AlertService.cs` | `ScanAndGenerateAlertsAsync` — low-stock detection + dedup + resolve |
| `Services/IAlertService.cs` | Alert service interface |
| `Models/Product.cs` | Name, SKU, Category, CostPrice, SellingPrice, StockQuantity, LowStockThreshold, IsActive |
| `Models/Order.cs` | OrderNumber, Total, DeliveryCharge, Discount, Status, CustomerId, StoreId |
| `Models/OrderItem.cs` | ProductName (snapshot), Quantity, UnitPrice, CostPrice |
| `Models/Customer.cs` | Name, Phone, Email, TotalOrders, TotalSpent, RFM scores & segment |
| `Models/Expense.cs` | Category, Amount, ExpenseDate, Notes |
| `Models/InventoryAlert.cs` | ProductId, Type, Message, Severity, IsRead |
| `ViewModels/Order/OrderFormViewModel.cs` | POS form: items list, ProductsJson, CustomersJson |
| `ViewModels/Order/OrderViewModel.cs` | Order list row |
| `ViewModels/Product/ProductFormViewModel.cs` | Product create/edit form binding |
| `ViewModels/Product/ProductViewModel.cs` | Product list row |
| `ViewModels/Customer/CustomerViewModel.cs` | Customer list row (includes RFM scores) |
| `ViewModels/Customer/CustomerEditViewModel.cs` | Customer edit form binding |
| `ViewModels/Expense/ExpenseViewModel.cs` | Expense list row |
| `ViewModels/Expense/ExpenseCreateViewModel.cs` | Expense create form binding |
| `ViewModels/Alert/AlertViewModel.cs` | Alert list row (severity, type, isRead) |
| `ViewModels/Report/ReportViewModel.cs` | Report summary page (total orders, total revenue) |

### Defense Q&A
- **How does POS prevent overselling?** Inside `BeginTransactionAsync`, `OrderService` loads each product, checks `StockQuantity >= requested quantity`, and returns an error string that triggers `RollbackAsync` if stock is insufficient — the UI never touches stock.
- **Why soft-delete products?** `OrderItem` keeps a `ProductId` FK. Hard-deleting would orphan historical line items. Setting `IsActive = false` preserves the row and all past invoice data.
- **How are alerts deduplicated?** Before inserting, `AlertService` queries existing `ProductId`s with `Type == "Low Stock"`. If one exists, it is skipped. Resolved products get their alert updated to `"Low Stock (Resolved)"` rather than deleted.
- **What is RFM?** Recency (days since last order), Frequency (order count), Monetary (total spend). `RfmService` uses percentile thresholds over 365 days to give each dimension a 1–5 score, then maps the combination to a named segment used for targeted marketing.

---

## Member 3 — AI/ML Developer
**Focus:** Prophet Demand Forecasting, C# ↔ Python Integration, Forecast Caching & Fallback

### Features & Responsibilities
- **Python FastAPI ML Service** — Standalone microservice (`SellWise.ML/`) exposes `POST /api/v1/ml/forecast`. Accepts JSON with historical daily sales (`ds`, `y`), runs Facebook Prophet, returns 30-day predictions with confidence intervals (`yhat`, `yhat_lower`, `yhat_upper`).
- **Prophet Model** — `prophet_service.py`: configures `yearly_seasonality=True`, `weekly_seasonality=True`. Fits Prophet on the incoming history DataFrame, generates `make_future_dataframe(periods=30)`, clamps negative predictions to 0.
- **Cold-Start Handling** — Returns an empty list if fewer than 2 data points are provided; Prophet fitting errors are caught and return empty rather than crashing.
- **CORS & Middleware** — `main.py` configures `CORSMiddleware` with allowed origins read from `CORS_ORIGINS` env var, supporting the .NET app's ports.
- **Health Endpoint** — `GET /api/v1/ml/health` (and `GET /`) return service status; used by `ForecastService.IsAvailableAsync()` for the C# fallback check.
- **Pydantic Schemas** — `schemas.py` defines `ForecastRequest`, `ForecastResponse`, `SalesHistoryPoint`, `ForecastResultPoint` — the contract between C# and Python.
- **C# Integration Layer** — `ForecastService.cs`: serializes `ForecastRequest` DTO → POSTs to `http://localhost:8000/api/v1/ml/forecast` via typed `HttpClient` → deserializes `ForecastResponse`. URL configured via `appsettings.json` (`MlServiceUrl`).
- **Forecast Caching** — `AnalyticsService` queries `Db.Forecasts` for records within 24 hours before calling Python. Cache hit skips the ML call entirely; new forecasts are batch-inserted after generation.
- **Moving Average Fallback** — On any HTTP exception or `null` response from `ForecastService`, `AnalyticsService.GetFallbackForecast` computes a 30-day flat projection from the 30-day historical average — dashboard never breaks.
- **Docker Container** — `Dockerfile` packages the Python service; `start.ps1`/`start.sh` boot the ML container alongside SQL Server and the .NET app.

### Key Files
| File | Responsibility |
|---|---|
| `SellWise.ML/app/main.py` | FastAPI app factory, CORS middleware, router registration |
| `SellWise.ML/app/routers/forecast.py` | `POST /api/v1/ml/forecast` — validates input, calls `generate_forecast`, returns JSON |
| `SellWise.ML/app/routers/health.py` | `GET /api/v1/ml/health` health check endpoint |
| `SellWise.ML/app/services/prophet_service.py` | `generate_forecast()` — Prophet fit, future dataframe, prediction, clamp to 0 |
| `SellWise.ML/app/models/schemas.py` | Pydantic schemas: `ForecastRequest`, `ForecastResponse`, `SalesHistoryPoint`, `ForecastResultPoint` |
| `SellWise.ML/Dockerfile` | Python service container definition |
| `SellWise.ML/requirements.txt` | Python dependencies (prophet, fastapi, uvicorn, pandas) |
| `Services/ForecastService.cs` | C# HTTP client wrapper: serialize → POST → deserialize; `IsAvailableAsync()` health check |
| `Models/Forecast.cs` | Cached forecast entity: StoreId, ProductId, ForecastDate, PredictedDemand, GeneratedAt |

### Defense Q&A
- **How does Prophet work here?** `prophet_service.py` converts the incoming history list into a pandas DataFrame with `ds` (date) and `y` (quantity sold) columns. Prophet fits a decomposable time-series model with weekly and yearly seasonality. `make_future_dataframe(periods=30)` generates the next 30 dates; `model.predict()` returns trend + seasonality components summed into `yhat`.
- **How does C# call Python?** `ForecastService` sends a `POST` with a JSON body (`store_id`, `product_id`, `history[]`, `periods`) to the FastAPI endpoint. The response is a JSON array of `{ds, yhat, yhat_lower, yhat_upper}` per day, deserialized into `List<ForecastResultPoint>`.
- **What if the Python service is down?** `ForecastService.GetForecastAsync` wraps the HTTP call in try/catch and returns `null`. `AnalyticsService` detects `null` and calls `GetFallbackForecast`, which uses a simple 30-day moving average from historical order data — the dashboard always renders a forecast line.
- **How is caching implemented?** `AnalyticsService` queries `Db.Forecasts.Where(f => f.StoreId == storeId && f.GeneratedAt >= now.AddHours(-24))`. If records exist, they are returned directly. New forecast rows are batch-inserted with `_db.Forecasts.AddRange(newForecasts)` after a successful ML call.

---

## Member 4 — Database Developer
**Focus:** DB Schema, EF Core Migrations, Docker SQL Server, Seed Data, Startup Scripts

### Features & Responsibilities
- **Database Schema Design** — Designed all EF Core Code-First models in collaboration with Members 1 & 2. Owns `AppDbContext.OnModelCreating`: composite PK on `StoreMember {StoreId, UserId}`, decimal precision `(18,2)` on all monetary columns, `DeleteBehavior.Restrict` on `InventoryAlert` and `Forecast` to prevent multi-path cascade errors.
- **Performance Indexes** — Composite indexes for the most common multi-tenant queries: `(StoreId, IsActive)` on Products, `(StoreId, OrderDate)` on Orders, `(StoreId, ExpenseDate)` on Expenses, `(StoreId, IsRead)` on Alerts, `StoreId` on Customers and Forecasts.
- **EF Core Migrations** — Sole owner of `Migrations/`. Runs `dotnet ef migrations add` and `dotnet ef database update` whenever Members 1 or 2 add new model fields. Current migrations: `InitialCreate`, `AddRfmFieldsToCustomer`, `RemoveOrderSource`.
- **Docker SQL Server** — Configured and runs the `sellwise-sql` Docker container (SQL Server image, password `YourPass123!`). Defined in startup scripts.
- **Startup Scripts** — `start.ps1` / `start.sh`: check Docker is running, start the SQL container, run `dotnet ef database update`, start the .NET app, and start the Python ML service.
- **Reset Scripts** — `reset-db.ps1` / `reset-db.sh`: stop containers, drop and recreate the database, re-run migrations, re-seed demo data — gives the team a clean slate for demos.
- **Demo Data Seeder** — `DemoSeederService` procedurally generates months of realistic `Order` + `OrderItem` history per store (two stores: SellWise Tech BD and StyleHub BD), applying trend slope + weekly seasonality noise so the Prophet model has meaningful patterns to learn from.

### Key Files
| File | Responsibility |
|---|---|
| `Data/AppDbContext.cs` | `DbSet<>` registrations; `OnModelCreating` — relationships, precision config, indexes |
| `Migrations/20260721102853_InitialCreate.cs` | Full initial schema: all tables, FKs, Identity tables |
| `Migrations/20260723104421_AddRfmFieldsToCustomer.cs` | Added RecencyScore, FrequencyScore, MonetaryScore, RfmSegment, LastOrderDate |
| `Migrations/20260723133404_RemoveOrderSource.cs` | Dropped OrderSource column after requirements changed |
| `Migrations/AppDbContextModelSnapshot.cs` | EF Core model snapshot (auto-generated, tracks current schema state) |
| `Services/DemoSeederService.cs` | Procedural realistic order history with trend + weekly seasonality per store |
| `SellWise.slnx` | Solution file linking the `SellWise.Web` project |
| `SellWise.Web/SellWise.Web.csproj` | NuGet package references (EF Core, Identity, QuestPDF, etc.) |
| `start.ps1` / `start.sh` | Full-stack boot: Docker SQL → EF migrations → .NET run → Python ML run |
| `reset-db.ps1` / `reset-db.sh` | Drop DB → re-migrate → re-seed |
| `SellWise.slnx` | Solution file linking `SellWise.Web` project |

### Defense Q&A
- **How is the schema designed?** Code-First: C# model classes define the schema. `OnModelCreating` adds composite keys (e.g., `StoreMember` has no surrogate PK — the pair `{StoreId, UserId}` is the PK), sets decimal precision to prevent SQL rounding, restricts cascades to avoid multi-path FK errors, and adds composite indexes on `(StoreId, X)` for every major table to make tenant-scoped queries fast.
- **What are the migrations?** Three: `InitialCreate` (full schema), `AddRfmFieldsToCustomer` (added R/F/M scoring columns needed by Member 2's `RfmService`), `RemoveOrderSource` (removed a column after scope change). EF Core auto-generates the SQL diff from model changes.
- **How does Docker SQL work?** `start.ps1` runs `docker run -e SA_PASSWORD=YourPass123! -p 1433:1433 mcr.microsoft.com/mssql/server`. The connection string in `appsettings.json` points to `localhost,1433`. `reset-db.ps1` stops the container, removes it, and starts fresh.
- **How is seed data realistic?** `DemoSeederService` generates daily orders over several months with a configurable upward trend and random weekly seasonality multipliers, so the time-series has the shape Prophet needs to detect patterns and produce a meaningful 30-day forecast.

---

## Member 5 — Frontend Developer
**Focus:** All Razor Views, Layout, Bootstrap Styling, Chart.js, Inline JS (in collaboration with Members 1 & 2)

### Features & Responsibilities
- **Shared App Shell (`_Layout.cshtml`)** — Sidebar navigation with active-link detection, store-switcher dropdown in the header, unread alert notification bell (badge count), responsive Bootstrap 5.3.3 grid, global search `<input>` with debounced `fetch` dropdown.
- **Auth Layout (`_AuthLayout.cshtml`)** — Minimal centered card layout for Login and Signup pages.
- **Dashboard View** — KPI stat cards (revenue, orders, avg order value, profit, health score), Chart.js revenue trend line chart, category sales doughnut chart, top-performing products table, AI demand forecast line chart with confidence band. Time-range selector buttons (7d / 30d / 90d / 1y) that reload the page with `?range=`.
- **POS Order Create View** — Most complex view: products and customers are embedded as inline JSON from the ViewModel; vanilla JS powers the cart — add/remove rows, live unit price population, quantity change recalculates line totals, delivery charge and discount update the grand total in real time. No page reload.
- **Order Views** — Index (filterable by status and date range, KPI bar at top showing today's revenue and pending count), Details (full line-item breakdown), Invoice (print-ready layout with store branding).
- **Product Views** — Index (paginated table, search bar, CSV import button), Create and Edit forms, `_ProductForm.cshtml` shared partial reused by both Create and Edit.
- **Customer Views** — Index (colour-coded RFM segment badges, sortable columns, segment filter dropdown), Edit form.
- **Expense View** — Paginated list; new expense created via an inline Bootstrap modal without leaving the page.
- **Alert View** — Severity badges (Critical = red, Warning = yellow), scan-inventory button, mark-all-read, per-row dismiss.
- **Report View** — Summary KPIs (total orders, total revenue) with PDF export button that POSTs to `ReportController.ExportPdf`.
- **Settings Views** — `Index.cshtml`: profile update + password change form. `Staff.cshtml`: staff table with role display, invite form, remove button (owner-only).
- **Auth Views** — `Login.cshtml` and `Signup.cshtml` using `_AuthLayout`.
- **Client-Side Validation** — `_ValidationScriptsPartial.cshtml` wires jQuery Unobtrusive Validation on all forms with data annotations.
- **Custom CSS** — `wwwroot/css/site.css`: sidebar width and collapse, card hover effects, RFM badge colour classes, chart container sizing, responsive tweaks on top of Bootstrap CDN.

### Key Files
| File | Responsibility |
|---|---|
| `Views/Shared/_Layout.cshtml` | App shell: sidebar, store-switcher, alert bell, search bar |
| `Views/Shared/_Layout.cshtml.css` | Scoped CSS for the layout (sidebar, nav, header styles) |
| `Views/Shared/_AuthLayout.cshtml` | Minimal layout for Login/Signup |
| `Views/Shared/_ValidationScriptsPartial.cshtml` | jQuery unobtrusive validation partial |
| `Views/Shared/Error.cshtml` | Generic error page |
| `Views/Dashboard/Index.cshtml` | KPI cards, Chart.js charts (trend line, category doughnut, forecast line), time-range selector |
| `Views/Order/Create.cshtml` | POS cart: inline JSON + vanilla JS live calculations |
| `Views/Order/Index.cshtml` | Order list: KPI bar, status/date filters, paginated table |
| `Views/Order/Details.cshtml` | Full order breakdown with line items |
| `Views/Order/Invoice.cshtml` | Print-ready invoice layout |
| `Views/Product/Index.cshtml` | Product list with search, pagination, CSV import |
| `Views/Product/Create.cshtml` | Product create form |
| `Views/Product/Edit.cshtml` | Product edit form |
| `Views/Product/_ProductForm.cshtml` | Shared form fields partial (Create + Edit) |
| `Views/Customer/Index.cshtml` | Customer list with RFM badges and segment filter |
| `Views/Customer/Edit.cshtml` | Customer edit form |
| `Views/Expense/Index.cshtml` | Expense list + inline Bootstrap modal |
| `Views/Alert/Index.cshtml` | Alert list with severity badges and controls |
| `Views/Report/Index.cshtml` | Report summary + PDF export button |
| `Views/Settings/Index.cshtml` | Profile + password change form |
| `Views/Settings/Staff.cshtml` | Staff list + invite form |
| `Views/Auth/Login.cshtml` | Login page |
| `Views/Auth/Signup.cshtml` | Registration/signup page |
| `wwwroot/css/site.css` | Custom CSS on top of Bootstrap 5.3.3 CDN |

### Defense Q&A
- **How does the POS cart work without React or Vue?** `Views/Order/Create.cshtml` embeds `ProductsJson` and `CustomersJson` from the ViewModel as inline JavaScript variables. Vanilla JS reads these arrays on load, populates the product select, and attaches `change`/`input` event listeners. Each change recalculates line totals and the grand total in real time — submitted as a standard HTML form.
- **How do Chart.js charts get their data?** The Razor view uses `@Json.Serialize(Model.RevenueTrend)` to emit typed C# lists as inline JavaScript arrays. Chart.js reads them on `DOMContentLoaded`. No AJAX, no separate API endpoint — data is baked into the page on the server render.
- **Why CDN instead of bundled assets?** Bootstrap 5.3.3 and Chart.js are loaded from CDN to eliminate a Node/npm frontend build pipeline. This keeps the project simple and focuses complexity on the backend and ML, appropriate for the team size and academic context.
- **How is the global search dropdown rendered?** The `<input>` in `_Layout.cshtml` fires a debounced `fetch` to `/Search/QuickSearch?q=...`. The returned JSON `{products[], orders[], customers[]}` is injected into a `<div>` dropdown via `innerHTML` — no template engine needed.

---

## Collaboration Notes

| Area | Who touches it |
|---|---|
| `Models/*.cs` | Member 4 defines schema · Members 1 & 2 add properties as needed |
| `Data/AppDbContext.cs` | Member 4 exclusively runs migrations |
| `Program.cs` | Member 1 owns · Member 4 adds connection string config |
| `Views/Shared/_Layout.cshtml` | Member 5 owns · Members 1 & 2 add sidebar nav links for their features |
| `Views/_ViewImports.cshtml`, `Views/_ViewStart.cshtml` | Shared — do not modify unilaterally |
| `Services/AnalyticsService.cs` | Member 1 owns · Member 3 owns `ForecastService.cs` which it calls |
| `start.ps1` / `start.sh` | Member 4 owns |

---

## Defense Presentation Flow

1. **Member 1** — Opens the app, explains the multi-tenant SaaS concept, logs in, switches between the two stores, shows Settings (profile update, staff invite), then walks through the Dashboard — KPI cards, charts, and how `AnalyticsService` aggregates data.
2. **Member 2** — Navigates to Products (adds a product), then opens Order → Create (POS), builds a cart, submits the order, shows the stock was decremented. Goes to Customers, triggers RFM recalculation, explains the segments. Adds an expense. Shows the Alert scan. Downloads a PDF report.
3. **Member 3** — Scrolls to the Demand Forecast section on the Dashboard. Explains the Python FastAPI service, how Prophet was trained on the seeded history, what `yhat`/confidence intervals mean, and what happens when the service is offline (fallback moving average).
4. **Member 4** — Opens the codebase, shows `AppDbContext.OnModelCreating` (schema relationships, indexes), walks through the three migrations, shows `DemoSeederService` generating realistic data, and demonstrates `reset-db.ps1` for a clean demo.
5. **Member 5** — Takes control of the browser, walks through every page's UI — sidebar, responsive layout, POS cart JS, Chart.js wiring, RFM badge colours, Bootstrap modal for expenses, and the global search dropdown.

## Demo Credentials
- **Email:** `admin@sellwise.com` &nbsp;|&nbsp; **Password:** `Admin123!`
- **Stores:** SellWise Tech BD (electronics) · StyleHub BD (fashion)
