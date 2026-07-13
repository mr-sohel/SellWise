# Project Report: SellWise
**AI-Powered Sales Analytics & Inventory SaaS for Small Sellers**

## 1. Executive Summary
SellWise is a modern Software-as-a-Service (SaaS) platform designed to empower small and medium-scale retailers in Bangladesh. Many small shop owners rely on manual ledgers or basic spreadsheets to track inventory, leading to lost sales, overstocking, and a lack of insight into customer behavior. SellWise digitizes this process while introducing advanced Artificial Intelligence (AI) to predict future demand and identify customers at risk of churning.

## 2. Introduction & Objectives
The primary objective of SellWise is to provide a highly scalable, secure, and user-friendly platform that handles day-to-day point-of-sale operations alongside enterprise-grade analytics. 

**Key Objectives:**
- Centralize inventory management and order processing.
- Provide intelligent insights using Machine Learning to prevent stockouts and overstocking.
- Identify at-risk customers (Churn) to enable targeted retention marketing.
- Ensure strict data isolation (multi-tenancy) and secure role-based access for shop owners and managers.

## 3. Technical Architecture
The system is built as a **Monorepo** (using `npm workspaces`) and follows a Microservices-inspired architecture.

- **Frontend (Client):** Developed using React 19, Vite, and Tailwind CSS v4. State management is handled by Zustand (client state) and TanStack Query (server state/caching).
- **Backend (Server):** Developed using Node.js and Express 5. It strictly follows a Layered Architecture: `Route -> Controller -> Service -> Repository`.
- **Database:** PostgreSQL for robust, ACID-compliant relational data. Redis for caching, rate limiting, and job queues.
- **Machine Learning (ML Service):** A standalone Python API powered by FastAPI, Prophet, and Scikit-Learn.

## 4. Core Modules & Workflows
- **Authentication & Authorization:** Uses highly secure `HTTP-Only` JSON Web Tokens (JWT) and middleware chains to verify store membership and roles (`owner`, `manager`).
- **Validation:** End-to-end type safety using `Zod`. The exact same schema validates data instantly on the frontend and strictly on the backend.
- **Product Management:** Allows bulk imports and single additions. Validates critical constraints (e.g., selling price > cost price).
- **Order Processing (ACID Transactions):** The most complex module. Creating an order triggers a database transaction (`BEGIN...COMMIT`). It uses `SELECT ... FOR UPDATE` to lock product rows, preventing race conditions where multiple cashiers might sell the same physical item simultaneously.

## 5. Machine Learning Algorithms
SellWise provides cutting-edge AI capabilities via its standalone ML service:

1. **Demand Forecasting:**
   - **Prophet:** Developed by Meta, this algorithm is used for products with ≥30 days of sales history. It intelligently models weekly and monthly seasonalities to predict exactly how many units will sell in the next 30 days.
   - **EWMA (Exponentially Weighted Moving Average):** Used as a fallback for new products (<30 days history). It gives mathematical weight to recent sales to estimate short-term demand.

2. **Customer Churn Prediction:**
   - **Gap Ratio Heuristic:** Calculates the average days a customer waits between purchases. If a customer exceeds their normal waiting period significantly, their churn probability increases.
   - **Logistic Regression (RFM):** Uses Recency, Frequency, and Monetary data to train a machine learning classifier that predicts the exact probability of a customer leaving the store.

## 6. Conclusion
SellWise bridges the gap between basic inventory tools and complex, expensive enterprise ERPs. By combining a blazing-fast user interface, a highly secure Node.js backend, and advanced Python-based AI algorithms, SellWise successfully equips small sellers with the technological power needed to maximize their profits and retain their customers.
