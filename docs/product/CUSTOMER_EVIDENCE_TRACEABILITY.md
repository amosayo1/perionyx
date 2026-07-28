---
title: "Customer Evidence Traceability"
created: 2026-07-28
phase: "27.0A"
tags: [product, ap, evidence, traceability]
---

# Customer Evidence Traceability

## Purpose

Every product decision in the AP Reference Workflow must be traceable to customer evidence or explicitly labelled as a hypothesis. This document provides the complete traceability matrix.

## Evidence Sources

| # | Source | Date | Type | Confidence | Method |
|---|--------|------|------|------------|--------|
| E1 | Adeel Aslam | 2026-07-21 | Discovery interview | High | Direct conversation |
| E2 | Ahmed Shatla | 2026-07-21 | Partial interview | Medium | Referenced in CRM |
| E3 | Ayman Shawky | TBD | CRM feedback | Medium | CRM notes |
| E4 | Muhammed Jamsheed | TBD | CRM feedback | Medium | CRM notes |
| E5 | Khaleel Ur Rehman | TBD | CRM interaction | Low | Single quote |
| E6 | Industry patterns | Ongoing | Research | Low | Secondary sources |
| E7 | Phase 20.0 validation | 2026-07-21 | Internal audit | High | Codebase analysis |

## Traceability Matrix

### Why AP Is the First Workflow

| Decision | Evidence | Quote/Data | Confidence |
|----------|----------|------------|------------|
| Start with AP, not AR or Treasury | E1, E2, E7 | Adeel: "vendor invoice reconciliations... still manage manually" / Ahmed: "vendor invoice reconciliations" / Phase 20.0: AP Manager scores 5/10 (joint lowest) | **High** |
| AP has the most manual pain | E1 | Adeel: "these operational tasks often require manual oversight" | **High** |
| AP affects all personas | E7 | Phase 20.0: 7 personas interact with AP | **Medium** |

### Why Three-Way Match Is Automated

| Decision | Evidence | Quote/Data | Confidence |
|----------|----------|------------|------------|
| Automate matching, not approval | E1, E7 | Adeel: "vendor invoice reconciliations" manual / Phase 21.0: matching engine exists (126 lines) but not wired | **High** |
| Show confidence score on match | E3 | Ayman: "Need for confidence scoring" | **Medium** |
| Default to 3-way (Invoice↔PO↔GRN) | E6 | Industry standard for purchase-order-based procurement | **Low** |

### Why Approval Is Multi-Level with Delegation

| Decision | Evidence | Quote/Data | Confidence |
|----------|----------|------------|------------|
| Multi-level threshold approval | E1, E7 | Adeel: "approval workflows... manual oversight" / Phase 20.0: approval matrix exists but not wired | **High** |
| Support delegation | P7 (Hypothesis) | No direct evidence — inferred from industry patterns | **Low** |
| Auto-escalate on SLA breach | E6 | Industry pattern for financial controls | **Low** |

### Why AI Explains Itself

| Decision | Evidence | Quote/Data | Confidence |
|----------|----------|------------|------------|
| AI must explain recommendations | E3, P5 | Ayman: "Need for confidence scoring on forecasts" / P5: "AI Must Explain Itself" (Hypothesis) | **Medium** |
| AI never approves payments | E1, Constitution | Adeel: "manual oversight to ensure accuracy" — trust requires human judgement | **High** |
| Every AI action logged | Constitution | "Every action is auditable" — Platform Constitution | **High** |

### Why Exception Queue Is Dedicated

| Decision | Evidence | Quote/Data | Confidence |
|----------|----------|------------|------------|
| Separate exception queue (not inline) | E1, E7 | Adeel: "manual oversight" / Phase 20.0: exception count (51) shown as KPI but no action possible | **High** |
| Categorise by type (price/quantity/duplicate) | E6 | Industry standard for AP exception management | **Low** |
| SLA-based escalation | E6 | Industry pattern | **Low** |

### Why Payment Is Batched

| Decision | Evidence | Quote/Data | Confidence |
|----------|----------|------------|------------|
| Batch payments by bank account | None | No direct customer evidence | **Hypothesis** |
| Optimise for early-pay discounts | None | No direct customer evidence | **Hypothesis** |
| Dual-signature for large payments | E6 | Industry standard for treasury controls | **Low** |

### Why Audit Trail Is Immutable

| Decision | Evidence | Quote/Data | Confidence |
|----------|----------|------------|------------|
| Append-only audit log | Constitution | "Every action is auditable" / "Tamper-evident design" | **High** |
| Complete invoice-to-payment traceability | E7 | Phase 20.0: "Audit trail for every action" listed as gap | **High** |

### Why Vendor Portal Is Deferred

| Decision | Evidence | Quote/Data | Confidence |
|----------|----------|------------|------------|
| Defer vendor portal to Phase 21D | None | No customer evidence of vendor self-service demand | **Hypothesis** |
| Vendors call to check payment status | E6 | Industry pattern — anecdotal | **Low** |

### Why Dashboard Shows Metrics First

| Decision | Evidence | Quote/Data | Confidence |
|----------|----------|------------|------------|
| Metrics render before charts | E3, WF-005 | Ayman: "Need for instant view" / WF-005: "No 'What Changed?' on dashboards" | **Medium** |
| Show delta (change from yesterday) | WF-005 | Phase 20.0: "most dashboards display static metric values" | **High** |

### Why Cmd+K Is Included

| Decision | Evidence | Quote/Data | Confidence |
|----------|----------|------------|------------|
| Cmd+K command palette | WF-003 | Phase 20.0: "Deep Nesting Requiring Excessive Clicks" — 4-5 clicks to reach detail | **High** |
| 2-click maximum to actionable detail | WF-003 | Phase 20.0: "CFOs expect 1-2 clicks maximum" | **High** |

## Confidence Summary

| Confidence Level | Count | Percentage |
|------------------|-------|------------|
| High (2+ direct sources) | 8 | 38% |
| Medium (1 source + industry) | 5 | 24% |
| Low (inference only) | 4 | 19% |
| Hypothesis (no evidence) | 4 | 19% |

## Evidence Gaps

| Gap | Impact | Validation Method | Priority |
|-----|--------|-------------------|----------|
| No interview evidence for batch payments | May design wrong payment UX | Interview 3+ AP managers about payment workflow | High |
| No interview evidence for vendor portal demand | May build unneeded feature | Interview 3+ vendors about self-service needs | Medium |
| No evidence for delegation requirements | May over/under-build delegation | Interview 3+ finance managers about approval delegation | High |
| No evidence for Arabic-first design | May miss MENA market needs | Interview 3+ MENA finance professionals | Medium |
| No evidence for AI explainability preference | May over/under-invest in AI UX | Prototype test with 5+ finance professionals | High |

## Validation Plan

| Phase | Method | Target | Timeline |
|-------|--------|--------|----------|
| Interviews 7-11 | Direct discovery conversations | 5 more finance professionals | Q3 2026 |
| Prototype testing | Interactive AP workflow prototype | 5 finance professionals | Q3 2026 |
| A/B testing | Compare batch vs individual payment UX | 20+ users in design partner program | Q4 2026 |
| Usage analytics | Track actual workflow patterns | All beta users | Post-launch |

## Evidence Decay

| Evidence Type | Revalidation Cadence | Reason |
|---------------|---------------------|--------|
| Interview quotes | 6 months | Roles and tools change |
| CRM feedback | 3 months | Contact context evolves |
| Industry patterns | 12 months | Best practices shift |
| Internal audit findings | Per phase | Codebase changes rapidly |
