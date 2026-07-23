# Web Architecture Explanation: SellWise.Web (Defense Guide)

This document provides a deep dive into the inner workings of the SellWise web application. Use this guide during your university defense to explain *how* features are implemented and *where* to find the exact code. 

## 1. MVC Pattern & Clean Code Architecture

The web app strictly follows the **ASP.NET Core 10 MVC** (Model-View-Controller) pattern. This separates concerns so the codebase remains maintainable and testable.

*   **Models:** Located in `SellWise.Web/Models/`. These are C# classes (e.g., `Product`, `Order`, `Customer`) that map directly to database tables using Entity Framework Core.
*   **Controllers:** Located in `SellWise.Web/Controllers/`. They handle HTTP requests. We followed the rule to **keep controllers thin**. They route the request, perform basic checks, and hand off heavy processing to Services.
*   **Views:** Located in `SellWise.Web/Views/`. These are Razor files (`.cshtml`). We intentionally avoided heavy front-end frameworks (like React/Vue) to keep the app simple and focused. The UI uses **Bootstrap 5.3.3 via CDN** and vanilla JavaScript.
*   **ViewModels:** Located in `SellWise.Web/ViewModels/`. *Defense Tip:* Mention that we NEVER pass raw Database Models to the UI. Instead, we use strictly typed ViewModels (like `OrderFormViewModel`) to pass only the exact data required, improving security and performance.
*   **Services:** Located in `SellWise.Web/Services/`. All complex business logic (like processing an order or calculating analytics) lives here.

## 2. Dependency Injection (DI)

Our application is modular. Instead of controllers manually creating database connections or services using the `new` keyword, the framework "injects" them.

*   **How it works:** Open `Program.cs`. Notice the lines like `builder.Services.AddScoped<IOrderService, OrderService>();`. This tells the application how to create these services.
*   **In action:** Open `SellWise.Web/Controllers/OrderController.cs`. Look at the constructor:
    ```csharp
    public OrderController(AppDbContext db, IOrderService orderService) : base(db)
    ```
    When a user visits the Order page, ASP.NET automatically creates an instance of `AppDbContext` and `OrderService` and passes them in. This is highly scalable and makes unit testing easier.

## 3. Database Transactions (Data Integrity)

This is a critical enterprise feature. When a user creates an Order, two major database changes happen:
1.  An `Order` and its `OrderItems` are inserted.
2.  The `StockQuantity` of the purchased `Product` is decremented.

*   **The Problem:** What if the app crashes right after saving the order, but before reducing the stock? Our inventory would be incorrect!
*   **The Solution:** Open `SellWise.Web/Services/OrderService.cs` and look at `CreateOrderAsync()`. You will see `using var transaction = await _db.Database.BeginTransactionAsync();`. 
*   **Explanation:** This guarantees the ACID (Atomicity, Consistency, Isolation, Durability) properties. If the product is out of stock, or an error occurs, `transaction.RollbackAsync()` is called, reverting everything. If successful, `transaction.CommitAsync()` permanently saves all changes together.

## 4. Multi-Tenancy & Security

SellWise is a SaaS (Software as a Service) designed to support multiple independent stores (tenants) on a single database.

*   **Security:** We use ASP.NET Core Identity (configured in `Program.cs` and managed in `AuthController.cs`). The `[Authorize]` attribute sits on top of our controllers, blocking unauthorized access. Cookie-based sessions keep users logged in.
*   **Tenant Isolation:** It is crucial that Store A cannot see Store B's products. Open `SellWise.Web/Controllers/BaseController.cs`. 
    *   It contains a helper method: `GetCurrentStoreId()`. 
    *   This reads the `ActiveStoreId` from the user's secure HTTP session.
    *   Every controller inherits from `BaseController`. When `ProductController.Index` fetches products, it writes: `Db.Products.Where(p => p.StoreId == storeId)`. This ensures absolute data isolation.

## 5. Customer Segmentation (RFM Analysis)

We implemented an advanced marketing feature called **RFM Analysis** (Recency, Frequency, Monetary value) to automatically categorize customers.

*   **How it works:** Look at `SellWise.Web/Services/RfmService.cs`. The `RecalculateAllAsync()` method scans the purchase history.
    *   **Recency:** Days since last purchase.
    *   **Frequency:** Total number of orders.
    *   **Monetary:** Total money spent.
*   Based on these metrics, the service categorizes the customer into segments like `"Champion"`, `"Loyal"`, `"At Risk"`, or `"Lost"`.
*   *Defense Tip:* Show how `CustomerController.Index` allows the user to filter the grid by these exact segments to launch targeted marketing campaigns.

## 6. Soft Delete Strategy

In enterprise systems, you rarely actually delete data. If a user "deletes" a product, older orders that contain that product would break because the foreign key reference is gone.

*   **How it works:** Look at the `Delete` method in `ProductController.cs`. We do not call `Db.Products.Remove()`. Instead, we update the record: `product.IsActive = false`. 
*   When fetching data for display, we simply filter out inactive products: `Where(p => p.IsActive)`. This preserves historical data integrity while hiding the product from the user interface.

## 7. Intelligent Alerts & Dashboard

The application proactively warns users about business risks.
*   **How it works:** Look at `AlertService.cs` (or `AlertController.cs`). The system constantly monitors stock levels. If a product's stock drops below its `LowStockThreshold`, an alert is generated.
*   These are surfaced dynamically on the UI through `DashboardController.cs`, providing an immediate snapshot of business health (Total Revenue, Active Orders, Low Stock Alerts) upon login.