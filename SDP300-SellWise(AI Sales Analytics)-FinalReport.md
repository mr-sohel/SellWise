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
| 4.3 | Conclusions | 74 |
| **5** | **TESTING** | **75** |
| 5.1 | Testing | 75 |
| 5.2 | Validation Criteria | 76 |
| 5.3 | Important Of Testing | 76 |
| 5.4 | Structural Testing | 77 |
| 5.5 | Functional Testing | 77 |
| 5.6 | Acceptance Test Generation | 78 |
| 5.7 | Unit Testing | 78 |
| 5.8 | Integration Testing | 79 |
| 5.9 | Test Data Used | 80 |
| 5.10 | Test Cases | 80 |
| 5.11 | Testing result | 83 |
| 5.12 | Testing Summery | 92 |
| **6** | **USER MANUAL** | **93** |
| 6.1 | Introduction | 93 |
| 6.2 | System Requirements | 94 |
| 6.3 | User Interface | 95 |
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
SellWise is a web-based application designed to make managing a retail business easier. It combines daily sales operations, stock management, and customer tracking into one simple platform. Most small shops rely on paper notebooks or basic spreadsheets to track their sales and inventory. This manual process takes a lot of time and is prone to errors. "SellWise" acts as a digital assistant that helps shop owners keep everything organized. 

Moreover, this system uses a bit of machine learning to guess what products might sell well in the coming days. The project is split into two parts: a main website built with ASP.NET Core for handling daily tasks, and a separate Python service for running the sales predictions. This ensures the main website stays fast.

## **1.2 Project overview**
This project provides an affordable and easy-to-use software solution for small and medium-sized shops. Users don't need any formal technical knowledge to use this system. The website is designed to be error-free, secure, and reliable. 

Each shop has its own isolated workspace, meaning data from one store never mixes with another. The web application handles the transactions, and the background machine learning service handles the predictions. This way, shop owners can focus on improving their business rather than getting stuck with record keeping.

## **1.3 Problem Statement**
Currently, many small businesses face several challenges because they don't have proper management software. The current situation is very limited and often leads to the following problems:
* **Inventory Issues:** Shops often overstock items that don't sell, or they run out of popular items and miss out on sales.
* **Losing Customers:** Since shop owners don't track customer purchase history properly, they don't realize when a regular customer stops coming.
* **Scattered Information:** Sales are noted in one book, inventory in another, making it hard to get a clear picture of profit or loss.
* **No Future Planning:** Owners can only see what happened in the past, but they don't have tools to predict what they will need next month.

## **1.4 Motivation**
Facing the problems described above, we wanted to build a custom system called SellWise that can solve these challenges. Our motivation comes from the desire to:
* Give shop owners a clear view of their business from a single dashboard.
* Help them prepare properly by forecasting future product demand.
* Track customer buying habits to offer better services.
* Provide an inexpensive, efficient, and comfortable way to manage a shop.
* Prevent data loss and calculation mistakes that happen with manual paperwork.

## **1.5 Objectives**
* Provide a user-friendly environment for managing shop inventory and sales.
* Implement a machine learning model to predict product demand for the next 30 days.
* Ensure all sales transactions are processed safely without corrupting inventory data.
* Group customers automatically based on how frequently they buy.
* Provide an alert system that warns the owner when product stock is low.
* Generate downloadable PDF reports for daily or monthly sales.
* Reduce paperwork and manual calculations.

## **1.6 Development Tools**
SellWise is a web application integrated with a database and a machine learning service. To build this website, we basically used C#, Python, HTML, CSS, and JavaScript. 
* **Technology:**
  * SQL Server for database management.
  * ASP.NET Core MVC for the main web framework.
  * FastAPI (Python) for the machine learning service.
  * Meta Prophet for time-series forecasting.
  * Docker for containerizing the database.
* **Language:**
  * C#
  * Python
  * HTML
  * CSS
  * JavaScript
  * SQL

## **1.7 Proposed System**
In our proposed system, there are three types of actors: Business Owner, Store Manager, and Employee.
Users will log in or register themselves using their email and password. A single admin account can manage multiple stores. 

The Owner has full control over the system. The Manager can process orders, check inventory, and view analytics. The Employee can only process orders and check the product catalog. 
During a sale, the system automatically checks if there is enough stock. If a product is running low, the system will show an alert. The system will also study the past sales data to forecast future demand, which will be shown on the owner's dashboard.

## **1.8 Purpose Of The System**
Many small shops know they should keep better track of their sales, but they can't afford expensive software. The purpose of SellWise is to encourage business owners to adopt digital tools, no matter where they are. 

By bringing everything into one system, shop owners don't have to jump between different tools. They can see all their orders, inventory, and reports in one place. The system automatically does the hard work, like calculating which customers are loyal and predicting future sales. This will provide opportunities for small businesses to grow and achieve their goals.

## **1.9 Goal**
The major goal of this project is to provide a user-friendly environment to manage retail shops efficiently. Another goal is to enhance the quality of business decisions by providing accurate data and predictions. We also aim to improve user accessibility and time flexibility so that store owners can check their business status from anywhere.

---

# **Chapter 2**
# **EXISTING SYSTEM**

## **2.1 Introduction**
Technology is among the most important factors for business growth today. Although many shops still use manual methods, the use of software increases efficiency and reduces errors. There are two main aims to this existing system analysis. The first aim is to establish the characteristics and importance of retail software. The second aim is to identify the techniques, tools, and approaches used in existing systems, to discuss their effectiveness, and to uncover factors that limit their usage by small shops. 

## **2.2 Existing System**
We have visited and analyzed several existing systems. They are listed below.

### **2.2.1 Shopify Analytics**
Shopify is one of the most popular e-commerce platforms that provides built-in analytics features. It offers basic sales reporting, traffic analytics, and inventory management.
**Advantages:**
* User-friendly interface with intuitive dashboards.
* Integrated e-commerce and POS capabilities.
* Basic inventory tracking and low-stock alerts.
**Disadvantages:**
* Limited advanced analytics without expensive add-ons.
* No built-in machine learning or predictive analytics.
* Advanced features require third-party app integrations at additional cost.

### **2.2.2 Square for Retail**
Square provides a free POS system with built-in inventory management and basic analytics for small retail businesses.
**Advantages:**
* Free base POS system with inventory tracking.
* Basic sales analytics and reporting.
* Customer directory with purchase history.
**Disadvantages:**
* Advanced analytics require a paid Square Analytics subscription.
* No predictive demand forecasting.
* Restrictive for multi-store operations.

### **2.2.3 Lightspeed Retail**
Lightspeed offers a comprehensive retail POS system with advanced inventory management and analytics features.
**Advantages:**
* Advanced inventory management with multi-location support.
* Detailed sales analytics and reporting.
* Vendor management and purchase ordering.
**Disadvantages:**
* Higher price point compared to competitors.
* No built-in machine learning for demand prediction.
* Complex setup and configuration required.

## **2.3 Supporting Literature**

### **2.3.1 Used Diagram**

**Entity Relationship Diagram**
An Entity-relationship model (ER model) describes the structure of a database with the help of a diagram, which is known as Entity Relationship Diagram (ER Diagram). An ER model is a design or blueprint of a database that can later be implemented as a database. The main components of E-R model are:
* **Entity:** An entity set is a group of similar entities and these entities can have attributes. In terms of DBMS, an entity is a table.
* **Attribute:** Attributes are the properties which define the entity type.
* **Relationship:** A relationship is represented by a diamond shape in the ER diagram; it shows the relationship among entities.

**Data Flow Diagram**
A data-flow diagram is a way of representing a flow of data through a process or a system. The DFD also provides information about the outputs and inputs of each entity and the process itself. Components of DFD involve:
* **Process:** An activity that changes or transforms data flows.
* **Data Flow:** Movement of data between external entities, processes, and data stores.
* **Data Store:** A data store simply holds data for later access.
* **External entity:** Also known as actors, sources, or sinks.

**Use Case Diagram**
A use case diagram is a way to summarize details of a system and the users within that system. It is generally shown as a graphic depiction of interactions among different elements in a system. 
* **System:** A specific sequence of actions and interactions between actors and the system.
* **Actors:** The users that interact with a system.

### **2.3.2 Technology Used**
To build this website, we basically used ASP.NET Core, HTML, CSS, and JavaScript. We used SQL Server for the database.
* **ASP.NET Core MVC:** Used for the web application framework. It keeps data (Model), user interface (View), and request handling (Controller) separate.
* **Entity Framework Core:** Used to talk to the SQL Server database. Instead of writing raw SQL, we write queries in C#.
* **Python FastAPI:** Used to build the machine learning service for sales prediction.
* **Facebook Prophet:** An open-source time-series forecasting library used to predict product demand.
* **Bootstrap & Chart.js:** Used for designing the frontend and drawing graphs on the dashboard.

## **2.4 Conclusion**
Software systems are becoming increasingly prominent in retail management. However, we found that most retail analytics tools are either too basic or too heavy. SellWise tries to solve this by providing built-in forecasting, automatic customer grouping, and a multi-store architecture in a simple, easy-to-use package.

---

# **Chapter 3**
# **SYSTEM EVALUATION**

## **3.1 Introduction**
Research works in the arena of retail management are characterized by a broad diapason of operations, ranging from POS systems to remote reporting. Because of the limitations in existing basic software, we proposed a model using modern web frameworks and machine learning where sales tracking, inventory alerts, and future predictions are all included. We hope that it will give great feedback to store owners.

## **3.2 Requirement Analysis**
Requirement Analysis is the process of defining user expectations for a new software being built. It encompasses those tasks that go into determining the needs or conditions to meet for a new product.

### **3.2.1 Non-Functional requirement**
Types of Non-functional Demand:
* **Performance:** Dashboard should load quickly, and operations should complete within seconds.
* **Security Demand:** Passwords must be hashed, and users can only access features based on their roles.
* **Reliability:** Data must not be corrupted during a transaction failure.
* **Manageability demand:** Easy to maintain and update the code.
* **Usability demand:** The website must be responsive and mobile-friendly.

### **3.2.2 Functional requirement**
A Functional Requirement describes the service that the software must offer.
* User Sign Up and Sign In.
* Create and manage products.
* Add products to the cart and process orders.
* View sales dashboard and statistics.
* View predicted demand for products.
* View low-stock alerts.
* Manage customer profiles.
* Generate PDF sales reports.

## **3.3 Methodology**

### **3.3.1 Agile Development model:**
We choose the Agile Development model for our project. It is a faster way to develop any software. It is a people and result-focused methodology. It’s flexible and easy to improve the quality of software.
**Reasons for choosing Agile Development model:**
* Clients are happier with the end product due to continuous improvements.
* Faster releases of features.
* More open communication between the team members.
* Spotting defects early during development rather than at the end.

### **3.3.2 Gantt Chart**
| Task | Week 1-2 | Week 3-4 | Week 5-6 | Week 7-8 | Week 9-10 |
|------|----------|----------|----------|----------|-----------|
| Database & Auth | ████ | | | | |
| Products & POS | | ████ | | | |
| Dashboard & ML | | | ████ | | |
| RFM & Alerts | | | | ████ | |
| Testing & Polish | | | | | ████ |

### **3.3.3 Data Flow Diagram**
**Context Level DFD (Level 0):**
``text
[Owner/Manager/Employee] <---> [SellWise System] <---> [SQL Database & ML Service]
``

### **3.3.4 ER Diagram**
**Key Entities:**
* User, Store, StoreMember
* Product, Order, OrderItem
* Customer, Expense, InventoryAlert, Forecast

### **3.3.5 Use Case Diagram**
* **Owner:** Manage Staff, View Dashboard, Switch Store, Generate Reports.
* **Manager:** Process Orders, Manage Inventory, View Analytics, Manage Customers.
* **Employee:** Process Orders, View Catalog.

### **3.3.6 Activity Diagram**
Order Creation Activity:
User clicks "Create Order" -> Adds items to cart -> Selects customer -> Submits form -> System begins database transaction -> Validates stock -> If sufficient, deducts stock and saves order -> Commits transaction.

### **3.3.7 Sequence Diagram**
Dashboard Sequence:
Browser requests Dashboard -> AnalyticsService checks Database -> Checks Forecast Cache -> If miss, requests Python ML Service -> Python returns prediction -> AnalyticsService saves cache -> Returns data to Browser.

### **3.3.8 Class Diagram**
* **BaseController:** Handles current store session.
* **DashboardController, OrderController:** Inherit BaseController.
* **AnalyticsService:** Calculates KPIs.
* **ForecastService:** Talks to the Python ML API.

### **3.3.9 Database Design**
Important tables:
* **Products:** Stores product details and stock quantity.
* **Orders:** Stores transaction totals and dates.
* **OrderItems:** Links orders with products and quantities.
* **Customers:** Stores customer details and RFM scores.

---

# **Chapter 4**
# **DESIGN IMPLEMENTATION**

## **4.1 User Section**
We have three kinds of users:
* Owner
* Manager
* Employee

We will show the background implementation of various features in this part.

### **4.1.1 Database Connection**
The SQL Server connection is configured in the application settings and connects via Entity Framework Core.
``json
``json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=SellWise;User Id=sa;Password=YourPass123!;TrustServerCertificate=True;"
  }
}
```


### **4.1.2 Authentication**
The signup function handles the creation of a user, their store, and their role, all within a database transaction.
``csharp
``csharp
[HttpPost]
public async Task<IActionResult> Login(LoginViewModel model)
{
    if (!ModelState.IsValid) return View(model);

    var result = await _signInManager.PasswordSignInAsync(
        model.Email!, model.Password!, isPersistent: true, lockoutOnFailure: false);

    if (result.Succeeded)
    {
        var user = await _userManager.FindByEmailAsync(model.Email!);
        if (user != null)
        {
            var member = await _db.StoreMembers.FirstOrDefaultAsync(m => m.UserId == user.Id);
            if (member != null)
                HttpContext.Session.SetString("ActiveStoreId", member.StoreId.ToString());
        }
        return RedirectToAction("Index", "Dashboard");
    }

    ModelState.AddModelError(string.Empty, "Invalid email or password.");
    return View(model);
}
```


### **4.1.3 POS Order Processing**
When a user creates an order, the system uses ACID transactions to ensure that stock is checked and deducted safely.
``csharp
``csharp
builder.Services.Configure<IdentityOptions>(options =>
{
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
});
```


### **4.1.4 Inventory Alerts**
The system automatically scans for low stock and generates alerts to notify the shop owner.
``csharp
``csharp
public async Task<IActionResult> Delete(Guid id)
{
    var storeId = GetCurrentStoreId();
    var product = await Db.Products
        .FirstOrDefaultAsync(p => p.Id == id && p.StoreId == storeId);
    if (product != null)
    {
        product.IsActive = false; // Soft delete — preserves historical OrderItem records
        await Db.SaveChangesAsync();
    }
    return RedirectToAction("Index");
}
```


### **4.1.5 Customer Segmentation**
Customers are grouped into segments based on Recency, Frequency, and Monetary scores.
``csharp
``csharp
public async Task ScanAndGenerateAlertsAsync(Guid storeId)
{
    var lowStockProducts = await _db.Products
        .Where(p => p.StoreId == storeId && p.IsActive
            && p.StockQuantity <= p.LowStockThreshold)
        .ToListAsync();

    // Resolve alerts for products that are now back above threshold
    var healthyProductIds = await _db.Products
        .Where(p => p.StoreId == storeId && p.IsActive && p.StockQuantity > p.LowStockThreshold)
        .Select(p => p.Id).ToListAsync();

    var alertsToResolve = await _db.Alerts
        .Where(a => a.StoreId == storeId && a.Type == "Low Stock"
            && healthyProductIds.Contains(a.ProductId))
        .ToListAsync();

    foreach (var alert in alertsToResolve)
    {
        alert.Type = "Low Stock (Resolved)";
        alert.IsRead = true;
    }

    // Avoid duplicates — check for existing "Low Stock" alerts (not resolved)
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
                : $"Only {product.StockQuantity} unit(s) left — threshold is {product.LowStockThreshold}.",
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        });
    }
    await _db.SaveChangesAsync();
}
```


### **4.1.6 Machine Learning Forecasting**
The Python service uses the Meta Prophet library to predict product demand based on historical data.
``python
``python
# app/services/prophet_service.py
from prophet import Prophet
import pandas as pd

def generate_forecast(history, periods=30):
    if len(history) < 2:
        return []

    df = pd.DataFrame([{"ds": point.ds, "y": point.y} for point in history])
    df = df.groupby("ds", as_index=False)["y"].sum().sort_values("ds").reset_index(drop=True)

    # Only enable yearly seasonality if history covers >= 1 full year
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
        print(f"Prophet fitting failed: {e}")
        return []

    future = model.make_future_dataframe(periods=periods)
    forecast_df = model.predict(future)
    future_forecast = forecast_df.tail(periods)

    return [
        ForecastResultPoint(
            ds=row['ds'].date(),
            yhat=max(0, float(row['yhat'])),
            yhat_lower=max(0, float(row['yhat_lower'])),
            yhat_upper=max(0, float(row['yhat_upper']))
        )
        for _, row in future_forecast.iterrows()
    ]
```


## **4.3 Conclusions**
A few design decisions that worked out well:
1. Keeping business logic in service classes kept our code clean.
2. Using database transactions for orders prevented any inventory mismatch.
3. Filtering queries manually by Store ID ensured that data from different shops never mixed.
4. Setting up a fallback mechanism ensures the dashboard still loads even if the machine learning service is down.

---

# **Chapter 5**
# **TESTING**

## **5.1 Testing**
Testing is the process in which the system is run on manually created input so that we can verify the system is correctly working as desired or not. During systems testing, the system is used experimentally to ensure that the software does not fail. Special test data are input for processing, and the results examined.

## **5.2 Validation Criteria**
The validation criteria in this project are as follows:
* Here, the user inputs are validated before storing them.
* All the screens have a similar look and feel, providing a better user interface.
* Transactions cannot corrupt data if an error occurs mid-process.

## **5.3 Important Of Testing**
The importance of system testing is that the system is expected to run according to requirement before delivering it to the user. The System is tested on the basis of specification so that it does not fail on the user site.

## **5.4 Structural Testing**
Structural Testing takes into account the internal mechanism of a system or component. We checked the code coverage and error handling, ensuring that all database operations are wrapped in try-catch blocks.

## **5.5 Functional Testing**
We tested each feature against what it is supposed to do, such as login, adding items to the cart, processing orders, and checking whether the dashboard numbers match the database.

## **5.6 Acceptance Test Generation**
The objective of this step is to produce a set of test data that may be used to test the system. We generated demo data with 2 stores, hundreds of customers, and 180 days of order history to simulate a real environment.

## **5.7 Unit Testing**
Unit testing focuses on the modules independently to locate errors. We checked individual service methods like the RFM calculation and the Prophet forecasting logic to ensure they return accurate numbers.

## **5.8 Integration Testing**
This is a systematic technique for constructing the program structure while uncovering errors associated with interfaces. We verified the connection between the C# web application and the Python machine learning service.

## **5.9 Test Data Used**
* **Using Live Test Data:** Live tests were conducted by inputting real-world retail scenarios.
* **Using Artificial Test Data:** Demo scripts were used to inject bulk data into the database for load testing.

## **5.10 Test Cases**

| Module | Test Case Scenarios | Tested | Working |
|--------|---------------------|--------|---------|
| **Authentication** | 1. Verify login with valid credentials<br>2. Verify account lockout<br>3. Verify signup creates store | Yes | Yes |
| **Dashboard** | 1. Verify KPI calculations<br>2. Verify charts render correctly | Yes | Yes |
| **POS Orders** | 1. Verify cart adds items<br>2. Verify stock validation<br>3. Verify transaction rollback on failure | Yes | Yes |
| **Products** | 1. Verify CRUD operations<br>2. Verify CSV import | Yes | Yes |
| **Customers** | 1. Verify RFM calculation<br>2. Verify segment assignment | Yes | Yes |

## **5.11 Testing result**
Sign in system works perfectly. If the given password doesn't match with the database, then it shows a warning. Order creation works smoothly and safely deducts inventory.

## **5.12 Testing Summery**
We tested all the panels assigned for users. The project was tested in the localhost with all possible options. The testing process involved successful login, form validation, order creation, and record generation. The project was successfully tested and a few bugs were fixed.

---

# **Chapter 6**
# **USER MANUAL**

## **6.1 Introduction**
The system provides the capability to manage all aspects of your retail business by providing a complete management suite. By creating powerful resources and delivering them online, the system is flexible and easy to use.

## **6.2 System Requirements**

### **6.2.1 H/W Requirements**
* **Operating System:** Windows 10, macOS, Linux
* **Processor:** Dual core processor
* **RAM:** Minimum 4GB
* **Storage:** 128GB
* **Network:** Internet connection required.

### **6.2.2 S/W Requirements**
* **Browser:** Chrome, Firefox, or Edge.
* **Docker:** Docker Desktop for running the database.
* **Python:** Python 3.11+ for the ML service.

## **6.3 User Interface**
The very first portion is "User Login" which is the user interface to access the system. Users must validate their email and password.
After login, users see the Dashboard where they can view sales KPIs, graphs, and demand forecasts. 
To process a sale, the user goes to the "Orders" section, adds products to the cart, applies any discounts, and submits the order.
To manage inventory, the user goes to the "Products" page to add or edit items.
The "Customers" page shows all customer profiles along with their automatically generated loyalty segments.

## **6.4 Conclusion**
In this chapter, we described the requirement specifications of the system and the actions that can be done. User will discover the basic characteristics and the way to use them easily.

---

# **Chapter 7**
# **CONCLUSION AND FUTURE WORKS**

## **7.1 Conclusion**
Our project is a humble venture to satisfy the needs of retail business management. This package shall prove to be a powerful tool in satisfying all the requirements of shop owners. We successfully built an application that combines POS, inventory, and machine learning sales predictions. 
At the end, it is concluded that we have made an effort to solve real-world problems by reducing manual paperwork and providing accurate, data-driven insights to users.

## **7.2 Outcomes**
* Added flexibility and better time management for shop owners.
* Improved decision-making using smart sales forecasting.
* Automated tracking of customer loyalty.
* Safe and error-free processing of daily sales.
* Easy monitoring of low-stock items.

## **7.3 Current Limitations**
We have some limitations to overcome in the future. Some of them are shared below:
* Improve the machine learning system to test different prediction models automatically.
* The system currently requires a continuous internet connection; there is no offline mode.
* It only supports one currency per store.

## **7.4 Future Works**
Our website may be improved in diverse vital areas to be carried out without problems:
* **Add Email Marketing:** Push customer segments to email platforms for automated marketing campaigns.
* **Mobile App:** Develop a native mobile app so that users can manage their shop more easily on the go, with offline capabilities.
* **Cloud Server:** Host the system on a cloud infrastructure like AWS or Azure for better performance and scalability globally.
