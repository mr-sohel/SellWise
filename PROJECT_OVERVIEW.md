# SellWise: Project Overview

## 1. The Big Picture

**SellWise** is a cloud-based SaaS (Software as a Service) platform that combines inventory management with Artificial Intelligence. It is built for small and medium-sized retail businesses that want to stop guessing and start making smart, data-driven decisions.

Instead of just showing what is currently in stock, SellWise predicts what a store will need in the future — turning a reactive store into a proactive one.

---

## 2. The Problem We Are Solving

Managing inventory is one of the hardest challenges for any retail business. Most small business owners rely on gut feelings or spreadsheets, which leads to two costly problems:

- **Overstocking:** Ordering too much product locks up cash and wastes warehouse space.
- **Understocking (Stockouts):** Running out of popular items means lost sales and frustrated customers.

Beyond inventory, business owners have no easy way to know which customers are loyal, which are about to leave, or whether their revenue is trending up or down — unless they spend hours analyzing data manually.

**SellWise solves all of this** by putting AI-powered analytics, live dashboards, and smart alerts into a single, easy-to-use web application.

---

## 3. Who Is This For?

- **Retail Store Owners** who want an affordable, smart system to replace spreadsheets.
- **Inventory Managers** who need data-backed numbers to decide when and how much to reorder.
- **Multi-Branch Owners** who manage several store locations and want to oversee all branches securely from one account.

---

## 4. Core Features

### AI-Powered Sales Forecasting
The system uses **Meta's Prophet** — a state-of-the-art machine learning algorithm — to analyze up to 90 days of historical sales and predict the next 30 days of demand for each product. The forecasts are rendered as visual sparkline charts on the dashboard, ranked by highest predicted demand.

Results are cached in the database for 24 hours so the dashboard loads instantly. If the AI service ever goes offline, the system automatically falls back to a simple moving average — the app never crashes and the user always sees a forecast.

### Multi-Store Management (Multi-Tenancy)
A single business owner can log in to one account and seamlessly switch between multiple store branches. The database strictly isolates each store's data, so the inventory, orders, and customers of Store A are completely invisible to Store B. This is enforced at the database query level through every part of the application.

### Bulletproof Order Management
When a customer order is placed, the system must do two things at once: record the order and deduct the stock. We use **ACID database transactions** to guarantee this happens safely. If any error occurs mid-process, the entire operation is cancelled and the data is rolled back to its original state — preventing corrupt or incomplete records.

### Smart Customer Insights (RFM Analysis)
The system automatically analyzes every customer's buying behavior using **RFM Analysis** — measuring Recency (how recently they bought), Frequency (how often they buy), and Monetary value (how much they spend). Based on these scores, customers are automatically labeled as **Champion**, **Loyal**, **At Risk**, or **Lost** — giving the store owner an instant view of who needs attention.

### Proactive Dashboard & Alerts
The live dashboard displays key business metrics: total revenue, active orders, top-selling products, and revenue trends over time. The alert system constantly monitors stock levels and automatically warns the owner when a product is running dangerously low — before a stockout happens.

### Soft Delete for Data Integrity
When a product is "deleted," it is never truly removed from the database. Instead, it is marked as inactive (`IsActive = false`). This preserves the historical accuracy of past orders that referenced that product, maintaining a clean and trustworthy data record.

---

## 5. Technical Architecture

SellWise is built on two components that work together:

1. **SellWise.Web** — An ASP.NET Core 10 MVC web application. It handles routing, authentication, business logic, and the UI. Built with Razor Views, Bootstrap 5.3.3, and vanilla JavaScript (no heavy front-end frameworks).

2. **SellWise.ML** — A standalone Python FastAPI microservice running on a separate process. It hosts the Prophet forecasting model and the Logistic Regression churn prediction model. The C# app communicates with it over HTTP.

This separation mirrors how modern companies like Netflix and Uber scale their services — if the ML service is under heavy load, it does not slow down the main website.

---

## 6. Why This Project Matters

### For the Business
SellWise has a direct impact on a company's bottom line:
- **Saves cash** by preventing overstocking.
- **Increases revenue** by ensuring top-selling items are never out of stock.
- **Retains customers** by identifying at-risk buyers before they leave.
- **Saves time** by replacing hours of manual spreadsheet analysis with an automated dashboard.

### For Software Engineering
This project demonstrates a full set of enterprise-level engineering practices:
- **Clean MVC Architecture** with thin controllers, typed ViewModels, and service-layer business logic.
- **Multi-Tenant Data Isolation** enforced consistently at the query level.
- **ACID Transaction Safety** for all critical database operations.
- **Microservice Architecture** for decoupling the AI workload from the web layer.
- **Graceful Degradation** so no single point of failure can crash the application.
- **Dependency Injection** making the codebase modular, testable, and maintainable.
