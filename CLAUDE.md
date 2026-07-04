# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is SellWise?

SellWise is an **AI-Powered Sales Analytics & Inventory Management SaaS** for small online businesses. It helps sellers track orders, manage inventory, forecast demand (using ML), and understand customer behavior.

**Target market:** Small online sellers in Bangladesh (with bilingual English/Bangla language support).

**Business types supported:** Auto-detected from category selection during onboarding (Facebook Seller, Small Shop, Online Store, Wholesaler).

## Project Phases

This project has two distinct phases. **Always ask which phase you're working on** if it's not clear from context.

### Phase 1: SDP (University Submission) — Node.js + TypeScript
- **Status:** Active development
- **Stack:** React + Vite + TypeScript (frontend), Express + TypeScript (backend), FastAPI + Python (ML), PostgreSQL, Redis
- **Monorepo:** npm workspaces with `@sellwise/shared`, `@sellwise/client`, `@sellwise/server`, `@sellwise/ml-service`

### Phase 2: Commercial Product — ASP.NET Core + C#
- **Status:** Planned (post-SDP)
- **Stack:** React + Vite + TypeScript (frontend — REUSED), ASP.NET Core 9 Web API + C# (backend — REBUILT), FastAPI + Python (ML — REUSED)

*(Note: The instructions below mostly apply to Phase 1, but the general architectural layers are identical across both phases).*

---

## Commonly Used Commands

**Installation:**
```bash
npm install
```

**Development Servers:**
```bash
# Start all services using the custom script (Recommended)
.\start-dev.ps1

# Start the React frontend individually
npm run dev:client

# Start the Express backend individually
npm run dev:server

# Start the Python ML Service individually
cd packages/ml-service
uv venv --allow-existing
uv pip install -r requirements.txt
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Quality Checks:**
```bash
# Run typechecking across all workspaces
npm run typecheck

# Run linting across all workspaces
npm run lint

# Build all packages
npm run build --workspace=@sellwise/shared
npm run build --workspace=@sellwise/client
npm run build --workspace=@sellwise/server
```

**Migrations:**
```bash
# Apply all pending migrations
npm run migrate:up --workspace=@sellwise/server

# Rollback last migration
npm run migrate:down --workspace=@sellwise/server
```

**Testing:**
```bash
# Run all backend tests
npm run test --workspace=@sellwise/server

# Run a single backend test file or suite
npm run test --workspace=@sellwise/server -- -t "Order Creation Flow"
npm run test --workspace=@sellwise/server -- src/tests/orders.test.ts

# Run ML tests
cd packages/ml-service && uv run pytest
```

---

## High-Level Code Architecture and Structure

Both phases follow a **Clean Architecture** approach. The patterns are identical; only the language/framework changes.

```
Request → Route/Controller → Service → Repository → Database
```

### 1. Monorepo Structure (npm workspaces)

- **`packages/shared`**: Single source of truth for TypeScript types, Zod schemas, and constants. Imported by both frontend and backend. **Must rebuild after changes:** `npm run build --workspace=@sellwise/shared`
- **`packages/client`**: React 19 SPA. Uses TanStack Query for server state, Zustand for client state, React Hook Form + Zod for validation, and Tailwind CSS v4 + custom UI components. Grouped by feature (`features/products`, `features/orders`, `features/onboarding`, `features/categories`).
- **`packages/server`**: Express 5 backend. Uses `pg` for raw SQL, `node-pg-migrate` for migrations, BullMQ for background jobs (using Redis), and Winston for structured logging. Custom JWTs stored in HTTP-only secure cookies with Redis-based token revocation.
- **`packages/ml-service`**: Python microservice running FastAPI and Facebook Prophet for demand forecasting. Supports business-type-aware seasonality tuning. Communicates with the backend via HTTP.

### 2. Strict Layer Rules

| Layer | Responsibility | MUST NOT |
|-------|---------------|----------|
| **Route / Controller** | HTTP boundary: parse request, call service, format response | Access database. Contain business logic |
| **Service** | Business logic, validation rules, orchestration, transactions | Write SQL. Reference HTTP (`req`/`res`) |
| **Repository** | SQL queries, data mapping | Contain business logic. Reference HTTP |

### 2B. Middleware Chain (Security)

Every protected request passes through this middleware chain:

```
helmet → cors → express.json → cookieParser → requestId → requestLogger → rateLimiter
→ authenticate → requireStoreMembership → [optional: requireRole] → [optional: validate(schema)] → Controller
```

- **`authenticate`**: Verifies JWT from cookie, checks Redis blacklist (2s timeout, fails open), sets `req.user`
- **`requireStoreMembership`**: Validates UUID format, checks `store_members` table, sets `req.storeRole`
- **`requireRole(['owner', 'manager'])`**: Reads from `req.storeRole` (no extra DB query)
- **`authLimiter`**: Applied only to `/login` and `/signup` (10 req/15min)
- **Logout**: Revokes JWT server-side via Redis blacklist before clearing cookie

### 3. API Standards

All endpoints follow the multi-tenant pattern: `/api/v1/stores/:storeId/<resource>`.

**Response Envelope (ALWAYS use this format):**
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": { "page": 1, "limit": 20, "totalCount": 142, "totalPages": 8 }
}
```
In Express, use `ApiResponse.success()` and `ApiResponse.error()` to format responses consistently. Services should throw custom errors (`NotFoundError`, `ConflictError`, `ValidationError`), which are caught by the global error handler middleware.

### 4. Category Presets & Onboarding

The store model has `business_type` (auto-detected) and `sales_channels` fields:

```typescript
// packages/shared/src/constants/business.ts
export const BUSINESS_TYPES = ['facebook_seller', 'small_shop', 'online_store', 'wholesaler'] as const;
export const SALES_CHANNELS = ['facebook', 'whatsapp', 'walk_in', 'website', 'other'] as const;

// Category presets for onboarding
export const CATEGORY_PRESETS: CategoryPreset[] = [
  { id: 'gadgets', icon: '📱', label: { en: 'Gadgets & Electronics', bn: '...' }, categories: [...] },
  { id: 'clothing', icon: '👕', label: { en: 'Clothing & Fashion', bn: '...' }, categories: [...] },
  { id: 'beauty', icon: '💄', label: { en: 'Beauty & Personal Care', bn: '...' }, categories: [...] },
  // ... 10 presets total
];

// Auto-detect business_type from selected presets
export function detectBusinessType(presetIds: CategoryPresetId[]): BusinessType {
  if (presetIds.includes('grocery')) return 'small_shop';
  return 'online_store';
}
```

**Onboarding flow:** After signup, users are redirected to `/onboarding` — a single page where they select product categories they sell. The system auto-detects `business_type` and pre-seeds categories. The `MainLayout` guard checks `store.business_type` — if null, redirects to onboarding.

**Auth service return shape:** `authService.signup()` and `authService.login()` return `{ user, store, role, token }` — the `store` is a full Store object (not just `storeId`). JWTs include `jti` claim for revocation. Logout calls `revokeToken(jti)` to blacklist the token in Redis.

### 5B. Demand Forecasting

**Demand Forecast API:** `GET /api/v1/stores/:storeId/analytics/demand-forecast?limit=5&days=30`
- Returns top N products by order frequency (90-day window) with their forecasts
- `limit` (default 5): number of top products to return
- `days` (default 30): forecast horizon (7, 15, or 30)
- Response: `{ top_products: [{ product_id, product_name, total_orders, total_units_sold, avg_daily_units, category, forecast: [{ date, predicted_qty, lower_bound, upper_bound }] }] }`

**Forecasting Tiers:**
- **Tier 1 (EWMA):** < 30 days history. Exponential Weighted Moving Average with 14-day window and auto-selected alpha (0.2-0.5) based on coefficient of variation. Uncertainty intervals widen with forecast horizon.
- **Tier 2 (Prophet):** >= 30 days. Facebook Prophet with business-type-aware seasonality. Auto-selects regularization strength based on data sparsity (changepoint_prior 0.01-0.05). Falls back to EWMA on ML service failure (30s timeout).

**Forecast Accuracy Tracking:** MAPE (Mean Absolute Percentage Error) calculated automatically when comparing past forecasts (3+ days old) against actual sales.

**Forecast Generation Script:**
```bash
npm run seed:forecasts --workspace=@sellwise/server  # Generate forecasts for seeded store
```
- Runs `forecastService.generateForecasts()` for the first store
- Uses EWMA fallback (ML Prophet service not running by default)

### 5. Category System

Categories are stored in a `categories` table with `store_id`, `name`, `name_bn`, `is_default`, `sort_order`.

- Default categories are seeded from category presets during onboarding
- Products use `category` (varchar) — NOT a foreign key to categories table
- The `CategoryPicker` component provides dropdown + free-text entry
- Categories are unique per store (`uq_categories_store_name` constraint)
- Customer list supports filtering by RFM segment (champion, loyal, potential, new, at_risk, lost)

### 6. Database Critical Rules

- **Multi-Tenant:** Always include `store_id` in queries. Repository `delete()` accepts optional `storeId`.
- **SQL Injection Prevention:** `UserRepository.update()` uses `ALLOWED_COLUMNS` allowlist.
- **Transactions & Locking:** Order creation must be an ACID transaction. **Stock uses `SELECT ... FOR UPDATE`** to prevent overselling. Items must be alphanumerically sorted by `product_id` before locking to prevent deadlocks.
- **Snapshots:** `order_items` snapshot the product name, unit price, and cost price at the time of the order. They do not reference current product values.
- **Soft Deletes:** Products use soft deletes (`is_active = false`). Never hard delete a product.
- **Primary Keys:** Always use UUIDs, never auto-increment integers.
- **UUID Validation:** Route params validated with UUID format check in `requestId` middleware.
- **Webhook Security:** Use an `api_keys` table (linked to `store_id`) to securely manage and rotate credentials for webhook ingestion.
- **Migrations:** DB schemas are managed using `node-pg-migrate` inside `packages/server/migrations`.

### 7. ML Service — Business-Type-Aware Forecasting

The Prophet service accepts `business_type` and configures seasonality accordingly:

```python
# packages/ml-service/app/services/prophet_service.py
SEASONALITY_CONFIGS = {
    'facebook_seller': { 'yearly_seasonality': True, ..., 'custom_seasonalities': [{'name': 'ecommerce_sale_season', 'period': 365.25, 'fourier_order': 5}] },
    'small_shop': { 'yearly_seasonality': True, ... },       # Weekly + monsoon
    'online_store': { 'yearly_seasonality': True, ... },     # Yearly patterns
    'wholesaler': { 'yearly_seasonality': True, ... },       # Bulk patterns
}
```

**Sparsity-aware regularization:** Prophet automatically adjusts `changepoint_prior_scale` (0.01-0.05) and `seasonality_prior_scale` (3-10) based on data density (ratio of zero-sales days). Sparse data gets stronger regularization to prevent overfitting.

**Churn prediction:** Uses an ensemble of gap-ratio heuristic + logistic regression. LR trains on multi-signal pseudo-labels (gap_ratio + recency/frequency quartiles + monetary percentile) to reduce tautological bias. Returns weighted average with 20-50% LR weight.

**Data format:** Backend sends `{ ds: date, y: quantity }` to ML service. ML service returns `{ ds, yhat, yhat_lower, yhat_upper }`.

**CRITICAL: PostgreSQL numeric returns strings.** When reading numeric/decimal columns from PostgreSQL (e.g., `SUM()`, `COUNT()`, `predicted_qty`), values arrive as strings. Always cast with `Number()` before arithmetic:
```typescript
// WRONG — string concatenation: "3+3+3" → "333"
const sma = history.reduce((sum, h) => sum + h.total_qty, 0);

// CORRECT — numeric addition: 3+3+3 → 9
const sma = history.reduce((sum, h) => sum + Number(h.total_qty), 0);
```

**Forecast tiers:**
- `< 7 days` history: No forecast
- `7-29 days`: Exponential Weighted Moving Average (EWMA) — 14-day window, alpha auto-selected by data variance
- `>= 30 days`: Prophet with business-type seasonality and sparsity-aware regularization

### 8. Background Jobs (BullMQ)

Scheduled tasks (e.g., daily Prophet forecasting, alert generation, weekly RFM calculations) are orchestrated via BullMQ and Redis. Jobs are durable, retryable, and run in a separate worker process to avoid blocking the main API.

### 9. RFM Segmentation & Churn Prediction

The RFM worker (`packages/server/src/jobs/rfm.worker.ts`) runs weekly (Sunday 4 AM) and:
1. Calculates R (recency), F (frequency), M (monetary) scores for each customer
2. Assigns segments based on scores
3. Calls the ML churn endpoint to get churn probabilities
4. Upserts results into `customer_rfm` table

**RFM Segment Constants** (`packages/shared/src/constants/rfm-segments.ts`):
```typescript
export const RFM_SEGMENTS = ['champion', 'loyal', 'potential', 'new', 'at_risk', 'lost'] as const;
export const RFM_SEGMENT_LABELS: Record<RfmSegment, string> = { ... };
export const RFM_SEGMENT_COLORS: Record<RfmSegment, 'violet' | 'info' | ...> = { ... };
```

**Segment Assignment Rules** (order matters — more specific conditions first):
1. `champion`: r≥4, f≥4, m≥4
2. `loyal`: r≥4, f≥4
3. `new`: r≥4, f≤2, m≤2
4. `potential`: r≥3, f≥3, m≥3
5. `lost`: r≤2, f≤2 (must be checked **before** `at_risk`)
6. `at_risk`: r≤3, f∈[1,3], m≤3
7. `potential`: fallback

**Churn ML Schema** (`packages/ml-service/app/models/schemas.py`):
```python
class CustomerDataPoint(BaseModel):
    customer_id: str
    recency_days: int        # Days since last order
    frequency_count: int     # Total order count
    monetary_value: float    # Total amount spent
    avg_gap_between_orders: float  # Average days between orders
```

**ML Churn Endpoint:** `POST /churn` returns `{ store_id, predictions: [{ customer_id, churn_probability }] }`

### 10. API Client Configuration

The frontend API client (`packages/client/src/lib/api/client.ts`) uses `import.meta.env.VITE_API_URL` for the base URL, falling back to `http://localhost:5000/api/v1`. Always use the env variable approach — never hardcode the URL.

### 11. Frontend Translation Keys

If `useTranslation` / `i18next` is removed from a component, ensure all `t()` calls in that component are also replaced with hardcoded strings. Orphaned `t()` calls cause `ReferenceError: t is not defined` at runtime.

### 12. Database Batch Bulk Operations

When writing loops that execute individual SQL statements (e.g., upserts in background workers), batch them into multi-row queries to avoid N+1 performance issues. Use a batch size of ~100 rows per query.

### 13. Zustand Persist — Clean Store & Partialize

The auth store uses Zustand persist with `cleanStore()` to strip DB extra fields (`role` from JOIN, `created_at`, `updated_at`) before serializing to localStorage. Use `partialize` to explicitly whitelist persisted fields:

```typescript
// packages/client/src/stores/auth.store.ts
cleanStore: (state) => {
  const clean = { ...state };
  delete clean.role;
  delete clean.created_at;
  delete clean.updated_at;
  return clean;
}

persist: {
  name: 'sellwise-auth',
  partialize: (state) => ({
    user: state.user,
    store: state.store,
    activeStoreId: state.activeStoreId,
    role: state.role,
    isAuthenticated: state.isAuthenticated,
  }),
}
```

**Bug fix:** `store` was null while `activeStoreId` was set. Root cause: extra DB fields from JOIN queries (`role`, `created_at`, `updated_at`) corrupted Zustand hydration. Fix: `cleanStore()` + `partialize`. Users may need to clear `sellwise-auth` localStorage key.

---

## When Generating Code

- **TypeScript Imports:** The project uses `verbatimModuleSyntax: true` in `tsconfig.json`. You **MUST** use `import type` when importing types or interfaces (e.g., `import type { CreateMemberDTO } from '@sellwise/shared'`). Failing to do so will cause the Vite dev server to crash the frontend React app to a white screen.
- **Phase 1:** Use TypeScript, import from `@sellwise/shared`, follow the 4-file pattern (routes, controller, service, repo), throw custom errors from services, and use Zod for validation.
- **Phase 2 (When active):** Follow C# Clean Architecture, use EF Core, FluentValidation, Hangfire, Serilog, and DI.
- **General:** Do not hardcode secrets, preserve existing comments/docstrings, handle errors at the controller/middleware level, add pagination to list endpoints, and log errors with context.

---

## Shared Package Rebuild

After modifying any file in `packages/shared/`, you **MUST** rebuild it before the client or server can pick up changes:

```bash
npm run build --workspace=@sellwise/shared
```

The client imports from the compiled `dist/` directory, not the source files.

---

## Frontend Color System

The frontend uses Tailwind CSS v4 with Vercel-style design tokens defined in `packages/client/src/index.css`:

- `bg-foreground` + `text-primary-foreground` — Dark button with white text (primary CTA)
- `bg-canvas-soft` — Light background (#fafafa)
- `bg-card` — White card background
- `border-border` — Hairline borders (#ebebeb)
- `text-body` — Gray body text (#4d4d4d)
- `text-muted-foreground` — Light gray for secondary text

**Do NOT use `text-canvas`** — it is not a valid Tailwind class. Use `text-primary-foreground` instead.
