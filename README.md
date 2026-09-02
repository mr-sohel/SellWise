# SellWise: AI Sales Analytics & Inventory SaaS

[![.NET 10](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![EF Core 10](https://img.shields.io/badge/EF%20Core-10.0-512BD4?logo=dotnet&logoColor=white)](https://learn.microsoft.com/ef/core/)
[![SQL Server 2022](https://img.shields.io/badge/SQL%20Server-2022-CC292B?logo=microsoftsqlserver&logoColor=white)](https://www.microsoft.com/sql-server/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Meta Prophet](https://img.shields.io/badge/Meta-Prophet-0081FB?logo=meta&logoColor=white)](https://facebook.github.io/prophet/)
[![Bootstrap 5.3](https://img.shields.io/badge/Bootstrap-5.3.3-7952B3?logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![QuestPDF](https://img.shields.io/badge/QuestPDF-2026.7-brightgreen)](https://www.questpdf.com/)

**SellWise** is an enterprise-grade Software-as-a-Service (SaaS) platform built for small-to-medium retail businesses. It combines transactional point-of-sale (POS) operations, multi-tenant inventory tracking, financial analytics, salesperson attribution, printable invoices, and machine learning to deliver predictive demand forecasting and automated customer segmentation.

---

## ⚡ Quick Start & Credentials

Run the automated startup script to launch SQL Server (Docker), the Python ML service, run EF Core migrations, and start the ASP.NET Core web app:

```bash
# Windows
.\start.ps1

# macOS / Linux
./start.sh
```

| Service | URL | Credentials / Notes |
|---|---|---|
| **Web Application** | [http://localhost:5000](http://localhost:5000) | **Email:** `admin@sellwise.com` <br> **Password:** `Admin123!` |
| **ML Microservice (FastAPI)** | [http://localhost:8000](http://localhost:8000) | Interactive API docs at `/docs` |
| **SQL Server (Docker)** | `localhost:1433` | **User:** `sa` <br> **Password:** `YourPass123!` |
| **Pre-seeded Demo Stores** | `SellWise Tech BD` (Electronics) <br> `StyleHub BD` (Fashion) | Switch active store via top navigation |

---

## 🏗️ System Architecture

SellWise decouples high-throughput web traffic and transactional data management from CPU-intensive machine learning workloads.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                             Client Browser                              │
│              (Razor Views + Bootstrap 5.3 + Chart.js)                   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP / HTTPS (Port 5000)
┌────────────────────────────────────▼────────────────────────────────────┐
│                    SellWise.Web (ASP.NET Core 10)                       │
│                                                                         │
│  - ASP.NET Core Identity (Cookie Auth, Lockout Policy & RBAC)           │
│  - Multi-Tenant Store Isolation (EF Core Session-Scoped Query Filters)  │
│  - Role Hierarchy (Owner, Store Manager, Salesman / Employee)           │
│  - Transactional POS & Order Types (Walk-In, Online, Delivery, Phone)   │
│  - Salesperson Tracking & Printable Invoices                            │
│  - Customer Management & RFM Scoring Cohorts                            │
│  - Proactive Inventory Alerts & Automated Resolution                    │
│  - QuestPDF Automated Document & Audit Export Engine                    │
└─────────────────┬───────────────────────────────────────┬───────────────┘
                  │ TDS (Port 1433)                       │ REST JSON (Port 8000)
┌─────────────────▼───────────────┐       ┌───────────────▼───────────────┐
│     SQL Server 2022 Docker      │       │     SellWise.ML (FastAPI)     │
│   (Named Volume: sellwise-data  │       │                               │
│    - Orders, Products, RFM)     │       │  - Meta Prophet Engine        │
│                                 │       │  - 30-Day Time Series         │
└─────────────────────────────────┘       └───────────────────────────────┘
```

---

## ✨ Key Features & Capabilities

### 1. 📈 AI-Powered Demand Forecasting
- **Time-Series Modeling:** Ingests 90 days of sales history per product, zero-pads missing dates, and submits data to the Python microservice running **Meta Prophet** (accounting for weekly and yearly seasonality).
- **30-Day Projections:** Predicts expected units with confidence intervals (`yhat_lower`, `yhat_upper`).
- **Resilient Fallback:** 24-hour caching in the `Forecasts` table; automatically falls back to Exponentially Weighted Moving Average (EWMA) if the ML service is unreachable.

### 2. 🛒 Point of Sale (POS) & Multi-Channel Orders
- **ACID Transactions:** Encapsulates order creation, stock validation, customer assignment, and inventory deduction within EF Core transactions (`BeginTransactionAsync`).
- **Multi-Channel Order Types:** Classifies orders across `Walk-In` (Offline POS), `Online`, `Delivery`, and `Phone`.
- **Salesperson Tracking:** Records the active salesperson (`SalespersonName`) on every order for commission tracking and staff accountability.
- **Atomic Rollbacks:** Prevents partial writes or negative inventory states during concurrent checkouts.

### 3. 🧾 Printable Invoices & Receipts
- **Interactive Invoice View:** Built-in invoice generator (`/Order/Invoice/{id}`) formatted for standard paper and thermal POS receipt printing (`window.print()`).
- **Complete Transaction Metadata:** Itemized products, quantity, unit prices, subtotal, discount, delivery charges, customer address, payment status, and order tracking numbers (`ORD-YYYYMMDD-XXXXXX`).

### 4. 👥 Customer Management & RFM Segmentation
- **Quick-Create Modal:** Add new customer profiles directly from the POS checkout flow or customer directory with automated phone deduplication.
- **Behavioral Scoring:** Calculates Recency, Frequency, and Monetary scores across entire purchase histories.
- **Dynamic Cohorts:** Classifies buyers into 8 actionable segments (*Champions, Loyal, Potential Loyalists, At Risk, Can't Lose Them, Hibernating, Lost, New Customers*).

### 5. ⚠️ Proactive Inventory Alerts & Restock Workflow
- Continuously tracks stock thresholds and reorder points.
- Categorizes inventory status into **Critical** (out of stock) and **Warning** (low stock) alerts.
- **Automated Resolution:** Alerts automatically resolve and mark as read when inventory is restocked above the threshold.

### 6. 💰 Expense Tracking & Net Profitability
- Categorizes and logs operational overhead (Rent, Utilities, Salaries, Marketing, Maintenance).
- Computes true net margins by deducting overhead expenses and Cost of Goods Sold (COGS) from gross revenue.

### 7. 📄 Automated PDF Reporting Engine
- Generates publication-ready PDF reports on-demand using **QuestPDF**.
- Exports periodic sales summaries, inventory valuations, and financial audits.

### 8. 🏢 Multi-Tenant Store & Role-Based Access Control (RBAC)
- Supports multiple store profiles per administrative account with instant store switching.
- **Role Permissions:**
  - **Owner:** Full system access, store creation, staff management, analytics, expenses, and reports.
  - **Manager:** POS operations, product catalog, inventory alerts, customer directory, and expenses.
  - **Salesman / Employee:** Fast POS checkout, order management, customer creation, and product catalog lookup (restricted from financial analytics, staff settings, and reports).

---

## 🐳 Docker Container Setup & Terminal Commands

SellWise uses Microsoft SQL Server 2022 running in a Docker container with persistent named volumes to maintain data between restarts.

### 1. Create and Run Container via Terminal

Execute the following commands in your terminal:

```bash
# 1. Pull the official SQL Server 2022 Linux image
docker pull mcr.microsoft.com/mssql/server:2022-latest

# 2. Create a persistent Docker volume for database files
docker volume create sellwise-data

# 3. Create and start the SQL Server container
docker run -d \
  --name sellwise-sql \
  -p 1433:1433 \
  -e "ACCEPT_EULA=Y" \
  -e "MSSQL_SA_PASSWORD=YourPass123!" \
  -v sellwise-data:/var/opt/mssql \
  --restart unless-stopped \
  mcr.microsoft.com/mssql/server:2022-latest
```

### 2. Verify Container Status & Health

```bash
# Check if the container is running
docker ps -f name=sellwise-sql

# Inspect container startup logs
docker logs sellwise-sql

# Test connectivity and query SQL Server version inside container
docker exec -it sellwise-sql /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "YourPass123!" -C \
  -Q "SELECT @@VERSION AS [SQL Server Version];"
```

### 3. Container Management Commands

| Action | Terminal Command |
|---|---|
| **Start container** | `docker start sellwise-sql` |
| **Stop container** | `docker stop sellwise-sql` |
| **Restart container** | `docker restart sellwise-sql` |
| **View live logs** | `docker logs -f sellwise-sql` |
| **Open Bash shell** | `docker exec -it sellwise-sql /bin/bash` |
| **Remove container (keeps data)** | `docker rm -f sellwise-sql` *(Volume `sellwise-data` preserves all tables)* |

---

## 🗄️ Database Connection & EF Core Configuration

The ASP.NET Core web application connects to SQL Server via Entity Framework Core 10 using the connection string defined in `SellWise.Web/appsettings.json`.

### 1. Connection String Configuration

File: `SellWise.Web/appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=SellWise;User Id=sa;Password=YourPass123!;TrustServerCertificate=True;Encrypt=False;"
  },
  "MlServiceUrl": "http://localhost:8000"
}
```

#### Parameter Breakdown:
- `Server=localhost,1433` — Host and port mapped by Docker.
- `Database=SellWise` — Target relational database name.
- `User Id=sa` — Default System Administrator account.
- `Password=YourPass123!` — Strong password matching the Docker container environment variable.
- `TrustServerCertificate=True` — Bypasses TLS certificate chain validation for local development.
- `Encrypt=False` — Disables SSL encryption requirement for local container connectivity.

### 2. Connecting with Database GUI Tools (SSMS, Azure Data Studio, DBeaver)

To connect from external database management software:

- **Server Name / Host:** `localhost,1433` (or `127.0.0.1,1433`)
- **Authentication:** `SQL Server Authentication`
- **Username / Login:** `sa`
- **Password:** `YourPass123!`
- **Database:** `SellWise`
- **Trust Server Certificate:** `True` (Checked)
- **Encryption:** `Optional` / `False`

### 3. Applying Migrations & Seeding via Terminal

```bash
# Navigate to web project directory
cd SellWise.Web

# Apply all EF Core migrations to create tables
dotnet ef database update

# Seed realistic demo data (Electronics & Fashion stores with 180 days of history)
dotnet run --seed
```

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Web Framework** | ASP.NET Core 10 MVC (`net10.0`) | Strongly typed, high-performance web framework |
| **ORM & Database** | Entity Framework Core 10 + SQL Server 2022 | Relational schema, ACID transactions, LINQ queries |
| **Authentication** | ASP.NET Core Identity | Cookie sessions, BCrypt password hashing, RBAC |
| **Frontend UI** | Razor Views, Bootstrap 5.3.3, Chart.js 4.4.7 | Responsive layout, CDN-delivered assets, custom CSS variables |
| **PDF Generation** | QuestPDF 2026.7.1 | Code-first programmatic PDF generation engine |
| **ML Microservice** | Python 3.11+, FastAPI, Uvicorn | High-performance asynchronous REST API |
| **Forecasting Engine** | Meta Prophet, Pandas, NumPy, Scikit-Learn | Additive regression model for time-series forecasting |
| **Containerization** | Docker & Named Volumes | MSSQL 2022 container with persistent volume `sellwise-data` |

---

## 📁 Project Structure

```text
SellWise/
├── Diagrams/                      # Architecture, UML & DFD diagram assets
│   ├── Use_Case_diagram.png       # Role & Use Case specifications
│   ├── activity_diagram.svg       # POS checkout transaction flow
│   ├── class_diagram.svg          # Core domain models & controllers
│   ├── dfd_level0.svg             # Context-level Data Flow Diagram
│   ├── dfd_level1.svg             # Functional-level Data Flow Diagram
│   ├── er_diagram.svg             # Entity-Relationship schema
│   ├── gantt_chart.svg            # Project timeline & milestone phases
│   └── sequence_diagram.svg       # Dashboard & ML forecast sequence
│
├── SellWise.Web/                  # ASP.NET Core 10 Web Application
│   ├── Controllers/               # Thin HTTP controllers (Auth, Order, Product, Dashboard, etc.)
│   ├── Data/                      # AppDbContext, Seed configurations, Migrations
│   ├── Models/                    # POCO database entities (Product, Order, Customer, Expense, etc.)
│   ├── Services/                  # Core business logic (Analytics, Forecast, Order, RFM, Alerts)
│   ├── ViewModels/                # Strongly typed view models preventing over-posting
│   ├── Views/                     # Razor views (.cshtml) styled with Bootstrap 5.3
│   └── wwwroot/                   # Static assets (site.css, images, JavaScript)
│
├── SellWise.ML/                   # Standalone Python ML Microservice
│   ├── app/
│   │   ├── routers/               # FastAPI endpoints (/forecast, /health)
│   │   ├── services/              # Prophet model training & prediction logic
│   │   └── models/                # Pydantic schemas for request/response validation
│   └── requirements.txt           # Python dependencies (Prophet, FastAPI, Pandas)
│
├── start.ps1 / start.sh           # Automated full-stack startup scripts
├── reset-db.ps1 / reset-db.sh     # DB drop, re-migration & multi-store seed scripts
└── SellWise.slnx                  # Visual Studio solution file
```

---

## 🤖 Machine Learning Pipeline

```text
Dashboard Request
  │
  ▼
AnalyticsService.GetOverview()
  │
  ├─► Select top 6 products by quantity sold
  │
  ├─► Check 'Forecasts' table (cached < 24 hrs?)
  │     ├── [YES] ──► Return cached predictions
  │     └── [NO]  ──► Query 90-day daily sales history from OrderItems
  │                     │
  │                     ▼
  │                   Pad missing days with zeros
  │                     │
  │                     ▼
  │                   ForecastService.GetForecastAsync()
  │                     │
  │                     ▼
  │                   POST http://localhost:8000/api/v1/ml/forecast
  │                     │
  │                     ▼
  │                   Prophet runs time-series regression
  │                     │
  │                     ▼
  │                   Return 30-day predicted demand (yhat, yhat_lower, yhat_upper)
  │                     │
  │                     ▼
  │                   Save results to 'Forecasts' table & rank cards on Dashboard
```

*Note: If the Python service is offline or cold-start times exceed the 5-second timeout, the system automatically falls back to an Exponentially Weighted Moving Average (EWMA).*

---

## 🚀 Getting Started

### Prerequisites
- [.NET 10.0 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for SQL Server container)
- [Python 3.11+](https://www.python.org/) and [`uv`](https://github.com/astral-sh/uv) (or standard `pip`)

### 1. Automated Setup (Recommended)
Clone the repository and run the startup script:

```bash
# Windows
.\start.ps1

# macOS / Linux
./start.sh
```

### 2. Full Database Reset & Multi-Store Seeding
To drop the database, re-run all migrations, and seed ~180 days of realistic sales data for both demo stores:

```bash
# Windows
.\reset-db.ps1

# macOS / Linux
./reset-db.sh
```

### 3. Manual Component Execution
If you prefer running services independently:

```bash
# Step 1: Start SQL Server in Docker
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourPass123!" -p 1433:1433 --name sellwise-sql -v sellwise-data:/var/opt/mssql -d mcr.microsoft.com/mssql/server:2022-latest

# Step 2: Apply Migrations & Seed Demo Data
cd SellWise.Web
dotnet ef database update
dotnet run --seed

# Step 3: Start Python ML Microservice
cd ../SellWise.ML
uv run uvicorn app.main:app --port 8000 --reload

# Step 4: Start ASP.NET Core Web App
cd ../SellWise.Web
dotnet run --urls "http://localhost:5000"
```

---

## 🛡️ Security & Reliability Best Practices

- **Anti-Forgery:** All state-modifying requests require valid anti-forgery tokens via `[AutoValidateAntiforgeryToken]`.
- **Over-Posting Protection:** Controllers accept only strictly defined ViewModels rather than binding database entities directly.
- **SQL Injection Prevention:** All database communication flows through Entity Framework Core parameterized queries.
- **Soft Deletes:** Key business entities implement soft deletion to maintain historical auditability and report referential integrity.
- **Brute-Force Protection:** ASP.NET Core Identity Lockout enforces 5 maximum failed login attempts with a 15-minute lockout period.
