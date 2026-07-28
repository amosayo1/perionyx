---
title: "EDP 27.0A — Enterprise Product Architecture & Workflow Design"
created: 2026-07-28
phase: "27.0A"
status: "Complete"
type: "Engineering Decision Packet"
---

# EDP 27.0A — Enterprise Product Architecture & Workflow Design

## Decision

Phase 27.0A is complete. The Enterprise Product Specification (EPS) for the Accounts Payable Reference Workflow has been produced. This specification is the blueprint for every future financial workflow across Perionyx.

## Evidence

### 13 Deliverable Documents Produced

| # | Document | Lines | Purpose |
|---|----------|-------|---------|
| 1 | `ENTERPRISE_PRODUCT_SPECIFICATION_AP.md` | ~508 | Master specification — 10 stages, 9 personas, state machines, AI behaviour, UX, design system |
| 2 | `PRODUCT_PHILOSOPHY.md` | ~328 | Core beliefs, what we optimise/not optimise, evidence basis |
| 3 | `PERIONYX_PRODUCT_PRINCIPLES.md` | ~420 | 15 principles (6 Validated, 4 Working, 5 Hypothesis) with evidence map |
| 4 | `AP_REFERENCE_WORKFLOW.md` | ~534 | 10 workflow stages with full specifications, notification map, error recovery matrix |
| 5 | `WORKFLOW_STATE_MACHINE.md` | ~576 | 5 state machines (Invoice, Payment, Approval, Exception, Vendor) with ASCII diagrams |
| 6 | `PERSONA_GUIDE.md` | ~567 | 9 personas with day-in-life narratives, success stories, failure scenarios |
| 7 | `UX_INFORMATION_ARCHITECTURE.md` | ~502 | 25 screens, navigation model, keyboard shortcuts, responsive behaviour |
| 8 | `AI_BEHAVIOUR_GUIDE.md` | ~608 | AI permission matrix, per-stage capabilities, confidence scoring, explainability, governance |
| 9 | `DESIGN_SYSTEM_GUIDELINES.md` | ~581 | EDL application to AP: colours, typography, cards, tables, forms, status indicators |
| 10 | `CUSTOMER_EVIDENCE_TRACEABILITY.md` | ~200 | Traceability matrix mapping every decision to customer evidence |
| 11 | `HYPOTHESIS_REGISTER.md` | ~280 | 14 hypotheses (10 product, 2 technical, 2 business) with validation plan |
| 12 | `SUCCESS_METRICS.md` | ~300 | 12 metrics across 5 categories with baselines, targets, anti-gaming rules |
| 13 | `EDP_27_0A.md` | This document | Engineering decision packet |

**Total**: ~5,204 lines of product specification across 13 documents.

### Customer Evidence Referenced

| Source | Evidence Used |
|--------|---------------|
| Adeel Aslam (2026-07-21) | Manual approval workflows, vendor invoice reconciliation, trust in automation |
| Ayman Shawky (CRM) | ERP silos, real-time cash visibility, AI confidence scoring |
| Muhammed Jamsheed (CRM) | ERP integration gaps, data export/import |
| Khaleel Ur Rehman (CRM) | Operating system vision |
| Phase 20.0 Validation | 25 friction issues, 14 workflow scores, persona ratings |
| Phase 21.0 Gap Analysis | 17 feature gaps, 8 integration gaps, 14 workflow stages |
| Platform Constitution | 15 architectural laws, trust principles |

### Key Design Decisions

| Decision | Rationale | Evidence |
|----------|-----------|----------|
| 10 stages (simplified from 14) | Reduce cognitive complexity for reviewers | Design principle: Clarity |
| AI explains but never decides | Trust requires human judgement | E1: "manual oversight to ensure accuracy" |
| Dedicated exception queue | Exceptions deserve attention, not automation | E7: Phase 20.0 — exception count shown but no action |
| Batch payments (hypothesis) | Industry pattern, needs validation | H4: No direct evidence |
| Immutable audit trail | Constitution: "Every action is auditable" | Platform Constitution |
| 2-click maximum | CFOs don't wait | WF-003: "4-5 clicks to reach detail" |

## Alternatives Considered

### Alternative 1: Implement First, Design Later

**Rejected.** Phase 21.0 proved this approach fails — extensive scaffolding (11 pages, 12 services, 5,716 records) produced zero runtime functionality. Designing first ensures implementation serves the right goals.

### Alternative 2: Design All Workflows Simultaneously

**Rejected.** Too broad for a single phase. AP is the highest-pain workflow (T1, T2, P2) and provides the reference implementation pattern for all future workflows.

### Alternative 3: Copy Existing ERP AP Workflows

**Rejected.** Perionyx must "redesign enterprise financial work around trusted information, operational context, and human judgement" — not imitate SAP or Oracle. Existing ERPs are the source of the pain we're solving.

### Alternative 4: Design Without Customer Evidence

**Rejected.** Every decision must be traceable to evidence or labelled as hypothesis. This prevents building what we think users want instead of what they actually need.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Evidence from 1 interview is insufficient | Wrong product direction | Interviews 7-11 in Q3 2026, prototype testing |
| 4 of 14 hypotheses prove wrong | Rework on affected features | Hypothesis register with validation backlog |
| Batch payment hypothesis is wrong | Payment UX redesign needed | A/B test before full implementation |
| Arabic-first hypothesis is wrong | Over-investment in i18n | Validate with MENA interviews before Phase 8B Arabic |
| AI explainability is over-engineered | Unnecessary complexity | Track AI recommendation adoption rate |

## Dependencies

| Dependency | Status | Required For |
|------------|--------|--------------|
| Prisma models (25 AP models) | ✅ Complete (Phase 21A.1) | Implementation |
| Application services (7 services, 51 commands) | ✅ Complete (Phase 21A.2) | Implementation |
| API layer (65 endpoints) | ✅ Complete (Phase 21A.3) | Implementation |
| Integration tests (87 workflow + 52 API) | ✅ Complete (Phase 21A.4) | Implementation |
| Seed data (28,000 records) | ✅ Complete (Phase 21B.2) | Implementation |
| Enterprise Foundation | ✅ Complete (Phase 26.3) | Implementation |
| **Product Specification (this phase)** | ✅ Complete | Implementation |
| **Customer evidence (interviews 7-11)** | ❌ Pending | Hypothesis validation |
| **Design partner program** | ❌ Pending | Real-world testing |

## Brain Updates

### Lesson 53

**"The quality of enterprise software is determined by the quality of its workflows."**

- Created: `brain/17-Lessons/53-workflow-quality-determines-software-quality.md`
- Phase: 27.0A
- Category: product
- Principle: #30

### Principle #30

**"Every workflow must reduce the cognitive effort required to make trusted financial decisions."**

- Added to Decision Network as row 30
- Status: Validated (evidence: E1, E7, Constitution)

### Evolution Timeline

- Entry for Phase 27.0A added
- 13 deliverable documents referenced

### AGENTS.md

- Phase 27.0A recorded in What Was Built section
- Recommended next phase: Phase 27.0B — AP Workflow Implementation

## Next Phase

**Phase 27.0B — AP Workflow Implementation** (8-12 weeks):

1. Wire invoice entry form to Prisma (Stage 1: Invoice Received)
2. Implement evidence collection service (Stage 2: Evidence Collection)
3. Wire matching engine to invoice/PO/GRN creation (Stage 3: Three-Way Match)
4. Build exception queue UI with resolution actions (Stage 4: Exception Detection)
5. Implement AI context building with explainability (Stage 5: AI Context Building)
6. Build cross-department coordination (Stage 6: Coordination)
7. Wire approval matrix to invoice workflow (Stage 7: Approval)
8. Implement payment proposal generation (Stage 8: Payment Readiness)
9. Wire payment execution to treasury (Stage 9: Payment)
10. Implement GL posting and audit trail (Stage 10: Audit Completion)

## Quality Gates

The specification is complete and ready for implementation when:

| Gate | Status |
|------|--------|
| AP workflow can be understood without reading code | ✅ 10-stage specification with evidence |
| Every decision traces to customer evidence or is labelled hypothesis | ✅ Traceability matrix complete |
| Workflow demonstrates clear improvement over traditional ERP | ✅ Time reduction targets defined |
| AI behaviour is fully defined | ✅ AI Behaviour Guide with permission matrix |
| Human judgement is preserved | ✅ AI never approves, humans decide |
| Finance professional could review and provide feedback | ✅ Written for CFOs/Controllers, not engineers |
| No production code was written during this phase | ✅ Documentation only |
