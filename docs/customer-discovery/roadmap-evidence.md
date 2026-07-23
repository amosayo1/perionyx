# Roadmap Evidence Mapping

**Phase:** 8E.2
**Status:** Active registry
**Last Updated:** July 8, 2026

---

## Purpose

This document maps every roadmap item to the customer evidence that justifies it. It ensures that:

- No feature is built without evidence
- Priority is determined by customer impact, not internal intuition
- Gaps in evidence are visible and actionable

---

## Evidence Mapping Schema

| Field | Description |
|---|---|
| Roadmap Item | Feature or capability name |
| Phase | Phase identifier (e.g., 8D.11, 7E) |
| Evidence Tier | T1 (direct) / T2 (inferred) / T3 (strategic) |
| Evidence Sources | Interview IDs, Pain Point IDs, Support Tickets |
| Customer Count | Number of distinct organizations requesting |
| Business Value | Quantified or qualitative impact |
| Priority | P0–P4 |
| Status | Proposed / In Progress / Shipped |
| Risk if Not Shipped | What happens if we defer |

---

## Evidence Backing by Phase

### Phase 8D.11 — Enterprise Certification Remediation

| Roadmap Item | Evidence Tier | Sources | Customer Count | Priority | Status |
|---|---|---|---|---|---|
| cnRTL sequential replacement fix | T3 | Certification audit, localization strategy | 0 (strategic) | P1 | Shipped |
| Mock data removal | T3 | Certification audit | 0 (certification req) | P1 | Shipped |
| Mobile page localization wiring | T3 | Localization strategy | 0 (strategic) | P2 | Shipped |
| Accessibility fixes | T3 | Certification audit, WCAG requirements | 0 (compliance) | P2 | Shipped |

### Phase 8E.1 — Enterprise Workflow Validation

| Roadmap Item | Evidence Tier | Sources | Customer Count | Priority | Status |
|---|---|---|---|---|---|
| Workflow validation for 9 personas | T3 | Pre-launch readiness | 0 (internal) | P1 | Shipped |
| Cross-domain navigation analysis | T3 | Pre-launch readiness | 0 (internal) | P2 | Shipped |

---

## Evidence Gap Analysis

### Items with T3 (strategic) evidence only

These items may need customer validation before further investment:

| Roadmap Item | T3 Rationale | Recommended Validation |
|---|---|---|
| cnRTL fix | RTL is prerequisite for Arabic market | Conduct 3 interviews with Arabic-market finance leaders |
| Mobile localization | Strategic for MENA expansion | Conduct 2-3 interviews with regional finance teams |
| Accessibility fixes | WCAG compliance for government/enterprise | Review with enterprise procurement requirements |

### Items with no evidence

These items are running on internal intuition and should be prioritized for customer interviews:

| Roadmap Item | Internal Rationale | Risk |
|---|---|---|
| *(no entries yet — all current roadmap items have ≥T3 evidence)* | | |

---

## Customer Evidence Index

| Customer | Interviews | Pain Points | Feature Requests | Priority Unmet |
|---|---|---|---|---|

---

## Quarterly Review Template

### New Evidence This Quarter

| Evidence | Source | Affected Roadmap Items |
|---|---|---|

### Evidence Upgrades

| Roadmap Item | Was Tier | Now Tier | New Sources |
|---|---|---|---|

### Items Deferred Due to Insufficient Evidence

| Item | Current Tier | Minimum Needed | Gap |
|---|---|---|---|

### Items Removed from Roadmap

| Item | Rationale | Evidence That Changed Decision |
|---|---|---|

---

## Adding a Roadmap Evidence Entry

1. Identify the roadmap item
2. Assign evidence tier (T1/T2/T3)
3. Link to Interview IDs, Pain Point IDs, or Feature Request IDs
4. Count distinct requesting organizations
5. Set status
6. Review quarterly

---

## Evidence Tier Definitions

| Tier | Definition | Minimum Action |
|---|---|---|
| **T1 — Direct** | ≥2 customers explicitly requested or demonstrated the need | Build with high confidence |
| **T2 — Inferred** | ≥3 indirect signals (surveys, analytics, competitive) | Validate with 1-2 interviews |
| **T3 — Strategic** | Market research, leadership directive, compliance req | Flag for customer validation |
