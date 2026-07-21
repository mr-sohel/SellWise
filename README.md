# SellWise: AI Sales Analytics & Inventory SaaS

SellWise is a modern Software-as-a-Service (SaaS) application designed for small online sellers. It helps business owners manage their inventory, track sales, and use Artificial Intelligence to predict future demand.

For the purpose of the university defense, this project has been refactored into a clean, monolithic **ASP.NET Core MVC** architecture, ensuring the code is highly readable, easily explainable, and extremely reliable.

---

## 1. Project Architecture

The system is divided into two main components:
1. **`SellWise.Web/`:** The main ASP.NET Core web application. It handles routing, user authentication, business logic, database connections, and rendering the UI.
2. **`SellWise.ML/`:** A standalone Python API (FastAPI) responsible for running Machine Learning algorithms. The ASP.NET Core app communicates with this service natively via `HttpClient`.

---

## 2. Tech Stack

- **Web Framework:** ASP.NET Core 10 MVC (`net10.0`)
- **Database ORM:** Entity Framework (EF) Core 10
- **Database Engine:** SQL Server 2022 (Dockerized)
- **Authentication:** ASP.NET Core Identity (Cookie-based session)
- **Frontend UI:** Razor Views styled with Bootstrap 5.3.3 + Chart.js (loaded via CDN)
- **Machine Learning:** Python, FastAPI, Facebook Prophet, Scikit-Learn

---

## 3. Core Modules & Logic

The ASP.NET Core backend strictly follows the **MVC (Model-View-Controller)** pattern.

### **Models (`Models/`)**
Contains simple C# POCOs (Plain Old C# Objects) representing our database tables like `Product`, `Order`, `Customer`, `Expense`, and `Forecast`. `AppDbContext` handles the translation between these objects and SQL Server.

### **Controllers (`Controllers/`)**
Thin controllers that handle HTTP requests. For example, `ProductController.cs` receives the request to create a product, checks `ModelState.IsValid`, interacts with the database via `AppDbContext`, and returns the appropriate Razor View. All controllers inherit from `BaseController`, which provides `GetCurrentStoreId()` for multi-tenant data filtering.

### **Views (`Views/`)**
Razor `.cshtml` files that render the HTML. We use ViewModels (e.g., `OrderFormViewModel`) to pass strictly typed data from the Controllers to the Views, preventing over-posting attacks and keeping the UI code clean.

### **Services (`Services/`)**
Business logic lives here:
- `AnalyticsService.cs` — Dashboard KPIs, revenue trends, product analytics, calls ForecastService for real ML predictions
- `ForecastService.cs` — Calls Python ML service via `HttpClient`, caches results in `Forecasts` table
- `DemoSeederService.cs` — Seeds realistic demo data with trends and weekly seasonality (53 products, 200 customers, ~11K orders)

---

## 4. Key Workflows

### Add Product Workflow
When a user adds a new product:
1. The user fills out the form in `Views/Product/Create.cshtml`.
2. The form submits a POST request to `ProductController.Create()`.
3. ASP.NET automatically validates the data based on the data annotations (e.g., `[Required]`, `[Range]`) in the model.
4. If valid, the controller saves the new `Product` using EF Core (`Db.Products.Add(product)`) and redirects the user back to the inventory list.

### Create Order Workflow (ACID Transaction)
Creating an order involves modifying multiple tables (Orders, OrderItems, Products) simultaneously.
1. The user selects a customer and products in the POS interface (`Views/Order/Create.cshtml`).
2. `OrderController` receives the `OrderFormViewModel`.
3. An EF Core Database Transaction (`BeginTransactionAsync()`) is started.
4. The system calculates totals, creates the Order, creates Order Items, and crucially, **deducts the stock quantity** from the Products table (with stock validation).
5. If everything succeeds, the transaction is committed (`CommitAsync()`). If an error occurs, it rolls back to prevent incomplete data.

### Demo Data Seeding
- **Auto-seed:** Only for the default admin (`admin@sellwise.com`) — seeds demo data in the background on first Dashboard visit.
- **Manual seed (Reset DB):** Run `./reset-db.sh` or `.\reset-db.ps1` to drop the DB, run migrations, and inject realistic, trend-heavy mock data.
- **Default Admin Account:** `admin@sellwise.com` / `Admin123!`. Other users start with a clean empty store.

---

## 5. Machine Learning (AI Forecasting)

The Python service runs independently on port 8000. It provides an endpoint `/api/v1/ml/forecast` that our C# `ForecastService.cs` calls to predict future sales.

### How It Works
1. When the Dashboard loads, `AnalyticsService` identifies the top 6 products by historical volume (units sold).
2. For each product, it gathers 90 days of sales history from `OrderItems`.
3. Missing days are padded with zeros to create continuous daily data.
4. `ForecastService` sends the history to the Python ML service.
5. The Python service selects the algorithm based on data availability:
   - **Prophet** (≥30 days history): Meta's Prophet model with weekly/yearly seasonality and Bangladesh holidays
   - **EWMA** (<30 days history): Exponential Weighted Moving Average for sparse data
6. The prediction (30-day demand forecast) is returned and stored in the `Forecasts` table for caching.
7. The Dashboard strictly ranks these resulting cards by **highest predicted demand** (so #1 mathematically forecasts the most units), and renders the curves.

### Caching
Forecasts are cached in the `Forecasts` table for 24 hours. If the ML service is unavailable, the system falls back to a simple moving average.

---

## 6. How to Run the Project

### Automated (Recommended)
1. Ensure Docker and .NET SDK are installed.
2. Open your terminal in the root `SellWise` folder.
3. Run:
   ```bash
   ./start.sh          # macOS/Linux
   .\start.ps1         # Windows
   ```

This script will automatically:
1. Start the SQL Server Docker container (with persistent data volume).
2. Boot up the Python ML FastAPI service in the background.
3. Run `dotnet ef database update` to ensure your database is perfectly synced.
4. Start the ASP.NET Core MVC application on `http://localhost:5000`.

### Manual (Individual Components)
```bash
# ASP.NET Core app
cd SellWise.Web && dotnet run

# Python ML service
cd SellWise.ML && uv run uvicorn app.main:app --port 8000 --reload

# Seed demo data
cd SellWise.Web && dotnet run --seed
```
