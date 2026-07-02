# Architecture Overview

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, standalone output) |
| ORM | Prisma 7 (`@prisma/client` + `@prisma/adapter-pg`) |
| Database | PostgreSQL 16 |
| Queue | PgBoss (schema: `perionyx_queue`) |
| Auth | Auth.js (Prisma adapter) |
| UI | Radix UI primitives + Tailwind CSS |

## Module Monolith

All domain logic lives under `src/modules/` as self-contained modules. Each module exports a barrel (`index.ts`) and typically contains:

- `*.service.ts` — stateless service classes
- `*.types.ts` — domain types and interfaces
- `index.ts` — public API barrel

There are 46 modules covering: treasury, ledger, connectors, transactions, risk, policies, approvals, audit, copilot, command-center, enterprise-intelligence, decision-intelligence, operations, reconciliation, fx, calendar, notifications, and more.

Modules communicate through typed function calls. Circular dependencies are prohibited.

## Pages

`src/app/` uses Next.js App Router with two route groups:

- `(auth)/` — sign-in, sign-up, invite, forgot-password
- `(shell)/` — all authenticated pages (dashboard, command-center, copilot, risk-intelligence, platform, wallets, approvals, etc.)

Shell layout enforces RBAC, tenant context, and the shared navigation shell.

## Key Design Decisions

- **Tenant Isolation:** Every entity carries `companyId`. Cross-tenant access is a security incident.
- **RBAC:** Roles and permissions enforced at the service layer via `src/modules/rbac/`. Authorization denies by default.
- **Dark Theme:** Enterprise-first UX with consistent dark theme across all pages.
- **Immutable Ledger:** Ledger entries never modify or delete. Corrections are reversal transactions.
- **Offline-First AI:** Platform functions fully without AI. AI never acts autonomously; it augments human decisions.

## Data Flow

```
Server Components (RSC)
  └→ Service class (Prisma query)
      └→ PostgreSQL

Client Components
  └→ API route (src/app/api/)
      └→ Service class
          └→ Prisma query
              └→ PostgreSQL
```

Server components import services directly for data-fetching. Client components call API routes (`/api/v1/...`) which delegate to the same service layer. This ensures consistent domain logic regardless of the entry point.

## Major Subsystems

| Subsystem | Module(s) | Purpose |
|-----------|-----------|---------|
| Treasury | `modules/treasury/`, `modules/ledger/`, `modules/wallets/`, `modules/fx/` | Account management, double-entry ledger, liquidity, FX, bank connectivity |
| Connector Platform | `modules/connector-platform/`, `modules/connectors/`, `modules/integrations/` | Plaid, QuickBooks, SWIFT, ACH, HTTP connectors |
| Enterprise Intelligence | `modules/enterprise-intelligence/`, `modules/intelligence/`, `modules/briefings/` | Executive briefings, time-machine, insights |
| Decision Intelligence | `modules/decision-intelligence/`, `modules/risk-intelligence/` | Anomaly detection, recommendations, what-if simulation |
| Copilot | `modules/copilot/`, `modules/ai-provider/` | AI-powered chat, natural language queries |
| Operations | `modules/operations/`, `modules/approval-thread/`, `modules/policies/` | Incident management, approval workflows, policy engine |
| Risk | `modules/risk/`, `modules/risk-intelligence/` | Risk alerts, scoring, monitoring |
| Queue | `modules/queue/` | PgBoss job scheduling and background workers |
| Audit | `modules/audit/`, `modules/observability/` | Immutable audit log, platform health |
| Identity | `modules/identity/`, `modules/users/`, `modules/rbac/`, `modules/companies/` | Auth, roles, invites, multi-tenant |
