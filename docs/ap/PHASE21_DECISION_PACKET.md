# Phase 21.0 — Decision Packet

> **Status**: Complete
> **Type**: Documentation-only — executive summary and design decisions
> **Date**: July 21, 2026
> **Scope**: Phase 21.0 AP capability inventory — decisions, trade-offs, and recommendations

---

## Executive Summary

Phase 21.0 is a documentation-only phase that inventories the Accounts Payable domain, maps existing capabilities against a 14-stage enterprise workflow, and creates an implementation plan. **Zero code was written.** The phase produces 6 deliverables that define what to build, why, and in what order.

### Key Finding

The AP domain has **extensive scaffolding** (11 pages, 12 services, 20 components, 888-line seed file) but **zero runtime functionality**. Every page is display-only. Every service is in-memory. Every workflow stage is seeded data. The AP Manager persona scores 5/10 — the joint-lowest of all 10 personas.

### Recommendation

**Execute Phase 21A-21B** (Foundation + Core Workflow, 5-7 weeks) to bring AP from 3.7% to ~75% enterprise readiness. This is the highest-impact investment for the platform because:

1. AP is the most common enterprise financial workflow
2. AP Manager is the weakest persona — fixing it lifts the entire platform
3. AP touches Treasury, GL, Procurement, and Approval — fixing AP fixes adjacent workflows
4. Every AP stage produces audit evidence — critical for SOX/compliance

---

## Design Decisions

### Decision 1: Prisma Persistence First

**Choice**: Build Prisma models before any feature work.

**Rationale**: Every other decision depends on persistent data. In-memory stores lose data on restart, cannot support audit trails, cannot support multi-tenancy, and cannot support any enterprise feature.

**Evidence**: Phase 20.0 identified in-memory stores as a structural blocker for all workflows. Phase 19.1 showed that financial precision requires Decimal fields, which require Prisma schema.

**Trade-off**: Slower initial progress (no visible UI changes in week 1) but faster overall delivery (every subsequent feature has persistence).

### Decision 2: Rewrite Services, Don't Patch

**Choice**: Rewrite all 12 procurement services from in-memory Maps to Prisma-backed repositories.

**Rationale**: The existing services have no update/delete methods, no tenant isolation, no audit integration, and use native number for monetary values. Patching would create an inconsistent hybrid. A clean rewrite ensures uniformity.

**Evidence**: The existing services average 54 lines each — they're thin wrappers around Maps. A Prisma-backed service of equivalent functionality is ~150-200 lines. The delta is manageable.

**Trade-off**: Higher initial effort (~1 week) but eliminates technical debt and ensures consistency.

### Decision 3: Reuse Existing Matching Logic

**Choice**: Keep the existing `InvoiceMatchingService` matching algorithms (2-way and 3-way) and wire them to Prisma.

**Rationale**: The matching logic is correct and well-structured (126 lines, clean MatchResult type). Only the storage layer and tolerance configuration need updating. Rewriting the algorithm would be waste.

**Evidence**: The current 3-way match compares invoice qty/price against PO qty/price and GRN qtyAccepted — this is the correct enterprise 3-way match. Only the hardcoded 0.01 tolerance needs to become configurable.

**Trade-off**: Accept the existing algorithm's limitations (no complex multi-PO matching, no partial match scoring) and enhance later.

### Decision 4: Approval Matrix Integration

**Choice**: Wire AP invoice approvals to the existing `automation-studio/approval-matrix/` rather than building a separate AP approval system.

**Rationale**: The approval matrix already supports threshold-based routing, delegation, and escalation. Building a separate system would create a duplicate that needs its own maintenance and would conflict with the automation-studio's authority over approval routing.

**Evidence**: `ApprovalMatrixEvaluator.evaluate()` already exists with 3-tier threshold routing. `ApprovalsService` in procurement already has status tracking. The gap is wiring — not new logic.

**Trade-off**: AP approval UI must conform to automation-studio patterns rather than having AP-specific approval UX. This is acceptable because consistency across approval workflows is more valuable than AP-specific features.

### Decision 5: Financial Precision Enforcement

**Choice**: All AP monetary fields use `Prisma.Decimal(20,4)` and all arithmetic uses `financial-precision.ts` helpers.

**Rationale**: Phase 19.1 established the Financial Precision Rule: native JavaScript `number` must NEVER be used for monetary calculations. This is non-negotiable for an enterprise financial platform.

**Evidence**: Phase 19.1 identified 84 UNSAFE `Number()` conversions in GL statement builders. Phase 21.0 identified PO totals stored as native `number` in procurement types. Both are precision risks.

**Trade-off**: More verbose code (explicit `sumDecimals()` instead of `a + b`) but guaranteed precision.

### Decision 6: Append-Only Audit Trail

**Choice**: AP audit events are append-only — no updates, no deletes, ever.

**Rationale**: SOX compliance and financial audit requirements mandate immutable audit trails. An audit record that can be modified is not an audit record.

**Evidence**: Phase 20.0 identified missing audit trails as a critical gap across all workflows. Phase 16.0 security audit noted that the existing `recordAudit()` function supports append-only but is not called in AP services.

**Trade-off**: Higher storage cost (no updates means stale records persist) but absolute integrity. The `ProcurementAudit` model is the only AP model without `updatedAt`.

### Decision 7: Idempotent Payments

**Choice**: Every payment has a unique `idempotencyKey` that prevents double-execution.

**Rationale**: Duplicate payments are the #1 AP fraud vector and the most expensive error to recover from. Prevention is orders of magnitude cheaper than recovery.

**Evidence**: The existing `Payment` type has no idempotency mechanism. The Phase 20.0 validation found zero payment safety controls.

**Trade-off**: Slightly more complex payment creation (must generate and check idempotency key) but eliminates the highest-risk failure mode.

### Decision 8: 4-Phase Execution

**Choice**: Split implementation into 4 phases (Foundation → Core → Intelligence → Hardening) rather than building everything at once.

**Rationale**: Each phase is independently shippable and delivers value. Phase 21A (Prisma + API) enables every subsequent phase. Phase 21B (Core Workflow) makes AP functional. Phase 21C (Intelligence) makes AP smart. Phase 21D (Hardening) makes AP enterprise-grade.

**Evidence**: The gap analysis identified 6 infrastructure gaps, 14 workflow stage gaps, 17 feature gaps, and 8 integration gaps. Building all at once would create dependencies and risk. Phasing reduces risk.

**Trade-off**: Phase 21A delivers zero visible UI changes (all backend). This may concern stakeholders. Mitigation: show Prisma schema + API routes as progress indicators.

---

## Trade-off Analysis

### Build vs. Buy

| Decision | Build | Buy | Choice | Reason |
|---|---|---|---|---|
| OCR/Invoice Capture | Phase 21C | Third-party (e.g., Rossum) | **Build basic, buy advanced** | Basic manual entry is free. OCR integration is future. |
| Vendor Portal | Phase 21D | Third-party (e.g., AvidXchange) | **Build** | Vendor portal is core to AP workflow, not separable |
| Payment Execution | Manual (Phase 21B) | Bank API integration | **Manual first** | Bank APIs vary by country/bank. Manual execution is universal. |
| Duplicate Detection | Phase 21C | Third-party fraud detection | **Build** | Simple rule-based detection covers 95% of cases. AI-enhanced is future. |

### Speed vs. Completeness

| Decision | Fast (Partial) | Complete (Full) | Choice | Reason |
|---|---|---|---|---|
| Vendor management | CRUD only | Full lifecycle + risk scoring | **CRUD first, risk later** | Basic vendor management unblocks PO creation |
| Approval routing | Threshold only | Threshold + delegation + SoD | **Threshold first, SoD later** | Basic routing unblocks invoice approval |
| Payment processing | Single payment | Batch + optimization | **Single first, batch later** | Single payment unblocks the workflow |
| Audit trail | Entity-level | Full chain with export | **Entity first, export later** | Basic audit trail unblocks compliance |

### Technical Debt

| Current Debt | Impact | Resolution | Phase |
|---|---|---|---|
| In-memory Maps | Data loss, no audit, no multi-tenant | Prisma rewrite | 21A |
| Native number arithmetic | Precision risk on monetary values | Decimal + financial-precision.ts | 21A |
| Hardcoded tolerances | No vendor/category flexibility | Configurable tolerance rules | 21B |
| Disconnected services | No end-to-end workflow | Service orchestration layer | 21B |
| No audit events in AP | No compliance evidence | recordAudit() at every transition | 21A-21D |

---

## Risk Register

| # | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Prisma migration conflicts with existing schema | Medium | High | Use additive-only migrations, never rename columns |
| R2 | Service rewrite introduces regressions | Medium | High | Write integration tests before rewrite, run parallel |
| R3 | In-memory seed data breaks during transition | High | Medium | Create Prisma seed that replaces in-memory seed atomically |
| R4 | UI forms require more effort than estimated | Medium | Medium | Use EnterpriseForm system (Phase 8B.6) for rapid form creation |
| R5 | Approval-matrix integration is complex | Low | Medium | ApprovalMatrixEvaluator already has clean API |
| R6 | Financial precision edge cases | Low | High | Use financial-precision.ts exclusively, add lint rule |
| R7 | Audit trail performance at scale | Low | Medium | Append-only model with proper indexing, no updates |

---

## Deliverables Summary

| # | Document | Purpose | Lines |
|---|---|---|---|
| 1 | `ACCOUNTS_PAYABLE_GAP_ANALYSIS.md` | Complete capability inventory, gap identification | ~400 |
| 2 | `ACCOUNTS_PAYABLE_WORKFLOW.md` | 14-stage workflow definition with full specs | ~500 |
| 3 | `ACCOUNTS_PAYABLE_IMPLEMENTATION_PLAN.md` | 4-phase build plan with effort estimates | ~500 |
| 4 | `AP_PERSONA_REVIEW.md` | 7 persona profiles with pain points and targets | ~300 |
| 5 | `AP_ENTERPRISE_SCORECARD.md` | Enterprise rubric scoring (current vs target) | ~300 |
| 6 | `PHASE21_DECISION_PACKET.md` | This document — decisions, trade-offs, risks | ~300 |

**Total documentation**: ~2,300 lines across 6 deliverables.

---

## Brain Updates Required

| Brain Location | Update |
|---|---|
| `03-Projects/Perionyx/journal.md` | Phase 21.0 entry — inventory findings, 6 deliverables |
| `12-Roadmaps/evolution-timeline.md` | Phase 21.0 entry — AP inventory complete |
| `11-ADR/decision-network.md` | Principle #8 — Domain Scaffolding ≠ Domain Functionality |
| `05-Engineering/Lessons/32-domain-scaffolding-is-not-domain.md` | New lesson — UI + types + seed ≠ workflow |
| `06-Research/insights/customer-discovery.md` | AP-specific pain points from Phase 20.0 |
| `13-Wave3/ap-workflow.md` | AP workflow knowledge |
| `AGENTS.md` | Phase 21.0 section — completed inventory, next steps |

---

## Next Steps

1. **Decision required**: Approve Phase 21A execution (Prisma models + repositories + API routes)
2. **Decision required**: Confirm 4-phase execution plan (21A → 21B → 21C → 21D)
3. **Decision required**: Confirm financial precision approach (Decimal everywhere)
4. **Decision required**: Confirm approval-matrix integration approach
5. **Begin**: Phase 21A.1 — Prisma model creation

---

*End of Phase 21.0 — Decision Packet*
