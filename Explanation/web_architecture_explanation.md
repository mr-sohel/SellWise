# Web Architecture Explanation: SellWise.Web (Defense Guide)

This document provides a deep dive into the inner workings of the SellWise web application. Use this guide during your university defense to explain *how* features are implemented, *why* architectural choices were made, and *where* to find the exact code in the repository.

---

## 1. MVC Pattern & Clean Code Architecture

The web app strictly follows the **ASP.NET Core 10 MVC** (Model-View-Controller) pattern, ensuring strict separation of concerns for maintainability, readability, and security.

* **Models (`SellWise.Web/Models/`):** C# POCO classes (e.g., `Product`, `Order`, `OrderItem`, `Customer`, `Expense`, `Forecast`, `Store`) representing database tables.
* **Controllers (`SellWise.Web/Controllers/`):** Kept deliberately thin. Controllers route HTTP requests, execute model validation (`ModelState.IsValid`), invoke business services, and return strictly typed Razor Views or JSON responses.
* **Views (`SellWise.Web/Views/`):** Razor templates (`.cshtml`) styled with **Bootstrap 5.3.3** via CDN, Chart.js 4.4, and clean vanilla JavaScript. Avoiding heavyweight frontend frameworks (like React/Vue) prevents unnecessary client-side bundle bloat and keeps execution deterministic.
* **ViewModels (`SellWise.Web/ViewModels/`):** Strongly typed data transfer objects (e.g., `OrderFormViewModel`, `ExpenseCreateViewModel`, `DashboardViewModel`).
  > **🎓 Defense Tip:** Emphasize that raw EF Core database entities are **never** directly bound from incoming HTTP requests. Using explicit ViewModels protects against **Over-Posting / Mass Assignment vulnerabilities**.
* **Services (`SellWise.Web/Services/`):** Encapsulates all domain and business logic (order processing, RFM scoring, analytics aggregation, alerting, and mock data generation).

---

## 2. Dependency Injection (DI) & Service Lifetimes

SellWise leverages ASP.NET Core’s built-in Inversion of Control (IoC) container to achieve loose coupling and testability.

* **Registration (`Program.cs`):**
  ```csharp
  builder.Services.AddScoped<IOrderService, OrderService>();
  builder.Services.AddScoped<IAlertService, AlertService>();
  builder.Services.AddScoped<IRfmService, RfmService>();
  builder.Services.AddScoped<AnalyticsService>();
  builder.Services.AddScoped<DemoSeederService>();
  builder.Services.AddHttpClient<ForecastService>(client => {
      client.Timeout = TimeSpan.FromSeconds(5);
  });
  ```
* **Injection in Action (`OrderController.cs`):**
  ```csharp
  public OrderController(AppDbContext db, IOrderService orderService) : base(db)
  {
      _orderService = orderService;
  }
  ```
* **Why Scoped?** `Scoped` services are instantiated once per HTTP request lifecycle, perfectly matching the lifetime of the EF Core `AppDbContext` to maintain a single Unit of Work.
* **Resilient HTTP Client:** `ForecastService` is registered via `AddHttpClient` with a strict 5-second timeout to prevent cold-starting Python ML workers from hanging the web thread pool.

---

## 3. Database Transactions & Data Integrity (ACID)

In retail and inventory management, atomic transactions are non-negotiable. Placing an order requires multiple simultaneous mutations:
1. Inserting the `Order` record and related `OrderItem` rows.
2. Deducting the physical `StockQuantity` from each corresponding `Product`.
3. Updating customer purchase timestamps and totals.

* **The Problem:** If an unhandled exception or server restart happens after saving the order but before reducing inventory, stock becomes desynchronized (ghost stock).
* **The Solution (`SellWise.Web/Services/OrderService.cs`):**
  ```csharp
  using var transaction = await _db.Database.BeginTransactionAsync();
  try
  {
      // 1. Validate customer & product existence
      // 2. Validate sufficient stock
      // 3. Deduct stock: product.StockQuantity -= item.Quantity
      // 4. Save Order and OrderItems
      await _db.SaveChangesAsync();
      await transaction.CommitAsync();
  }
  catch (Exception)
  {
      await transaction.RollbackAsync();
      return "Order creation failed. Rolling back.";
  }
  ```
* **ACID Guarantee:** If any product is out of stock or validation fails, `transaction.RollbackAsync()` reverts all pending mutations, guaranteeing that the database remains in a consistent state.

---

## 4. Multi-Tenancy & Query Isolation

SellWise is architected as a multi-tenant Software-as-a-Service platform where multiple distinct stores share a single physical SQL Server database.

* **Authentication:** ASP.NET Core Identity with secure, HttpOnly cookie sessions (`Program.cs` / `AuthController.cs`).
* **Tenant Isolation:**
  * All controllers inherit from `BaseController.cs`.
  * `BaseController` exposes `GetCurrentStoreId()`, which extracts the active tenant GUID from `HttpContext.Session.GetString("ActiveStoreId")`.
  * Every repository/EF Core query filters explicitly by store ID:
    ```csharp
    var products = await Db.Products
        .Where(p => p.StoreId == storeId && p.IsActive)
        .ToListAsync();
    ```
  * This structural isolation guarantees that Store A can never view or modify Store B's customers, inventory, or financial data.

---

## 5. Dynamic Multi-Store Switching & Realistic Demo Seeding

To demonstrate real-world SaaS workflows during defense evaluations, SellWise provides multi-store tenancy switching:

* **Store Switching (`AuthController.cs:141`):**
  The `SwitchStore(Guid storeId)` action verifies that the authenticated user belongs to the target store via `StoreMembers` table, updates the `ActiveStoreId` session state, and redirects seamlessly to the dashboard.
* **Realistic Trend Data Generation (`DemoSeederService.cs`):**
  The seeder injects realistic historical datasets for two distinct demo business verticals:
  1. **SellWise Tech BD:** Consumer electronics (53 products, 300 customers, 180 days of growth trends + weekend spikes).
  2. **StyleHub BD:** Fashion & apparel (50 products, 250 customers, 180 days of seasonal volume).
* **Execution:**
  - Automated seeding on first login for the default admin (`admin@sellwise.com`).
  - Full reset via `dotnet run --seed` or execution scripts (`.\reset-db.ps1` / `./reset-db.sh`).

---

## 6. Customer Segmentation Engine (RFM Analysis)

Rather than relying on opaque black-box classifiers with insufficient training data, SellWise implements algorithmic **Recency, Frequency, Monetary (RFM)** analysis.

* **Implementation (`SellWise.Web/Services/RfmService.cs`):**
  `RecalculateAllAsync(Guid storeId)` queries the entire transaction ledger for that store:
  - **Recency ($R$):** Days elapsed since the customer's last order.
  - **Frequency ($F$):** Total lifetime count of completed orders.
  - **Monetary ($M$):** Aggregate currency spent.
* **Percentile-Based Scoring (1–5):**
  Customers are ranked into percentile buckets (Top 10% $\rightarrow$ 5, Top 25% $\rightarrow$ 4, Median $\rightarrow$ 3, Bottom 25% $\rightarrow$ 2, Bottom 10% $\rightarrow$ 1).
* **8 Actionable Behavioral Cohorts:**
  Scores map to strategic business segments:
  - **Champions ($R \ge 4, F \ge 4, M \ge 4$):** High-value promoters; target with VIP programs.
  - **Loyal Customers ($R \ge 3, F \ge 3, M \ge 3$):** Consistent buyers; prime for upsells.
  - **At Risk ($R \le 2, F \ge 3, M \ge 3$):** High historical spenders who stopped buying; trigger win-back campaigns.
  - **Lost ($R \le 2, F \le 2, M \le 2$):** Dormant churned accounts.
  - **New Customers ($R \ge 4, F \le 2$):** Recent first-time purchasers needing onboarding.
  - **Can't Lose Them ($R \le 2, F \ge 4, M \ge 4$):** Urgent retention intervention needed.
* **UI Integration (`CustomerController.cs`):** Store managers can filter the customer directory directly by segment to export targeted outreach lists.

---

## 7. Operational Expense Tracking & True Net Profitability

Standard retail tools only track Gross Revenue (Price $\times$ Quantity), giving a false impression of business health. SellWise accounts for operational overhead to calculate **True Net Profit**.

* **Controller Implementation (`ExpenseController.cs`):**
  Users record operational overhead categorized into Rent, Utilities, Marketing, Salaries, and Inventory Shipping.
* **Analytics Calculation (`AnalyticsService.cs`):**
  $$\text{Gross Profit} = \sum (\text{Sale Price} - \text{Cost Price}) \times \text{Quantity Sold}$$
  $$\text{Net Profit} = \text{Gross Profit} - \sum \text{Operating Expenses}$$
* This gives store owners an exact view of net margins and operational burn rate on the dashboard.

---

## 8. Programmatic PDF Generation (QuestPDF Engine)

SellWise generates formatted financial and inventory audit documents dynamically in C#.

* **Architecture (`ReportController.cs`):**
  Uses **QuestPDF** (Fluent C# API) configured under the Community license (`LicenseType.Community`).
* **Why Code-First PDF Generation?**
  Traditional HTML-to-PDF converters (like wkhtmltopdf or Puppeteer) are slow, require headless browsers, and have security vulnerabilities. QuestPDF compiles directly into a native document model with deterministic pagination.
* **Dynamic Report Composition:**
  ```csharp
  var document = Document.Create(container => {
      container.Page(page => {
          page.Size(PageSizes.A4);
          page.Margin(2, Unit.Centimetre);
          page.Header().Element(ComposeHeader);
          page.Content().Element(ComposeContent);
          page.Footer().Element(ComposeFooter);
      });
  });
  return File(document.GeneratePdf(), "application/pdf", "SalesReport.pdf");
  ```
* Supports configurable date ranges (7, 30, 90 days, or All Time) with tabulated customer orders and financial aggregates.

---

## 9. Soft Delete Strategy (Data Integrity & Auditability)

In relational enterprise systems, executing hard SQL deletes (`DELETE FROM Products`) corrupts foreign-key constraints on historic order ledgers.

* **Implementation (`ProductController.cs:Delete`):**
  Instead of `Db.Products.Remove(product)`, the system performs a soft deletion:
  ```csharp
  product.IsActive = false;
  await Db.SaveChangesAsync();
  ```
* **Query Level:** Active listings filter with `.Where(p => p.IsActive)`.
* **Benefit:** When viewing a 6-month-old order invoice containing a discontinued item, the historic order line, SKU, unit price, and total remain intact without database orphan errors.

---

## 10. Intelligent Inventory Threshold Alerts

SellWise continuously monitors stock levels to prevent stockouts and loss of sales momentum.

* **Logic (`AlertService.cs` / `AlertController.cs`):**
  - **Critical Alert:** `StockQuantity == 0` (Out of Stock).
  - **Warning Alert:** `0 < StockQuantity <= LowStockThreshold`.
* **Dashboard Surfacing:** Alerts are displayed immediately on login in `DashboardController.cs` with quick-restock triggers and restock-status badges.

---

## 11. Cross-Entity Global Search Architecture

To ensure fast navigation in high-volume stores, SellWise implements an asynchronous cross-entity search bar.

* **Endpoint (`SearchController.cs:QuickSearch`):**
  Accepts a search query `q` and executes parallelized database lookups across three entities:
  1. **Products:** Matches by `Name` or `Sku`.
  2. **Orders:** Matches by `OrderNumber` or customer `Name`.
  3. **Customers:** Matches by `Name` or `Phone`.
* **JSON Payload:** Returns structured search results consumed by the top-bar vanilla JS search dropdown for instantaneous page navigation.