# Bangladesh University of Business and Technology
## Department of Computer Science and Engineering
### CSE 400: Software Development IV

# FINAL PROJECT REPORT

**Semester:** Summer 2026
**Title:** SellWise — An AI-Powered Sales Analytics and Inventory Management System for Small Online Businesses
**Submission Date:** 16th July, 2026

**TEAM MEMBERS**
- 22235103083 — Md. Sohel Rana (51/03)
- 22235103215 — Md. Labu Miah (51/03)
- 22235103133 — Faysal Islam Fahad (51/03)
- 22235103203 — Naushin Sultana Mim (51/03)
- 22235103125 — Mst. Milhan Jannat Jerin (51/03)

**SUPERVISOR’S SIGNATURE WITH DATE**
________________________________
Humayra Ahmed
Assistant Professor
Department of CSE, BUBT

---

## 1. Abstract

Small online business owners, particularly Facebook and WhatsApp sellers in Bangladesh, heavily rely on manual tools such as spreadsheets to track inventory and sales. This manual tracking often leads to unpredicted stockouts, tied-up capital in slow-moving goods, and an inability to understand customer purchasing behaviors. **SellWise** was developed as a complete Enterprise SaaS solution to automate and elevate these workflows. By combining modern web architecture (React, Node.js, PostgreSQL) with Machine Learning models (Facebook Prophet, Scikit-learn), SellWise offers proactive inventory alerts, automated demand forecasting, and customer churn prediction within a single, highly intuitive dashboard. 

## 2. Introduction

### 2.1 Problem Statement
Small business owners lack access to predictive and automated tools. Existing solutions are either too simplistic (basic charts without predictive insights) or too expensive (Enterprise ERPs). The core problems addressed by SellWise are:
- Products going out of stock without prior warning.
- Over-purchasing products that have low demand, locking up working capital.
- A lack of analytical insight into customer behavior (e.g., failing to identify high-value or churning customers).

### 2.2 Project Objectives
- Develop an all-in-one web-based dashboard for managing orders, products, and inventory.
- Implement an automated ML pipeline to forecast future demand for 7, 14, and 30-day windows.
- Automatically categorize customers based on RFM (Recency, Frequency, Monetary) scores.
- Build a robust, scalable backend architecture capable of handling heavy concurrent background jobs securely.

---

## 3. System Architecture & Methodology

SellWise was developed using an **Enterprise SaaS architecture** approach, prioritizing type safety, modularity, and clean separation of concerns.

### 3.1 Tech Stack
- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4, Zustand, TanStack Query.
- **Backend API:** Node.js, Express 5, TypeScript, PostgreSQL 16, Redis 7.
- **Machine Learning Service:** Python 3.11, FastAPI, Prophet, Scikit-learn.
- **Infrastructure:** Docker Compose, Monorepo (`npm workspaces`), `node-pg-migrate`.

### 3.2 Architectural Patterns
The application implements strict **Clean Architecture** on the backend:
1. **Routes:** Defines HTTP endpoints and attaches middleware (Auth, Rate Limiting).
2. **Controllers:** Parses requests, calls business services, and returns a standardized API envelope (`{ success, data, error, meta }`).
3. **Services:** Handles core business logic, validations, and orchestrations.
4. **Repositories:** Manages raw SQL queries and data mapping (DB rows to TS objects).

**Shared Schema Validation:** Both frontend and backend share `Zod` validation schemas through a dedicated `@sellwise/shared` workspace, ensuring a strict Single Source of Truth for data validation.

### 3.3 Asynchronous Workers (BullMQ)
To prevent blocking the main Node.js event loop, heavy computational tasks are offloaded to background workers using **BullMQ** and **Redis**:
- **Forecast Worker:** Periodically communicates with the Python ML service to generate demand forecasts.
- **Alert Worker:** Scans inventory against predicted demand to trigger low-stock alerts.
- **RFM Worker:** Analyzes customer purchase history weekly to recalculate churn probabilities and segments.

---

## 4. Features Implemented

### 4.1 Intelligent Onboarding & Category System
The system automatically detects the type of business (e.g., Grocery vs. Online Electronics) based on the categories a user selects during onboarding. This configures the ML models to look for specific seasonal patterns (e.g., Friday grocery rushes vs. yearly holiday spikes).

### 4.2 Quick Order Entry
Designed specifically for high-volume Facebook/WhatsApp sellers, the application features a search-as-you-type product picker and customer phone lookup, drastically reducing the time needed to input manual orders.

### 4.3 Dual-Layer Demand Forecasting
The forecasting system intelligently switches algorithms based on data availability:
- **Tier 1 (Heuristics):** Uses Simple Moving Average (SMA) for new products with less than 30 days of data.
- **Tier 2 (Machine Learning):** Uses Facebook Prophet algorithm to predict future sales for products with sufficient historical data.

### 4.4 Customer Intelligence (RFM)
The system segments customers into actionable groups (Champions, Loyal, At Risk, Lost) using Recency, Frequency, and Monetary scores, and predicts the probability of a customer churning using a Logistic Regression ensemble model.

---

## 5. Security & Scalability Features

- **Authentication:** Stateless JWTs stored in HTTP-only, secure cookies with server-side revocation tracking via a Redis blacklist.
- **Multi-Tenancy Isolation:** Every database table strictly enforces `store_id` isolation, ensuring sellers can never access another business's data.
- **Rate Limiting:** Distributed rate limiting across login and core API endpoints using Redis.
- **Database Migrations:** All database changes are handled programmatically through `node-pg-migrate` to ensure the schema remains version-controlled and reproducible across environments.

---

## 6. Conclusion

The **SellWise** project successfully bridges the gap between raw data and actionable business intelligence for small online sellers. By migrating away from error-prone spreadsheets to an automated, ML-driven ecosystem, sellers can optimize their inventory levels, retain valuable customers, and ultimately increase their profitability. The strict adherence to enterprise software patterns ensures the platform is highly scalable, maintainable, and ready for production deployment.

## 7. Future Scope

While Phase 1 (SDP) successfully delivers the core functionality, future enhancements include:
- Integration with local SMS gateways (e.g., SSL Wireless) to send automated order confirmations to customers.
- Native mobile application development using React Native for sellers to manage inventory on the go.
- Real-time webhook integrations with popular e-commerce platforms like Shopify and WooCommerce.
