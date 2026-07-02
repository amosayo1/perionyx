# Perionyx — Coding Standards

**Version 1.0**  
**Last Updated: July 2026**

---

## 1. TypeScript Standards

### 1.1 Strict Mode

TypeScript strict mode is mandatory. The `tsconfig.json` must include:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": false,
    "forceConsistentCasingInFileNames": true
  }
}
```

### 1.2 Prohibited Patterns

- `any` — prohibited except in documented adapter layers (e.g., JSON parsing, external API responses)
- `as` casts — require a comment explaining why TypeScript can't infer the type
- `@ts-ignore` — prohibited. Use `@ts-expect-error` with a reason if absolutely necessary
- `!` non-null assertions — prohibited. Use proper type narrowing or optional chaining
- `require()` — use ES module imports exclusively
- `var` — prohibited. Use `const` by default, `let` only when reassignment is necessary

### 1.3 Return Types

All functions must have explicit return types:

```typescript
// Good
export async function getWalletById(ctx: TenantContext, id: string): Promise<Wallet | null> {
  return prisma.wallet.findFirst({ where: { id, companyId: ctx.companyId } });
}

// Bad
export async function getWalletById(ctx: TenantContext, id: string) {
  return prisma.wallet.findFirst({ where: { id, companyId: ctx.companyId } });
}
```

### 1.4 Generic Constraints

Use descriptive type parameter names:

```typescript
// Good
export async function createRecord<T extends RecordCreateInput>(input: T): Promise<Record> { ... }

// Bad
export async function createRecord<T>(input: T): Promise<Record> { ... }
```

---

## 2. File Organization

### 2.1 Module Structure

Every feature follows this convention:

```
src/modules/<feature>/
├── index.ts                    # Re-exports public API
├── <feature>.service.ts        # Main service implementation
├── <feature>.types.ts          # TypeScript types
├── <feature>.validation.ts     # Zod schemas
└── <sub-feature>/              # Sub-modules for complex features
```

### 2.2 Component Structure

```
src/components/<feature>/
├── index.ts                    # Re-exports
├── <component>.tsx             # React component
└── <component>.types.ts        # Props and state types
```

### 2.3 API Route Structure

```
src/app/api/v1/<resource>/
├── route.ts                    # Collection endpoints (GET/POST)
├── [id]/route.ts               # Detail endpoints (GET/PUT/DELETE)
└── <action>/route.ts           # Action endpoints (POST)
```

### 2.4 File Naming

- **Service modules**: `kebab-case.service.ts`
- **React components**: `kebab-case.tsx`
- **Types**: `kebab-case.types.ts`
- **Validation**: `kebab-case.validation.ts`
- **Tests**: `kebab-case.test.ts`
- **Page files**: `page.tsx` (Next.js convention)
- **Layout files**: `layout.tsx` (Next.js convention)

---

## 3. Naming Conventions

### 3.1 Variables and Functions

```typescript
// camelCase for variables and functions
const walletBalance = 1000;
function getTransactionById() { ... }

// Boolean variables should be prefixed with is/has/should
const isActive = true;
const hasPendingApprovals = false;
const shouldRefresh = true;
```

### 3.2 Classes and Types

```typescript
// PascalCase for classes, interfaces, types, and enums
export class WalletService { ... }
export interface TransactionResult { ... }
export type WalletStatus = "active" | "frozen";
export enum TransactionType { ... }
```

### 3.3 Constants

```typescript
// UPPER_SNAKE_CASE for global constants
export const MAX_TRANSACTION_AMOUNT = 1000000;
export const DEFAULT_PAGE_SIZE = 20;
```

### 3.4 Database Fields

- `camelCase` mapped to `snake_case` in PostgreSQL via `@map()` decorators
- Example: `createdAt` → `created_at`, `companyId` → `company_id`

### 3.5 API Routes

- Plural resource names: `/api/v1/wallets`, `/api/v1/transactions`
- kebab-case for multi-word: `/api/v1/audit-logs`, `/api/v1/api-keys`
- Action endpoints as sub-resources: `/api/v1/transactions/credit`, `/api/v1/transactions/transfer`

---

## 4. Error Handling

### 4.1 Structured Error Response

All API errors must return a consistent structure:

```typescript
{
  "error": {
    "code": "UNIQUE_CONSTRAINT",
    "message": "A wallet with this name already exists.",
    "details": { "field": "name", "value": "Primary USD" }
  }
}
```

### 4.2 Error Handling Pattern

```typescript
try {
  const result = await operation();
  return NextResponse.json(result);
} catch (error) {
  if (error instanceof z.ZodError) {
    return zodErrorResponse(error);  // 400
  }
  if (error instanceof UnauthorizedError) {
    return handleRouteError(error);  // 401
  }
  if (error instanceof ForbiddenError) {
    return handleRouteError(error);  // 403
  }
  console.error("[module] operation failed:", error);  // Always log
  return handleRouteError(error);  // 500 with generic message
}
```

### 4.3 Error Types

Use the error hierarchy in `src/lib/errors/`:

- `AppError` — Base error class
- `UnauthorizedError` — Authentication failure (401)
- `ForbiddenError` — Authorization failure (403)
- `NotFoundError` — Resource not found (404)
- `ConflictError` — Resource conflict (409)
- `ValidationError` — Input validation failure (400)

### 4.4 Logging Requirements

Every catch block must include a log statement:

```typescript
console.error("[module:function] human-readable description:", error);
```

Production logging uses the structured logger at `src/lib/logger.ts`.

---

## 5. Database Access

### 5.1 Prisma as Single Source of Truth

All database access must go through the Prisma client. Raw SQL is prohibited except:
- Performance-critical query paths reviewed by the architecture team
- Database migrations
- These exceptions must be documented with a comment explaining why Prisma is insufficient

### 5.2 Tenant Isolation

Every query must include `companyId`:

```typescript
// Good
const wallet = await prisma.wallet.findFirst({
  where: { id: walletId, companyId: ctx.companyId }
});

// Bad — no tenant isolation
const wallet = await prisma.wallet.findUnique({
  where: { id: walletId }
});
```

### 5.3 Include Only What You Need

```typescript
// Good
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { id: true, name: true, email: true }
});

// Bad — fetches all fields including password hash
const user = await prisma.user.findUnique({
  where: { id: userId }
});
```

### 5.4 N+1 Prevention

Use `include` for relations and batch queries with `Promise.all`:

```typescript
// Good — single query with includes
const transactions = await prisma.transaction.findMany({
  where: { companyId: ctx.companyId },
  include: { ledgerEntries: true, approvals: true }
});

// Bad — N+1 queries in a loop
const transactions = await prisma.transaction.findMany({...});
for (const tx of transactions) {
  const entries = await prisma.ledgerEntry.findMany({ where: { transactionId: tx.id } });
}
```

---

## 6. React Standards

### 6.1 Component Types

- **Server Components**: Default. Used for data-fetching pages, static content, and layouts
- **Client Components**: Explicit `"use client"` directive. Used for interactivity, state, and browser APIs
- **Server Actions**: For form mutations when appropriate

### 6.2 Props

All component props must be typed:

```typescript
interface WalletCardProps {
  wallet: {
    id: string;
    name: string;
    balance: string;
    currency: string;
  };
  onSelect: (id: string) => void;
  className?: string;
}
```

### 6.3 State Management

- Prefer local state (`useState`, `useReducer`) for component-local state
- Use React Context for app-wide concerns (auth, onboarding, theme)
- Avoid external state libraries unless justified by specific requirements
- All state-modifying operations should go through API calls, not direct mutations

---

## 7. Testing Philosophy

### 7.1 Test Levels

- **Unit Tests**: Business logic in service modules. Cover edge cases, error paths, and happy paths
- **Integration Tests**: API contract tests. Verify request/response formats, status codes, and error structures
- **Sandbox Tests**: End-to-end financial scenarios using the sandbox environment

### 7.2 What to Test

- All service module functions
- All API route handlers (success and error paths)
- Validation schemas
- Edge cases: empty results, large data, concurrent operations
- Financial integrity: double-entry balancing, wallet balance consistency

### 7.3 What Not to Test

- Generated code (Prisma client, generated types)
- Third-party library behavior
- UI rendering details (prefer integration tests for user flows)

---

## 8. Code Review Expectations

Every pull request must satisfy:

- [ ] Zero TypeScript errors
- [ ] Zero lint warnings
- [ ] All new functions have return types
- [ ] All new types are exported
- [ ] Error paths are handled and logged
- [ ] Empty states, loading states, and error states are implemented
- [ ] RBAC is respected
- [ ] Tenant isolation is maintained
- [ ] No `any` or `@ts-ignore`
- [ ] No raw SQL without documented justification
- [ ] Tests cover the new functionality (or justification for no tests)
- [ ] Documentation is updated (ARCHITECTURE.md, ADR)
- [ ] Feature works with sandbox (if applicable)

---

## 9. Performance Expectations

### 9.1 Query Performance

- Every query pattern must have a corresponding database index
- List queries must use pagination
- N+1 patterns must be addressed during development, not after
- Use `select` to fetch only required fields

### 9.2 Rendering Performance

- Large lists must use virtual scrolling
- Dashboard widgets must load independently (no waterfall)
- Server Components for data-heavy pages to minimize client JS
- Lazy load below-the-fold content

### 9.3 Bundle Size

- Minimize client-side JavaScript
- Use dynamic imports for large component trees
- Avoid large dependencies; justify every new dependency
- Monitor bundle size changes in CI

---

## 10. Reuse Requirements

### 10.1 Before Building New

Before creating a new component, service, or utility:

1. Search the existing codebase for similar functionality
2. Check if an existing module can be extended instead of replaced
3. Verify that the new code doesn't duplicate existing patterns

### 10.2 UI Reuse

- Use `src/components/ui/` primitives for all standard UI elements
- Compose complex UIs from existing primitives
- Create domain-specific components only when the composition pattern becomes unwieldy

### 10.3 Service Reuse

- Favor extending existing service modules over creating new ones
- Cross-module dependencies must be explicitly declared
- Shared business logic belongs in `src/lib/` or a shared module
