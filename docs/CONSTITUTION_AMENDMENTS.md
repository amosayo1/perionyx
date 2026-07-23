# Constitution Amendments Report — Phase 15.1

**Date:** 2026-07-19
**Phase:** 15.1 — Cross-Document Constitution Validation
**Status:** Recommendations (No amendments ratified)
**Author:** Automated validation pipeline

---

## Executive Summary

Phase 15.1 validated the three Perionyx constitutions against each other:

| # | Document | Lines | Role |
|---|---|---|---|
| 1 | `GOVERNANCE_CONSTITUTION.md` | Priority 1 | Authority hierarchy, architecture principles, security, AI rules |
| 2 | `PRODUCT_CONSTITUTION.md` | Priority 2 | Product scope, data layer, UX, build rules |
| 3 | `AUTONOMOUS_FINANCE_WORKFORCE.md` | Priority 5 (proposed) | Agent constraints, deterministic rules, KPIs |

**6 conflicts found** — 2 HIGH, 2 MEDIUM, 2 LOW. All are gaps in the higher-priority documents (GOVERNANCE, PRODUCT) where the subordinate document (AFW) introduces constraints that have no parent anchor.

**Recommended amendments:** 6 total (3 GOVERNANCE, 2 PRODUCT, 1 structural). No amendments to AFW — it is the most detailed and well-structured document.

**No constitutions were modified.** All recommendations are documented for governance review and must be ratified through the standard ADR process.

---

## Conflict Analysis

### 1. TERMINOLOGY CONFLICT — HIGH

| Field | Value |
|---|---|
| **Severity** | HIGH |
| **Documents** | GOVERNANCE §Product Language vs. PRODUCT §Preamble |
| **Rule** | GOVERNANCE (priority 1) bans the term "financial operating system" |
| **Violation** | PRODUCT uses "enterprise financial operating system" in its Preamble |
| **Impact** | GOVERNANCE ranks higher. PRODUCT is in explicit violation of a GOVERNANCE constraint. |

**Evidence:**
- GOVERNANCE §Product Language: Category is "Enterprise Treasury Operating System"
- PRODUCT §Preamble: "Perionyx is an enterprise financial operating system"

**Resolution:** Amendment P-1 — fix the PRODUCT Preamble to use the GOVERNANCE-approved term.

---

### 2. AFW NOT IN AUTHORITY HIERARCHY — HIGH

| Field | Value |
|---|---|
| **Severity** | HIGH |
| **Documents** | GOVERNANCE Authority Hierarchy vs. AFW §Purpose |
| **Rule** | GOVERNANCE defines a 10-document authority hierarchy |
| **Gap** | AFW is not listed in the hierarchy at all |
| **Impact** | AFW claims authority ("When this document conflicts with GOVERNANCE, the Platform Constitution prevails") but has no slot in the hierarchy table. |

**Evidence:**
- GOVERNANCE Authority Hierarchy: Documents 1-10 (GOVERNANCE → ADRs → SECURITY)
- AFW §Purpose: References GOVERNANCE conflict resolution but is not itself listed

**Resolution:** Amendment G-1 — add AFW as priority 5 in the GOVERNANCE authority hierarchy.

---

### 3. DETERMINISTIC FINANCIAL RULE — NO PARENT ANCHOR — MEDIUM

| Field | Value |
|---|---|
| **Severity** | MEDIUM |
| **Documents** | AFW §4 + Deterministic Financial Rule vs. PRODUCT §4.3 |
| **Rule** | AFW: "Financial calculations must never be duplicated, approximated, or reimplemented by any specialist" |
| **Gap** | Neither GOVERNANCE nor PRODUCT references this constraint |
| **Impact** | A significant new constraint exists only in the subordinate document. Modules could violate it without triggering a GOVERNANCE or PRODUCT violation. |

**Evidence:**
- AFW Principle 4: Canonical calculation systems are singular
- AFW Deterministic Financial Rule: Explicit prohibition on reimplementing financial calculations
- PRODUCT §4.3: Data Layer Authority — no mention of deterministic calculations

**Resolution:** Amendment P-2 — reference the Deterministic Financial Rule in PRODUCT §4.3.

---

### 4. SPECIALIST PERFORMANCE KPIs — NO ENFORCEMENT — MEDIUM

| Field | Value |
|---|---|
| **Severity** | MEDIUM |
| **Documents** | AFW §Performance Expectations vs. GOVERNANCE |
| **Rule** | AFW defines detailed KPI targets for 7 specialist roles |
| **Gap** | GOVERNANCE has no performance accountability section |
| **Impact** | Performance accountability exists only in the subordinate document. No escalation path exists at the GOVERNANCE level. |

**Evidence:**
- AFW §Performance Expectations: Treasury Analyst (5 KPIs), Cash Manager (5 KPIs), Risk Analyst (5 KPIs), Compliance Officer (5 KPIs), Payment Processor (5 KPIs), FX Specialist (5 KPIs), Investment Analyst (5 KPIs)
- GOVERNANCE: No performance targets or accountability sections

**Resolution:** Amendment G-3 — add a "Performance Accountability" section to GOVERNANCE that references AFW KPIs.

---

### 5. AI RULES SCOPE — LOW

| Field | Value |
|---|---|
| **Severity** | LOW |
| **Documents** | GOVERNANCE AI Never vs. AFW Specialists Must Never |
| **Rule** | GOVERNANCE defines 4 AI prohibitions |
| **Gap** | AFW adds 10 prohibitions for specialists (post journals, modify ledger, override policies, bypass approvals, hide uncertainty, operate without audit logging) |
| **Ambiguity** | Are AFW specialists "AI" under GOVERNANCE's AI Rules? |

**Evidence:**
- GOVERNANCE AI Never: (1) fabricate platform data, (2) bypass approvals, (3) hide errors, (4) operate without audit logging
- AFW Specialists Must Never: 10 items including the 4 from GOVERNANCE plus 6 additional constraints

**Resolution:** Amendment G-2 — clarify in GOVERNANCE that AFW specialists are subject to AI Rules.

---

### 6. FINANCIAL INTEGRITY FIRST — LOW

| Field | Value |
|---|---|
| **Severity** | LOW |
| **Documents** | PRODUCT §3.1 vs. GOVERNANCE "Immutable Financial History" |
| **Rule** | PRODUCT: "The ledger must always balance. Every transaction must be traceable..." |
| **Gap** | GOVERNANCE covers immutable history but does not use the "ledger must always balance" language |
| **Amendment** | Consider elevating this language into GOVERNANCE Architecture Principles |

**Resolution:** Not recommended as a formal amendment at this time. The existing GOVERNANCE language is sufficient. Flag for future review.

---

## Recommended Amendments

### GOVERNANCE_CONSTITUTION.md — 3 Amendments

#### Amendment G-1: Add AFW to Authority Hierarchy

**Type:** Structural
**Severity:** HIGH
**Location:** Authority Hierarchy table (after line 163, after ADR-030)

Insert row at priority 5:

```
| 5 | AUTONOMOUS_FINANCE_WORKFORCE.md | Agent behavior constraints, deterministic rules, KPIs |
```

**Rationale:** AFW is the most detailed constitution. It must be explicitly slotted into the authority hierarchy so that all documents can reference it consistently. Current position: after ADRs (priority 4), before SECURITY (priority 5+).

**Effect:** All 10 existing documents shift down by one priority number. AFW becomes the authoritative source for agent behavior, deterministic financial rules, and specialist KPIs.

---

#### Amendment G-2: Clarify AI Rules Scope

**Type:** Clarification
**Severity:** LOW
**Location:** After line 125 (AI never fabricates platform data)

Insert paragraph:

> All Enterprise Finance Specialists (as defined in AUTONOMOUS_FINANCE_WORKFORCE.md) are subject to the AI Rules defined in this constitution. The AFW provides additional constraints specific to autonomous financial operations.

**Rationale:** Removes ambiguity about whether AFW specialists are "AI" under GOVERNANCE. Establishes that GOVERNANCE AI Rules are the floor, and AFW adds stricter constraints.

---

#### Amendment G-3: Add Performance Accountability

**Type:** New Section
**Severity:** MEDIUM
**Location:** After line 135 (Future Development Rules)

Insert section:

> ## Performance Accountability
>
> Enterprise Finance Specialists must meet the performance KPIs defined in AUTONOMOUS_FINANCE_WORKFORCE.md §Performance Expectations. KPI failures must be escalated through the chains defined in AFW §Escalation Model.

**Rationale:** Performance accountability currently exists only in AFW. Elevating it to GOVERNANCE ensures that KPI failures trigger escalation at the governance level, not just the agent level.

---

### PRODUCT_CONSTITUTION.md — 2 Amendments

#### Amendment P-1: Fix Terminology

**Type:** Correction
**Severity:** HIGH
**Location:** Line 5 (Preamble)

**Before:**
```
Perionyx is an enterprise financial operating system
```

**After:**
```
Perionyx is an Enterprise Treasury Operating System
```

**Rationale:** GOVERNANCE §Product Language explicitly bans "financial operating system" and mandates "Enterprise Treasury Operating System." PRODUCT is in violation. This is a direct GOVERNANCE override (priority 1 > priority 2).

---

#### Amendment P-2: Reference Deterministic Financial Rule

**Type:** New Subsection
**Severity:** MEDIUM
**Location:** After §4.3 (Data Layer Authority)

Insert subsection:

> §4.3.1 Financial calculations must never be duplicated, approximated, or reimplemented by any module. The canonical calculation systems are defined in AUTONOMOUS_FINANCE_WORKFORCE.md §Deterministic Financial Rule.

**Rationale:** The Deterministic Financial Rule is a significant constraint that has no parent-document anchor. Referencing it from PRODUCT §4.3 ensures that module authors encounter it when reviewing data layer authority.

---

### AUTONOMOUS_FINANCE_WORKFORCE.md — 0 Amendments

No amendments recommended. AFW is the most detailed and well-structured document. All identified gaps are in the higher-priority documents.

---

## Amendment Summary

| # | Document | Amendment | Type | Severity | Status |
|---|---|---|---|---|---|
| G-1 | GOVERNANCE | Add AFW to Authority Hierarchy | Structural | HIGH | Recommended |
| G-2 | GOVERNANCE | Clarify AI Rules Scope | Clarification | LOW | Recommended |
| G-3 | GOVERNANCE | Add Performance Accountability | New Section | MEDIUM | Recommended |
| P-1 | PRODUCT | Fix Terminology | Correction | HIGH | Recommended |
| P-2 | PRODUCT | Reference Deterministic Financial Rule | New Subsection | MEDIUM | Recommended |
| — | AFW | None | — | — | No amendments |

---

## Implementation Notes

1. **All amendments are RECOMMENDED, not mandatory.** They require governance review and ADR ratification before implementation.

2. **No constitutions were modified during Phase 15.1.** The golden rule applies: "Do NOT modify constitutions silently." All changes must go through the ADR process.

3. **Amendment priority order:**
   - **Immediate:** G-1 (AFW hierarchy slot) and P-1 (terminology fix) — these are HIGH severity and affect document consistency
   - **Next cycle:** G-3 (performance accountability) and P-2 (deterministic rule anchor) — these are MEDIUM severity and add new sections
   - **Backlog:** G-2 (AI rules scope) — LOW severity, clarification only

4. **ADR requirement:** Each amendment should be documented as a separate ADR with:
   - Problem statement (conflict found)
   - Proposed solution (amendment text)
   - Alternatives considered
   - Impact assessment
   - Migration path (if any)

5. **Re-validation:** After amendments are ratified, re-run Phase 15.1 validation to confirm all 6 conflicts are resolved.

---

## Appendix: Conflict Severity Matrix

| Severity | Count | Action Required |
|---|---|---|
| HIGH | 2 | Immediate ADR + governance review |
| MEDIUM | 2 | Next ADR cycle |
| LOW | 2 | Backlog or no action |
| **Total** | **6** | |

---

*This report was generated by the Phase 15.1 cross-document validation pipeline. All line references are approximate and should be verified against the current document state before applying amendments.*
