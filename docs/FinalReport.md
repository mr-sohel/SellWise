# **Contents**

| **Chapter** | **Title** | **Page** |
|---|---|---|
| **1** | **INTRODUCTION** | **2** |
| 1.1 | Introduction | 2 |
| 1.2 | Project Overview | 3 |
| 1.3 | Problem Statement | 3 |
| 1.4 | Motivation | 4 |
| 1.5 | Objectives | 4 |
| 1.6 | Development Tools | 5 |
| 1.7 | Proposed System | 6 |
| 1.8 | Purpose of the System | 7 |
| 1.9 | Goal | 7 |
| **2** | **EXISTING SYSTEM** | **8** |
| 2.1 | Introduction | 8 |
| 2.2 | Existing System | 9 |
| 2.3 | Supporting Literature | 11 |
| 2.4 | Conclusion | 16 |
| **3** | **SYSTEM EVALUATION** | **17** |
| 3.1 | Introduction | 17 |
| 3.2 | Requirement Analysis | 17 |
| 3.3 | Methodology | 20 |
| **4** | **DESIGN IMPLEMENTATION** | **31** |
| 4.1 | User Section | 31 |
| 4.2 | Backend Implementation | 32 |
| 4.3 | Conclusions | 74 |
| **5** | **TESTING** | **75** |
| 5.1 | Testing | 75 |
| 5.2 | Validation Criteria | 76 |
| 5.3 | Importance of Testing | 76 |
| 5.4 | Structural Testing | 77 |
| 5.5 | Functional Testing | 77 |
| 5.6 | Acceptance Test Generation | 78 |
| 5.7 | Unit Testing | 78 |
| 5.8 | Integration Testing | 79 |
| 5.9 | Test Data Used | 80 |
| 5.10 | Test Cases | 80 |
| 5.11 | Testing Result | 83 |
| 5.12 | Testing Summary | 92 |
| **6** | **USER MANUAL** | **93** |
| 6.1 | Introduction | 93 |
| 6.2 | System Requirements | 94 |
| 6.3 | User Interface Guide | 95 |
| 6.4 | Conclusion | 96 |
| **7** | **CONCLUSION AND FUTURE WORKS** | **97** |
| 7.1 | Conclusion | 97 |
| 7.2 | Outcomes | 98 |
| 7.3 | Current Limitations | 99 |
| 7.4 | Future Works | 100 |

---

# **Chapter 1**
# **INTRODUCTION**

## **1.1 Introduction**
SellWise is an enterprise-grade Software-as-a-Service (SaaS) web application built to simplify and elevate the daily operations of retail businesses. It consolidates sales operations, multi-tenant inventory tracking, customer relationship management, salesperson attribution, printable invoicing, and machine learning-driven demand forecasting into a single unified platform. 

Most small and medium-sized shops today still rely on paper registers or basic spreadsheets to record their sales and inventory. These manual processes are slow, error-prone, vulnerable to data loss, and unable to provide forward-looking insights. SellWise serves as a digital backbone that organizes operations, automates complex calculations, and secures transactional integrity.

Beyond day-to-day point-of-sale activities, SellWise uses time-series machine learning models to forecast product demand for the next 30 days. The platform adopts a decoupled microservice architecture:
* **ASP.NET Core 10 Web Application:** Handles web traffic, authentication, multi-tenant session isolation, ACID order transactions, customer RFM scoring, inventory alerts, and QuestPDF report exports.
* **FastAPI Python Microservice:** A dedicated background service running **Meta Prophet** models for computational time-series regression.

Separating these concerns keeps the web interface snappy and responsive while computationally heavy predictions run asynchronously in the background.

## **1.2 Project Overview**
SellWise provides an affordable, turnkey software solution tailored for small and medium-sized retail businesses. The system is designed with an intuitive interface so that store owners, managers, and sales staff can operate it without needing advanced technical training.

Each store operates within an isolated workspace using database-level multi-tenancy, ensuring that records from different businesses never mix. By automating routine ledger entries, low-stock notifications, customer clustering, and future demand forecasting, SellWise frees business owners to concentrate on customer satisfaction and growth.

## **1.3 Problem Statement**
Small retail businesses face several fundamental challenges due to a lack of specialized software:
* **Inventory Imbalance & Dead Capital:** Retailers frequently overstock slow-moving items, tying up working capital, while running out of fast-selling items and losing revenue.
* **Customer Attrition:** Without automated purchase history tracking, store owners fail to notice when once-frequent customers become inactive.
* **Fragmented Bookkeeping:** Keeping sales entries in one notebook, expenses in another, and supplier bills in a drawer makes calculating true net profit extremely difficult.
* **Absence of Predictive Analytics:** Traditional tools only reflect past transactions without offering any predictive guidance on upcoming product demand.

## **1.4 Motivation**
Observing these operational roadblocks faced by independent store owners inspired the development of SellWise. Our key motivations are:
* Provide business owners with a centralized executive dashboard summarizing real-time sales, net profit, and inventory health.
* Equip retailers with predictive AI tools to forecast demand and optimize reorder timing.
* Automatically analyze customer buying habits to foster loyalty and retention.
* Ensure transaction safety and data integrity through atomic database operations.
* Eliminate manual calculation mistakes and paperwork through digital receipts, printable invoices, and automated PDF audits.

## **1.5 Objectives**
* Develop a clean, mobile-responsive web platform using ASP.NET Core 10 MVC, Bootstrap 5.3, and Chart.js.
* Integrate Meta Prophet to predict 30-day demand per product using 90-day historical time-series data.
* Ensure point-of-sale (POS) checkouts execute within ACID transactions to prevent stock discrepancies.
* Group customers automatically using the Recency, Frequency, Monetary (RFM) model into 8 behavioral cohorts.
* Provide proactive inventory alerts (Critical and Warning) with automatic restock resolution.
* Support multiple order channels (*Walk-In, Online, Delivery, Phone*) and attribute sales to active salespeople.
* Generate formatted printable invoices and downloadable QuestPDF sales audit reports.
* Deploy containerized Microsoft SQL Server 2022 using Docker with persistent named volumes.

## **1.6 Development Tools**
SellWise combines robust backend frameworks, modern frontend libraries, a relational database engine, and a Python machine learning microservice:
* **Technologies & Frameworks:**
  * Microsoft SQL Server 2022 (Docker Linux Container)
  * ASP.NET Core 10 MVC (`net10.0`)
  * Entity Framework Core 10 (ORM)
  * Python 3.11+ with FastAPI & Uvicorn
  * Meta Prophet (Time-Series Forecasting)
  * QuestPDF 2026.7 (Code-First PDF Generation)
  * Bootstrap 5.3.3 & Chart.js 4.4.7
* **Languages:**
  * C# 13
  * Python 3.11
  * SQL (T-SQL)
  * HTML5, CSS3, JavaScript (ES6)

## **1.7 Proposed System**
The system implements a three-tier Role-Based Access Control (RBAC) hierarchy:
* **Business Owner:** Full administrative control, store creation, multi-store switching, staff account management, financial analytics, expense tracking, and PDF audit exports.
* **Store Manager:** POS order processing, inventory adjustments, low-stock monitoring, customer directory management, and expense logging.
* **Salesman / Employee:** Fast POS checkout, customer lookup/creation, and product catalog lookup (restricted from financial analytics, staff settings, and reports).

When an order is created, the system checks stock availability, deducts inventory, assigns customer history, records the salesperson name, and logs the order channel within an atomic transaction. Background services continuously evaluate stock levels and calculate demand forecasts for the owner's dashboard.

## **1.8 Purpose Of The System**
The purpose of SellWise is to democratize advanced enterprise analytics for small and medium retail businesses. By integrating point-of-sale operations, inventory tracking, customer insights, and predictive forecasting into a single unified platform, SellWise removes the need for multiple disconnected tools and empowers retailers to make data-backed business decisions.

## **1.9 Goal**
The primary goal of this project is to deliver a reliable, secure, and user-friendly retail management platform that simplifies daily bookkeeping, prevents inventory stockouts through predictive modeling, and improves business profitability.

---

# **Chapter 2**
# **EXISTING SYSTEM**

## **2.1 Introduction**
Digital technology is indispensable for modern retail sustainability. While many local stores continue to rely on manual ledgers, adopting specialized retail software improves checkout speed and prevents costly calculation mistakes. This chapter analyzes existing retail software systems, identifies their advantages and limitations, and discusses the foundational concepts behind SellWise.

## **2.2 Existing System Analysis**

### **2.2.1 Shopify Analytics**
Shopify is an established e-commerce platform offering integrated POS capabilities and cloud reporting.
* **Advantages:**
  * Polished user interface and dashboard design.
  * Tight integration between online storefronts and physical retail POS.
  * Basic inventory tracking and threshold notifications.
* **Disadvantages:**
  * Advanced analytics require expensive higher-tier subscription plans.
  * Lacks native predictive demand forecasting without recurring third-party app charges.
  * Can become cost-prohibitive for small brick-and-mortar stores.

### **2.2.2 Square for Retail**
Square provides a popular point-of-sale system with basic inventory tracking and payment integration.
* **Advantages:**
  * Free entry-level POS software.
  * Built-in customer directory and transaction history.
  * Straightforward payment processing integration.
* **Disadvantages:**
  * Advanced inventory routing and in-depth reporting require paid add-on tiers.
  * No built-in machine learning for future demand projection.
  * Multi-store management has functional restrictions on basic accounts.

### **2.2.3 Lightspeed Retail**
Lightspeed is an enterprise-oriented POS system designed for detailed multi-branch inventory management.
* **Advantages:**
  * Robust multi-location inventory and purchase order routing.
  * Comprehensive historical reporting and vendor management.
* **Disadvantages:**
  * High monthly license fees.
  * Steep learning curve for non-technical retail staff.
  * Lacks automated time-series machine learning models for predictive stock planning.

## **2.3 Supporting Literature**

### **2.3.1 Architectural Modeling Diagrams**

**Entity Relationship Diagram (ERD)**
An Entity-Relationship diagram depicts the logical structure of a relational database. It serves as a blueprint showing entities (tables), attributes (columns), primary/foreign keys, and cardinalities ($1:N$, $N:M$).

**Data Flow Diagram (DFD)**
A Data Flow Diagram visualizes the movement of data between external entities, business processes, and data stores. It is modeled across context (Level 0) and detailed functional (Level 1) perspectives.

**Use Case Diagram**
A Use Case Diagram illustrates the functional boundary of the system and defines the specific interactions accessible to each actor role (Owner, Manager, Salesman).

### **2.3.2 Technology Selection Rationale**
* **ASP.NET Core 10 MVC:** Delivers industry-leading execution performance, dependency injection, and integrated security features like anti-forgery tokens and cookie authentication.
* **Entity Framework Core 10:** Provides LINQ abstraction, automatic migration versioning, and ACID-compliant transaction control.
* **Python FastAPI & Meta Prophet:** Enables non-blocking asynchronous REST endpoints that execute additive time-series models capable of capturing day-of-week and yearly seasonality.
* **Docker Containerization:** Delivers reproducible, portable database deployments across diverse developer environments.

## **2.4 Conclusion**
Existing commercial retail software is often either too basic or overly complex and expensive for small retailers. SellWise solves this by combining intuitive POS operations, strict multi-tenancy, automated RFM customer segmentation, printable receipts, and predictive demand forecasting in an affordable, cohesive platform.

---

# **Chapter 3**
# **SYSTEM EVALUATION**

## **3.1 Introduction**
System evaluation formally specifies the functional and non-functional requirements, development methodology, and architectural modeling diagrams that form the foundation of SellWise.

## **3.2 Requirement Analysis**

### **3.2.1 Non-Functional Requirements**
* **Performance:** POS checkout operations complete within 300ms; dashboard page rendering completes within 1.5 seconds.
* **Security:** ASP.NET Core Identity password hashing (PBKDF2), anti-forgery validation (`[AutoValidateAntiforgeryToken]`), and 15-minute account lockout after 5 consecutive failed login attempts.
* **Reliability & Data Integrity:** All multi-step order checkouts execute within EF Core database transactions (`BeginTransactionAsync`), guaranteeing atomic commit or rollback.
* **Multi-Tenant Isolation:** Session-scoped store query filtering prevents cross-store data leakage.
* **Usability & Responsiveness:** Clean Bootstrap 5.3 interface styled for desktop displays, point-of-sale touchscreens, and mobile tablets.

### **3.2.2 Functional Requirements**
* User registration, cookie-based authentication, and store workspace creation.
* Product catalog management with SKU, pricing, stock levels, and low-stock threshold configuration.
* Point-of-Sale order creation supporting multiple order channels (*Walk-In, Online, Delivery, Phone*), custom discounts, delivery charges, and active salesperson tracking.
* Dynamic printable invoice generation (`/Order/Invoice/{id}`) formatted for standard paper and thermal POS receipts.
* Customer directory with quick-create modal, phone number search, and automated RFM loyalty score calculation.
* Proactive inventory alert monitoring with automatic creation and resolution.
* 30-Day AI demand forecasting powered by Meta Prophet with EWMA fallback.
* On-demand PDF business audit report generation using QuestPDF.

## **3.3 Methodology**

### **3.3.1 Agile Development Model**
The project followed the Agile Scrum methodology, organizing work into iterative two-week sprints to facilitate early testing, continuous integration, and rapid feature refinement.

![Agile Development Cycle](Diagrams/agile.png)

**Key Advantages of Agile:**
* Incremental feature delivery allows immediate validation of POS and ML workflows.
* High adaptability to changing requirements during development.
* Early detection and mitigation of bugs through continuous testing.

### **3.3.2 Gantt Chart**
The development schedule and sprint phases are illustrated in the Gantt chart below:

![Gantt Chart](Diagrams/gantt_chart.svg)

| Phase | Milestone | Sprint 1-2 | Sprint 3-4 | Sprint 5-6 | Sprint 7-8 | Sprint 9-10 |
|---|---|---|---|---|---|---|
| **Phase 1** | Architecture, Database & Identity | ████ | | | | |
| **Phase 2** | Products, Categories & POS Orders | | ████ | | | |
| **Phase 3** | Analytics, Dashboard & Prophet ML | | | ████ | | |
| **Phase 4** | Invoicing, RFM & Inventory Alerts | | | | ████ | |
| **Phase 5** | QuestPDF Reports & Final Testing | | | | | ████ |

### **3.3.3 Data Flow Diagrams**

**Context Level DFD (Level 0):**
The Context Level DFD illustrates external actors interacting with the central SellWise application boundary:

![Context Level DFD (Level 0)](Diagrams/dfd_level0.svg)

**Level 1 Data Flow Diagram:**
The Level 1 DFD shows the detailed flow of data between internal processes (Authentication, POS, Product Management, Analytics, ML Forecasting) and database entities:

![Level 1 Data Flow Diagram](Diagrams/dfd_level1.svg)

### **3.3.4 Entity Relationship Diagram (ERD)**
The relational database schema is structured around store multi-tenancy and transactional consistency:

![Entity Relationship Diagram](Diagrams/er_diagram.svg)

**Key Schema Entities:**
* **Store & Membership:** `Store`, `StoreMember`, `ApplicationUser`
* **Sales & Catalog:** `Product`, `Order`, `OrderItem`
* **Operations & Intelligence:** `Customer`, `Expense`, `InventoryAlert`, `Forecast`

### **3.3.5 Use Case Diagram**
The Use Case Diagram defines the capabilities accessible by each actor role:

![Use Case Diagram](Diagrams/Use_Case_diagram.png)

* **Business Owner:** Full administrative access, store provisioning, staff management, analytics, expenses, and PDF reports.
* **Store Manager:** POS order processing, inventory adjustments, low-stock alert monitoring, customer management, and expense logging.
* **Salesman / Employee:** Fast POS checkout, customer lookup/creation, and product catalog lookup.

### **3.3.6 Activity Diagram**
The Activity Diagram illustrates the execution flow during point-of-sale checkout:

![Activity Diagram](Diagrams/activity_diagram.svg)

**POS Order Lifecycle:**
Cashier selects items $\rightarrow$ System verifies in-memory stock $\rightarrow$ Cashier selects/creates customer $\rightarrow$ Sets order channel (*Walk-In, Online, Delivery, Phone*) $\rightarrow$ Applies discount/delivery charge $\rightarrow$ Submits order $\rightarrow$ EF Core begins database transaction $\rightarrow$ Validates stock in database $\rightarrow$ Deducts inventory $\rightarrow$ Inserts Order and OrderItems $\rightarrow$ Commits transaction $\rightarrow$ Generates printable receipt.

### **3.3.7 Sequence Diagram**
The Sequence Diagram depicts the interaction between the client browser, ASP.NET Core services, database, and the Python ML microservice:

![Sequence Diagram](Diagrams/sequence_diagram.svg)

**Dashboard & Forecasting Sequence:**
Browser requests Dashboard $\rightarrow$ `AnalyticsService` fetches sales KPIs $\rightarrow$ Checks `Forecasts` table for cached predictions ($<24$ hours) $\rightarrow$ If expired, queries 90-day daily sales history from `OrderItems` $\rightarrow$ Sends JSON payload to Python FastAPI `/forecast` $\rightarrow$ Meta Prophet computes 30-day projection $\rightarrow$ Returns predictions $\rightarrow$ `ForecastService` persists results $\rightarrow$ View renders interactive Chart.js graphs.

### **3.3.8 Class Diagram**
The Class Diagram outlines the domain models, controllers, and service-layer interfaces:

![Class Diagram](Diagrams/class_diagram.svg)

* **`BaseController`:** Manages multi-tenant store session resolution (`GetCurrentStoreId()`).
* **`OrderController` & `OrderService`:** Manages POS checkouts, order channels, salesperson tracking, and printable receipts.
* **`AnalyticsService` & `ForecastService`:** Computes dashboard KPIs and integrates with the ML microservice.
* **`AlertService`:** Runs inventory threshold scans and manages alert lifecycles.

---

# **Chapter 4**
# **DESIGN IMPLEMENTATION**

## **4.1 User Section & Architecture**
SellWise enforces strict separation of concerns through ASP.NET Core MVC and service-layer business encapsulation.

## **4.2 Backend Implementation**

### **4.2.1 Docker Container Creation & Terminal Setup**
Microsoft SQL Server 2022 runs in a Linux container with persistent volume storage. The container can be created and managed directly from the terminal:

```bash
# 1. Pull the official SQL Server 2022 image
docker pull mcr.microsoft.com/mssql/server:2022-latest

# 2. Create persistent volume
docker volume create sellwise-data

# 3. Launch SQL Server container
docker run -d \
  --name sellwise-sql \
  -p 1433:1433 \
  -e "ACCEPT_EULA=Y" \
  -e "MSSQL_SA_PASSWORD=YourPass123!" \
  -v sellwise-data:/var/opt/mssql \
  --restart unless-stopped \
  mcr.microsoft.com/mssql/server:2022-latest

# 4. Verify container status and query version
docker exec -it sellwise-sql /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "YourPass123!" -C \
  -Q "SELECT @@VERSION AS [SQL Server Version];"
```

### **4.2.2 Database Connection Configuration**
The connection string is defined in `SellWise.Web/appsettings.json` and consumed by Entity Framework Core:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=SellWise;User Id=sa;Password=YourPass123!;TrustServerCertificate=True;Encrypt=False;"
  },
  "MlServiceUrl": "http://localhost:8000"
}
```

### **4.2.3 Authentication & Multi-Tenant Store Scoping**
Upon successful login, the user's active store identifier is stored in session state. Role checks redirect sales employees straight to POS order processing while directing managers and owners to the executive dashboard:

```csharp
[HttpPost]
[AutoValidateAntiforgeryToken]
public async Task<IActionResult> Login(LoginViewModel model)
{
    if (!ModelState.IsValid) return View(model);

    var result = await _signInManager.PasswordSignInAsync(
        model.Email!, model.Password!, isPersistent: true, lockoutOnFailure: true);

    if (result.Succeeded)
    {
        var user = await _userManager.FindByEmailAsync(model.Email!);
        if (user != null)
        {
            var member = await _db.StoreMembers.FirstOrDefaultAsync(m => m.UserId == user.Id);
            if (member != null)
            {
                HttpContext.Session.SetString("ActiveStoreId", member.StoreId.ToString());
                if (string.Equals(member.Role, "employee", StringComparison.OrdinalIgnoreCase))
                {
                    return RedirectToAction("Index", "Order");
                }
            }
        }
        return RedirectToAction("Index", "Dashboard");
    }

    ModelState.AddModelError(string.Empty, "Invalid email or password.");
    return View(model);
}
```

### **4.2.4 Transactional POS Order Processing with Salesperson Tracking**
When completing a sale, the system executes an ACID transaction to validate stock, deduct inventory, record customer order counts, track the salesperson, and log the order type (*Walk-In, Online, Delivery, Phone*):

```csharp
public async Task<string?> CreateOrderAsync(Guid storeId, OrderFormViewModel model, string? salespersonName)
{
    using var transaction = await _db.Database.BeginTransactionAsync();
    try
    {
        var order = new Order
        {
            StoreId = storeId,
            CustomerId = model.CustomerId,
            OrderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6]}",
            OrderType = model.OrderType ?? "Walk-In",
            SalespersonName = salespersonName,
            Status = "pending",
            DeliveryCharge = model.DeliveryCharge,
            Discount = model.Discount,
            Notes = model.Notes,
            OrderDate = DateTime.UtcNow
        };

        decimal subtotal = 0;
        foreach (var item in model.Items.Where(i => i.ProductId != Guid.Empty && i.Quantity > 0))
        {
            var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == item.ProductId && p.StoreId == storeId);
            if (product == null || product.StockQuantity < item.Quantity)
            {
                await transaction.RollbackAsync();
                return $"Insufficient stock for {product?.Name ?? "item"}.";
            }

            product.StockQuantity -= item.Quantity;
            var lineTotal = item.Quantity * product.SellingPrice;
            subtotal += lineTotal;

            order.Items.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                Quantity = item.Quantity,
                UnitPrice = product.SellingPrice
            });
        }

        order.Total = Math.Max(0, subtotal + order.DeliveryCharge - order.Discount);
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();
        await transaction.CommitAsync();
        return null;
    }
    catch (Exception ex)
    {
        await transaction.RollbackAsync();
        return "Transaction failed during order checkout.";
    }
}
```

### **4.2.5 Proactive Inventory Alerts & Automatic Resolution**
The alert engine continuously monitors stock levels against configured thresholds. Alerts are automatically created and resolved without requiring manual intervention:

```csharp
public async Task ScanAndGenerateAlertsAsync(Guid storeId)
{
    var healthyProductIds = await _db.Products
        .Where(p => p.StoreId == storeId && p.IsActive && p.StockQuantity > p.LowStockThreshold)
        .Select(p => p.Id).ToListAsync();

    var alertsToResolve = await _db.Alerts
        .Where(a => a.StoreId == storeId && a.Type == "Low Stock" && healthyProductIds.Contains(a.ProductId))
        .ToListAsync();

    foreach (var alert in alertsToResolve)
    {
        alert.Type = "Low Stock (Resolved)";
        alert.IsRead = true;
    }

    var lowStockProducts = await _db.Products
        .Where(p => p.StoreId == storeId && p.IsActive && p.StockQuantity <= p.LowStockThreshold)
        .Select(p => p.Id).ToListAsync();

    var existingAlertProductIds = await _db.Alerts
        .Where(a => a.StoreId == storeId && a.Type == "Low Stock")
        .Select(a => a.ProductId).ToListAsync();

    foreach (var product in lowStockProducts)
    {
        if (existingAlertProductIds.Contains(product.Id)) continue;

        _db.Alerts.Add(new InventoryAlert
        {
            StoreId = storeId,
            ProductId = product.Id,
            Type = "Low Stock",
            Severity = product.StockQuantity == 0 ? "Critical" : "Warning",
            Message = product.StockQuantity == 0
                ? $"Out of stock. Threshold is {product.LowStockThreshold}."
                : $"Only {product.StockQuantity} unit(s) left (Threshold: {product.LowStockThreshold}).",
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        });
    }
    await _db.SaveChangesAsync();
}
```

### **4.2.6 Customer RFM Segmentation Engine**
Customers are scored across Recency (days since last purchase), Frequency (total orders), and Monetary value (total spent). Customers are classified into 8 actionable cohorts:

```csharp
public async Task RecalculateAllAsync(Guid storeId)
{
    var customers = await _db.Customers.Where(c => c.StoreId == storeId).ToListAsync();
    if (customers.Count == 0) return;

    var cutoffDate = DateTime.UtcNow.AddDays(-365);
    var orderStats = await _db.Orders
        .Where(o => o.StoreId == storeId && o.CustomerId.HasValue && o.OrderDate >= cutoffDate)
        .GroupBy(o => o.CustomerId!.Value)
        .Select(g => new {
            CustomerId = g.Key,
            LastOrderDate = g.Max(o => o.OrderDate),
            Frequency = g.Count(),
            Monetary = g.Sum(o => o.Total)
        }).ToListAsync();

    // Assign RFM cohort (Champions, Loyal, Potential Loyalists, At Risk, Can't Lose Them, etc.)
    foreach (var customer in customers)
    {
        var stats = orderStats.FirstOrDefault(s => s.CustomerId == customer.Id);
        if (stats != null)
        {
            customer.TotalOrders = stats.Frequency;
            customer.TotalSpent = stats.Monetary;
            customer.RfmSegment = DetermineSegment(stats.LastOrderDate, stats.Frequency, stats.Monetary);
        }
    }
    await _db.SaveChangesAsync();
}
```

### **4.2.7 Machine Learning Demand Forecasting Microservice**
The standalone FastAPI service applies Meta Prophet to historical daily sales data, computing 30-day projected demand with confidence bounds:

```python
# app/services/prophet_service.py
from prophet import Prophet
import pandas as pd

def generate_forecast(history, periods=30):
    if len(history) < 2:
        return []

    df = pd.DataFrame([{"ds": point.ds, "y": point.y} for point in history])
    df = df.groupby("ds", as_index=False)["y"].sum().sort_values("ds").reset_index(drop=True)

    span_days = (df["ds"].max() - df["ds"].min()).days
    has_yearly_signal = span_days >= 365

    model = Prophet(
        yearly_seasonality=has_yearly_signal,
        weekly_seasonality=True,
        daily_seasonality=False
    )
    try:
        model.fit(df)
    except Exception as e:
        return []

    future = model.make_future_dataframe(periods=periods)
    forecast_df = model.predict(future)
    future_forecast = forecast_df.tail(periods)

    return [
        {
            "ds": row['ds'].date(),
            "yhat": max(0, float(row['yhat'])),
            "yhat_lower": max(0, float(row['yhat_lower'])),
            "yhat_upper": max(0, float(row['yhat_upper']))
        }
        for _, row in future_forecast.iterrows()
    ]
```

## **4.3 Conclusions**
Key architectural decisions delivered substantial reliability and scalability benefits:
1. **Decoupled Python ML Microservice:** Prevents CPU-bound forecast computations from blocking web worker threads.
2. **ACID Transactions:** Eliminates inventory inconsistencies and orphaned payment records during high-concurrency checkouts.
3. **Session-Scoped Tenant Filtering:** Guarantees strict data isolation between multiple stores.
4. **Resilient EWMA Fallback:** Ensures continuous dashboard operation during ML microservice restarts.

---

# **Chapter 5**
# **TESTING**

## **5.1 Testing**
Testing verified that all components of SellWise function correctly under standard and edge-case operating conditions.

## **5.2 Validation Criteria**
* Form inputs are strictly validated on both client and server sides.
* Multi-tenant query isolation is enforced across all controllers and services.
* Database transactions roll back cleanly without leaving orphaned records when an error occurs.
* The ML service degrades gracefully to EWMA moving averages if unavailable.

## **5.3 Importance of Testing**
Thorough testing ensures system stability, preventing financial inaccuracies or stock mismatches when store owners manage live retail operations.

## **5.4 Structural Testing**
All service methods, database queries, and external HTTP calls are wrapped in structured exception handling (`try-catch`) blocks with appropriate logging.

## **5.5 Functional Testing**
Functional tests verified authentication, POS cart operations, order channel classification, salesperson assignment, invoice generation, RFM scoring, and PDF report creation.

## **5.6 Acceptance Test Generation**
Automated demo seeder scripts injected 2 stores, 103 products, 550 customers, and 180 days of realistic sales data to simulate production environments.

## **5.7 Unit Testing**
Independent unit tests verified isolated algorithmic components, including RFM segment assignment, discount/delivery calculations, and time-series date zero-padding.

## **5.8 Integration Testing**
Integration tests verified communication between the ASP.NET Core web host, the Docker SQL Server container, and the Python FastAPI forecasting microservice.

## **5.9 Test Data Used**
* **Live Test Data:** Manual user inputs entered via web forms during manual testing.
* **Synthetic Test Data:** Bulk datasets generated by `DemoSeederService` to validate load handling and report calculations.

## **5.10 Test Cases**

| Module | Test Scenario | Tested | Result |
|---|---|:---:|:---:|
| **Authentication** | Valid credentials grant session and set active store cookie | Yes | Passed |
| **Authentication** | 5 consecutive failed attempts trigger 15-minute lockout | Yes | Passed |
| **Authentication** | Employee role redirects directly to POS order view | Yes | Passed |
| **POS Orders** | Cart calculates subtotal, discounts, and delivery fees | Yes | Passed |
| **POS Orders** | Out-of-stock product triggers atomic transaction rollback | Yes | Passed |
| **POS Orders** | Order records channel (*Walk-In, Online, Delivery, Phone*) and salesperson name | Yes | Passed |
| **Invoices** | Invoice view renders itemized details, totals, and barcode | Yes | Passed |
| **Invoices** | Print stylesheet renders clean thermal/standard receipts | Yes | Passed |
| **Customers** | Quick-Create modal adds customer without leaving checkout | Yes | Passed |
| **Customers** | RFM engine assigns customers to 8 behavioral cohorts | Yes | Passed |
| **Inventory** | Low stock triggers Warning / Critical alerts | Yes | Passed |
| **Inventory** | Replenishing stock resolves active alerts automatically | Yes | Passed |
| **Forecasting** | Prophet returns 30-day forecast with confidence intervals | Yes | Passed |
| **Forecasting** | System falls back to EWMA if ML microservice is unreachable | Yes | Passed |
| **Reports** | QuestPDF generates formatted downloadable sales audits | Yes | Passed |

## **5.11 Testing Result**
All test cases executed successfully. Form validations, transaction safety checks, invoice generation, and ML fallback mechanisms performed as expected.

## **5.12 Testing Summary**
SellWise underwent comprehensive verification across user roles (Owner, Manager, Salesman). All identified edge cases were addressed, ensuring a secure and reliable platform for retail deployment.

---

# **Chapter 6**
# **USER MANUAL**

## **6.1 Introduction**
This user manual guides business owners, store managers, and sales personnel through setting up and running SellWise.

## **6.2 System Requirements**

### **6.2.1 Server-Side Requirements (Hosting & Development)**
* **Operating System:** Windows 10/11, macOS, or Linux (Ubuntu 22.04+).
* **Runtimes:** .NET 10.0 SDK and Python 3.11+.
* **Container Engine:** Docker Desktop or Docker Engine (for SQL Server 2022).
* **Hardware:** Dual-Core 2.0+ GHz processor, 4 GB RAM (8 GB recommended), 10 GB storage.

### **6.2.2 Client-Side Requirements (End-Users)**
* Any standard PC, laptop, tablet, or smartphone with an active internet/LAN connection.
* A modern web browser: Google Chrome, Mozilla Firefox, Microsoft Edge, or Apple Safari.

## **6.3 User Interface Guide**

### **6.3.1 Starting the Application**
Launch the complete stack (Docker SQL Server, Python ML service, and ASP.NET Core web app) using the startup script:

```bash
# macOS / Linux
./start.sh

# Windows PowerShell
.\start.ps1
```

Access the application in your browser at `http://localhost:5000`.

* **Default Admin Account:** `admin@sellwise.com` / `Admin123!`
* **Pre-configured Demo Stores:** *SellWise Tech BD* (Electronics), *StyleHub BD* (Fashion). Switch stores using the top navigation bar.

### **6.3.2 Point-of-Sale (POS) & Order Processing**
1. Navigate to **Orders $\rightarrow$ New Order**.
2. Click products from the catalog to add them to the active cart.
3. Select an existing customer or click **+ New Customer** to quickly add a customer profile.
4. Select the order channel (*Walk-In, Online, Delivery, Phone*) and enter any applicable discount or delivery charge.
5. Click **Complete Order** to finalize the transaction.
6. Click **Print Invoice** to view and print the formatted receipt.

### **6.3.3 Dashboard & AI Demand Forecasts**
The Dashboard presents today's revenue, order counts, pending orders, and 30-day product demand projections generated by the machine learning model. Products with high forecast demand and low current stock are highlighted for immediate restocking.

### **6.3.4 Inventory Alerts & Management**
Navigate to **Products** to manage items, pricing, and stock levels. If stock falls below a product's threshold, a warning appears on the **Inventory Alerts** page. Restocking the item automatically clears the alert.

### **6.3.5 Customer RFM Segmentation**
Visit the **Customers** page to view customer buying histories and their automatically assigned loyalty segments (*Champions, Loyal, At Risk, etc.*).

---

# **Chapter 7**
# **CONCLUSION AND FUTURE WORKS**

## **7.1 Conclusion**
SellWise successfully provides an accessible, AI-powered retail management platform designed specifically for small and medium-sized businesses. By combining point-of-sale operations, multi-tenant inventory control, customer RFM segmentation, salesperson tracking, printable invoicing, and machine learning demand forecasting, SellWise enables independent retailers to operate with enterprise-grade efficiency.

The modular architecture cleanly isolates high-throughput transactional web operations in ASP.NET Core 10 from CPU-bound time-series machine learning in Python FastAPI, ensuring high performance, security, and scalability.

## **7.2 Outcomes**
* Centralized retail operations into a unified, multi-tenant dashboard.
* Replaced manual paperwork with atomic, error-free database transactions.
* Delivered 30-day predictive demand forecasts using Meta Prophet to prevent stockouts and overstocking.
* Automated customer retention using RFM behavioral clustering.
* Provided instant printable invoices and downloadable QuestPDF sales audit reports.

## **7.3 Current Limitations**
* The forecasting engine currently uses Meta Prophet exclusively; future versions can evaluate additional model architectures.
* The system currently requires an active network connection and does not yet offer an offline POS sync mode.
* Each store profile operates with a single configured currency.

## **7.4 Future Works**
* **Automated Marketing Campaigns:** Integrating RFM customer cohorts directly with email services (Mailchimp/SendGrid) for automated promotional messaging.
* **Native Mobile Application:** Building companion iOS and Android mobile apps using .NET MAUI with built-in barcode scanning.
* **Multi-Warehouse Inventory Routing:** Supporting inter-branch inventory transfers for businesses managing multiple physical warehouses.
