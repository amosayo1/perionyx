---
title: "Architectural Risk Register — Phase 25.5"
created: 2026-07-27
updated: 2026-07-27
tags: [type/risk-register, domain/architecture, status/complete]
owner: Architecture Team
phase: "25.5"
---

# Architectural Risk Register — Phase 25.5

## 1. Executive Summary

This register catalogs 20 architectural risks identified across 7 parallel review workstreams (WS1-WS10). Risks are ranked by severity (Critical/High/Medium/Low) and prioritized (P0-P3) with estimated remediation effort.

**Summary**:
- **Critical**: 4 risks (2 require immediate action — < 1 day)
- **High**: 11 risks (6-8 weeks total remediation)
- **Medium**: 5 risks (8-9 weeks total remediation)
- **Total Estimated Remediation**: 38-48 person-weeks

| Priority | Count | Effort Range | Deadline |
|---|---|---|---|
| P0 | 4 | 1 hour – 12 weeks | This sprint |
| P1 | 11 | 2 hours – 6 weeks | 1-2 months |
| P2 | 5 | 1 week – 3 weeks | 2-4 months |
| **Total** | **20** | **38-48 weeks** | |

---

## 2. Risk Register

### R-01 — In-Memory Stores Cause Data Loss on Restart

| Field | Value |
|---|---|
| **ID** | R-01 |
| **Severity** | 🔴 Critical |
| **Source** | WS1 Finding-04, WS10 P0 |
| **Description** | 6+ modules store business rules, approval matrices, schedules, and templates in JavaScript `Map` objects. All data is lost on server restart. |
| **Evidence** | `business-rules-builder.ts` uses `Map<string, BusinessRule>`. `approval-matrix-evaluator.ts` uses `Map<string, ApprovalMatrixRule>`. `automation-scheduler.ts` uses `Map<string, AutomationSchedule>`. `template-library.ts` uses `Map<string, WorkflowTemplate>`. Zero Prisma models for these entities. Zero persistence adapters. |
| **Impact** | All business data ephemeral. Approval matrices governing financial workflows reset on every deployment. In production, this means every restart erases configuration that controls who can approve payments, what rules govern invoice matching, and what schedules trigger automations. |
| **Likelihood** | Certain — data loss occurs on every restart |
| **Mitigation** | Wire in-memory stores to Prisma persistence layer. Create 4 Prisma models (BusinessRule, ApprovalMatrixRule, AutomationSchedule, WorkflowTemplate). Implement repository pattern following AP domain precedent. |
| **Priority** | P0 |
| **Effort** | 8-12 weeks |
| **Dependencies** | Prisma schema design, migration, repository implementation, UI form updates |
| **Related Risks** | R-02 (foundation not adopted), R-07 (schema changes) |
| **Owner** | Platform Team |
| **Target Date** | Phase 26 |

---

### R-02 — Foundation Platform Zero Adoption

| Field | Value |
|---|---|
| **ID** | R-02 |
| **Severity** | 🔴 Critical |
| **Source** | WS1 Finding-01, WS2 |
| **Description** | ~2,500 lines of foundational infrastructure (ProviderDriver, RuntimeContext, PersistenceAbstraction, CapabilityRegistry, SecretManager, ConfigurationRegistry, ClassificationRegistry) have zero consumers across the entire codebase. |
| **Evidence** | `src/server/foundation/provider-runtime/driver.ts` — 0 imports. `src/runtime/context/runtime-context.ts` — 0 `withRuntimeContext` calls. `src/server/persistence/` (31 files) — 0 adapter consumers. `src/server/foundation/capability-registry/` — 0 registrations. All built in Phases 24.0 and 24.0B. |
| **Impact** | ~1,500+ lines of dead code creating false architectural confidence. Constitution claims "every platform uses ProviderDriver" but zero do. Maintenance burden without usage benefit. Future wiring will encounter unknown integration issues. |
| **Likelihood** | Certain — code exists with zero consumers |
| **Mitigation** | **Option A (Preferred)**: Wire RuntimeContext into request pipeline (`proxy.ts` → route handlers) and migrate 3-5 services to ProviderDriver. Proves value in 3-4 weeks. **Option B**: Delete foundation code. Removes dead code but loses investment. **Option C**: Mark as "architectural seed" with explicit TODOs and acceptance criteria. |
| **Priority** | P0 |
| **Effort** | 3-4 weeks (Option A) |
| **Dependencies** | Request pipeline modification, service migration plan |
| **Related Risks** | R-01 (persistence also unwired) |
| **Owner** | Architecture Team |
| **Target Date** | Phase 26 |

---

### R-03 — Broken Webhook Signature Verification

| Field | Value |
|---|---|
| **ID** | R-03 |
| **Severity** | 🔴 Critical |
| **Source** | WS4 C-1 |
| **Description** | The `verifyWebhookSignature` function has a code path that bypasses signature verification, allowing spoofed webhook events to be accepted as valid. |
| **Evidence** | `verifyWebhookSignature` in webhook handler has conditional logic that returns `true` when signature is missing or malformed. Any caller can send a webhook without a valid signature and it will be processed. |
| **Impact** | Spoofed events could trigger financial actions — invoice approvals, payment initiations, balance updates. An attacker could fabricate a webhook from a bank integration to show a false balance, or trigger a payment approval. |
| **Likelihood** | Medium — requires attacker knowledge of webhook endpoint URLs |
| **Mitigation** | Fix `verifyWebhookSignature` to reject requests with missing or invalid signatures. Add rate limiting to webhook endpoints. Log all rejected signatures for monitoring. |
| **Priority** | P0 |
| **Effort** | 1 hour |
| **Dependencies** | None |
| **Related Risks** | None |
| **Owner** | Security Team |
| **Target Date** | Immediate |

---

### R-04 — Plaintext Passwords in Identity Module

| Field | Value |
|---|---|
| **ID** | R-04 |
| **Severity** | 🔴 Critical |
| **Source** | WS4 C-2 |
| **Description** | The identity module stores user passwords in plaintext or with inadequate hashing. Some code paths compare passwords without constant-time comparison. |
| **Evidence** | Identity module `local.ts` adapter stores passwords without bcrypt/argon2 hashing. Password comparison in some paths uses `===` instead of `crypto.timingSafeEqual()`. MFA recovery codes use SHA-256 (acceptable) but primary passwords do not. |
| **Impact** | Database compromise exposes all user passwords. Lateral movement risk — users reuse passwords across services. Compliance violation (SOC 2, PCI DSS, GDPR). |
| **Likelihood** | High — plaintext passwords are trivially extractable from database dumps |
| **Mitigation** | Delete plaintext password storage. Migrate to bcrypt (cost factor 12) or argon2id. Update all password comparison paths to use timing-safe comparison. Force password reset for all existing users. |
| **Priority** | P0 |
| **Effort** | 2 hours |
| **Dependencies** | Password reset flow must exist |
| **Related Risks** | R-11 (OWNER bypass) |
| **Owner** | Security Team |
| **Target Date** | Immediate |

---

### R-05 — 763 `as any` Assertions Undermine Type Safety

| Field | Value |
|---|---|
| **ID** | R-05 |
| **Severity** | 🟠 High |
| **Source** | WS1 Finding-10 |
| **Description** | 763 `as any` type assertions across 340+ files erode TypeScript's type safety guarantees. While some are necessary (Prisma raw queries, third-party APIs), the volume suggests insufficient type narrowing utilities. |
| **Evidence** | `rg --count "as any" --include="*.ts" --include="*.tsx"` returns 763 matches. Top offenders: Prisma query results (~180), third-party API responses (~120), legacy form components (~90), workflow engine (~60), miscellaneous (~313). |
| **Impact** | Runtime type errors possible. Debugging time increased. Refactoring risk elevated — `as any` hides type mismatches until runtime. |
| **Likelihood** | High — 763 escape hatches statistically guarantee type errors |
| **Mitigation** | Create `PrismaResult<T>` helper type for raw queries. Create API response type templates for Plaid, banking, AI providers. Budget 50 fixes per sprint. Target: < 200 within 6 months. |
| **Priority** | P1 |
| **Effort** | 3 weeks |
| **Dependencies** | None |
| **Related Risks** | None |
| **Owner** | Platform Team |
| **Target Date** | Phase 27 |

---

### R-06 — Duplicate Workflow Engines

| Field | Value |
|---|---|
| **ID** | R-06 |
| **Severity** | 🟠 High |
| **Source** | WS1 Finding-05 |
| **Description** | Two workflow engine implementations exist: primary `WorkflowEngine` (singleton) and deprecated `OrchestrationExecutionEngine` (static). They use different Prisma tables and have incompatible APIs. |
| **Evidence** | `src/modules/workflow/engine.ts` (primary, singleton). `src/modules/orchestration/workflow-engine.ts` (deprecated, static, renamed in Phase 18.1A). 3 consumers still reference orchestration engine. Different Prisma tables: `WorkflowInstance` vs orchestration-specific tables. |
| **Impact** | Two systems can create conflicting workflow state. Developers confused about which engine to use. Maintenance burden doubled. |
| **Likelihood** | Medium — deprecated engine still has active consumers |
| **Mitigation** | Migrate 3 remaining consumers to primary engine. Delete orchestration module. Remove deprecated Prisma tables. |
| **Priority** | P1 |
| **Effort** | 2 weeks |
| **Dependencies** | Consumer migration, Prisma migration |
| **Related Risks** | R-01 (both use in-memory state) |
| **Owner** | Workflow Team |
| **Target Date** | Phase 26 |

---

### R-07 — Company Model is 346-Field God Object

| Field | Value |
|---|---|
| **ID** | R-07 |
| **Severity** | 🟠 High |
| **Source** | WS5 C1 |
| **Description** | The `Company` Prisma model has 346 fields spanning identity, treasury, banking, ERP, accounting, compliance, and UI preferences. Schema changes to this model cascade to all 389 models via foreign keys. |
| **Evidence** | `Company` model in `schema.prisma` spans ~400 lines. Fields include: identity (name, domain, logo), treasury (cash position, limits), banking (plaid tokens, account mappings), ERP (quickbooks sync, sap config), accounting (fiscal year, tax settings), compliance (SOX, PCI), UI (theme, language). 389 models reference Company via `companyId`. |
| **Impact** | Any schema change to Company (adding a field, changing a type, modifying an index) triggers a migration affecting all 389 models' foreign key constraints. Deployment risk elevated. |
| **Likelihood** | High — Company model changes frequently as new features are added |
| **Mitigation** | Split into focused sub-models: `CompanyIdentity`, `CompanyTreasury`, `CompanyBanking`, `CompanyERP`, `CompanyCompliance`. Keep `Company` as slim identity record. Use composition over monolith. |
| **Priority** | P1 |
| **Effort** | 2 weeks |
| **Dependencies** | Prisma migration, 100+ file updates for `company.X` field access |
| **Related Risks** | R-09 (soft delete needs model split) |
| **Owner** | Data Architecture Team |
| **Target Date** | Phase 27 |

---

### R-08 — 68 Math.round Calls Bypass financialRound

| Field | Value |
|---|---|
| **ID** | R-08 |
| **Severity** | 🟠 High |
| **Source** | WS5 C2 |
| **Description** | 68 `Math.round()` calls in financial code paths bypass the `financialRound()` helper that implements banker's rounding (round half to even). This introduces systematic rounding bias. |
| **Evidence** | `rg "Math\.round" --include="*.ts" src/` returns 68 matches in financial domains. `financialRound()` in `src/lib/financial-precision.ts` implements banker's rounding via `Intl.NumberFormat`. Phase 19.1 migrated some but not all. |
| **Impact** | Rounding bias in financial calculations. Over large transaction volumes, systematic rounding error compounds. Audit findings for financial precision. |
| **Likelihood** | High — 68 instances actively used in production calculations |
| **Mitigation** | Systematic sweep: replace all `Math.round(n * 100) / 100` with `financialRound(n, 2)`. ESLint rule to flag `Math.round` in financial domains. |
| **Priority** | P1 |
| **Effort** | 1 week |
| **Dependencies** | ESLint rule creation, codebase sweep |
| **Related Risks** | None |
| **Owner** | Financial Integrity Team |
| **Target Date** | Phase 26 |

---

### R-09 — Zero Soft Delete on Financial Models

| Field | Value |
|---|---|
| **ID** | R-09 |
| **Severity** | 🟠 High |
| **Source** | WS5 C3 |
| **Description** | Financial models (invoices, payments, journal entries, bank transactions) use hard delete — physical row removal. This destroys audit history and makes regulatory compliance impossible. |
| **Evidence** | `delete()` methods on financial repositories call `prisma.invoice.delete()`, `prisma.payment.delete()`, etc. No `deletedAt` field on any financial model. No soft delete middleware in Prisma. AP audit entity (`ProcurementAPAuditRecord`) is append-only (good) but other financial models are not. |
| **Impact** | Physical deletion destroys audit history. SOC 2 and PCI DSS require audit trails for all financial data. Regulatory examination finding. |
| **Likelihood** | High — any delete operation on financial data is irreversible |
| **Mitigation** | Add `deletedAt DateTime?` to critical financial models. Create Prisma middleware for soft delete. Update all `delete()` calls to `update({ deletedAt: new Date() })`. |
| **Priority** | P1 |
| **Effort** | 1 week |
| **Dependencies** | Prisma schema update, middleware creation, repository updates |
| **Related Risks** | R-07 (Company model split affects financial models) |
| **Owner** | Data Architecture Team |
| **Target Date** | Phase 26 |

---

### R-10 — API Keys Hardcoded to ADMIN Role

| Field | Value |
|---|---|
| **ID** | R-10 |
| **Severity** | 🟠 High |
| **Source** | WS4 H-2 |
| **Description** | API key authentication resolves all keys to ADMIN role, regardless of the key's intended permissions. A compromised API key grants unrestricted admin access. |
| **Evidence** | API key validation in auth middleware sets `role: 'ADMIN'` for all valid keys. No per-key role resolution. No key-scoped permission checking. Permission registry has 64 permissions but API keys bypass them all. |
| **Impact** | Compromised API key = full admin access. No principle of least privilege for API integrations. |
| **Likelihood** | Medium — requires API key compromise |
| **Mitigation** | Resolve actual role from API key record. Add `role` field to API key model. Validate key permissions against requested endpoint. |
| **Priority** | P1 |
| **Effort** | 4 hours |
| **Dependencies** | Prisma schema update (API key model) |
| **Related Risks** | R-04 (plaintext passwords), R-11 (OWNER bypass) |
| **Owner** | Security Team |
| **Target Date** | Phase 26 |

---

### R-11 — OWNER Bypass Skips All Permission Checks

| Field | Value |
|---|---|
| **ID** | R-11 |
| **Severity** | 🟠 High |
| **Source** | WS4 H-3 |
| **Description** | Users with OWNER role bypass all permission checks via a hard-coded early return. This creates an unpredictable permission model where OWNER users can perform any action, including destructive operations. |
| **Evidence** | `requirePermission()` function has `if (role === 'OWNER') return true` before any permission lookup. No OWNER-specific permission set defined. No audit logging for OWNER actions. |
| **Impact** | Unpredictable permission model. OWNER users can accidentally or maliciously perform destructive operations. Audit trail incomplete — OWNER actions not logged with specific permissions. |
| **Likelihood** | High — OWNER role exists and bypass is always active |
| **Mitigation** | Define explicit OWNER permission set (most permissions, but not all — e.g., exclude `system.delete`). Log all OWNER actions with specific permission names. Remove blanket bypass. |
| **Priority** | P1 |
| **Effort** | 1 day |
| **Dependencies** | Permission set definition, audit logging |
| **Related Risks** | R-10 (API keys also bypass) |
| **Owner** | Security Team |
| **Target Date** | Phase 26 |

---

### R-12 — Unauthenticated Health Endpoints Leak Details

| Field | Value |
|---|---|
| **ID** | R-12 |
| **Severity** | 🟠 High |
| **Source** | WS4 H-1 |
| **Description** | Health and readiness endpoints return infrastructure details (database errors, memory usage, uptime, Node.js version) without authentication. |
| **Evidence** | `/api/health` and `/api/ready` endpoints return full system status including DB connection errors, memory consumption, process uptime, and Node.js version. Phase 17.2 partially fixed `/api/health` to return only `{ status, ready, live }` but `/api/ready` and other diagnostic endpoints still leak. |
| **Impact** | Infrastructure information exposed to unauthenticated users. Aids reconnaissance for targeted attacks. |
| **Likelihood** | High — endpoints are publicly accessible |
| **Mitigation** | Gate detailed health behind authentication. Return only `{ status: "ok" }` for unauthenticated requests. Detailed diagnostics available to ADMIN role only. |
| **Priority** | P1 |
| **Effort** | 2 hours |
| **Dependencies** | None |
| **Related Risks** | None |
| **Owner** | Security Team |
| **Target Date** | Immediate |

---

### R-13 — SSO/SAML is Completely Stubbed

| Field | Value |
|---|---|
| **ID** | R-13 |
| **Severity** | 🟠 High |
| **Source** | WS7 Identity |
| **Description** | SSO, SAML, and OIDC integration points are defined in the identity module but have zero real implementation. All SSO methods return stub responses. |
| **Evidence** | `src/server/identity/sso-handler.ts` has method signatures for SAML assertion parsing, OIDC token exchange, and SCIM provisioning — all return hardcoded success responses. No SAML library installed. No OIDC client configured. |
| **Impact** | Enterprise pilots fail immediately. Every enterprise customer requires SSO integration (Okta, Azure AD, Google Workspace). This is a hard blocker for any enterprise sale. |
| **Likelihood** | High — SSO is required by all enterprise customers |
| **Mitigation** | Implement real SAML 2.0 SP using `@node-saml/passport-saml`. Implement OIDC flow using `openid-client`. Configure for at least one IdP (Okta or Azure AD). |
| **Priority** | P1 |
| **Effort** | 4-6 weeks |
| **Dependencies** | Identity module refactoring, IdP test account |
| **Related Risks** | R-04 (password storage), R-11 (OWNER bypass) |
| **Owner** | Identity Team |
| **Target Date** | Phase 27 |

---

### R-14 — Storage Integration Has Zero Code

| Field | Value |
|---|---|
| **ID** | R-14 |
| **Severity** | 🟠 High |
| **Source** | WS7 Storage |
| **Description** | File storage abstraction is defined (interface + types) but has zero implementation. No S3, GCS, or Azure Blob adapter exists. |
| **Evidence** | `src/server/storage/` has interface definitions and type files (~200 lines total). No actual storage provider implementation. No upload/download/delete methods. No file metadata tracking. |
| **Impact** | No file upload capability. No document storage. No export functionality. Blocks AP invoice processing (R-15), report generation, and any feature requiring file I/O. |
| **Likelihood** | High — file storage is needed by multiple features |
| **Mitigation** | Implement S3-compatible adapter (works with AWS S3, MinIO, Cloudflare R2). Add file metadata to Prisma. Wire into API routes for upload/download. |
| **Priority** | P1 |
| **Effort** | 3-4 weeks |
| **Dependencies** | S3 bucket configuration, Prisma schema update |
| **Related Risks** | R-15 (documents depends on storage) |
| **Owner** | Infrastructure Team |
| **Target Date** | Phase 27 |

---

### R-15 — Documents Integration Has Zero Code

| Field | Value |
|---|---|
| **ID** | R-15 |
| **Severity** | 🟠 High |
| **Source** | WS7 Documents |
| **Description** | Document management for invoices, receipts, statements, and compliance artifacts has zero implementation. AP cannot process invoice PDFs. |
| **Evidence** | No document models in Prisma. No document service. No OCR integration. No document lifecycle (upload → classify → extract → attach → archive). Zero lines of code. Score: 0.1/10. |
| **Impact** | AP cannot process invoice PDFs — core AP workflow broken. No document audit trail. No compliance document retention. |
| **Likelihood** | High — AP workflow requires document processing |
| **Mitigation** | Implement Document model in Prisma. Create document lifecycle service. Integrate with storage layer (R-14). Add OCR stub for future extraction. |
| **Priority** | P1 |
| **Effort** | 4-6 weeks |
| **Dependencies** | R-14 (storage), Prisma schema, OCR provider selection |
| **Related Risks** | R-14 (storage prerequisite) |
| **Owner** | AP Team |
| **Target Date** | Phase 28 |

---

### R-16 — Data Classification Has Zero Enforcement

| Field | Value |
|---|---|
| **ID** | R-16 |
| **Severity** | 🟡 Medium |
| **Source** | WS3 Law 13 |
| **Description** | Data classification levels (11 defined in `ClassificationRegistry`) have zero enforcement. PII and PCI data flows through the same code paths as public data with no protection differentiation. |
| **Evidence** | `ClassificationRegistry` defines 11 levels with labels and handling rules. Zero middleware checks classification before processing. Zero logging of classified data access. Zero encryption differentiation by classification level. |
| **Impact** | PII/PCI data unprotected. Classification labels are decorative. SOC 2 and GDPR compliance requires data classification enforcement. |
| **Likelihood** | Medium — no current breach, but protection gap exists |
| **Mitigation** | Wire classification into API middleware. Add `@Classified(level)` decorator to sensitive endpoints. Implement data access logging for classified data. Add encryption-by-classification for PII/PCI. |
| **Priority** | P2 |
| **Effort** | 3 weeks |
| **Dependencies** | Middleware framework, logging infrastructure |
| **Related Risks** | R-09 (soft delete), R-04 (password storage) |
| **Owner** | Security Team |
| **Target Date** | Phase 28 |

---

### R-17 — Optimistic Locking Missing from Financial Aggregates

| Field | Value |
|---|---|
| **ID** | R-17 |
| **Severity** | 🟡 Medium |
| **Source** | WS5 H1 |
| **Description** | Financial aggregates (invoices, payments, journal entries) lack optimistic locking (`version` fields). Concurrent edits can silently overwrite each other. |
| **Evidence** | AP domain models have `version Int @default(0)` (good), but other financial models (GL entries, treasury positions, bank transactions) have no version field. No Prisma middleware for version checking. |
| **Impact** | Lost updates on concurrent edits. Financial data corruption possible in high-concurrency scenarios. |
| **Likelihood** | Medium — concurrent edits rare but possible in multi-user environments |
| **Mitigation** | Add `version Int @default(0)` to critical financial models. Implement Prisma middleware for version check on update. Return 409 Conflict on version mismatch. |
| **Priority** | P2 |
| **Effort** | 1 week |
| **Dependencies** | Prisma schema update, middleware creation |
| **Related Risks** | R-07 (Company model split) |
| **Owner** | Data Architecture Team |
| **Target Date** | Phase 28 |

---

### R-18 — No Data Retention/Archival Policy

| Field | Value |
|---|---|
| **ID** | R-18 |
| **Severity** | 🟡 Medium |
| **Source** | WS5 H2 |
| **Description** | No data retention or archival policy exists. Tables grow unbounded. Audit logs, transaction history, and notification logs accumulate indefinitely. |
| **Evidence** | Zero retention configuration in codebase. No archival jobs. No TTL on any Prisma model. Notification logs, audit records, and transaction history grow linearly with usage. |
| **Impact** | Unbounded table growth degrades query performance. Storage costs increase. GDPR right-to-erasure compliance impossible without deletion/archival mechanism. |
| **Likelihood** | Medium — growth is gradual but certain |
| **Mitigation** | Define retention policy per entity type (e.g., audit: 7 years, notifications: 90 days, sessions: 30 days). Implement archival job (move to cold storage). Add TTL to non-critical models. |
| **Priority** | P2 |
| **Effort** | 2 weeks |
| **Dependencies** | Retention policy definition, archival storage (R-14), PgBoss job scheduling |
| **Related Risks** | R-14 (storage needed for archival), R-09 (soft delete needed first) |
| **Owner** | Data Architecture Team |
| **Target Date** | Phase 29 |

---

### R-19 — No E2E Workflow Tests

| Field | Value |
|---|---|
| **ID** | R-19 |
| **Severity** | 🟡 Medium |
| **Source** | WS10 P1 |
| **Description** | Zero end-to-end tests for critical financial workflows. Cannot validate that invoice → approval → payment → GL posting works correctly as an integrated flow. |
| **Evidence** | No Playwright or Cypress tests. No workflow integration tests spanning multiple services. AP workflow tests (87) are service-level, not end-to-end. Critical path (CRM → Invoice → Payment → GL) has no test coverage. |
| **Impact** | Cannot validate critical financial paths work correctly. Regressions in workflow integration go undetected until production. |
| **Likelihood** | High — integration bugs are the most common production incidents |
| **Mitigation** | Write Playwright E2E tests for 5 critical workflows: (1) Invoice lifecycle, (2) Payment approval, (3) Bank reconciliation, (4) Vendor onboarding, (5) Month-end close. |
| **Priority** | P2 |
| **Effort** | 2 weeks |
| **Dependencies** | Playwright setup, test database seeding |
| **Related Risks** | R-01 (in-memory stores affect test reliability) |
| **Owner** | QA Team |
| **Target Date** | Phase 28 |

---

### R-20 — Test Suite Timeout (>180s)

| Field | Value |
|---|---|
| **ID** | R-20 |
| **Severity** | 🟡 Medium |
| **Source** | WS9 |
| **Description** | Full test suite takes >180 seconds to complete, slowing developer iteration and CI/CD pipeline. |
| **Evidence** | `pnpm test` runs 443 tests across 18 suites in ~180-200 seconds. Most time spent on Prisma integration tests and in-memory store setup/teardown. |
| **Impact** | Slow developer iteration. CI/CD pipeline delay. Developers skip test runs, reducing test discipline. |
| **Likelihood** | Medium — test time grows with each new test suite |
| **Mitigation** | Create fast test profile (`pnpm test:fast`) that excludes integration and Prisma tests (~60s). Parallelize test suites. Use in-memory database for integration tests. |
| **Priority** | P2 |
| **Effort** | 1 week |
| **Dependencies** | Vitest configuration, test database setup |
| **Related Risks** | None |
| **Owner** | QA Team |
| **Target Date** | Phase 27 |

---

## 3. Summary by Severity

| Severity | Count | Risks |
|---|---|---|
| 🔴 Critical | 4 | R-01, R-02, R-03, R-04 |
| 🟠 High | 11 | R-05, R-06, R-07, R-08, R-09, R-10, R-11, R-12, R-13, R-14, R-15 |
| 🟡 Medium | 5 | R-16, R-17, R-18, R-19, R-20 |
| **Total** | **20** | |

## 4. Summary by Priority

| Priority | Count | Effort | Deadline |
|---|---|---|---|
| P0 | 4 | 1h + 2h + 4h + 8-12w | This sprint |
| P1 | 11 | 4h + 1d + 2w + 3w + 4-6w + 3-4w + 4-6w | 1-2 months |
| P2 | 5 | 1w + 2w + 3w + 2w + 1w | 2-4 months |
| **Total** | **20** | **38-48 person-weeks** | |

## 5. Risk Heat Map

```
Impact ↑
  High   │ R-01 R-02 │ R-05 R-07 R-08 R-09 R-10 R-13 R-14 R-15 │ R-16 R-17 R-19 │
  Medium │ R-03 R-04 │ R-06 R-11 R-12                         │ R-18 R-20      │
  Low    │           │                                         │                │
         └───────────┴─────────────────────────────────────────┴────────────────┘
              Certain       High              Medium           Low        Likelihood →
```

## 6. Remediation Timeline

```
Week 1:  R-03 (1h), R-04 (2h), R-12 (2h), R-10 (4h), R-11 (1d)
Week 2:  R-08 (1w), R-09 (1w), R-20 (1w), R-17 (1w)
Week 3:  R-05 (3w begins), R-06 (2w begins)
Week 4:  R-05 continues, R-06 completes
Week 5:  R-05 completes, R-02 (3-4w begins)
Week 6:  R-02 continues, R-14 (3-4w begins)
Week 7:  R-02 completes, R-14 continues
Week 8:  R-14 completes, R-18 (2w begins), R-19 (2w begins)
Week 9:  R-18 continues, R-19 continues
Week 10: R-18 completes, R-19 completes
Week 11: R-16 (3w begins), R-07 (2w begins)
Week 12: R-16 continues, R-07 completes
Week 13: R-16 completes
Week 14-19: R-13 (4-6w), R-15 (4-6w) — can run in parallel
Week 20-31: R-01 (8-12w) — largest single effort
```

## 7. Governance

### Review Cadence

- **Weekly**: P0 risks reviewed in architecture standup
- **Bi-weekly**: P1 risks reviewed in sprint planning
- **Monthly**: Full register reviewed by Architecture Board
- **Quarterly**: Risk re-assessment against new findings

### Escalation Path

1. Risk owner identifies mitigation blocker
2. Escalate to Architecture Team Lead
3. If unresolved in 48h, escalate to CTO
4. Critical risks with no mitigation path → emergency architecture review

### Risk Retirement

A risk is retired when:
1. Mitigation is complete AND verified
2. Evidence of remediation is documented
3. No regression detected in subsequent sprints
4. Risk owner signs off retirement

---

## 8. Appendix: Source Workstreams

| Workstream | Scope | Risks Contributed |
|---|---|---|
| WS1 | Architecture Review | R-01, R-02, R-05, R-06 |
| WS2 | Foundation Audit | R-02 |
| WS3 | Constitution Compliance | R-16 |
| WS4 | Security Audit | R-03, R-04, R-10, R-11, R-12 |
| WS5 | Data Architecture | R-07, R-08, R-09, R-17, R-18 |
| WS7 | Platform Completeness | R-13, R-14, R-15 |
| WS9 | Performance | R-20 |
| WS10 | Testing | R-01, R-19 |
