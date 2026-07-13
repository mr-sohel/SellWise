# SellWise

**SellWise** is an AI-Powered Sales Analytics & Inventory Management SaaS designed specifically for small online businesses and sellers in Bangladesh. It helps sellers track orders, manage inventory, forecast demand using Machine Learning, and understand customer behavior — effectively replacing manual Excel workflows.

This repository contains the **Phase 1 (SDP)** implementation of the platform, structured as an enterprise-grade `npm` workspaces monorepo.

---

## 🎯 The Problem & Our Solution

Small online business owners often struggle with manual inventory tracking, estimating future product demand, and understanding customer behavior. **SellWise** aims to fill the gap left by expensive ERPs or overly simplistic spreadsheet methods by offering:

- **Proactive Inventory Alerts:** Stops products from going out of stock without warning.
- **Demand Forecasting:** Uses Machine Learning to estimate what will sell in the next 7, 14, and 30 days so capital isn't tied up in unsold stock.
- **Customer Intelligence:** Identifies valuable buyers and customers at risk of churning through RFM (Recency, Frequency, Monetary) analysis.
- **All-in-One Dashboard:** Combines sales analytics, inventory management, and customer relations in a single, non-technical interface.

---

## 🏗️ Architecture & Tech Stack

SellWise is built with an **Enterprise SaaS architecture**, ensuring scalability, strict separation of concerns, and type safety across the board.

### The Stack
* **Frontend (`@sellwise/client`)**: React 19, Vite, TypeScript, Tailwind CSS v4, Zustand, TanStack Query, i18next (English & Bangla).
* **Backend (`@sellwise/server`)**: Node.js, Express 5, TypeScript, PostgreSQL 16, Redis 7, BullMQ (background jobs), JWT (HTTP-only secure cookies).
* **ML Service (`@sellwise/ml-service`)**: Python 3.11, FastAPI, Facebook Prophet (Demand Forecasting), Scikit-learn (Churn Prediction).
* **Infrastructure**: Docker Compose, `node-pg-migrate` for versioned database schema control.

### Key Architectural Patterns
* **Clean Architecture Backend:** Strict separation of concerns utilizing a `Routes → Controllers → Services → Repositories` layer pattern.
* **Standardized API Envelopes:** Every endpoint returns a predictable `{ success, data, error, meta }` format to the frontend.
* **Shared Schemas:** `Zod` validation schemas are shared between the frontend and backend in a `@sellwise/shared` workspace, ensuring a single source of truth.
* **Asynchronous Workers:** Heavy operations (Demand Forecasting, Inventory Alerts, RFM Analysis) are decoupled from the main API and processed reliably in the background using **BullMQ** and **Redis**.

---

## 🏢 Business Type System

SellWise adapts to different business types through a **category-focused onboarding wizard**. During signup, users select what they sell (product categories), and the system auto-detects the business type and pre-seeds relevant categories.

### Category Presets (Onboarding)

| Preset | Default Categories |
|--------|-------------------|
| 📱 **Gadgets & Electronics** | Mobile Phones, Phone Accessories, Computers & Laptops, Audio & Speakers, Cameras |
| 👕 **Clothing & Fashion** | Men's Clothing, Women's Clothing, Shoes, Bags & Accessories, Traditional Wear |
| 💄 **Beauty & Personal Care** | Skincare, Makeup, Haircare, Fragrances, Personal Care |
| 🏠 **Home & Kitchen** | Kitchenware, Furniture, Home Decor, Bedding, Lighting |
| 🛒 **Grocery & Super Shop** | Rice & Grains, Oil & Spices, Snacks & Beverages, Dairy & Eggs, Cleaning Supplies |
| ⚽ **Sports & Outdoors** | Fitness Equipment, Sportswear, Outdoor Gear, Cycling, Cricket |
| 📚 **Books & Stationery** | Books, Pens & Pencils, Office Supplies, Art Supplies, Bags & Pouches |
| 💊 **Health & Medicine** | Vitamins & Supplements, First Aid, Personal Hygiene, Medical Devices, Baby Care |
| 🚗 **Auto & Accessories** | Car Parts, Bike Accessories, Car Electronics, Car Care, Helmets |
| 🏪 **General Store** | Mixed Items, Seasonal Products, Gift Items, Toys, Pet Supplies |

### Business Type Auto-Detection

- **Grocery selected** → `small_shop` (weekly rush, monsoon dips)
- **Any other selection** → `online_store` (yearly seasonality, weekly patterns)

Sales channels (Facebook, WhatsApp, Walk-in, Website) can be configured later in Settings.

---

## 🛠️ Prerequisites

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

Set up your environment variables:
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

### 3. Start All Services

Run the single startup script to launch all three services (Frontend, Backend, ML):

**Windows:**
```powershell
.\start-dev.ps1
```

**macOS/Linux:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

This starts:
- **Frontend** → `http://localhost:5173`
- **Backend API** → `http://localhost:5005` *(Note: Running on port 5005)*
- **ML Service** → `http://localhost:8000`

### Alternative: Start Services Individually

```bash
# Frontend (React)
npm run dev:client

# Backend (Express)
npm run dev:server

# ML Service (Python)
cd packages/ml-service
uv venv --allow-existing
uv pip install -r requirements.txt
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🌱 Seed Data (Bangladeshi Electronics)

The seed script creates realistic demo data for a Bangladeshi gadget shop:

| Resource | Count | Details |
|----------|-------|---------|
| Products | 51 | Across 5 categories (Mobile Phones, Phone Accessories, Computers & Laptops, Audio & Speakers, Cameras) |
| Customers | 40 | Bangladeshi names with realistic phone/address data |
| Orders | 800 | Spread over 12 months with seasonal patterns |
| Expenses | 192 | Across 6 expense categories |

Run the seed script:
```bash
npm run seed --workspace=@sellwise/server
```

Generate demand forecasts (requires seed data):
```bash
npm run seed:forecasts --workspace=@sellwise/server
```

---

## 🔑 Test Credentials & Usage

Since this is a private repository and isolated local database environment, **there are no pre-seeded credentials**.

To test the application:
1. Navigate to **`http://localhost:5173/signup`**.
2. Create a new account (e.g., `admin@sellwise.com` / `password123`).
3. Complete the onboarding wizard (select product categories you sell).
4. You will be redirected to the dashboard with pre-configured categories.
5. *Note: As the first user, you act as the Store Owner.*

*Alternatively, run the seed script to get 51 products, 40 customers, and 800 orders of realistic demo data.*

---

## 🧪 Running Automated Tests

We use **Jest** for backend integration tests and **Pytest** for the ML service unit tests.

### Backend Tests
Ensure your Docker containers (PostgreSQL & Redis) are running, then execute:
```bash
npm run test --workspace=@sellwise/server
```

### ML Service Tests
Navigate to the ML service directory and run Pytest:
```bash
cd packages/ml-service
uv run pytest
```

---

## 📂 Project Structure

```text
sellwise/
├── packages/
│   ├── shared/              # Shared TS types, Zod schemas, constants
│   ├── client/              # React frontend application
│   │   ├── src/
│   │   │   ├── features/    # Domain-driven features (onboarding, products, orders, etc.)
│   │   │   ├── components/  # Shared UI components
│   │   │   └── stores/      # Zustand state management
│   ├── server/              # Express.js backend API + BullMQ workers
│   │   ├── migrations/      # Database migrations (node-pg-migrate)
│   │   └── src/
│   │       ├── routes/      # API routes definitions
│   │       ├── controllers/ # HTTP request/response handlers
│   │       ├── services/    # Core business logic & orchestration
│   │       ├── repositories/# Database interaction & raw SQL queries
│   │       └── jobs/        # BullMQ background workers (Forecast, Alerts, RFM)
│   └── ml-service/          # Python FastAPI ML microservice
│       ├── app/
│       │   ├── routers/     # API endpoints
│       │   ├── services/    # Prophet forecasting, Churn prediction algorithms
│       │   └── models/      # Pydantic validation schemas
│       └── requirements.txt
├── docker-compose.yml       # Local Infra (PostgreSQL + Redis)
├── start-dev.ps1            # Windows all-in-one startup script
├── start-dev.sh             # macOS/Linux all-in-one startup script
└── README.md
```

---

## 🛡️ Security Features

SellWise implements defense-in-depth security for local development:

| Layer | Implementation |
|-------|---------------|
| **Password Policy** | Minimum 8 chars, uppercase, lowercase, number (Zod enforced) |
| **JWT Auth** | 96-char hex secret, 7-day expiry, HTTP-only secure cookies with `sameSite: 'lax'` |
| **Token Revocation** | Logout revokes JWT server-side via Redis blacklist |
| **Multi-Tenancy** | `requireStoreMembership` middleware validates user has role in `store_members` for each request |
| **SQL Injection** | Repository column allowlists prevent malicious column names |
| **Rate Limiting** | Global 2000 req/15min; auth endpoints 10 req/15min (login/signup) |
| **Request Validation** | Zod schemas validate all inputs; UUID validation on route params |
| **Security Headers** | Helmet with HSTS, CSP, and standard protections |

---

## 📜 License
*Proprietary / All Rights Reserved* - Designed for University SDP Evaluation.
