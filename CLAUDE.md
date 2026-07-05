# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## SellWise
AI Sales Analytics & Inventory SaaS for small online sellers in Bangladesh. Phase 1 (current): React+Vite+TS, Express+TS, FastAPI+Python, Postgres, Redis. Phase 2 (planned): React, ASP.NET Core 9+C#, FastAPI. Monorepo: `@sellwise/shared`, `@sellwise/client`, `@sellwise/server`, `@sellwise/ml-service`.

## Commands
- Start dev: `.start-dev.ps1`
- Install: `npm install`
- Build shared: `npm run build --workspace=@sellwise/shared` (CRITICAL: MUST run after shared edits)
- Typecheck/Lint: `npm run typecheck`, `npm run lint`
- DB Migrations: `npm run migrate:up --workspace=@sellwise/server`
- Test Backend: `npm run test --workspace=@sellwise/server`
- Start ML: `cd packages/ml-service && uv venv --allow-existing && uv pip install -r requirements.txt && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000`

## Architecture & Rules
- **Layered Arch**: Route/Controller → Service → Repository → DB. No DB in controllers; no HTTP in repos.
- **Middleware**: helmet → cors → json → cookieParser → requestId → requestLogger → rateLimiter → authenticate → requireStoreMembership → requireRole → validate → Controller.
- **Auth**: JWT HTTP-only cookie. `authenticate` sets `req.user`, checks Redis blacklist. Logout revokes token.
- **API Envelope**: `{ success: true, data: {}, error: null, meta: {...} }`. Use `ApiResponse.success()`. Routes are `/api/v1/stores/:storeId/<resource>`.
- **Database**:
  - Postgres `numeric` returned as strings. Wrap in `Number()` for math/formatting (e.g. `Number(val).toLocaleString()`, `reduce((a,b) => a + Number(b))`).
  - Always filter by `store_id`. Use UUIDs. Soft delete products (`is_active = false`).
  - Order creation MUST be ACID. Lock stock with `SELECT ... FOR UPDATE` (sort by product_id). Snapshot prices in order_items.
  - Batch bulk inserts (avoid N+1).
- **TypeScript**: `verbatimModuleSyntax: true`. MUST use `import type` for interfaces, otherwise Vite dev server crashes.
- **Frontend State**:
  - React Hook Form `useFieldArray`: Use `update()` not `setValue()`. For hidden inputs in arrays, pass `value={watch(...)}`.
  - API limits: Verify Zod max limits (e.g. 1000) in `@sellwise/shared`.
  - `useDebounce` required for API search inputs.
  - Zustand persist: Strip DB JOIN fields via `cleanStore` & `partialize` to fix hydration bugs.
  - Vercel-style Tailwind v4: `bg-foreground`, `text-primary-foreground`, `bg-canvas-soft`, `bg-card`, `border-border`. NEVER use `text-canvas`.
- **Demand Forecasting (ML)**:
  - Tiers: <30 days = EWMA (auto-alpha), >=30 days = Facebook Prophet (business-type seasonality, sparsity-aware regularization).
  - API: `GET /api/v1/stores/:storeId/analytics/demand-forecast`.
  - ML endpoint receives `{ ds: date, y: quantity }`, returns `{ ds, yhat, yhat_lower, yhat_upper }`.
- **RFM & Churn**:
  - Weekly BullMQ worker calculates Recency, Frequency, Monetary (1-5 quintiles).
  - Segments: champion, loyal, potential, new, at_risk, lost.
  - ML churn uses gap-ratio heuristic + logistic regression on pseudo-labels. Returns probability.