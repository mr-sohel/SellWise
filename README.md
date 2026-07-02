# SellWise 🚀

**SellWise** is an AI-Powered Sales Analytics & Inventory Management SaaS designed specifically for small online businesses and sellers in Bangladesh. It replaces manual Excel workflows by helping sellers track orders, manage inventory, forecast demand using Machine Learning, and understand customer behavior.

## 🎯 Key Features

- **Order & Inventory Management:** Track stock levels in real-time with transaction-safe deductions to prevent overselling.
- **Smart Forecasting:** Built-in ML service using Facebook Prophet to predict future demand based on historical sales data.
- **Customer Intelligence:** Automatically calculates RFM (Recency, Frequency, Monetary) scores and churn probability.
- **Bilingual Interface:** Full support for both English (en) and Bangla (bn), including local number formatting and currency (BDT ৳).
- **Multi-Tenant SaaS:** Built from the ground up for multiple stores with role-based access control (RBAC).

## 🏗️ Architecture

This repository contains the **Phase 1 (Node.js/TS)** implementation of the platform, structured as an `npm` monorepo.

### Tech Stack
* **Frontend:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Zustand, TanStack Query.
* **Backend:** Node.js, Express 5, TypeScript, PostgreSQL 16, Redis 7, BullMQ (for background jobs).
* **ML Service:** Python, FastAPI, Facebook Prophet, scikit-learn.
* **Infrastructure:** Docker Compose (local dev), raw SQL with `node-pg-migrate`.

## 📂 Project Structure

```text
sellwise/
├── packages/
│   ├── shared/       # Shared TypeScript types, Zod schemas, and constants
│   ├── client/       # React frontend application
│   ├── server/       # Express.js backend API
│   └── ml-service/   # Python FastAPI ML microservice
└── docker-compose.yml # PostgreSQL and Redis setup (Coming Soon)
```

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+)
- [Docker & Docker Compose](https://www.docker.com/) (for DB and Redis)
- [Python 3.10+](https://www.python.org/) (for ML service)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/SellWise.git
   cd SellWise
   ```

2. **Install Node dependencies**
   ```bash
   npm install
   ```

3. **Start local infrastructure (Database & Cache)**
   *(Docker setup instructions coming soon)*

4. **Run the development servers**
   ```bash
   # Start the React frontend
   npm run dev:client

   # Start the Express backend
   npm run dev:server
   ```

## 📄 License
*Proprietary / All Rights Reserved* - See LICENSE file for details.
