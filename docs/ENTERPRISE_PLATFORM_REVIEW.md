# Enterprise Platform Review

**Platform**: Perionyx — Enterprise Financial Operating System  
**Version**: v1.0.0 | **Date**: July 2026  
**Reviewer**: Architecture & Engineering Review Board  
**Classification**: Internal — Confidential

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Platform Metrics](#2-platform-metrics)
3. [Architecture Review](#3-architecture-review)
4. [Security Review](#4-security-review)
5. [Governance Review](#5-governance-review)
6. [UX & Design Review](#6-ux--design-review)
7. [Enterprise Readiness Assessment](#7-enterprise-readiness-assessment)
8. [Risk Register](#8-risk-register)
9. [Prioritized Recommendations](#9-prioritized-recommendations)
10. [Roadmap](#10-roadmap)

---

## 1. Executive Summary

Perionyx is a modular-monolith Enterprise Financial Operating System built on Next.js 16, React 19, TypeScript 5.9, Prisma 7.8, and PostgreSQL 16. The platform serves CFOs, Treasurers, Controllers, Finance Managers, and Auditors across 30+ financial domains with 338 database models, 67 business modules, 1,130 components, and 392 API route files.

### Overall Assessment: 6.4 / 10

| Domain | Score | Status |
|---|---|---|
| **Architecture** | 7.5 / 10 | Solid modular monolith with clear boundaries |
| **Security** | 6.5 / 10 | Strong foundations; critical gaps in middleware, CSP, CSRF |
| **Governance** | 7.0 / 10 | Excellent documentation; no automated enforcement |
| **UX & Design** | 6.0 / 10 | Design system exists but 1.1% adoption |
| **Performance** | 5.5 / 10 | N+1 queries, zero code-splitting, no API caching |
| **Enterprise Readiness** | 7.0 / 10 | Multi-tenant, RBAC, audit; missing SSO, real-time |

### Key Strengths

- **Domain completeness**: 30+ financial domains with full CRUD, analytics, and AI integration
- **Tenant isolation**: `companyId` on every entity, enforced at API, service, and query layers
- **Audit trail**: Hash-chained audit log with tamper detection
- **Agent Framework**: 11 services, 14 DB models, 8 API groups — fully functional autonomous agent infrastructure
- **Design system infrastructure**: 13 token files, 70+ CSS custom properties, 12 canonical components
- **Documentation**: 784 markdown files, 3 constitutions, 30 ADRs

### Critical Gaps

1. **No auth middleware** — unauthenticated requests reach Server Components
2. **1.1% design system adoption** — 98.9% of codebase uses raw HTML elements
3. **Three N+1 query patterns** in production code
4. **Zero code-splitting** — no `next/dynamic`, no `React.lazy`, no `Suspense`
5. **CSP allows `unsafe-inline` and `unsafe-eval`** — weakens XSS protection

---

## 2. Platform Metrics

| Metric | Count |
|---|---|
| TypeScript/TSX Files | **3,671** |
| Prisma Models | **338** |
| Prisma Migrations | **51** |
| Schema Lines | **9,249** |
| API Route Files | **392** |
| API Endpoint Groups | **138** |
| Versioned v1 Routes | **194** |
| Page Files | **468** |
| Component Files | **1,130** |
| Module Directories | **67** |
| Server Domain Directories | **45** |
| Server TypeScript Files | **797** |
| Documentation Files | **784** |
| ADRs | **30** |
| Design Token Files | **13** |
| Canonical Components | **12** |

### Codebase Age & Velocity

- **51 migrations** spanning the full development lifecycle
- **14 migrations on 2026-07-17 alone** (agent framework through board governance)
- **Zero TODO/FIXME/HACK markers** in agent framework code
- **Zero new runtime dependencies** added for design system or motion

---

## 3. Architecture Review

### 3.1 Architecture Principles (from Governance Constitution)

| # | Principle | Implementation |
|---|---|---|
| 1 | Modular Monolith | 67 business modules with typed interfaces |
| 2 | Tenant Isolation | `companyId` on every entity, `requireTenantContext()` |
| 3 | Secure by Default | Auth required, authz denies by default, rate limiting |
| 4 | Immutable Financial History | Ledger entries never delete; corrections are reversals |
| 5 | Explicit Domain Boundaries | Typed calls, no circular dependencies |
| 6 | Offline-First AI | Platform works without AI; AI never acts autonomously |
| 7 | Enterprise-First UX | Dark theme, data-dense, keyboard nav |
| 8 | Consistency Over Convenience | Shared patterns across all domains |

### 3.2 Layer Architecture

```
┌─────────────────────────────────────────────────┐
│  Pages (468 page.tsx)                           │
│  Server Components with auth + data fetching     │
├─────────────────────────────────────────────────┤
│  Components (1,130 .tsx)                         │
│  79 domain directories, 12 canonical design      │
├─────────────────────────────────────────────────┤
│  Modules (67 business modules, 499 files)        │
│  Domain logic, facades, orchestration             │
├─────────────────────────────────────────────────┤
│  Server (45 domains, 797 files)                  │
│  Services, repositories, security, observability  │
├─────────────────────────────────────────────────┤
│  Infrastructure                                  │
│  Cache, Locks, Queues, Persistence, HA           │
├─────────────────────────────────────────────────┤
│  Prisma (338 models, 51 migrations)              │
│  PostgreSQL 16 + PgBoss queue                    │
└─────────────────────────────────────────────────┘
```

### 3.3 What's Working Well

- **Clear separation of concerns**: Modules don't import from each other's internals; facade pattern (`AgentService`, `AutomationStudioService`) provides clean public APIs
- **Consistent API pattern**: All 392 routes use `handleRouteError()` / `zodErrorResponse()`, `requireTenantContext()`, `cacheHeaders()`
- **Infrastructure abstraction**: Cache (LRU + Redis), Locks (in-memory + Redis), Persistence (4 adapters), Queue (PgBoss)
- **Type safety**: TypeScript strict mode, Zod validation on all API inputs, typed Prisma queries
- **Agent Framework**: Cleanest module in the codebase — 5,700 LOC, 11 services, zero tech debt markers, comprehensive types

### 3.4 Architectural Concerns

| Concern | Severity | Detail |
|---|---|---|
| **No auth middleware** | Critical | `next.config.ts` has headers but no `middleware.ts`. Unauthenticated requests reach Server Components before auth checks. |
| **Service layer bypass** | High | `/api/agents/[id]/tasks/route.ts` calls `prisma.agentTask.create()` directly, bypassing `AgentRuntime` business logic. |
| **N+1 query patterns** | Critical | QuickBooks sync (10,001 queries for 5,000 entities), Identity sync (2,001 queries for 1,000 users), connector listing (101 queries for 50 connectors). |
| **Zero code-splitting** | High | No `next/dynamic`, no `React.lazy`, no `Suspense` boundaries. Every page downloads the full application JS bundle. |
| **In-memory rate limiter** | Medium | Survives no process restarts. In multi-process or serverless deployments, rate limiting resets on cold start. |
| **Audit logger stubs** | Low | `getRecent()`, `getByType()`, `getByUser()`, `getStats()` return empty data. Prisma-backed methods work but facade has dead code paths. |

---

## 4. Security Review

### 4.1 Security Controls Inventory

| Control | Implementation | Status |
|---|---|---|
| **Authentication** | NextAuth v5, credentials provider, JWT 30-day | ✅ Strong |
| **Password Hashing** | bcrypt 12 rounds | ✅ Strong |
| **Account Lockout** | 5 attempts / 15 min window | ✅ Strong |
| **RBAC** | `GranularPermission` in PermissionRegistry | ✅ Strong |
| **Tenant Isolation** | `requireTenantContext()` on all queries | ✅ Strong |
| **Encryption** | AES-256-GCM with key rotation | ✅ Strong |
| **Audit Trail** | Hash-chained SHA-256 with tamper detection | ✅ Strong |
| **Rate Limiting** | Redis-backed + in-memory fallback | ⚠️ Partial |
| **CSRF Protection** | Origin validation + token headers | ⚠️ Weak |
| **Security Headers** | CSP, HSTS, X-Frame-Options, etc. | ⚠️ Partial |
| **Input Validation** | Zod on API inputs | ✅ Strong |
| **Secrets Validation** | 7 critical + 12 production-required | ✅ Strong |
| **Dependency Scanning** | Manual vulnerability map (empty) | ❌ No-op |

### 4.2 OWASP Top 10 Assessment

| OWASP Category | Status | Notes |
|---|---|---|
| **A01: Broken Access Control** | ⚠️ Partial | RBAC exists but no middleware gate; requests reach Server Components |
| **A02: Cryptographic Failures** | ✅ Strong | AES-256-GCM, bcrypt 12, JWT with secure cookies |
| **A03: Injection** | ✅ Strong | Prisma parameterized queries, Zod validation |
| **A04: Insecure Design** | ✅ Strong | Defense-in-depth, least privilege, immutable audit |
| **A05: Security Misconfiguration** | ⚠️ Partial | CSP allows `unsafe-inline`/`unsafe-eval` |
| **A06: Vulnerable Components** | ❌ Weak | Dependency scanner has no real vulnerability data |
| **A07: Auth Failures** | ✅ Strong | Lockout, 30-day sessions, account status checks |
| **A08: Data Integrity** | ✅ Strong | Hash-chained audit, no delete on financial records |
| **A09: Logging Failures** | ✅ Strong | Structured logging, audit chain, CSV export |
| **A10: SSRF** | ✅ Strong | Plaid connector validated, no arbitrary URL fetching |

### 4.3 Security Vulnerabilities

#### CRITICAL

1. **No Auth Middleware**  
   Server Components receive unauthenticated requests. The auth check happens inside each Server Component individually, not at the edge. This means:
   - Static assets and page shells are served before auth
   - Any Server Component that forgets an auth check is exposed
   - Performance penalty: every page does its own DB session lookup

2. **CSP `unsafe-inline` / `unsafe-eval`**  
   Content Security Policy includes `'unsafe-inline'` for scripts and `'unsafe-eval'`, which means:
   - XSS payloads can execute inline
   - Dynamic code evaluation is permitted
   - This contradicts the "Secure by Default" architecture principle

#### HIGH

3. **CSRF Token Comparison Not Constant-Time**  
   Token comparison uses `===` (JavaScript strict equality), which is vulnerable to timing side-channel attacks. Should use `crypto.timingSafeEqual()`.

4. **Dependency Scanner Empty**  
   `dependency-scanner.ts` has a `knownVulnerable` map that is empty by default. The scanner provides false confidence — it reports "no vulnerabilities" because nothing is in the database, not because the codebase is secure.

5. **2.25MB PNG Logo on Every Page**  
   Raw `<img>` tag loads a 2.25MB PNG on every page load. A 757-byte SVG already exists. This is both a performance and security concern (increased attack surface for image parsing).

#### MEDIUM

6. **Non-Standard CSRF Pattern**  
   Both CSRF token and "stored" token are sent in request headers (`x-csrf-token` and `x-csrf-stored`). Standard CSRF protection uses a cookie + header pattern where the stored token is never transmitted by the client.

7. **In-Memory Rate Limiter**  
   Rate limiting resets on process restart. In multi-process or serverless deployments, this provides no protection.

### 4.4 Security Strengths

- **AES-256-GCM encryption** with authenticated encryption, key rotation, and KMS abstraction
- **Hash-chained audit log** with SHA-256 integrity verification
- **Multi-tenant isolation** enforced at API, service, and query layers
- **Account lockout** with configurable thresholds and remaining-time disclosure
- **Secure cookies** with `__Secure-` prefix in production
- **Secrets validation** rejects known test/default values in production
- **CSP with nonce-based script loading** (when `unsafe-inline` is removed)

---

## 5. Governance Review

### 5.1 Constitution Hierarchy

| Priority | Document | Lines | Authority |
|---|---|---|---|
| 1 | GOVERNANCE_CONSTITUTION.md | 174 | Supreme — all decisions must comply |
| 2 | PRODUCT_CONSTITUTION.md | 191 | Product design principles |
| 3 | AUTONOMOUS_FINANCE_WORKFORCE.md | 567 | Agent behavior constraints |

### 5.2 Governance Constitution Assessment

**10 Core Principles** — all documented, all referenced in code review:
1. Enterprise Trust Above All ✅
2. Financial Correctness Before Features ✅
3. Security Before Convenience ✅
4. Trust Before Automation ✅
5. Audit Trail for Every Action ✅
6. Role-Based Access Everywhere ✅
7. Multi-Tenant Isolation Is Non-Negotiable ✅
8. Data Integrity Over Performance ✅
9. Backward Compatibility Is Sacred ✅
10. Documentation Is a Deliverable ✅

**6-Question Decision Framework** — documented but not enforced:
- Enterprise value justification
- Existing module extension check
- Complexity assessment
- Maintainability review
- Fortune 500 trust evaluation
- Hierarchy consistency check

### 5.3 AI Governance

**Hard Constraints** (from Autonomous Finance Workforce):
- AI never approves payments/transactions ✅
- AI never bypasses RBAC ✅
- AI never performs irreversible actions ✅
- AI never fabricates data ✅
- AI always explains reasoning with sources ✅
- AI includes confidence ratings ✅

### 5.4 ADR Status

- **30 ratified ADRs** in `docs/adr/`
- Coverage: authentication, error handling, monitoring, caching, i18n, forms, tables, charts, AI, security, API versioning
- All ADRs follow standard format (Title, Status, Context, Decision, Consequences)
- No superseded ADRs found — clean decision history

### 5.5 Governance Gaps

| Gap | Severity | Detail |
|---|---|---|
| **No automated enforcement** | High | Constitution rules depend entirely on human discipline. No lint rules, no CI gates, no pre-commit hooks enforce constitution compliance. |
| **No constitution versioning** | Medium | Constitutions have no version numbers, change dates, or amendment history. impossible to track when rules changed. |
| **No compliance dashboard** | Medium | No UI or API shows constitution compliance status. The 6-question framework is checked manually. |
| **Agent framework permissions unverified** | Low | API routes check `agents.manage` permission but it's unclear if this permission exists in the PermissionRegistry. |

---

## 6. UX & Design Review

### 6.1 Design System V2 Audit Scores

| Category | V1 | V2 | Target | Gap |
|---|---|---|---|---|
| Design System Foundation | 2 | 7 | 9 | +2 |
| Component Consistency | 3 | 5 | 8 | +3 |
| Navigation & IA | 4 | 7 | 9 | +2 |
| Accessibility (WCAG AA) | 3 | 5 | 8 | +3 |
| Loading & Perf UX | 5 | 6 | 8 | +2 |
| Form & Input UX | 4 | 5 | 8 | +3 |
| Table & Data Display | 3 | 5 | 8 | +3 |
| Dashboard Standardization | 3 | 6 | 9 | +3 |
| Motion & Micro-interactions | 6 | 7 | 8 | +1 |
| Documentation | 2 | 7 | 8 | +1 |
| **Overall** | **4.7** | **6.0** | **8.5** | **+2.5** |

### 6.2 Quantitative Gains (V1 → V2)

| Metric | Before | After | Change |
|---|---|---|---|
| Navigation sections | 30 | 7 | -77% |
| Navigation entries | 224 | 165 | -26% |
| Gold hex values | 3 | 1 | Unified `#d4af37` |
| Design token files | 0 | 13 | New |
| CSS custom properties | 0 | 70+ | New |
| Canonical components | 0 | 12 | New |
| Design system docs | 0 | 4 files (1,842 lines) | New |
| EnterpriseTable adoption | 1 | 5 | +400% |
| EnterpriseForm adoption | 6 | 9 | +50% |

### 6.3 Adoption Gap — The Core Problem

The design system infrastructure is well-built but barely used:

| Element | Raw HTML | Canonical Component | Adoption |
|---|---|---|---|
| `<button>` | 508 | `<Button>` | 24% |
| Card divs | 511 | `<Card>` | 34% |
| `<table>` | 103 | `<EnterpriseTable>` | 4.6% |
| `<input>` | ~215 unlabeled | `<EnterpriseField>` | <5% |
| `<skeleton>` | 45 | `<Skeleton>` | 39% |
| Design system imports | — | 12 / 1,130 files | **1.1%** |

### 6.4 Accessibility Violations

| Issue | Count | Severity |
|---|---|---|
| Unlabeled form inputs | ~215 | Critical — WCAG AA failure |
| Icon buttons without `aria-label` | 508 | High — screen reader broken |
| Missing `role="alert"` on errors | 7+ | Medium |
| Missing keyboard handlers on interactive divs | 6 | Medium |
| Missing `focus-visible` ring | Global | Fixed in Phase 15.0 |

### 6.5 What's Excellent

- **Navigation redesign**: 30 sections → 7 workflow-based sections. Cognitive load dramatically reduced.
- **Motion system**: 13 components with `framer-motion`, reduced-motion awareness, consistent durations/easings
- **Dashboard template**: 12 typed props, consistent layout across all domain dashboards
- **Documentation quality**: 1,842 lines of design system docs, accessibility guide, motion guide, navigation guide
- **Token architecture**: 70+ CSS custom properties with backward-compatible remapping

---

## 7. Enterprise Readiness Assessment

### 7.1 Feature Completeness

| Domain | Module | API Routes | Pages | Components | Status |
|---|---|---|---|---|---|
| Agent Framework | 11 services | 8 groups | 9 | 12 | ✅ Complete |
| CFO Advisor | ✅ | 12 | — | — | ✅ Complete |
| Reconciliation | ✅ | 14 | — | — | ✅ Complete |
| Controller | ✅ | 18 | — | — | ✅ Complete |
| Treasury | ✅ | 15 | 18 | — | ✅ Complete |
| Audit | ✅ | 16 | — | — | ✅ Complete |
| Compliance | ✅ | 14 | 15 | — | ✅ Complete |
| FP&A | ✅ | 15 | 17 | — | ✅ Complete |
| Tax | ✅ | 15 | 18 | — | ✅ Complete |
| Board Governance | ✅ | 14 | — | — | ✅ Complete |
| Executive Command Center | 6 services | 13 | 6 | — | ✅ Complete |

### 7.2 Infrastructure Readiness

| Component | Status | Notes |
|---|---|---|
| Multi-tenancy | ✅ | `companyId` on all entities, enforced at all layers |
| RBAC | ✅ | `GranularPermission`, role hierarchy, 50+ permission strings |
| Audit Trail | ✅ | Hash-chained SHA-256, tamper detection, CSV export |
| Rate Limiting | ⚠️ | Redis-backed with in-memory fallback; in-memory doesn't survive restarts |
| Caching | ✅ | LRU in-memory + Redis, tiered TTL, namespaced keys |
| Distributed Locks | ✅ | In-memory + Redis, hierarchical, exponential backoff |
| Queue System | ✅ | PgBoss, 8 default queues, dead-letter routing |
| Health Checks | ✅ | Readiness, liveness, circuit breaker, auto-reconnect |
| Observability | ✅ | Prometheus metrics, structured logging, OpenTelemetry bridge |
| Backup & Recovery | ✅ | Backup manager, restore manager, snapshot manager |
| CI/CD | ✅ | GitHub Actions (typecheck, lint, test, build, security, deploy) |
| Docker | ✅ | Multi-stage Dockerfile, docker-compose (dev + prod) |
| Kubernetes | ✅ | Deploy, ingress, secrets, HPA, PDB, network policies |

### 7.3 Missing Enterprise Features

| Feature | Priority | Notes |
|---|---|---|
| **SSO/SAML/OIDC** | Critical | Identity module exists but no SSO provider configured |
| **Real-time updates** | High | No WebSocket/SSE for agent status, approvals, alerts |
| **API versioning** | High | 194 routes under `/api/v1/` but no version negotiation |
| **Response compression** | Medium | No gzip/brotli on API responses |
| **ETag support** | Medium | No conditional GET on entity endpoints |
| **Read replicas** | Medium | All queries hit primary; no read/write splitting |
| **Offline support** | Low | No service worker, no offline queue |
| **Multi-language UI** | Low | `next-intl` installed but not integrated into components |

---

## 8. Risk Register

### Critical Risks

| ID | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| **C-01** | No auth middleware — unauthenticated requests reach Server Components | Data breach, compliance failure | High | Implement `middleware.ts` with edge auth check |
| **C-02** | CSP allows `unsafe-inline`/`unsafe-eval` — XSS exploitation | Data theft, session hijacking | Medium | Remove `unsafe-inline`, implement nonce-based CSP |
| **C-03** | N+1 queries in QuickBooks/Identity sync | 10,001+ DB calls per sync cycle | High | Batch queries with `findMany({ where: { id: { in: [...] } } })` |
| **C-04** | Zero code-splitting — full app bundle on every page | 3-5x bandwidth waste, slow TTI | High | Add `next/dynamic` for heavy components, `Suspense` boundaries |
| **C-05** | 1.1% design system adoption — 98.9% raw HTML | Inconsistent UX, accessibility violations | Medium | Systematic migration sprint (see Section 9) |

### High Risks

| ID | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| **H-01** | CSRF timing attack — `===` comparison | Token forgery via timing side-channel | Low | Replace with `crypto.timingSafeEqual()` |
| **H-02** | Dependency scanner empty | False security confidence | Medium | Integrate `npm audit` or Snyk in CI |
| **H-03** | 2.25MB PNG on every page | 99.97% bandwidth waste | High | Replace with SVG or optimize with `next/image` |
| **H-04** | No middleware auth gate | Each Server Component does own auth check | Medium | Edge middleware with JWT validation |
| **H-05** | Service layer bypass in tasks route | Business logic skipped on task creation | Low | Route through `AgentRuntime.createTask()` |

### Medium Risks

| ID | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| **M-01** | Constitution not versioned | Cannot track rule changes | Low | Add version + amendment history to constitution files |
| **M-02** | In-memory rate limiter restarts | Rate limiting resets on cold start | Medium | Always use Redis-backed rate limiter in production |
| **M-03** | No SSO/SAML/OIDC | Enterprise customers can't use their IdP | High | Implement SAML/OIDC providers in identity module |
| **M-04** | No real-time updates | Manual refresh for agent status, approvals | Medium | Add WebSocket or SSE for critical status changes |
| **M-05** | Audit logger stubs | Dead code paths in facade | Low | Remove stubs or implement with Prisma queries |

---

## 9. Prioritized Recommendations

### Critical (Fix Immediately)

1. **Implement Auth Middleware**  
   Create `src/middleware.ts` with edge-based JWT validation. All routes except `/api/auth/*`, `/login`, `/` should require valid session. This is the single most important security improvement.

2. **Fix CSP — Remove `unsafe-inline`/`unsafe-eval`**  
   Use nonce-based script loading (already partially implemented in `headers.ts`). Remove `'unsafe-inline'` and `'unsafe-eval'` from `script-src`. This closes the XSS attack vector.

3. **Fix N+1 Queries**  
   - QuickBooks sync: batch `findMany` with `id: { in: [...] }` instead of individual `findUnique`
   - Identity sync: same pattern
   - Connector listing: single query with `include` instead of N individual lookups

4. **Add Code-Splitting**  
   - Wrap heavy components in `next/dynamic` (analytics charts, rich text editors, large tables)
   - Add `Suspense` boundaries at route level for streaming
   - Lazy-load landing page components (13 client components for static content)

### High (Fix This Sprint)

5. **Replace 2.25MB PNG with SVG**  
   The 757-byte SVG already exists. Replace the `<img>` tag. Estimated 99.97% bandwidth reduction.

6. **Fix CSRF Timing Attack**  
   Replace `===` with `crypto.timingSafeEqual()` in `csrf.ts`. One-line change, eliminates timing side-channel.

7. **Integrate Real Dependency Scanner**  
   Add `npm audit` or Snyk scan to CI pipeline. Remove the empty `knownVulnerable` map. This eliminates false security confidence.

8. **Route Agent Tasks Through Service Layer**  
   Update `/api/agents/[id]/tasks/route.ts` to use `AgentRuntime.createTask()` instead of direct Prisma calls. Ensures audit recording, validation, and metrics tracking.

9. **Design System Migration Sprint**  
   Focus on highest-impact areas:
   - Replace 508 raw `<button>` with `<Button>` (24% → 80% adoption)
   - Replace 215 unlabeled inputs with `<EnterpriseField>` (accessibility fix)
   - Add `aria-label` to all 508 icon buttons

### Medium (Fix This Quarter)

10. **Version Constitutions**  
    Add version numbers, effective dates, and amendment history to all 3 constitution documents. Track changes via ADRs.

11. **Implement Real-Time Updates**  
    Add WebSocket or SSE for agent status changes, approval requests, and critical alerts. Currently requires manual page refresh.

12. **Add API Caching Headers**  
    Apply `Cache-Control` headers to all read-only API endpoints. Use tiered TTLs (15s for real-time data, 60s for reference data, 300s for static data).

13. **Implement Response Compression**  
    Enable gzip/brotli compression on API responses. Estimated 60-80% bandwidth reduction for JSON payloads.

14. **Add Read Replicas**  
    Split read queries to PostgreSQL read replicas. Reduce primary DB load by 50-70%.

### Low (Backlog)

15. **Implement SSO/SAML/OIDC**  
    Enterprise customers need SSO integration. The identity module exists but has no provider configuration.

16. **Offline Support**  
    Add service worker and offline action queue for mobile users. Low priority for desktop-first enterprise users.

17. **Multi-Language UI**  
    Complete `next-intl` integration for Arabic RTL and other languages. Infrastructure exists but components aren't wired.

---

## 10. Roadmap

### Sprint 1 (Immediate — This Week)

- [ ] Implement `src/middleware.ts` with edge auth
- [ ] Fix CSP — remove `unsafe-inline`/`unsafe-eval`
- [ ] Fix N+1 queries (QuickBooks, Identity, connectors)
- [ ] Replace 2.25MB PNG with SVG
- [ ] Fix CSRF timing attack (`crypto.timingSafeEqual`)

### Sprint 2 (Next Sprint)

- [ ] Add `next/dynamic` for heavy components
- [ ] Add `Suspense` boundaries at route level
- [ ] Integrate `npm audit` in CI
- [ ] Route agent tasks through service layer
- [ ] Design system migration — buttons and inputs

### Sprint 3 (This Quarter)

- [ ] Version all 3 constitutions
- [ ] Implement WebSocket/SSE for real-time updates
- [ ] Add API caching headers (18 read endpoints)
- [ ] Enable response compression
- [ ] Implement SAML/OIDC SSO

### Sprint 4 (Next Quarter)

- [ ] PostgreSQL read replicas
- [ ] Design system migration — tables and cards
- [ ] Offline support (service worker)
- [ ] Multi-language UI integration
- [ ] Performance monitoring dashboard

---

*This review is based on codebase analysis as of July 2026. All findings are documented in good faith and should be validated against production deployment before prioritization.*
