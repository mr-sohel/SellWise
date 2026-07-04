# SellWise

**SellWise** is an AI-Powered Sales Analytics & Inventory Management SaaS designed specifically for small online businesses and sellers in Bangladesh. It helps sellers track orders, manage inventory, forecast demand using Machine Learning, and understand customer behavior — effectively replacing manual Excel workflows.

This repository contains the **Phase 1 (SDP)** implementation of the platform, structured as an enterprise-grade `npm` workspaces monorepo.

---

## Tech Stack & Architecture

* **Frontend (`@sellwise/client`)**: React 19, Vite, TypeScript, Tailwind CSS v4, Zustand, TanStack Query, i18next (English & Bangla).
* **Backend (`@sellwise/server`)**: Node.js, Express 5, TypeScript, PostgreSQL 16, Redis 7, BullMQ (background jobs), JWT (HTTP-only secure cookies).
* **ML Service (`@sellwise/ml-service`)**: Python 3.11, FastAPI, Facebook Prophet (Demand Forecasting with business-type-aware seasonality), Scikit-learn (Churn Prediction with ensemble heuristic + LR).
* **Infrastructure**: Docker Compose, `node-pg-migrate` for versioned database schema control.

---

## Business Type System

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

## Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js** (v20+)
- **Python** (v3.11+)
- **Docker** and **Docker Compose**

---

## Quick Start Guide

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
```bash
.\start-dev.ps1
```

This starts:
- **Frontend** → `http://localhost:5173`
- **Backend** → `http://localhost:5000`
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

## Seed Data (Bangladeshi Electronics)

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

## Test Credentials & Usage

Since this is a private repository and isolated local database environment, **there are no pre-seeded credentials**.

To test the application:
1. Navigate to **`http://localhost:5173/signup`**.
2. Create a new account (e.g., `admin@sellwise.com` / `password123`).
3. Complete the onboarding wizard (select product categories you sell).
4. You will be redirected to the dashboard with pre-configured categories.
5. *Note: As the first user, you act as the Store Owner.*

*Alternatively, run the seed script to get 51 products, 40 customers, and 800 orders of realistic demo data.*

---

## Running Automated Tests

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
python -m pytest
```

---

## Project Structure

```text
sellwise/
├── packages/
│   ├── shared/              # Shared TS types, Zod schemas, constants (business types, categories)
│   ├── client/              # React frontend application
│   │   ├── src/
│   │   │   ├── features/
│   │   │   │   ├── onboarding/    # Business type wizard
│   │   │   │   ├── categories/    # Category picker component
│   │   │   │   ├── products/      # Product management
│   │   │   │   ├── orders/        # Order management (search-as-you-type)
│   │   │   │   ├── customers/     # Customer management
│   │   │   │   ├── dashboard/     # Dashboard with analytics
│   │   │   │   ├── expenses/      # Expense tracking
│   │   │   │   ├── alerts/        # Inventory alerts
│   │   │   │   ├── reports/       # Report generation
│   │   │   │   └── settings/      # Store & profile settings
│   │   │   ├── components/ui/     # Shared UI components (Button, Card, Badge, etc.)
│   │   │   └── stores/           # Zustand state management
│   ├── server/              # Express.js backend API + BullMQ workers
│   │   ├── migrations/      # Database migrations (node-pg-migrate)
│   │   └── src/
│   │       ├── routes/      # API routes (auth, stores, products, orders, categories, etc.)
│   │       ├── controllers/ # Request handlers
│   │       ├── services/    # Business logic
│   │       ├── repositories/# Database queries
│   │       └── jobs/        # BullMQ background workers
│   └── ml-service/          # Python FastAPI ML microservice
│       ├── app/
│       │   ├── routers/     # API endpoints (forecast, churn)
│       │   ├── services/    # Prophet forecasting, churn prediction
│       │   └── models/      # Pydantic schemas
│       └── requirements.txt
├── docker-compose.yml       # Local Infra (PostgreSQL + Redis)
└── README.md
```

---

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` — Create account
- `POST /api/v1/auth/login` — Login
- `POST /api/v1/auth/logout` — Logout

### Store Management
- `GET /api/v1/stores` — List user's stores
- `POST /api/v1/stores` — Create store
- `PATCH /api/v1/stores/:storeId/onboarding` — Complete onboarding (accepts `categoryPresetIds`, auto-detects business_type)
- `PATCH /api/v1/stores/:storeId/profile` — Update store profile

### Categories
- `GET /api/v1/stores/:storeId/categories` — List categories
- `POST /api/v1/stores/:storeId/categories` — Create category
- `PATCH /api/v1/stores/:storeId/categories/:categoryId` — Update category
- `DELETE /api/v1/stores/:storeId/categories/:categoryId` — Delete category (non-default only)

### Products
- `GET /api/v1/stores/:storeId/products` — List products (with search, category filter)
- `POST /api/v1/stores/:storeId/products` — Create product
- `PUT /api/v1/stores/:storeId/products/:id` — Update product
- `DELETE /api/v1/stores/:storeId/products/:id` — Soft delete product
- `POST /api/v1/stores/:storeId/products/bulk` — Bulk import

### Orders
- `GET /api/v1/stores/:storeId/orders` — List orders (with search, status filter)
- `POST /api/v1/stores/:storeId/orders` — Create order (with customer upsert)
- `PATCH /api/v1/stores/:storeId/orders/:id/status` — Update order status

### Customers
- `GET /api/v1/stores/:storeId/customers` — List customers (with search, segment filter)
- `POST /api/v1/stores/:storeId/customers` — Create customer
- `PUT /api/v1/stores/:storeId/customers/:id` — Update customer

### Analytics
- `GET /api/v1/stores/:storeId/analytics/dashboard` — Dashboard KPIs
- `GET /api/v1/stores/:storeId/analytics/category-breakdown` — Sales by category
- `GET /api/v1/stores/:storeId/analytics/demand-forecast?limit=5&days=30` — Top products by demand forecast

### Forecasts
- `GET /api/v1/stores/:storeId/products/:productId/forecast` — Get demand forecast for a product

### Webhooks
- `POST /api/v1/webhooks/orders` — External order ingestion (API key auth)

---

## Security Features

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
| **Cookie Security** | `httpOnly`, `secure` (prod), `sameSite: 'lax'`, `path: '/'` |
| **Container Security** | Non-root `appuser` in Docker images; DB/Redis ports bound to `127.0.0.1` |

---

## License
*Proprietary / All Rights Reserved* - Designed for University SDP Evaluation.
