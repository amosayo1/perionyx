# Architectural Debt Register

**Phase**: 23.1 — Constitutional Validation
**Date**: 2026-07-24

---

## Summary

This register captures all architectural debt found during Constitutional validation — violations, gaps, and shortcuts that create future risk. Each item has a root cause, impact, risk, recommended fix, priority, and estimated effort.

---

## Critical Debt (Must Fix)

### DEBT-001: Data Classification Not Implemented (Law 13)

- **Root Cause**: Law 13 was written as aspirational but never implemented
- **Impact**: Cannot enforce tiered security, retention, or PII handling. All data treated identically regardless of sensitivity.
- **Risk**: Compliance failure (SOC 2, GDPR, PCI DSS). Regulatory fines. Data breach liability.
- **Fix**: Create `DataClassification` enum (Public, Internal, Confidential, Restricted, Regulated). Add to Prisma schema. Wire into access control, encryption, retention policies.
- **Priority**: P0 — Compliance blocker
- **Effort**: 3-4 weeks

### DEBT-002: Audit Trail Not Persisted (AP Domain)

- **Root Cause**: `AuditEntry` objects created by all 7 AP services but never written to `ProcurementAPAuditRecord` table
- **Impact**: No audit trail despite correct schema and entry creation. Audit records exist only in memory within command results.
- **Risk**: Compliance failure. Cannot demonstrate audit trail to auditors. Tamper-evident design is theoretical.
- **Fix**: Add post-command middleware or extend UnitOfWork to persist `CommandResult.auditEntries` to `ProcurementAPAuditRecord`.
- **Priority**: P0 — Compliance blocker
- **Effort**: 1 week

### DEBT-003: tick.service.ts Imports PlaidService (Law 1)

- **Root Cause**: Business domain service directly imports provider-specific service instead of using ConnectorPlatform
- **Impact**: Tick scheduler coupled to Plaid API. If Plaid changes or is replaced, tick service breaks.
- **Risk**: Provider lock-in. Unnecessary coupling. Law 1 violation.
- **Fix**: Replace `PlaidService.syncBalance()` call with ConnectorPlatform orchestrator's `syncData()` method.
- **Priority**: P1 — Law compliance
- **Effort**: 2 hours

---

## High Debt (Should Fix)

### DEBT-004: 12/15 Platforms Lack Contract Interfaces (Law 3)

- **Root Cause**: Contracts were documented in CAPABILITY_CONTRACTS.md but not implemented as TypeScript interfaces
- **Impact**: Cannot swap implementations, cannot test in isolation, cannot compose platforms safely.
- **Risk**: Vendor lock-in for most platforms. Test isolation impossible. Future refactoring becomes high-risk.
- **Fix**: Define `I{Platform}Contract` for each platform. Create contract registry.
- **Priority**: P1 — Architectural
- **Effort**: 3-4 weeks

### DEBT-005: 13/15 Platforms Emit No Metrics (Laws 5, 8)

- **Root Cause**: Metrics infrastructure exists but platform-specific metrics were never registered
- **Impact**: Blind in production for Identity, AI, Workflow, Audit, AP, Notification, Search platforms.
- **Risk**: Cannot assess health, latency, throughput. Performance issues undetectable.
- **Fix**: Register platform-specific metrics in observability layer.
- **Priority**: P1 — Operational
- **Effort**: 2-3 weeks

### DEBT-006: WorkflowEngine Singleton (Law 10)

- **Root Cause**: Engine implemented as singleton class (847 lines) without interface abstraction
- **Impact**: Not replaceable, hard to test in isolation, no dependency injection.
- **Risk**: Workflow platform cannot evolve independently. Testing requires full engine.
- **Fix**: Extract `IWorkflowEngine` interface. Convert singleton to injectable service.
- **Priority**: P1 — Architectural
- **Effort**: 2 weeks

### DEBT-007: In-Memory Identity Store

- **Root Cause**: Identity platform built with in-memory stores for Phase 1
- **Impact**: User data, sessions, permissions lost on process restart. Cannot integrate external IdPs.
- **Risk**: Data loss in production. Cannot pass security audit.
- **Fix**: Migrate to Prisma-backed persistence. Add SAML/OIDC adapters.
- **Priority**: P1 — Security
- **Effort**: 3 weeks

### DEBT-008: AP Idempotency In-Memory

- **Root Cause**: Idempotency store uses `Map` instead of Redis
- **Impact**: Idempotency keys lost on restart. Not shared across instances in multi-instance deployment.
- **Risk**: Duplicate mutations possible after restart or in scaled deployment.
- **Fix**: Migrate to `CacheManager` from `src/server/cache/` (Redis-backed).
- **Priority**: P1 — Production safety
- **Effort**: 2 days

### DEBT-009: Duplicate Detection Native Arithmetic (Law 6)

- **Root Cause**: `duplicate-detection.service.ts:37` uses `Math.abs(a - b)` on monetary amounts
- **Impact**: Potential precision loss on very large amounts (beyond Number.MAX_SAFE_INTEGER edge case).
- **Risk**: Low — practical amounts are safe, but violates the letter of Law 6.
- **Fix**: Replace with `financialRound()` from `@/lib/financial-precision`.
- **Priority**: P2 — Law compliance
- **Effort**: 1 hour

---

## Medium Debt (Nice to Fix)

### DEBT-010: 16 `as any` in Repository Adapters

- **Root Cause**: Prisma `orderBy` dynamic keys require type assertions
- **Impact**: Reduced type safety in repository layer
- **Risk**: Runtime errors from invalid sort keys. Not caught by TypeScript.
- **Fix**: Use typed `Prisma.XOrderByWithRelationInput` unions or generic sort builder.
- **Priority**: P2 — Code quality
- **Effort**: 2 days

### DEBT-011: plaidAccessToken DB Field (Law 14)

- **Root Cause**: Database schema has `plaidAccessToken` column — vendor name in persistence layer
- **Impact**: Vendor name leaks into persistence. Not a code import but a schema-level coupling.
- **Risk**: Low — renaming is a migration but doesn't affect runtime.
- **Fix**: Rename to `encryptedAccessToken` or `providerAccessToken` via Prisma migration.
- **Priority**: P3 — Naming
- **Effort**: 1 day

### DEBT-012: AP Event Bus In-Memory

- **Root Cause**: `APDomainEventBus` uses in-process `Map<EventType, Set<Handler>>`
- **Impact**: Events lost on restart. No event replay. No distributed delivery.
- **Risk**: Event-driven workflows break on restart. No event sourcing capability.
- **Fix**: Persist events to Prisma. Add event replay capability.
- **Priority**: P2 — Architecture
- **Effort**: 2 weeks

### DEBT-013: No `APContract` Interface

- **Root Cause**: Domain boundary implicit through repository types, not enforced by contract
- **Impact**: Other domains cannot safely depend on AP capabilities.
- **Risk**: Cross-domain coupling. Refactoring AP internals breaks consumers.
- **Fix**: Define `IAPContract` interface. Wire into dependency injection.
- **Priority**: P2 — Architecture
- **Effort**: 1 week

### DEBT-014: SearchPlatform In-Memory Index

- **Root Cause**: Search index stored in memory, no persistence
- **Impact**: Search data lost on restart. Not production-ready.
- **Risk**: Knowledge base lost. User experience degrades.
- **Fix**: Migrate to Elasticsearch or PostgreSQL full-text search.
- **Priority**: P2 — Production readiness
- **Effort**: 2 weeks

---

## Low Debt (Acceptable for Now)

### DEBT-015: Constitution Overstates Platform Readiness

- **Root Cause**: PLATFORM_CONSTITUTION.md labels 9 platforms as "Partially built" but most are Level 1-2
- **Impact**: Governance integrity. Stakeholder expectations misaligned.
- **Risk**: Decision-making based on inaccurate status.
- **Fix**: Update Platform Registry to match actual maturity levels.
- **Priority**: P3 — Documentation
- **Effort**: 30 minutes

### DEBT-016: ERPPlatform Scaffolded Only

- **Root Cause**: ERP integrations deferred to future phase
- **Impact**: No actual QuickBooks, SAP, or NetSuite integration
- **Risk**: Feature gap for customers using these ERPs
- **Fix**: Build ERP adapters using ConnectorPlatform pattern
- **Priority**: P3 — Feature gap
- **Effort**: 4-6 weeks per ERP

### DEBT-017: PaymentsPlatform Stub

- **Root Cause**: Payment processing scaffolded but not implemented
- **Impact**: Cannot actually execute payments
- **Risk**: AP payment workflow stops at proposal — no actual money movement
- **Fix**: Build payment execution with provider drivers
- **Priority**: P2 — Feature gap
- **Effort**: 4 weeks

---

## Debt Summary

| Priority | Count | Total Effort |
|---|---|---|
| **P0** (Must Fix) | 3 | ~5 weeks |
| **P1** (Should Fix) | 6 | ~12 weeks |
| **P2** (Nice to Fix) | 5 | ~7 weeks |
| **P3** (Acceptable) | 3 | ~5 weeks |
| **Total** | 17 | ~29 weeks |

---

*Validated: 2026-07-24 | Phase 23.1 | Architectural Debt Register*
