# SellWise — Project Context for AI Assistants

> **Read this file first before writing any code for this project.**

## What is SellWise?

SellWise is an **AI-Powered Sales Analytics & Inventory Management SaaS** for small online businesses. It helps sellers track orders, manage inventory, forecast demand (using ML), and understand customer behavior — replacing manual Excel workflows.

**Target market:** Small online sellers in Bangladesh (with Bangla language support).

---

## Project Phases — TWO CODEBASES

This project has two distinct phases. **Always ask which phase you're working on** if it's not clear from context.

### Phase 1: SDP (University Submission) — Node.js + TypeScript

- **Status:** Active development
- **Stack:** React + Vite + TypeScript (frontend), Express + TypeScript (backend), FastAPI + Python (ML), PostgreSQL, Redis
- **Team:** 5 members (M1-M5), but Sohel (project owner) is the primary developer
- **Deadline:** Summer 2026 semester
- **Monorepo:** pnpm workspaces with `packages/shared`, `packages/client`, `packages/server`, `packages/ml-service`
- **Reference:** See `implementation_plan.md` for full architecture, API endpoints, database schema, and weekly roadmap

### Phase 2: Commercial Product — ASP.NET Core + C#

- **Status:** Planned (post-SDP)
- **Stack:** React + Vite + TypeScript (frontend — REUSED), ASP.NET Core 9 Web API + C# (backend — REBUILT), FastAPI + Python (ML — REUSED), PostgreSQL, Redis
- **Developer:** Sohel (solo)
- **Key tools:** Entity Framework Core, FluentValidation, Hangfire, Serilog, Swagger/NSwag
- **Reference:** See `aspnet_core_strategy.md` (in artifacts) for architecture mapping and project structure

### What Changes Between Phases

| Component | Phase 1 (SDP) | Phase 2 (Commercial) |
|-----------|--------------|---------------------|
| Backend framework | Express 5 + TypeScript | **ASP.NET Core 9 + C#** |
| ORM / DB access | `pg` (raw SQL) | **Entity Framework Core** |
| Validation | Zod (shared package) | **FluentValidation** |
| Background jobs | BullMQ | **Hangfire** |
| Auth | Custom JWT middleware | **ASP.NET Identity + JWT Bearer** |
| Logging | Winston | **Serilog** |
| API docs | None | **Swagger (Swashbuckle)** |
| DI | Manual / none | **Built-in ASP.NET DI** |
| Frontend | React + Vite + TS | **Same (reused)** |
| ML service | FastAPI + Python | **Same (reused)** |
| Database | PostgreSQL 16 | **Same** |
| Cache | Redis 7 | **Same** |

---

## Architecture — Clean Architecture (Both Phases)

Both phases follow the **same architecture**. The patterns are identical; only the language/framework changes.

```
Request → Route/Controller → Service → Repository → Database
```

### Layer Rules (STRICT)

| Layer | Responsibility | MUST NOT |
|-------|---------------|----------|
| **Route / Controller** | HTTP boundary: parse request, call service, format response | Access database. Contain business logic |
| **Service** | Business logic, validation rules, orchestration, transactions | Write SQL. Reference `req`/`res` or `HttpContext` |
| **Repository** | SQL queries / EF Core queries, data mapping | Contain business logic. Reference HTTP |

### Naming Conventions

**Phase 1 (Node.js):**
```
routes/product.routes.ts
controllers/product.controller.ts
services/product.service.ts
repositories/product.repository.ts
```

**Phase 2 (ASP.NET Core):**
```
Controllers/ProductController.cs
Services/ProductService.cs       (implements IProductService)
Repositories/ProductRepository.cs (implements IProductRepository)
```

---

## API Standards — Both Phases

### Response Envelope (ALWAYS use this format)

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": { "page": 1, "limit": 20, "totalCount": 142, "totalPages": 8 }
}
```

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [{ "field": "name", "message": "Required" }]
  }
}
```

### Error Codes

| Code | HTTP Status | When |
|------|------------|------|
| `VALIDATION_ERROR` | 422 | Request body/query fails validation |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `CONFLICT` | 409 | Duplicate SKU, insufficient stock, invalid status transition |
| `FORBIDDEN` | 403 | User doesn't have the required role |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT token |
| `INTERNAL_ERROR` | 500 | Unhandled exception (never leak stack traces in production) |

### URL Pattern

All endpoints follow: `/api/v1/stores/:storeId/<resource>`

Examples:
- `GET /api/v1/stores/:storeId/products`
- `POST /api/v1/stores/:storeId/orders`
- `GET /api/v1/stores/:storeId/analytics/overview?range=30d`

---

## Database Schema — 11 Tables

The schema is **identical in both phases**. Key tables:

| Table | Purpose |
|-------|---------|
| `users` | Accounts (email, password_hash, preferred_lang) |
| `stores` | Business entities (multi-tenant via store_id FK) |
| `store_members` | RBAC: user ↔ store with role (owner / manager) |
| `products` | Catalog with soft deletes (is_active flag) |
| `customers` | Auto-updated profiles (total_orders, total_spent) |
| `orders` | Order headers with status lifecycle |
| `order_items` | Line items with **snapshotted** price/name at order time |
| `expenses` | Manual cost tracking by category |
| `forecasts` | ML output: predicted quantities with confidence bounds |
| `inventory_alerts` | Auto-generated: low stock, dead stock, reorder |
| `customer_rfm` | Weekly ML output: RFM scores, segments, churn probability |

### Critical Business Rules

1. **Order creation is a transaction:** upsert customer → create order → snapshot items → deduct stock → update customer stats. ALL or NOTHING.
2. **Stock uses `SELECT ... FOR UPDATE`** (row-level locking) to prevent overselling.
3. **Cancelled/returned orders restore stock** via transaction.
4. **Order status transitions** follow a state machine — not all transitions are valid.
5. **Products use soft deletes** (`is_active = false`) — never hard delete products referenced by orders.
6. **Order items snapshot** the product name and price at time of order — they don't FK to current product values.

---

## ML Service (Python — Both Phases)

The ML service is a **separate FastAPI microservice** that the backend calls via HTTP.

### Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/forecast` | POST | Prophet forecasting for a product |
| `/churn` | POST | Logistic regression churn prediction |

### Forecasting Strategy (Dual-Tier)

- **Tier 1 (< 30 days history):** Simple Moving Average (SMA) — calculated in the backend, no ML service call
- **Tier 2 (≥ 30 days history):** Facebook Prophet with Bangladesh holidays — calls ML service

---

## Internationalization

- **Languages:** English (en) and Bangla (বাংলা / bn)
- **Framework:** i18next + react-i18next
- **Bangla numerals:** Custom formatter (০১২৩৪৫৬৭৮৯)
- **Font:** Noto Sans Bengali for Bangla text
- **Currency:** BDT (৳) with Bangla formatting

---

## When Generating Code

### Phase 1 (Node.js) Rules

1. **Always use TypeScript** — no `.js` files in `packages/server` or `packages/client`
2. **Import from `@sellwise/shared`** for types, schemas, and constants
3. **Use Zod schemas** for all validation — define in `packages/shared`, import in both client and server
4. **Follow the 4-file pattern** for new features: route → controller → service → repository
5. **Use `ApiResponse.success()` and `ApiResponse.error()`** for all responses
6. **Throw custom errors** (`NotFoundError`, `ConflictError`, etc.) — never return raw error JSON from services
7. **Use TanStack Query hooks** for data fetching — don't use raw `useEffect` + `fetch`
8. **Use Zustand** for client-only state (auth, active store) — don't use React Context for global state

### Phase 2 (ASP.NET Core) Rules

1. **Follow Clean Architecture** with 4 projects: `SellWise.Api`, `SellWise.Application`, `SellWise.Domain`, `SellWise.Infrastructure`
2. **Use interfaces for all services and repositories** — `IProductService`, `IProductRepository`
3. **Register everything in DI** via `Program.cs` — never use `new Service()` directly
4. **Use EF Core** for data access — avoid raw SQL unless performance requires it
5. **Use FluentValidation** for request validation — one validator class per request DTO
6. **Use Hangfire** for background jobs — configure with PostgreSQL storage
7. **Use Serilog** with structured logging — include correlationId, userId, storeId in log context
8. **Use `[Authorize]` and `[Authorize(Roles = "Owner")]`** attributes — don't write custom auth middleware
9. **Generate frontend types via NSwag** from the OpenAPI spec — don't manually maintain TypeScript interfaces
10. **Use async/await everywhere** — all DB and HTTP calls must be async

### General Rules (Both Phases)

1. **Never hardcode secrets** — use environment variables / `appsettings.json`
2. **Always use UUIDs** for primary keys — not auto-increment integers
3. **Always include `store_id`** in queries — this is a multi-tenant system
4. **Preserve existing comments and docstrings** when editing code
5. **Use meaningful variable names** — no single-letter variables except loop counters
6. **Handle errors at the controller/middleware level** — services throw, controllers catch (via global handler)
7. **Write pagination** for all list endpoints — never return unbounded results
8. **Cache analytics/dashboard queries** in Redis with 5-minute TTL
9. **Log all errors with context** — requestId, userId, storeId, operation name

---

## Key Files to Read

| File | What It Contains |
|------|-----------------|
| `implementation_plan.md` | Complete SDP architecture, database schema, API endpoints, sequence diagrams, weekly roadmap |
| `SDP_4_Proposal_Revised.md` | Project proposal with problem statement, features, feasibility study |
| `.agents/AGENTS.md` | Workspace coding rules and conventions |
