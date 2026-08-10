# SellWise: Project Overview

## 1. Executive Summary

SellWise is a Software-as-a-Service (SaaS) web application designed to optimize retail operations through advanced analytics and machine learning. Built specifically for small and medium-sized enterprises (SMEs), the platform addresses core operational challenges such as inventory mismanagement, lack of demand visibility, and customer churn. 

By integrating a centralized management dashboard, AI-powered demand forecasting, and automated customer segmentation, SellWise enables data-driven decision-making. The system utilizes an ASP.NET Core MVC architecture coupled with a microservice-based Python ML backend, ensuring high performance, decoupling of computational workloads, and robust data integrity.

---

## 2. Problem Statement

Retail businesses frequently encounter inefficiencies stemming from a lack of predictive insight and centralized data management. Key challenges include:

- **Inventory Misallocation (Overstocking & Understocking):** Inaccurate demand forecasting leads to capital tied up in surplus inventory or lost revenue due to stockouts.
- **Unrecognized Customer Churn:** Without systematic tracking of purchasing behavior, businesses often fail to identify and re-engage dormant or at-risk customers.
- **Fragmented Data Ecosystems:** Relying on disconnected spreadsheets and manual reporting mechanisms increases operational overhead and introduces human error.

SellWise resolves these issues by consolidating retail data into a single, unified platform enhanced by predictive modeling and automated analytics.

---

## 3. Target User Personas

| Role | Operational Challenge | SellWise Solution |
|---|---|---|
| **Business Owner** | Lack of real-time visibility into business performance across locations. | Comprehensive real-time dashboard aggregating key metrics and multi-tenant management. |
| **Inventory Manager** | Difficulties in anticipating demand and maintaining optimal stock levels. | 30-day predictive demand forecasting and automated low-stock alerts. |
| **Store Manager** | Need for efficient point-of-sale operations and role-restricted access. | Streamlined order management interface with strict role-based access control (RBAC). |

---

## 4. Core Features and Capabilities

### 4.1 Real-Time Analytics Dashboard
The centralized dashboard provides an immediate overview of business health, aggregating key performance indicators (KPIs) such as temporal revenue trends, active order volume, top-performing SKUs, and predictive demand trajectories.

### 4.2 AI-Powered Demand Forecasting
The system utilizes time-series forecasting to predict future product demand:
- **Historical Analysis:** The system aggregates 90 days of sales history per product.
- **Predictive Modeling:** Data is transmitted to an isolated Python microservice running Facebook Prophet, a production-grade forecasting algorithm.
- **Statistical Output:** The model returns a 30-day projection, including the expected demand (`yhat`), as well as lower (`yhat_lower`) and upper (`yhat_upper`) confidence intervals.
- **Graceful Degradation:** Forecasts are cached for 24 hours. Should the ML microservice experience downtime, the system automatically falls back to a moving average calculation, ensuring uninterrupted functionality.

### 4.3 Transactional Order Management
The Point-of-Sale (POS) interface guarantees strict data integrity. Creating an order and deducting inventory are encapsulated within an ACID-compliant database transaction. This ensures that system failures during order processing result in a complete rollback, preventing data corruption and misaligned stock levels.

### 4.4 Automated Customer Segmentation (RFM Analysis)
SellWise implements Recency, Frequency, and Monetary (RFM) analysis to algorithmically categorize customers. By scoring purchasing behavior, the system automatically assigns segments such as "Champion", "At Risk", or "Lost". This enables targeted marketing and proactive retention strategies.

### 4.5 Proactive Inventory Alerts
The platform continuously monitors stock thresholds, automatically generating actionable alerts when inventory levels reach predefined minimums or are fully depleted. 

### 4.6 Multi-Tenant Architecture
The application supports multi-store management under a single administrative account. Strict tenant isolation is enforced at the database query layer, ensuring that data cross-contamination between branches is structurally impossible.

### 4.7 Comprehensive Data Operations
- **Role-Based Access Control (RBAC):** Granular permissions for Owners, Managers, and Employees.
- **Bulk Data Import:** CSV support for rapid ingestion of historical orders and product catalogs.
- **Reporting:** Automated generation of formatted PDF financial and operational reports.
- **Expense Tracking:** Integration of overhead costs to calculate true profitability.
- **Soft Deletion:** Records are flagged as inactive rather than permanently deleted, preserving referential integrity for historical financial reporting.

---

## 5. Technical Architecture

SellWise employs a microservice-oriented architecture, decoupling the primary web application from the computationally intensive machine learning workload.

### System Diagram
```text
┌─────────────────────────────────────────┐
│              Client Browser             │
└────────────────────┬────────────────────┘
                     │ HTTP / HTTPS
┌────────────────────▼────────────────────┐
│      SellWise.Web (ASP.NET Core MVC)    │
│                                         │
│  - Authentication & Authorization       │
│  - Entity Framework Core (ORM)          │
│  - Multi-tenant Query Filters           │
│  - Business Logic & Analytics Services  │
└────────────────────┬────────────────────┘
                     │ REST API (JSON)
┌────────────────────▼────────────────────┐
│      SellWise.ML (Python / FastAPI)     │
│                                         │
│  - Data Validation (Pydantic)           │
│  - Time-Series Modeling (Prophet)       │
│  - Forecast Generation                  │
└─────────────────────────────────────────┘
```

---

## 6. Technology Stack

| Component | Technology | Rationale |
|---|---|---|
| **Web Framework** | ASP.NET Core 10 MVC (C#) | Strongly-typed, scalable framework optimized for enterprise web applications. |
| **Database** | SQL Server (Dockerized) | Relational database management system supporting robust ACID transactions. |
| **ORM** | Entity Framework Core 10 | Simplifies data access and enforces type-safe database interactions. |
| **Authentication** | ASP.NET Core Identity | Secure, built-in framework for authentication, hashing, and session management. |
| **Frontend** | Bootstrap 5.3, Chart.js, jQuery | Lightweight, framework-agnostic UI implementation ensuring high performance. |
| **Reporting** | QuestPDF | Efficient C# library for programmatic PDF generation. |
| **ML Microservice** | Python, FastAPI, Uvicorn | High-performance API framework within the industry-standard Python data science ecosystem. |
| **Forecasting Engine** | Facebook Prophet | Open-source, production-ready time-series forecasting model optimized for business metrics. |

---

## 7. Architectural Decisions & Best Practices

1. **ACID Compliance:** Essential operations, particularly inventory deductions during order placement, are transactional.
2. **Structural Multi-Tenancy:** Tenant isolation is enforced globally via Entity Framework Core query filters, minimizing the risk of application-layer data leaks.
3. **Microservice Decoupling:** Isolating the Prophet modeling process in a standalone Python service prevents CPU-bound tasks from degrading the performance of the primary web application.
4. **Resiliency Patterns:** Implementing moving-average fallbacks guarantees that the dashboard remains functional even if the ML service is unavailable.
5. **Dependency Injection:** Business logic is abstracted into interface-based services, promoting loose coupling, testability, and modularity.
6. **Optimized Database Indexing:** Compound indexes are applied to high-traffic query paths (e.g., date and store ID filtering) to ensure sustained performance at scale.

---

## 8. Development & Deployment

The repository includes automation scripts to streamline environment provisioning and application startup.

**Startup Command (Windows):**
```powershell
.\start.ps1
```
This script orchestrates the deployment process by:
1. Initializing the SQL Server database via Docker.
2. Launching the Python FastAPI ML service on port 8000.
3. Executing Entity Framework Core database migrations.
4. Starting the ASP.NET Core web application.

**Database Reset & Seeding:**
```powershell
.\reset-db.ps1
```
This command tears down the existing database and seeds a comprehensive demonstration dataset containing multiple simulated stores, populated with historical orders and seasonal trends, enabling immediate evaluation of the forecasting and analytics engines.

---

## 9. Conclusion

SellWise represents a robust, production-ready software solution that bridges the gap between basic retail management and advanced data science. By implementing enterprise-grade architectural patterns—including microservices, ACID transactions, and structural multi-tenancy—it provides a secure, scalable, and intelligent platform. The integration of predictive machine learning directly into the operational workflow allows businesses to transition from reactive management to proactive, data-driven optimization.
