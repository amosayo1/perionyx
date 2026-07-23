# Contributing to Perionyx

Thank you for contributing to **Perionyx** — the Enterprise Financial Operating System. Every line of code either protects or risks capital. This guide establishes the engineering standards, workflows, and principles that govern all contributions.

> **Read this before writing code.** The [Engineering Constitution](docs/architecture/perionyx-engineering-constitution.md) is the authoritative source. This document is a practical summary.

---

## Table of Contents

- [Welcome](#welcome)
- [Development Setup](#development-setup)
- [Folder Structure](#folder-structure)
- [Branch Strategy](#branch-strategy)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Naming Conventions](#naming-conventions)
- [Architecture Principles](#architecture-principles)
- [Testing Expectations](#testing-expectations)
- [Documentation Requirements](#documentation-requirements)
- [ADR Requirements](#adr-requirements)
- [Code Review Checklist](#code-review-checklist)
- [Security Requirements](#security-requirements)
- [Performance Requirements](#performance-requirements)

---

## Welcome

Perionyx is an enterprise treasury and financial operations platform. We serve CFOs, Treasurers, Controllers, Finance Managers, and Auditors — professionals who depend on correctness, auditability, and security above all else.

This guide covers everything you need to contribute effectively:

- **Development setup** — local environment, IDE, tooling
- **Code standards** — TypeScript, naming, architecture, patterns
- **Workflow** — branching, PRs, reviews, merging
- **Quality gates** — testing, security, performance, documentation

**Our philosophy: correctness over performance.** Financial software that is fast but wrong is worthless. When correctness and performance conflict, correctness wins. Profile first, optimize second.

---

## Development Setup

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| **Node.js** | 20+ | Runtime |
| **pnpm** | 9+ | Package manager (required — not npm) |
| **PostgreSQL** | 16+ | Database |
| **Git** | 2.40+ | Version control |

### Quick Start

```bash
# 1. Clone the repository
git clone <repo-url>
cd vaultareloaded

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp .env.example .env
# Edit .env — set DATABASE_URL and AUTH_SECRET at minimum

# 4. Generate Prisma client
pnpm db:generate

# 5. Run database migrations
pnpm db:migrate

# 6. Seed the database
pnpm db:seed

# 7. Start the dev server
pnpm dev
```

The app runs at **http://localhost:3000**. Use "Try Demo" on sign-in for pre-seeded data.

### IDE Setup (VS Code)

Install these extensions:

| Extension | Purpose |
|---|---|
| `dbaeumer.vscode-eslint` | ESLint integration |
| `esbenp.prettier-vscode` | Code formatting |
| `Prisma.prisma` | Prisma schema IntelliSense |
| `bradlc.vscode-tailwindcss` | Tailwind CSS IntelliSense |
| `ms-vscode.vscode-typescript-next` | Latest TypeScript |

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build (must pass before merge) |
| `pnpm typecheck` | TypeScript strict mode check (must pass before merge) |
| `pnpm lint` | ESLint check |
| `pnpm test` | Run test suite with vitest |
| `pnpm test -- --watch` | Run tests in watch mode |
| `pnpm db:generate` | Regenerate Prisma Client |
| `pnpm db:migrate` | Create and apply migrations |
| `pnpm db:push` | Push schema changes without migrations |
| `pnpm db:seed` | Seed database with demo data |
| `pnpm db:studio` | Open Prisma Studio (visual DB browser) |
| `pnpm e2e` | Run Playwright E2E tests |
| `pnpm analyze` | Bundle size analysis |

### Pre-Commit Hooks

Husky runs automatically on commit via `lint-staged`:

- **`*.ts`, `*.tsx`** — ESLint fix + TypeScript check
- Commit will be **blocked** if either fails

---

## Folder Structure

```
vaultareloaded/
├── src/
│   ├── app/                    # Next.js App Router — pages and API routes
│   │   ├── (auth)/             #   Authentication pages (sign-in, sign-up, invite)
│   │   ├── (shell)/            #   Authenticated dashboard pages (96+ routes)
│   │   ├── api/                #   API route handlers
│   │   ├── layout.tsx          #   Root layout
│   │   └── page.tsx            #   Landing page
│   ├── components/             # React components
│   │   ├── enterprise/         #   Enterprise design system (tables, forms, motion, workflow)
│   │   ├── mobile/             #   Mobile-first executive components
│   │   ├── onboarding/         #   Setup wizard components
│   │   └── ui/                 #   shadcn/ui primitives
│   ├── modules/                # Business logic (56 domain modules)
│   │   ├── treasury/           #   Treasury operations
│   │   ├── ledger/             #   Double-entry accounting
│   │   ├── workflow/           #   Workflow engine
│   │   ├── governance/         #   Policy engine
│   │   ├── risk/               #   Risk monitoring
│   │   ├── intelligence/       #   AI/ML capabilities
│   │   └── ...                 #   50+ other domain modules
│   ├── server/                 # Server-side infrastructure (48 domains)
│   │   ├── persistence/        #   Database abstraction layer
│   │   ├── cache/              #   Caching (LRU + Redis)
│   │   ├── locks/              #   Distributed locking
│   │   ├── queues/             #   Job queue (PgBoss)
│   │   ├── security/           #   Secrets, CSP, rate limiting
│   │   ├── observability/      #   Metrics, tracing, health checks
│   │   └── ...                 #   40+ other infrastructure domains
│   ├── lib/                    # Shared utilities and helpers
│   ├── hooks/                  # React hooks (responsive, keyboard, etc.)
│   ├── i18n/                   # Internationalization config (en/ar)
│   ├── testing/                # Test factories, fixtures, helpers
│   ├── design-system/          # Design tokens and theme config
│   ├── mobile/                 # Mobile-specific utilities
│   └── version.ts              # Platform version metadata
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Migration history
│   └── seed.ts                 # Database seeder
├── docs/
│   ├── architecture/           # Architecture Decision Records
│   ├── design/                 # Design system documentation
│   ├── persistence/            # Persistence layer docs
│   ├── infrastructure/         # Infrastructure docs
│   ├── deployment/             # Deployment runbooks
│   ├── security/               # Security documentation
│   ├── testing/                # Testing strategy docs
│   └── identity/               # IAM documentation
├── k8s/                        # Kubernetes manifests
├── AGENTS.md                   # Engineering constitution summary
├── CONTRIBUTING.md             # This file
└── package.json
```

### Key Paths

| Path | What lives here |
|---|---|
| `src/app/(shell)/` | Dashboard pages — one `page.tsx` per route |
| `src/app/api/` | API route handlers — follow REST conventions |
| `src/components/enterprise/` | Enterprise-grade UI primitives (tables, forms, charts, motion) |
| `src/modules/` | Business logic — one folder per domain, exported as singleton services |
| `src/server/` | Infrastructure — cache, locks, queues, security, observability |
| `src/lib/` | Shared utilities used across modules and components |
| `src/hooks/` | React hooks — responsive breakpoints, keyboard shortcuts, etc. |
| `src/i18n/` | Locale routing and message loading |
| `prisma/` | Schema, migrations, seed data |

---

## Branch Strategy

```
main              ← Production (protected)
  └── develop     ← Integration branch (PR target)
       ├── feature/*    ← New features
       ├── fix/*        ← Bug fixes
       ├── docs/*       ← Documentation updates
       └── chore/*      ← Maintenance, dependencies, CI
```

| Branch | Purpose | Protection | Merge Target |
|---|---|---|---|
| `main` | Production release | PR required, 2 approvals | — |
| `develop` | Integration branch | PR required, 1 approval | `main` |
| `feature/*` | New features | — | `develop` |
| `fix/*` | Bug fixes | — | `develop` |
| `docs/*` | Documentation | — | `develop` |
| `chore/*` | Maintenance | — | `develop` |

### Branch Naming

```
feature/treasury-cash-pooling
fix/ledger-balance-version-conflict
docs/adr-001-persistence-strategy
chore/upgrade-prisma-to-7.8
```

---

## Pull Request Process

### Step-by-Step

1. **Branch from `develop`**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   ```

2. **Write code + tests**
   - Follow [Coding Standards](#coding-standards)
   - Write tests for all new functionality
   - Ensure financial operations use typed errors

3. **Run quality gates**
   ```bash
   pnpm typecheck    # Must pass — zero TypeScript errors
   pnpm lint         # Must pass — zero ESLint errors
   pnpm test         # Must pass — all 443+ tests green
   pnpm build        # Must pass — production build succeeds
   ```

4. **Update documentation**
   - Add entry to `CHANGELOG.md` under `[Unreleased]`
   - Update relevant docs if behavior changed
   - Write an ADR for architectural decisions

5. **Self-review against the checklist**
   - Review the [Code Review Checklist](#code-review-checklist) below
   - Verify tenant isolation, audit logging, error handling
   - Check that no secrets or keys are committed

6. **Open PR against `develop`**
   - Title: `feat: treasury cash pooling` (conventional commits)
   - Description: what changed, why, how to test
   - Link to issue if applicable

7. **Address review feedback**

8. **Squash merge to `develop`**
   - Clean commit message: `feat: add treasury cash pooling`
   - Delete feature branch after merge

### PR Title Format (Conventional Commits)

```
feat: add treasury cash pooling
fix: resolve ledger balance version conflict
docs: add ADR for persistence strategy
chore: upgrade Prisma to 7.8
refactor: extract ConditionEvaluator from BranchStepExecutor
test: add integration tests for approval escalation
```

---

## Coding Standards

### TypeScript

- **Strict mode is mandatory** — `tsconfig.json` has `"strict": true`
- **Zero `any` types** — use `unknown` and narrow with type guards
- **No `as` casts in financial logic** — use type-safe alternatives
- **All I/O is `async/await`** — no fire-and-forget promises
- **No circular dependencies** — module A cannot import from module B if B imports from A

### Components

- **Functional components only** — no class components
- **Server Components by default** — add `'use client'` only when interactivity requires it
- **Radix UI + Tailwind CSS** — all UI primitives from `@radix-ui/*`, styled with Tailwind
- **shadcn/ui patterns** — use existing component library, extend via `class-variance-authority`

### API Routes

- **`handleRouteError()`** — every API route must use the shared error handler from `src/server/http/handle-route.ts`
- **`requireTenantContext()`** — every tenant-scoped endpoint must extract and validate the company context
- **Zod validation** — validate all request bodies, query params, and path params
- **Cache-Control headers** — apply `cacheHeaders(ttl)` to all read endpoints

```typescript
// Example: well-structured API route
import { handleRouteError, zodErrorResponse } from '@/server/http/handle-route';
import { requireTenantContext } from '@/server/context';
import { z } from 'zod';

const Schema = z.object({ name: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const ctx = requireTenantContext();
    const body = await request.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const result = await myService.create(ctx.companyId, parsed.data);
    return Response.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
```

### Database

- **Prisma for all database access** — no raw SQL in business logic
- **No `$queryRaw` in financial code** — the only exception is `RowLockManager` for `FOR UPDATE` locks
- **Forward-only migrations** — rollbacks via new migrations, never `DROP` in production
- **Constraints over code** — use database-level `UNIQUE`, `CHECK`, `FOREIGN KEY` constraints

### Financial Operations

- **Explicit transactions** — `Prisma.$transaction()` for all multi-step financial writes
- **Pessimistic + optimistic locking** — `FOR UPDATE` + version check on every balance write
- **Idempotency keys** — every mutating financial operation must be idempotent
- **Typed errors** — `ConflictError`, `ValidationError`, `NotFoundError`, `ForbiddenError`
- **Append-only ledger** — `LedgerEntry` records are never updated or deleted

---

## Naming Conventions

| Type | Convention | Example |
|---|---|---|
| **Files** | kebab-case | `my-component.tsx`, `treasury.service.ts` |
| **React Components** | PascalCase | `MyComponent`, `TreasuryDashboard` |
| **Functions** | camelCase | `myFunction`, `getTreasuryBalance` |
| **Types / Interfaces** | PascalCase | `MyInterface`, `TreasuryAccount` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_RETRIES`, `DEFAULT_TIMEOUT_MS` |
| **Database columns** | snake_case | `created_at`, `company_id` |
| **API routes** | kebab-case | `/api/v1/my-endpoint` |
| **CSS classes** | Tailwind conventions | `bg-charcoal-900`, `text-gold-500` |
| **Test files** | `*.test.ts` co-located | `treasury.service.test.ts` |

### File Naming Patterns

```
my-component.tsx          # React component
my-component.test.ts      # Test file (co-located)
my-service.ts             # Service module
my-service.test.ts        # Service tests
my.types.ts               # Type definitions (if file needs own types)
types.ts                  # Shared type definitions
index.ts                  # Barrel export
```

---

## Architecture Principles

### Seven-Layer Architecture

```
Presentation    →  Next.js App Router (Server Components + Client Components)
     ↓
API Layer       →  Route Handlers (validation, auth, error handling)
     ↓
Service Layer   →  Business Logic (domain rules, orchestration)
     ↓
Data Access     →  Prisma ORM + RowLockManager
     ↓
Database        →  PostgreSQL 16
     ↓
Cache           →  LRU in-memory + Redis (invalidatable, never authoritative)
     ↓
Queue           →  PgBoss (async jobs, background sync)
```

**Dependency rule**: each layer may only import from layers below it. Service code never imports from presentation. API routes never contain business logic.

### Module-Per-Domain Pattern

Each business domain gets its own module in `src/modules/`:

```
src/modules/treasury/
├── types.ts                    # Domain types
├── treasury.service.ts         # Service facade
├── treasury.repository.ts      # Data access
└── index.ts                    # Barrel export
```

### Singleton Services

```typescript
// Services are instantiated once and shared
class TreasuryService {
  private static instance: TreasuryService;
  static getInstance(): TreasuryService {
    if (!this.instance) this.instance = new TreasuryService();
    return this.instance;
  }
}
```

### Immutable Financial Facts

- **Ledger entries**: append-only, never mutated
- **Audit logs**: append-only, never deleted
- **Transaction histories**: immutable event log
- Corrections via reversal transactions, not edits

### Audit Trail on Every Mutation

Every financial action must produce an `AuditLog` entry:
- Actor identity (userId or system)
- Action type
- Resource type + ID
- Metadata to reconstruct the operation

### Multi-Tenant Isolation

- Every resource scoped by `companyId`
- `requireTenantContext()` validates session + company
- Row-Level Security (RLS) as database-level defense
- Application-level scoping as application-level defense
- **Both must exist** — defense in depth

---

## Testing Expectations

### Test Suite

| Category | Framework | Coverage |
|---|---|---|
| **Unit tests** | vitest | Service methods, utilities, pure functions |
| **Integration tests** | vitest | API routes, database operations, service interactions |
| **E2E tests** | Playwright | Full user workflows in browser |
| **Load tests** | vitest | Concurrent operations, lock contention |
| **Chaos tests** | vitest | Failure injection, recovery verification |

### Current Status

- **443+ tests passing** across 15 test categories
- **85% coverage threshold** — enforced in CI
- Test factories in `src/testing/` for consistent mock data

### Writing Tests

- **Co-located** — `my-service.test.ts` next to `my-service.ts`
- **Describe blocks** — group by function/method
- **Arrange-Act-Assert** — clear test structure
- **One assertion per concept** — don't bundle unrelated checks

```typescript
import { describe, it, expect } from 'vitest';
import { TreasuryService } from './treasury.service';

describe('TreasuryService', () => {
  describe('createAccount', () => {
    it('should create account with valid input', async () => {
      // Arrange
      const input = { name: 'Operating Account', currency: 'USD' };

      // Act
      const account = await treasuryService.createAccount('company-1', input);

      // Assert
      expect(account.name).toBe('Operating Account');
      expect(account.currency).toBe('USD');
      expect(account.companyId).toBe('company-1');
    });

    it('should reject negative opening balance', async () => {
      const input = { name: 'Account', currency: 'USD', balance: -100 };

      await expect(
        treasuryService.createAccount('company-1', input)
      ).rejects.toThrow('Balance must be non-negative');
    });
  });
});
```

### Running Tests

```bash
pnpm test                        # Run all tests
pnpm test -- --watch             # Watch mode
pnpm test -- --coverage          # With coverage report
pnpm test -- treasury            # Filter by name
pnpm e2e                         # Run Playwright E2E tests
```

---

## Documentation Requirements

### When to Document

| What | Where | Required? |
|---|---|---|
| Architecture decision | `docs/adr/NNNN-title.md` | Yes — for all significant decisions |
| New feature | `CHANGELOG.md` + relevant docs | Yes |
| API endpoint | OpenAPI spec or inline JSDoc | Yes |
| Financial operation | `docs/enterprise/` | Yes — locking, isolation, audit, recovery |
| Design system component | `docs/design/` | Recommended |
| Deployment procedure | `docs/deployment/` | Yes — if changed |

### Documentation Principles

- **Docs are code** — versioned, reviewed, and tested in CI
- **Single source of truth** — no duplicate docs saying different things
- **Write for the reader** — assume they're competent but unfamiliar
- **Keep it current** — outdated docs are worse than no docs

---

## ADR Requirements

### When to Write an ADR

Write an ADR when:

- Choosing a technology, library, or framework
- Changing the architecture (layers, patterns, data flow)
- Introducing a new cross-cutting concern (caching, logging, security)
- Making a decision that affects multiple teams/modules
- Reversing or deprecating a previous decision

### ADR Template

Create files in `docs/adr/` with sequential numbering:

```markdown
# ADR-NNNN: Title

**Status:** Proposed | Accepted | Ratified | Deprecated
**Date:** YYYY-MM-DD
**Deciders:** List of people involved

## Context

What is the issue that motivates this decision?

## Decision

What is the change being proposed?

## Consequences

### Positive
- What improves?

### Negative
- What gets worse?

### Risks
- What could go wrong?

## Alternatives Considered

What other options were evaluated and why were they rejected?
```

### ADR Lifecycle

```
Proposed → Accepted → Ratified
              ↓
         Deprecated (superseded by new ADR)
```

### ADR Numbering

Use sequential 4-digit numbers: `0001`, `0002`, `0003`...

Never reuse a number, even if an ADR is deprecated.

---

## Code Review Checklist

Every PR must pass all 10 items before merge. Reviewers must verify each one.

| # | Check | How to Verify |
|---|---|---|
| 1 | **TypeScript strict mode passes** | `pnpm typecheck` exits 0 |
| 2 | **Zero new TypeScript errors** | No new errors in output |
| 3 | **Tests pass** | `pnpm test` — all 443+ green |
| 4 | **No comments added** | Code is self-documenting; exceptions need justification |
| 5 | **Tenant isolation verified** | `requireTenantContext()` used; no cross-tenant data access |
| 6 | **Audit logging present for mutations** | `recordAudit()` or `recordIAMAudit()` on every financial write |
| 7 | **No secrets committed** | No API keys, passwords, tokens in source code |
| 8 | **Error handling uses handleRouteError()** | API routes use shared error handler, not raw `throw` |
| 9 | **Cache headers on read endpoints** | `cacheHeaders(ttl)` applied to GET routes |
| 10 | **Accessibility (WCAG 2.1 AA)** | `aria-label`, `aria-describedby`, keyboard navigation |

### Additional Financial Checks

| # | Check | How to Verify |
|---|---|---|
| 11 | **Explicit transactions** | `Prisma.$transaction()` for multi-step writes |
| 12 | **Version-protected balances** | `updateMany` with version condition |
| 13 | **Idempotency keys** | Mutating ops are replay-safe |
| 14 | **Typed errors** | `ConflictError`, `ValidationError`, etc. — not generic `Error` |
| 15 | **No raw SQL in business logic** | Only `RowLockManager` uses `$queryRaw` |

---

## Security Requirements

### Secrets Management

- **Never commit secrets** — API keys, passwords, tokens, connection strings
- **Use environment variables** — load via `process.env`, validated in `src/server/env/`
- **`.env` is gitignored** — `.env.example` is committed with placeholder values
- **Rotate compromised secrets immediately** — assume they're public if committed

### Authentication & Authorization

- **Every endpoint authenticates first** — unauthenticated requests rejected at proxy layer
- **RBAC at the resource level** — verify role + permission for specific resources
- **Session validation** — `requireTenantContext()` extracts and validates session

### Input Validation

- **Zod schemas** for all user input — body, query params, path params
- **Financial amounts** validated as positive, finite, within acceptable ranges
- **Parameterized queries** — Prisma handles this; never use raw SQL with string interpolation

### Infrastructure Security

- **Rate limiting** — mutation endpoints must be rate-limited
- **CSRF protection** — origin validation on all state-changing requests
- **Security headers** — CSP, HSTS, X-Frame-Options applied at proxy
- **Dependency scanning** — CI runs `pnpm audit` on every PR

### When to Escalate

- If you discover a security vulnerability, **do not open a public issue**
- Contact the security team directly via private channel
- Document the finding in `docs/security/incidents/`

---

## Performance Requirements

### Frontend Targets

| Metric | Target | How to Measure |
|---|---|---|
| **Lighthouse score** | ≥ 95 | `pnpm build` + Lighthouse CI |
| **First Contentful Paint** | < 1.5s | Chrome DevTools |
| **Largest Contentful Paint** | < 2.5s | Chrome DevTools |
| **Cumulative Layout Shift** | < 0.1 | Chrome DevTools |
| **Total Blocking Time** | < 200ms | Chrome DevTools |

### Frontend Guidelines

- **Server Components by default** — minimize client-side JavaScript
- **No unnecessary re-renders** — use `React.memo`, `useMemo`, `useCallback`
- **Memoize expensive computations** — derived state, large data transforms
- **Lazy load heavy components** — `next/dynamic` for charts, editors, viewers
- **Bundle size awareness** — new dependencies must be justified (> 10kB gzipped needs approval)

### Backend Guidelines

- **Batch database operations** — `updateMany`, `createMany` over loops
- **Parallelize independent queries** — `Promise.all` for unrelated reads
- **Move I/O outside transactions** — notifications, external APIs after commit
- **Cache read-heavy queries** — tiered TTLs (5s critical → 600s stale)
- **Paginate unbounded results** — cursor-based pagination for large datasets

### Database Guidelines

- **Index all filtered columns** — `companyId`, `status`, `createdAt`, `transactionId`
- **Verify query plans** — `EXPLAIN ANALYZE` before deploying new queries
- **No full table scans** on financial tables
- **Connection pool awareness** — size pool for peak concurrent load

---

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | When to Use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or correcting tests |
| `chore` | Build process, dependencies, CI |
| `revert` | Reverts a previous commit |

### Examples

```
feat(treasury): add cash pooling with automatic sweep rules
fix(ledger): resolve version conflict on concurrent balance updates
docs(adr): add ADR-0015 for distributed caching strategy
refactor(workflow): extract ConditionEvaluator as shared module
test(approval): add concurrency tests for approval escalation
```

---

## Getting Help

| Resource | Where |
|---|---|
| **Engineering Constitution** | `docs/architecture/perionyx-engineering-constitution.md` |
| **Architecture docs** | `docs/architecture/` |
| **Design system** | `docs/design/` |
| **Deployment runbooks** | `docs/deployment/` |
| **Security policies** | `docs/security/` |
| **Test strategy** | `docs/testing/` |
| **Open an issue** | GitHub Issues |

---

## License

Private — internal use. All contributions are subject to the project's license terms.
