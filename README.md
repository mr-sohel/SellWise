# SellWise 🚀

**SellWise** is an AI-Powered Sales Analytics & Inventory Management SaaS designed specifically for small online businesses and sellers in Bangladesh. It helps sellers track orders, manage inventory, forecast demand using Machine Learning, and understand customer behavior — effectively replacing manual Excel workflows.

This repository contains the **Phase 1 (SDP)** implementation of the platform, structured as an enterprise-grade `npm` workspaces monorepo.

---

## 🏗️ Tech Stack & Architecture

* **Frontend (`@sellwise/client`)**: React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui, Zustand, TanStack Query, i18next (English & Bangla).
* **Backend (`@sellwise/server`)**: Node.js, Express 5, TypeScript, PostgreSQL 16, Redis 7, BullMQ (background jobs), JWT (HTTP-only secure cookies).
* **ML Service (`@sellwise/ml-service`)**: Python 3.11, FastAPI, Facebook Prophet (Demand Forecasting), Scikit-learn (Churn Prediction).
* **Infrastructure**: Docker Compose, `node-pg-migrate` for versioned database schema control.

---

## ⚙️ Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js** (v20+)
- **Python** (v3.11+)
- **Docker** and **Docker Compose**

---

## 🚀 Quick Start Guide

### 1. Installation & Environment Setup

Clone the repository and install all Node.js workspace dependencies:

```bash
npm install
```

Set up your environment variables by copying the example file (ensure this is done in both the root and `packages/server` if required, though the root `.env` will serve as the master):
```bash
cp .env.example .env
```

### 2. Start Infrastructure & Run Migrations

Start the local PostgreSQL and Redis instances using Docker:
```bash
docker-compose up -d postgres redis
```

Once the database is running, apply the database migrations to build the schema:
```bash
npm run migrate:up --workspace=@sellwise/server
```

### 3. Run the ML Service (Python)

Open a new terminal, navigate to the ML service, install dependencies, and start the FastAPI server:
```bash
cd packages/ml-service
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*(The ML API will run at `http://localhost:8000`)*

### 4. Run the Backend (Express API)

Open a new terminal and start the Node.js server. This will also automatically initialize the BullMQ background workers:
```bash
npm run dev:server
```
*(The Backend API will run at `http://localhost:5000`)*

### 5. Run the Frontend (React SPA)

Open a final terminal and start the Vite development server:
```bash
npm run dev:client
```
*(The Frontend UI will be accessible at `http://localhost:5173`)*

---

## 🔑 Test Credentials & Usage

Since this is a private repository and isolated local database environment, **there are no pre-seeded credentials**. 

To test the application:
1. Navigate to **`http://localhost:5173/signup`**.
2. Create a new account (e.g., `admin@sellwise.com` / `password123`).
3. You will be automatically authenticated via HTTP-only secure cookies and redirected to the application.
4. *Note: As the first user, you act as the Store Owner. You can navigate the UI to create products, log expenses, and generate orders.*

---

## 🧪 Running Automated Tests

We use **Jest** for backend integration tests and **Pytest** for the ML service unit tests.

### Backend Tests
Ensure your Docker containers (PostgreSQL & Redis) are running, then execute:
```bash
npm run test --workspace=@sellwise/server
```
*This will run integration tests for Auth, Orders, and Products, verifying the ACID transactions and database locking.*

### ML Service Tests
Navigate to the ML service directory and run Pytest:
```bash
cd packages/ml-service
python -m pytest
```
*This validates the mock Prophet forecasting and Logistic Regression churn models.*

---

## 📂 Project Structure

```text
sellwise/
├── packages/
│   ├── shared/         # 📦 Shared TS types, Zod schemas, constants
│   ├── client/         # 🖥️ React frontend application
│   ├── server/         # ⚙️ Express.js backend API + BullMQ workers
│   └── ml-service/     # 🐍 Python FastAPI ML microservice
├── docker-compose.yml  # Local Infra (PostgreSQL + Redis)
├── docker-compose.prod.yml # Production Deployment Configuration
└── README.md
```

## 📜 License
*Proprietary / All Rights Reserved* - Designed for University SDP Evaluation.