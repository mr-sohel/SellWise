# SellWise: AI Sales Analytics & Inventory SaaS

SellWise is a modern Software-as-a-Service (SaaS) application designed specifically for small sellers. It helps business owners manage their inventory, track sales, and use Artificial Intelligence to predict future demand and identify customers who might stop buying from them (churn).

The project is structured as a **Monorepo** using `npm workspaces`, which means all the different parts of the application live in a single repository but are separated into logical packages.

---

## 1. Project Architecture (The Big Picture)

The system is divided into four main packages:
1. **`@sellwise/shared`:** Contains TypeScript types, Zod validation schemas, and constants shared between the frontend and backend.
2. **`@sellwise/client`:** The frontend web application built with React.
3. **`@sellwise/server`:** The backend API built with Node.js and Express.
4. **`@sellwise/ml-service`:** A standalone Python API for running Machine Learning algorithms.

All packages work together to deliver a seamless user experience. The frontend talks to the backend via REST API, and the backend delegates heavy predictive tasks to the ML service.

---

## 2. Backend Core Logic & Coding Pattern

**Tech Stack:** Node.js, Express 5, PostgreSQL (Database), Redis (Caching & Job Queues), BullMQ.

The backend strictly follows a **Layered Architecture**. This is crucial for keeping the code clean, testable, and scalable. For every resource (e.g., Orders, Products, Customers), there are four files:

1. **Routes (`routes/*.routes.ts`):** 
   - *What it does:* Defines the API endpoints (e.g., `GET /orders`, `POST /orders`).
   - *Core logic:* Runs middlewares like authentication (`authenticate`), checks permissions (`requireRole`), validates incoming data using Zod (`validate(schema)`), and then passes the request to the controller.

2. **Controllers (`controllers/*.controller.ts`):** 
   - *What it does:* Handles the HTTP Request and Response.
   - *Core logic:* Extracts data from `req.body` or `req.params`, calls the Service layer to do the actual work, and then formats the successful response using a standard `ApiResponse.success(data)` envelope. **No database queries are ever written here.**

3. **Services (`services/*.service.ts`):** 
   - *What it does:* The "Brain" of the backend. Contains all the business logic.
   - *Core logic:* This is where complex workflows happen. For example, in `order.service.ts` when creating an order, it locks the product row (`SELECT ... FOR UPDATE`), checks stock, deducts stock, creates the order header, creates order items, and updates the customer's total spent—all within an ACID transaction (`BEGIN` ... `COMMIT`). If anything fails, it rolls back.

4. **Repositories (`repositories/*.repository.ts`):** 
   - *What it does:* The only place where Database (SQL) queries exist.
   - *Core logic:* Methods like `findById`, `create`, or `update` are defined here. It never knows about HTTP requests, making it purely focused on PostgreSQL operations.

**Multi-tenancy & Auth:** Every store's data is isolated. A `store_id` is required in almost every query to ensure a user can never see another shop's data. Authentication uses secure HTTP-only cookies with JWTs.

---

## 3. Deep Dive: Key Workflows (Add Product & Create Order)

### Add Product Workflow
When a user adds a new product, it follows a strict flow to ensure data integrity:
1. **Frontend (Client):** The user fills out the Add Product form. `React Hook Form` handles the state, and `Zod` instantly validates rules (e.g., selling price must be greater than cost price, stock cannot be negative).
2. **API Call:** When submitted, `TanStack Query`'s `useMutation` sends a `POST` request to `/api/v1/stores/:storeId/products`.
3. **Backend Middleware:** The router catches the request. `authenticate` verifies the JWT cookie. `requireStoreMembership` ensures the user belongs to the store. `validate` runs the Zod schema again on the server side to prevent malicious API requests.
4. **Service & Database:** The `product.service.ts` receives the data. It calls `product.repository.ts` to execute an `INSERT` SQL query. If successful, the new product is saved.
5. **UI Update:** The frontend receives a success response. `TanStack Query` automatically invalidates the `['products']` cache, causing the product list to instantly refresh and show the newly added product!

### Create Order Workflow (ACID Transaction)
Creating an order is the most complex workflow because it must perfectly balance inventory and money. 
1. **Frontend:** The POS (Point of Sale) style form allows adding multiple products. It debounces customer phone number searches to prevent spamming the backend API. When submitted, the frontend calculates totals based on delivery charges and discounts.
2. **Backend Transaction Initiation:** In `order.service.ts`, we start a database transaction using `client.query('BEGIN')`. This ensures that if any part fails, nothing is saved (preventing half-created orders).
3. **Customer Resolution:** The system checks if the customer exists by phone number. If yes, it links the order. If no, it creates a new customer record on the fly (`upsertByPhone`).
4. **Stock Locking & Validation:** For every item in the order, the database executes a `SELECT ... FOR UPDATE` query. This puts a "lock" on the product row, preventing two cashiers from selling the exact same final item at the exact same millisecond. It verifies enough stock exists.
5. **Deduction & Creation:** The service deducts the stock, creates the main Order Header, and then creates Order Items (saving a snapshot of the price so if prices change later, old orders aren't affected).
6. **Commit:** Finally, it updates the customer's total spent stats and runs `client.query('COMMIT')` to permanently save everything.

---

## 4. Security: Authentication & Validation

Security is a massive priority in this application. It uses a robust, two-layered security model:

### A. Authentication & Authorization (JWT + Cookies)
The system does not use easily-stolen `localStorage` for authentication tokens. 
- **HTTP-Only Cookies:** When a user logs in, the server generates a JSON Web Token (JWT) and sends it back inside an `httpOnly`, `secure`, and `sameSite` cookie. This means malicious JavaScript (XSS attacks) cannot steal the token.
- **Middleware Chain:** Every protected API route runs through a strict middleware chain:
  1. `authenticate`: Verifies the JWT signature and ensures the token hasn't been blacklisted in Redis (for instantaneous logouts).
  2. `requireStoreMembership`: Verifies in the database that the authenticated user actually belongs to the `store_id` they are trying to access. This prevents "Tenant Isolation" breaches (User A viewing Shop B's data).
  3. `requireRole`: Optional middleware that restricts sensitive actions (like deleting products) to only users with the `owner` or `manager` role.

### B. Validation (Zod Everywhere)
To prevent bad data from crashing the server or corrupting the database, the app uses **Zod** for end-to-end type-safe validation.
- **Single Source of Truth:** The validation schemas are defined once in the `@sellwise/shared` package.
- **Frontend Validation:** When a user fills a form, `React Hook Form` uses the shared Zod schema. If they enter a negative quantity, the form shows an error and refuses to submit, saving an unnecessary API call.
- **Backend Validation:** Even if an attacker bypasses the frontend and sends a raw HTTP request, the backend router runs `validate(schema)` using the exact same Zod schema. If the data doesn't match the rules, the server immediately rejects the request with a `400 Bad Request` before it ever reaches the controller or database.

---

## 5. How the Machine Learning (ML) Works

**Tech Stack:** Python, FastAPI, Prophet, Scikit-Learn.

The ML service runs independently on port 8000. The backend communicates with it to fetch analytics. It focuses on two massive AI features:

### A. Demand Forecasting (Predicting Future Sales)
The ML service predicts how many units of a product will sell in the next 30 days.
- **How it works:** It uses two different mathematical models depending on the data.
- **Prophet Algorithm:** If a product has a long history (≥ 30 days of sales), it uses Meta's Prophet model. Prophet is highly advanced and automatically learns weekly/monthly seasonalities (e.g., higher sales on weekends or during holidays).
- **EWMA (Exponentially Weighted Moving Average):** If a product is new (< 30 days of history), Prophet wouldn't have enough data. The system intelligently falls back to EWMA, which gives more weight to recent sales to predict immediate future demand.

### B. Customer Churn Prediction (Who is leaving?)
This algorithm predicts the probability (0% to 100%) that a customer will stop buying from the store.
- **How it works:** It uses an Ensemble Model (combining two logic systems).
- **Primary Heuristic (Gap Ratio):** It calculates the average days a customer usually waits between purchases. If they normally buy every 10 days, but it has been 25 days, the gap ratio is 2.5. The higher the ratio, the higher the churn probability.
- **Secondary Machine Learning (Logistic Regression):** If the store has enough data, it trains a Logistic Regression model using RFM data: **R**ecency (days since last order), **F**requency (total orders), and **M**onetary (total spent). It scales these features and predicts churn behavior based on historical lost customers.

---

## 6. Frontend Architecture & Everything Else

**Tech Stack:** React 19, Vite, Tailwind CSS v4, TanStack Query, Zustand, React Hook Form, Zod.

The frontend is designed to be blazing fast and highly modern, utilizing a Vercel-style aesthetic with CSS variables (e.g., `bg-background`, `text-primary-foreground`) defined in `index.css`.

### Core Tools & How They Are Used:
1. **TanStack Query (Server State):** 
   - *Usage:* Used for all data fetching (e.g., `useOrders`, `useProducts`). It caches API responses, automatically handles loading states, and refetches data when needed. This is why the app feels so fast—if you revisit a page, the data is already cached.
2. **Zustand (Client State):** 
   - *Usage:* Used for global state that doesn't come from the database. For example, `useAuthStore` keeps track of the currently logged-in user, their role, and the active store. It uses local storage persistence so you stay logged in after refreshing.
3. **React Hook Form & Zod:** 
   - *Usage:* Used for all forms (like the Create Order page). Zod defines the strict rules (e.g., "Quantity must be > 0"). React Hook Form binds these rules to the inputs, ensuring no bad data is ever sent to the backend. It does this without re-rendering the whole page on every keystroke, keeping performance high.

### File Structure:
- `src/features/*`: The codebase is organized by feature rather than type. All code related to Orders (components, API hooks, pages) lives inside `src/features/orders/`. This makes the code highly modular and easy to navigate.
- `src/components/ui/*`: Reusable, generic UI components like Buttons, Badges, and Dropdowns.

By strictly following these patterns, SellWise remains highly scalable, secure, and ready to handle large amounts of data for thousands of businesses!
