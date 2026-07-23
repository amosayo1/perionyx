---
title: System Architecture
version: 1.0.0
last_updated: 2026-07-16
status: published
audience: Engineering, Architecture Review
---

# System Architecture

## Seven-Layer Architecture

Perionyx is organized into seven logical layers. Each layer has a distinct responsibility and communicates with adjacent layers through well-defined interfaces.

```mermaid
block-beta
  columns 1
  block["Edge / Security Layer"]
    columns 3
    p["Proxy (src/proxy.ts)"] rl["Rate Limiting"] csrf["CSRF Protection"]
    auth["Auth Extraction"] locale["Locale Detection"] cors["CORS"]
  end
  block["Application Layer"]
    columns 3
    rsc["React Server Components"] cc["Client Components"] appr["App Router"]
    pages["Pages (96+)"] layouts["Layouts"] loading["Loading / Error UI"]
  end
  block["API Layer"]
    columns 3
    rest["REST Endpoints (272+)"] handle["handleRouteError()"] valid["zod Validation"]
    cache["Cache-Control"] etag["ETag Support"] streaming["Response Streaming"]
  end
  block["Business Logic Layer"]
    columns 3
    modules["56 Business Modules"] services["Domain Services"] facade["Facades"]
    rules["Business Rules"] matrix["Approval Matrix"] eval["Condition Evaluator"]
  end
  block["Integration Layer"]
    columns 3
    connectors["Connector Framework"] plaid["Plaid"] webhooks["Webhooks"]
    ach["ACH"] http["HTTP"] mock["Mock Connectors"]
  end
  block["Intelligence Layer"]
    columns 3
    anom["Anomaly Detection"] forecast["Cash Forecasting"] recs["Recommendations"]
    nlp["NLP Commentary"] riskScoring["Risk Scoring"] compliance["Compliance Checks"]
  end
  block["Infrastructure Layer"]
    columns 3
    cache["CacheManager (LRU+Redis)"] queue["QueueManager (PgBoss)"] locks["LockManager"]
    metrics["MetricsRegistry (Prom)"] logging["Pino Logger"] otel["OpenTelemetry"]
  end
```

## Multi-Tenancy Architecture

Tenant isolation is enforced at the database and application layers.

**Database layer:** Every table includes a `companyId` column. Queries are scoped by default. The Prisma schema enforces foreign key relationships through the `Company` model.

**Application layer:** The `requireTenantContext()` guard extracts the tenant from the JWT session and injects it into every service call. API routes receive tenant context via the edge proxy, which decodes the session token before the request reaches the handler.

**Key enforcement points:**

| Mechanism | Location |
|---|---|
| Tenant context extraction | `src/proxy.ts` |
| Guard function | `requireTenantContext()` in shared middleware |
| Per-table scoping | `companyId` on every model |
| Cross-tenant blocking | All repository queries include tenant filter |

## Domain Boundaries

Eleven domains partition the platform's functionality:

```mermaid
graph TD
    subgraph Identity
        IAM["Identity & IAM<br/>RBAC, ABAC, MFA, SSO"]
    end
    subgraph Financial
        Treasury["Treasury<br/>Cash, FX, Forecasting"]
        Ledger["Ledger<br/>Double-Entry, Journals"]
        Risk["Risk<br/>Scoring, Limits"]
    end
    subgraph Intelligence
        Intel["Intelligence Platform<br/>6 Engines, 14 Files"]
    end
    subgraph Operations
        Integrations["Integrations<br/>Connectors, Plaid, Webhooks"]
        Workflow["Workflow Orchestration<br/>12 Files"]
        Queue["Queue System<br/>9 Job Types"]
    end
    subgraph Experience
        Exp["Enterprise Experience<br/>10 Files"]
        Notif["Notifications<br/>3 Channels"]
        Auto["Automation Studio<br/>Business Rules, Schedules"]
    end

    IAM -->|Authenticates| Treasury
    IAM -->|Authenticates| Ledger
    IAM -->|Authenticates| Risk
    IAM -->|Authorizes| Workflow
    Treasury -->|Feeds| Intel
    Ledger -->|Feeds| Intel
    Treasury -->|Feeds| Reporting
    Ledger -->|Feeds| Reporting
    Integrations -->|Syncs Data| Treasury
    Integrations -->|Syncs Data| Ledger
    Queue -->|Backs| Notif
    Queue -->|Backs| Workflow
    Auto -->|Uses| Workflow
    Auto -->|Uses| Intel
    Workflow -->|Orchestrates| Ledger
    Workflow -->|Triggers| Notif
```

## Module Interaction Diagram

The following diagram shows how the 56 business modules in `src/modules/` interact at runtime:

```mermaid
graph LR
    subgraph Modules
        A[automation-studio]
        B[ledger]
        C[treasury]
        D[reporting]
        E[risk]
        F[intelligence-platform]
        G[integrations]
        H[orchestration]
        I[enterprise-experience]
        J[notifications]
        K[queue]
        L[identity]
        M[rbac]
    end

    A --> H
    A --> F
    B --> D
    C --> D
    F --> D
    G --> B
    G --> C
    H --> B
    H --> J
    K --> J
    L --> M
    L -->|auth| B
    L -->|auth| C
    L -->|auth| H
```

## Key Architectural Decisions

| Decision | Rationale |
|---|---|
| Proxy replaces Middleware | Next.js 16 uses `src/proxy.ts` instead of `src/middleware.ts` for edge processing |
| Unified error format | All 272+ API endpoints use `handleRouteError()` / `zodErrorResponse()` |
| Cache headers on 18 endpoints | Tiered TTLs (15-120s) designed for CDN adoption |
| Stale-while-revalidate | Allows background refresh of cached financial data |
| Parallel DB queries | 9 independent queries converted from sequential to `Promise.all` |
| In-memory stores (ephemeral) | Rules/schedules/matrix stored in `Map` objects — DB persistence planned |
