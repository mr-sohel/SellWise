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

- **Web Framework:** ASP.NET Core 8/10 MVC
- **Database ORM:** Entity Framework (EF) Core
- **Database Engine:** SQL Server (Dockerized)
- **Authentication:** ASP.NET Core Identity (Cookie-based session)
- **Frontend UI:** Razor Views styled with Bootstrap 5
- **Machine Learning:** Python, FastAPI, Facebook Prophet, Scikit-Learn

---

## 3. Core Modules & Logic

The ASP.NET Core backend strictly follows the **MVC (Model-View-Controller)** pattern.

### **Models (`Models/`)**
Contains simple C# POCOs (Plain Old C# Objects) representing our database tables like `Product`, `Order`, `Customer`, and `Expense`. `AppDbContext` handles the translation between these objects and SQL Server.

### **Controllers (`Controllers/`)**
Thin controllers that handle HTTP requests. For example, `ProductController.cs` receives the request to create a product, checks `ModelState.IsValid`, interacts with the database via `AppDbContext`, and returns the appropriate Razor View.

### **Views (`Views/`)**
Razor `.cshtml` files that render the HTML. We use ViewModels (e.g., `OrderFormViewModel`) to pass strictly typed data from the Controllers to the Views, preventing over-posting attacks and keeping the UI code clean.

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
4. The system calculates totals, creates the Order, creates Order Items, and crucially, **deducts the stock quantity** from the Products table.
5. If everything succeeds, the transaction is committed (`CommitAsync()`). If an error occurs, it rolls back to prevent incomplete data.

---

## 5. Machine Learning (AI Forecasting)

The Python service runs independently on port 8000. It provides an endpoint `/api/v1/ml/forecast` that our C# `ForecastService.cs` calls to predict future sales.

- **Prophet Algorithm:** If a product has a long history, it uses Meta's Prophet model. Prophet automatically learns weekly/monthly seasonalities (e.g., higher sales on weekends).
- **Integration:** The ASP.NET app passes the historical sales data to the Python API, waits for the mathematical prediction, and then renders it on the C# Dashboard using Chart.js.

---

## 6. How to Run the Project (Defense Mode)

To simplify the presentation during the defense board, a single automation script has been provided. 

1. Ensure Docker and .NET SDK are installed.
2. Open your terminal in the root `SellWise` folder.
3. Run the following command:

```bash
./start.sh
```

This script will automatically:
1. Start the SQL Server Docker container.
2. Boot up the Python ML FastAPI service in the background.
3. Run `dotnet ef database update` to ensure your database is perfectly synced.
4. Start the ASP.NET Core MVC application on `http://localhost:5000`.
