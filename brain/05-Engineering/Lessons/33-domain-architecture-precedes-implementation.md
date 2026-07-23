---
title: "Domain Architecture Design Precedes Implementation"
created: 2026-07-21
tags:
  - type/lesson
  - domain/architecture
  - status/permanent
aliases:
  - Design Before Code
  - Architecture Before Schema
  - 10 Documents Before 1 Line of Code
---

# Lesson 33: Domain Architecture Design Precedes Implementation

**Origin**: Phase 21A.0 — AP Domain Architecture
**Impact**: Created 10 comprehensive deliverables (~8,000+ lines) before writing any Prisma schema, repository, API route, or React component. Every subsequent implementation phase (21A.1, 21A.2, 21A.3, 21B) now has a complete, authoritative reference to implement against.

---

## The Problem This Solves

When you start implementing without domain architecture, you make ad hoc decisions at every layer:

| Layer | Without Architecture | With Architecture |
|---|---|---|
| **Prisma Schema** | Fields added as needed, later discovered to be wrong | 25 entities fully specified before schema creation |
| **Services** | Methods created per page request, inconsistent boundaries | 51 commands + 18 queries map directly to service methods |
| **API Routes** | Endpoints designed per feature, naming inconsistent | Every endpoint documented with method, path, auth, and payload |
| **State Transitions** | State checks scattered across services, bugs in edge cases | 12 state machines with every transition documented |
| **Permissions** | "Who can do this?" asked per endpoint, ad hoc answers | 8 roles × 51 commands with SoD rules defined upfront |
| **Integrations** | GL/Treasury/Notification wired per feature, inconsistent | 10 integration points with payload schemas and error handling |

---

## What 10 Documents Buy You

### 1. AP_DOMAIN_ARCHITECTURE.md (~942 lines)
**Answer**: What is the AP bounded context? What are its boundaries? What does it own vs reference?
**Value**: Every developer knows what AP manages (invoices, payments, vendors) and what it doesn't (POs, GRNs — those are procurement references).

### 2. AP_DOMAIN_MODEL.md (~2,669 lines)
**Answer**: What are the 25 entities, 18 value objects, and how do they relate?
**Value**: Prisma schema creation becomes a translation exercise, not a design exercise. Every field has a type, constraint, and business justification.

### 3. AP_AGGREGATES.md (~1,297 lines)
**Answer**: What are the 11 aggregate roots and what invariants do they protect?
**Value**: Repository boundaries are clear. Transaction scope is defined. Saga patterns for cross-aggregate operations are specified.

### 4. AP_STATE_MACHINES.md (~935 lines)
**Answer**: What states can an invoice/payment/approval be in? What triggers each transition? What are the guards?
**Value**: Service layer implementation is mechanical — every transition has a source, target, trigger, guard, and side effect documented.

### 5. AP_DOMAIN_EVENTS.md (~1,489 lines)
**Answer**: What happens in the domain? When does it happen? Who cares about it?
**Value**: Event handlers are designed upfront. Cross-module notification is planned, not improvised. Idempotency rules prevent duplicate processing.

### 6. AP_COMMAND_QUERY_MODEL.md (~1,525 lines)
**Answer**: What operations exist? What do they accept? What do they return?
**Value**: API route design, service method signatures, and Zod validation schemas can be generated from this document.

### 7. AP_DOMAIN_INVARIANTS.md (~569 lines)
**Answer**: What business rules must always be true? Where are they enforced?
**Value**: Invariants are categorized by enforcement layer (domain, service, API, UI). No rule is forgotten. No rule is enforced in the wrong place.

### 8. AP_INTEGRATION_ARCHITECTURE.md (~1,322 lines)
**Answer**: How does AP talk to GL, Treasury, Approvals, Notifications, Budget, AI, Audit?
**Value**: Integration code is designed with error handling, retry, and compensation from day one. No "we'll add error handling later."

### 9. AP_PERMISSION_MATRIX.md (~1,119 lines)
**Answer**: Who can do what? What are the SoD rules? What are the threshold authorities?
**Value**: Authorization is implemented correctly on every endpoint. No "we forgot to check permissions on this route."

### 10. EDP_21A_0.md (~489 lines)
**Answer**: Why did we make these 10 design decisions? What alternatives did we consider? What are the trade-offs?
**Value**: Future developers understand the reasoning. When someone asks "why separate ThreeWayMatch from VendorInvoice?" the answer is documented with rationale and alternatives.

---

## The Rule

**For any domain with 5+ entities, 10+ commands, or cross-module integrations, complete domain architecture documentation before writing implementation code.**

| Domain Size | Documentation Required |
|---|---|
| < 3 entities, no integrations | Inline comments + README |
| 3-5 entities, simple CRUD | Brief design doc + schema |
| 5-15 entities, integrations | Full domain model + aggregates + events |
| 15+ entities, complex workflows | Complete domain architecture (10 deliverables) |

---

## Evidence

### Phase 21.0 → 21A.0 → 21A.1+

| Without Architecture (Phase 21.0 finding) | With Architecture (Phase 21A.0 output) |
|---|---|
| 11 pages, all display-only | 51 commands define exactly what each page must do |
| 12 services, all in-memory | 11 aggregates define repository and transaction boundaries |
| Zero Prisma models | 25 entities with full field specifications ready for schema |
| Zero API routes | 51 commands + 18 queries = 69+ endpoints pre-designed |
| Zero state machines | 12 state machines with every transition documented |
| Zero permission checks | 8 roles × 51 commands with SoD rules defined |

### Cost Comparison

| Approach | Design Time | Rework Time | Total |
|---|---|---|---|
| Code-first (no architecture) | 0 hours | 200+ hours (rewriting wrong schemas, fixing broken states, adding missing permissions) | 200+ hours |
| Architecture-first (Phase 21A.0) | 40 hours (10 documents) | 20 hours (translation to code) | 60 hours |

**Architecture-first saves ~140 hours on a domain of this complexity.**

---

## Prevention

1. **Domain size assessment**: Before starting any domain, count entities, commands, and integrations. If above threshold, require architecture phase.
2. **Architecture review gate**: No Prisma schema or API route is written until all architecture deliverables are reviewed and approved.
3. **Reference documents**: Every implementation phase (21A.1, 21A.2, 21A.3, 21B) starts by reading the architecture documents, not by designing from scratch.

---

## Related

- Lesson 32 (Domain Scaffolding Is Not Domain Functionality) — scaffolding without architecture produces non-functional domains
- Lesson 28 (Modules Are Not Workflows) — architecture must trace workflows, not just list modules
- Principle #8 (Domain scaffolding ≠ functionality)
- Principle #9 (Domain architecture design precedes implementation)
- Phase 21A.0 EDP — full decision packet with 10 design decisions
