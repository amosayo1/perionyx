---
title: Engineering Standards
version: 1.0.0
last_updated: 2026-07-16
status: published
audience: Engineering
---

# Engineering Standards

## Folder Structure

The codebase follows a strict four-directory convention:

| Directory | Purpose | Contents |
|-----------|---------|----------|
| `src/app/` | Pages, routes, layouts | Next.js App Router pages, API routes, layouts, loading/error UI |
| `src/components/` | UI components | React components, organized by domain (automation-studio, enterprise/motion, mobile, etc.) |
| `src/modules/` | Business logic | 56 business modules with domain services, types, and evaluation logic |
| `src/server/` | Infrastructure | Cache, queues, locks, persistence, identity, observability, HA, recovery, installer |

### Page Routes

Pages live under `src/app/(shell)/` for authenticated routes. The shell layout provides sidebar, topbar, and shared context.

### API Routes

API routes live under `src/app/api/`. All 272+ endpoints use the shared error handling pattern.

## Naming Conventions

| Artifact | Convention | Example |
|----------|------------|---------|
| Files | kebab-case | `business-rules-builder.ts` |
| Components | PascalCase | `ApprovalMatrixEvaluator` |
| Classes | PascalCase | `CacheManager`, `QueueManager` |
| Functions | camelCase | `handleRouteError()`, `zodErrorResponse()` |
| Variables | camelCase | `companyId`, `tenantContext` |
| Services | `.service.ts` suffix | `automation-studio.service.ts` |
| Tests | `.test.ts` suffix | `business-rules-builder.test.ts` |
| Types | PascalCase | `BusinessRuleDefinition`, `AutomationSchedule` |
| Enums | PascalCase | `ApprovalStatus`, `JobType` |

## Coding Standards

### TypeScript Strict Mode

- `strict: true` in `tsconfig.json`
- `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes` enabled
- Zero TypeScript errors enforced at build (`pnpm typecheck`)
- Prefer `type` over `interface` for union types and intersections
- Use `interface` for object shapes that may be extended

### No `any`

- Explicit `any` is forbidden
- Use `unknown` with type guards for dynamic data
- Use `z.infer<typeof schema>` for Zod-inferred types

### No Comments in Code

- Code should be self-documenting through clear naming and structure
- Complex business logic may include minimal comments explaining *why*, not *what*
- Documentation lives in `docs/` or inline type definitions

### Barrel Exports

- Each module/index file exports the public API
- Internal implementation details are not re-exported
- Barrel files should not contain logic

## Testing Philosophy

### Test Types

| Type | Framework | Coverage Target | Location |
|------|-----------|-----------------|----------|
| Unit | vitest | 85% | Alongside source files |
| Integration | vitest | 80% | `src/testing/` |
| Service | vitest | 75% | Alongside service files |
| Component | vitest + testing-library | 70% | Alongside component files |
| E2E | Playwright | Critical paths | `e2e/` |
| API | vitest + supertest | 100% of endpoints | `src/testing/api/` |

### Test Configuration

```typescript
// vitest.config.ts
export default {
  coverage: {
    provider: "v8",
    reporter: ["text", "html", "lcov"],
    thresholds: {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
  },
};
```

### What to Test

- Business logic: Always (unit tests)
- Data access: Repository integration tests
- API routes: Request/response validation
- Components: Render, interaction, accessibility
- E2E: Critical user journeys (login, dashboard, approval)

## Error Handling

### AppError Class

```typescript
class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public cause?: unknown,
  );
}
```

### API Error Pattern

All 272+ API endpoints use:

```typescript
import { handleRouteError, zodErrorResponse } from "@/server/http/handle-route";

// Success
return NextResponse.json(data);

// Validation error
return zodErrorResponse(error);

// Application error
return handleRouteError(error);

// Unknown error
// handleRouteError catches and returns 500 with correlation ID
```

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION",
    "message": "Description of the error",
    "issues": []
  }
}
```

## Logging

- Structured JSON logging via Pino
- Every log includes: `timestamp`, `level`, `correlationId`, `module`
- Error logs include: `error.message`, `error.stack`, `duration`
- Correlation IDs are injected by the edge proxy (`src/proxy.ts`)

## Architecture Principles

### Design System (from AGENTS.md)

| Principle | Definition |
|-----------|------------|
| **Clarity** | Every screen answers one question; no visual noise |
| **Confidence** | Stale data labeled, destructive actions confirmed, cached balances marked |
| **Speed** | Metric values render first, charts second |
| **Beauty** | Achieved through restraint — whitespace, rhythm, purposeful color |
| **Trust** | Every number has a source; every state has an explanation |

### Visual Identity

- Charcoal surfaces ~95% (backgrounds, cards, sidebars, headers)
- Typography ~4% (white/off-white text on charcoal)
- Gold accents ~1% (currency, active states, key metrics, logo)
- Influence: Bloomberg Terminal, Stripe Dashboard, Linear, Apple, Mercedes S-Class interior

## Security Checklist (Pre-Commit)

Every change must pass the 10-question Security Review from `AGENTS.md`:

| # | Question | Requirement |
|---|----------|-------------|
| 1 | Expose sensitive financial data? | No — or require encryption + audit |
| 2 | Require new permission? | No — or add GranularPermission to PermissionRegistry |
| 3 | Cross-tenant access possible? | No — blocked by requireTenantContext() |
| 4 | Need audit logging? | Yes — all security/finance/approval mutations |
| 5 | Encryption required? | Yes — if handling PII, financial data, credentials |
| 6 | Operation reversible? | Documented — destructive actions need confirmation |
| 7 | Privilege escalation risk? | No — verify permission checks at endpoint |
| 8 | Introduce new secrets? | No — use env vars + secret manager |
| 9 | Rate limiting required? | Yes — for auth, mutation, financial, public endpoints |
| 10 | Comply with security architecture? | Yes — follow IAM, tenant isolation, audit patterns |
