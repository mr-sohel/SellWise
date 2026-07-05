# AGENTS.md

SellWise: AI Sales Analytics & Inventory SaaS for small sellers in Bangladesh. Monorepo (`npm workspaces`).

## Packages

| Package | Path | Stack | Dev command |
|---------|------|-------|-------------|
| `@sellwise/shared` | `packages/shared/` | TS, Zod | `npm run build --workspace=@sellwise/shared` |
| `@sellwise/client` | `packages/client/` | React 19, Vite, Tailwind v4 | `npm run dev:client` |
| `@sellwise/server` | `packages/server/` | Express 5, PostgreSQL, Redis, BullMQ | `npm run dev:server` |
| `@sellwise/ml-service` | `packages/ml-service/` | Python, FastAPI, Prophet, scikit-learn | `uv run uvicorn app.main:app --port 8000 --reload` |

Backend runs on port **5005** (not 5000). ML on 8000. Frontend on 5173.

## Critical Gotchas

1. **`verbatimModuleSyntax: true`** (client + shared tsconfig). Always use `import type` for type-only imports — missing it crashes the Vite dev server.
2. **Rebuild shared after edits**: `npm run build --workspace=@sellwise/shared`. Client and server won't see changes until you do.
3. **PostgreSQL returns numeric/decimal columns as strings**. Wrap in `Number()` before any arithmetic — `reduce((a, b) => a + Number(b.val), 0)`, not `+ b.val`.
4. **`text-canvas` does not exist** in the Tailwind theme. Use `text-primary-foreground` for primary CTAs.
5. **`useFieldArray` in React Hook Form**: use `update()` not `setValue()`. For hidden inputs in arrays, pass `value={watch(...)}`.
6. **Zustand persist hydration**: strip DB JOIN fields via `cleanStore` + `partialize` to avoid hydration bugs.
7. **`useDebounce` required** for any API search input — never fire raw keystrokes to the backend.

## Backend Architecture

Layered: `Route/Controller → Service → Repository → DB`. No DB access in controllers; no HTTP references in repos.

**4-file pattern per resource**:
```
routes/resource.routes.ts
controllers/resource.controller.ts
services/resource.service.ts
repositories/resource.repository.ts
```

**Error handling**: throw custom errors from `src/errors/AppError.ts` (`NotFoundError`, `ConflictError`, `ValidationError`, `ForbiddenError`, `UnauthorizedError`). Never throw raw HTTP errors.

**Response envelope**: use `ApiResponse.success(data)` from `src/utils/ApiResponse.ts`.

**Middleware chain** (per request):
```
helmet → cors → express.json → cookieParser → requestId → requestLogger → rateLimiter
→ [auth: authLimiter] → [protected: authenticate → requireStoreMembership]
→ [optional: requireRole] → [optional: validate(schema)] → Controller
```

**Auth**: JWT in HTTP-only secure cookies. `authenticate` verifies JWT, checks Redis blacklist (2s timeout, fails open). Logout revokes via `revokeToken()`.

**Multi-tenancy**: always include `store_id` in queries. `requireStoreMembership` validates `store_members` table, sets `req.storeRole`. `requireRole(['owner', 'manager'])` reads from `req.storeRole` (no extra DB call).

**Database rules**:
- UUIDs for PKs, `SELECT ... FOR UPDATE` for stock locking, batch bulk ops (100 rows)
- Products: soft delete (`is_active = false`)
- Order creation MUST be ACID — lock stock, snapshot prices in `order_items`
- `UserRepository.update()` uses column allowlist (`ALLOWED_COLUMNS`)

**Logging**: Winston from `src/utils/logger.ts` — never `console.log`/`console.error`.

## Frontend Architecture

**State**: TanStack Query (server state), Zustand (client state), React Hook Form + Zod (forms).

**API calls**: `import api from '../../lib/api/client'` — base URL is `http://localhost:5005/api/v1`.

**Tailwind v4 tokens** (Vercel-style): `bg-foreground`, `text-primary-foreground`, `bg-canvas-soft`, `bg-card`, `border-border`. Defined in `src/index.css`.

**Forms**: `zodResolver(schema) as any` cast required with React Hook Form.

## ML Service

**Forecasting tiers**: <30 days → EWMA (auto-alpha), ≥30 days → Prophet (business-type seasonality, sparsity-aware). Falls back to EWMA on failure.

**Data contract**: Backend sends `{ ds, y }`, ML returns `{ ds, yhat, yhat_lower, yhat_upper }`.

**Churn**: gap-ratio heuristic + logistic regression ensemble. Backend sends RFM features, ML returns `{ customer_id, churn_probability }`.

**Business type**: always accept `business_type` in forecast requests — configures seasonality.

## Commands

```bash
# Full dev startup (Docker + build shared + migrate + ML + server + client)
.\start-dev.ps1

# Individual
npm run dev:server          # Express on :5005
npm run dev:client          # Vite on :5173
cd packages/ml-service && uv run uvicorn app.main:app --port 8000 --reload

# Build & verify
npm run build --workspace=@sellwise/shared   # MUST run after shared edits
npm run typecheck           # all workspaces
npm run lint                # all workspaces (oxlint for client)

# Tests
npm run test --workspace=@sellwise/server              # Jest
npm run test --workspace=@sellwise/server -- -t "name" # single test
cd packages/ml-service && uv run pytest                # Pytest

# DB
npm run migrate:up --workspace=@sellwise/server
npm run migrate:create --workspace=@sellwise/server -- --name migration-name
npm run seed --workspace=@sellwise/server
npm run seed:forecasts --workspace=@sellwise/server

# ML service setup
cd packages/ml-service && uv venv --allow-existing && uv pip install -r requirements.txt
```

## Pre-Commit Checklist

1. `npm run typecheck`
2. `npm run lint`
3. `npm run build --workspace=@sellwise/shared`
4. `npm run build --workspace=@sellwise/client`

`react(only-export-components)` lint warnings are expected for component files that also export utilities — safe to ignore.
