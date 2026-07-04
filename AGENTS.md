# AGENTS.md

This file provides coding conventions and guidelines for AI agents working on the SellWise codebase.

## General Principles

- Follow existing patterns and conventions in the codebase
- Never hardcode secrets, keys, or credentials
- Preserve existing comments and docstrings
- Handle errors at the controller/middleware level
- Add pagination to list endpoints
- Log errors with context using Winston

## TypeScript Conventions

### Imports
- Use `import type` for type-only imports (required by `verbatimModuleSyntax: true`)
- Import from `@sellwise/shared` for types, schemas, and constants
- Never import from compiled `dist/` directories in source files

```typescript
// Correct
import type { CreateOrderDTO, Product } from '@sellwise/shared';
import { BUSINESS_TYPES, CATEGORY_PRESETS, detectBusinessType } from '@sellwise/shared';

// Wrong
import { CreateOrderDTO, Product } from '@sellwise/shared';
```

### Shared Package
After modifying any file in `packages/shared/`, rebuild before the client or server can pick up changes:
```bash
npm run build --workspace=@sellwise/shared
```

## Backend (Express) Conventions

### File Structure
Follow the 4-file pattern for each resource:
```
routes/resource.routes.ts     # Route definitions
controllers/resource.controller.ts  # Request handlers
services/resource.service.ts  # Business logic
repositories/resource.repository.ts  # Database queries
```

### Layer Rules
| Layer | Responsibility | MUST NOT |
|-------|---------------|----------|
| **Route / Controller** | HTTP boundary: parse request, call service, format response | Access database. Contain business logic |
| **Service** | Business logic, validation rules, orchestration, transactions | Write SQL. Reference HTTP (`req`/`res`) |
| **Repository** | SQL queries, data mapping | Contain business logic. Reference HTTP |

### Error Handling
Services should throw custom errors, not HTTP errors:
```typescript
import { NotFoundError, ConflictError, ValidationError } from '../errors/AppError';

// In service
throw new NotFoundError('Product not found');
throw new ConflictError('Email already in use');
```

### Response Format
Always use the `ApiResponse` utility:
```typescript
import { ApiResponse } from '../utils/ApiResponse';

// Success
res.status(200).json(ApiResponse.success(data));

// Error (handled by global error handler)
throw new NotFoundError('Not found');
```

### Database
- Always include `store_id` in queries (multi-tenant)
- Use UUIDs for primary keys
- Use `SELECT ... FOR UPDATE` for stock locking
- Batch bulk operations (100 rows per query)
- Products use soft deletes (`is_active = false`)
- **CRITICAL:** PostgreSQL returns numeric/decimal columns as **strings**. Always cast with `Number()` before arithmetic:
  ```typescript
  // WRONG — string concatenation
  const sum = history.reduce((a, h) => a + h.total_qty, 0);

  // CORRECT — numeric addition
  const sum = history.reduce((a, h) => a + Number(h.total_qty), 0);
  ```

### Auth
- Return `{ user, store, role, token }` from auth service (NOT `storeId`)
- Store JWT in HTTP-only secure cookies
- Use `authenticate` middleware for protected routes
- Use `requireRole(['owner', 'manager'])` for role-based access

## Frontend (React) Conventions

### File Structure
Group by feature:
```
features/
  featureName/
    FeaturePage.tsx         # Main page component
    hooks/useFeature.ts     # TanStack Query hooks
    components/             # Feature-specific components
```

### State Management
- **Server state:** TanStack Query (`useQuery`, `useMutation`)
- **Client state:** Zustand stores (`useAuthStore`)
- **Form state:** React Hook Form + Zod validation

### UI Components
- Use shared components from `components/ui/` (Button, Card, Badge, etc.)
- Follow Vercel design tokens defined in `index.css`
- Use `bg-foreground` + `text-primary-foreground` for primary CTAs
- **Never use `text-canvas`** — it doesn't exist. Use `text-primary-foreground` instead

### Forms
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProductSchema, type CreateProductDTO } from '@sellwise/shared';

const { register, handleSubmit, formState: { errors } } = useForm<CreateProductDTO>({
  resolver: zodResolver(createProductSchema) as any,
  defaultValues: { ... },
});
```

### API Calls
```typescript
import api from '../../lib/api/client';

// GET
const { data } = await api.get(`/stores/${storeId}/products`);

// POST
const { data } = await api.post(`/stores/${storeId}/orders`, orderData);

// PATCH
const { data } = await api.patch(`/stores/${storeId}/orders/${id}/status`, { status });
```

## ML Service (Python) Conventions

### File Structure
```
app/
  main.py                  # FastAPI app setup
  routers/                 # API endpoints
  services/                # Business logic (Prophet, churn)
  models/schemas.py        # Pydantic request/response schemas
```

### Data Format
Backend sends `{ ds: date, y: quantity }`. ML service returns `{ ds, yhat, yhat_lower, yhat_upper }`.

### Churn Prediction
Backend sends `{ store_id, customers: [{ customer_id, recency_days, frequency_count, monetary_value, avg_gap_between_orders }] }`. ML service returns `{ store_id, predictions: [{ customer_id, churn_probability }] }`.

### Business-Type Awareness
Always accept `business_type` in forecast requests and configure seasonality accordingly.

## Database Migrations

### Creating Migrations
```bash
npm run migrate:create --workspace=@sellwise/server -- --name migration-name
```

### Naming Convention
Use descriptive names: `add-business-type-to-stores`, `create-categories`

### Migration File
```typescript
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Forward migration
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // Rollback migration
}
```

## Testing

### Backend (Jest)
```bash
npm run test --workspace=@sellwise/server
npm run test --workspace=@sellwise/server -- -t "test name"
```

### ML Service (Pytest)
```bash
cd packages/ml-service && uv run pytest
```

## Code Quality

### Before Committing
1. Run typecheck: `npm run typecheck`
2. Run lint: `npm run lint`
3. Build shared package: `npm run build --workspace=@sellwise/shared`
4. Build client: `npm run build --workspace=@sellwise/client`

### Lint Warnings
- `react(only-export-components)` warnings are expected for component files that also export utilities
- These are safe to ignore
