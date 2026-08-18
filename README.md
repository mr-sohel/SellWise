# SellWise: AI Sales Analytics & Inventory SaaS

[![.NET 10](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![EF Core 10](https://img.shields.io/badge/EF%20Core-10.0-512BD4?logo=dotnet&logoColor=white)](https://learn.microsoft.com/ef/core/)
[![SQL Server 2022](https://img.shields.io/badge/SQL%20Server-2022-CC292B?logo=microsoftsqlserver&logoColor=white)](https://www.microsoft.com/sql-server/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Meta Prophet](https://img.shields.io/badge/Meta-Prophet-0081FB?logo=meta&logoColor=white)](https://facebook.github.io/prophet/)
[![Bootstrap 5.3](https://img.shields.io/badge/Bootstrap-5.3.3-7952B3?logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![QuestPDF](https://img.shields.io/badge/QuestPDF-2026.7-brightgreen)](https://www.questpdf.com/)

**SellWise** is an enterprise-grade Software-as-a-Service (SaaS) platform built for small-to-medium retail businesses. It combines transactional point-of-sale (POS) operations, inventory tracking, financial analytics, and machine learning to deliver predictive demand forecasting and automated customer segmentation.

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
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│             (Razor Views + Bootstrap 5.3 + Chart.js)        │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / HTTPS (Port 5000)
┌──────────────────────────────▼──────────────────────────────┐
│                SellWise.Web (ASP.NET Core 10)               │
│                                                             │
│  - ASP.NET Core Identity (Cookie Auth & RBAC)               │
│  - Multi-Tenant Store Isolation (EF Core Global Filters)    │
│  - Transactional POS & Order Management (ACID)              │
│  - Analytics, RFM Scoring & Inventory Alerts                │
│  - QuestPDF Automated Document Generation                   │
└───────────────┬─────────────────────────────┬───────────────┘
                │ TDS (Port 1433)             │ REST JSON (Port 8000)
┌───────────────▼───────────────┐ ┌───────────▼───────────────┐
│     SQL Server 2022 Docker    │ │    SellWise.ML (FastAPI)  │
│   (Named Volume: sellwise-data│ │                           │
│    - Orders, Products, RFM)   │ │  - Meta Prophet Engine    │
│                               │ │  - 30-Day Time Series     │
└───────────────────────────────┘ └───────────────────────────┘
```

---

## ✨ Key Features & Capabilities

### 1. 📈 AI-Powered Demand Forecasting
- **Time-Series Modeling:** Ingests 90 days of sales history per product, zero-pads missing dates, and submits data to the Python microservice running **Meta Prophet** (accounting for weekly and yearly seasonality).
- **30-Day Projections:** Predicts expected units with confidence intervals (`yhat_lower`, `yhat_upper`).
- **Resilient Fallback:** 24-hour caching in the `Forecasts` table; automatically falls back to Exponentially Weighted Moving Average (EWMA) if the ML service is unreachable.

### 2. 🛒 ACID-Compliant Point of Sale (POS)
- Encapsulates order creation, customer assignment, and inventory deduction within EF Core transactions (`BeginTransactionAsync`).
- Atomic rollbacks prevent partial writes or negative inventory states during concurrent checkouts.

### 3. 👥 Customer RFM Segmentation
- **Behavioral Scoring:** Calculates Recency, Frequency, and Monetary scores across entire purchase histories.
- **Dynamic Cohorts:** Classifies buyers into 8 actionable segments (*Champions, Loyal, Potential Loyalists, At Risk, Can't Lose Them, Hibernating, Lost, New Customers*).

### 4. ⚠️ Proactive Inventory Alerts
- Continuously tracks stock thresholds and reorder points.
- Categorizes inventory status into **Critical** (out of stock) and **Warning** (low stock) alerts with instant restock triggers.

### 5. 💰 Expense Tracking & Net Profitability
- Logs operational overhead (rent, utilities, salaries, marketing).
- Computes true net margins by deducting overhead expenses and Cost of Goods Sold (COGS) from gross revenue.

### 6. 📄 Automated PDF Reporting Engine
- Generates publication-ready PDF reports on-demand using **QuestPDF**.
- Exports periodic sales summaries, inventory valuations, and financial audits.

### 7. 🏢 Multi-Tenant Store Management
- Supports multiple store profiles per administrative account.
- Enforces strict tenant data isolation at the ORM query level (`GetCurrentStoreId()`), preventing cross-store data leakage.

### 8. 🔍 Global Search & Quick Actions
- Real-time indexing across products, customers, and orders for rapid navigation.

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
| **Containerization** | Docker & Docker Compose | Containerized MSSQL with persistent volume `sellwise-data` |

---

## 📁 Project Structure

```text
SellWise/
├── SellWise.Web/                  # ASP.NET Core 10 Web Application
│   ├── Controllers/               # Thin HTTP controllers (BaseController, Order, Product, etc.)
│   ├── Data/                      # AppDbContext, Seed configurations, Migrations
│   ├── Models/                    # POCO database entities (Product, Order, Customer, Expense)
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
# Step 1: Start SQL Server
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
