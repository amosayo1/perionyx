# Feature Request Catalog

**Phase:** 8E.2
**Status:** Active registry
**Last Updated:** July 8, 2026

---

## Purpose

Track all feature requests collected through customer interviews, support tickets, and product feedback. Every request is linked to the pain point it addresses and the customers who requested it.

---

## Catalog Schema

| Field | Description |
|---|---|
| ID | `FR-{YYYYMMDD}-{NNN}` |
| Title | Concise feature name |
| Category | Taxonomy category (see §3) |
| Description | User-facing description of the request |
| Requesting Customers | Comma-separated list of customer names |
| Pain Point Addressed | PainPointID(s) |
| Expected Business Value | Quantified impact |
| Effort Estimate | XS / S / M / L / XL |
| Priority | P0 – P4 |
| Status | Proposed / Validated / In Progress / Shipped / Rejected |
| Evidence Source | Interview ID(s) |
| Dependencies | FeatureRequestID(s) |
| Date Added | ISO 8601 |
| Last Updated | ISO 8601 |

---

## Priority Definitions

| Priority | Definition | Action |
|---|---|---|
| **P0** | Launch blocker; no workaround | Immediate |
| **P1** | High value; multiple customers blocked | This quarter |
| **P2** | Important; improves core experience | This half |
| **P3** | Nice-to-have; enhances satisfaction | Next year |
| **P4** | Future consideration; low signal | Revisit annually |

---

## Status Definitions

| Status | Definition |
|---|---|
| Proposed | Request captured, not yet validated |
| Validated | Confirmed by ≥2 independent sources or ≥1 interview |
| In Progress | Under active development |
| Shipped | Released to production |
| Rejected | Decision not to build (documented in decision log) |

---

## Feature Request Registry

| ID | Title | Category | Requesting Customers | Pain Point | Effort | Priority | Status |
|---|---|---|---|---|---|---|---|
| | *(no entries yet)* | | | | | | |

---

## Requesting Customers Index

| Customer | Feature Requests | Pain Points | Priority Requests |
|---|---|---|---|---|
| | | | | |

---

## Category Distribution

| Category | Count | Breakdown |
|---|---|---|
| Month-end Close | 0 | |
| Treasury | 0 | |
| Reconciliation | 0 | |
| Cash Flow | 0 | |
| Financial Reporting | 0 | |
| Approvals | 0 | |
| Compliance | 0 | |
| Audit | 0 | |
| ERP Integration | 0 | |
| Localization | 0 | |
| Executive Reporting | 0 | |
| AI Assistance | 0 | |
| Performance | 0 | |
| User Experience | 0 | |
| Training & Adoption | 0 | |
| Data Visibility | 0 | |
| Security | 0 | |
| Workflow Automation | 0 | |

---

## Adding a New Feature Request

1. Assign next sequential ID: `FR-{YYYYMMDD}-{NNN}`
2. Link to at least one Pain Point ID from the pain point catalog
3. List all requesting customers
4. Set status to `Proposed`
5. Route for validation (minimum 2 independent sources)

---

## Decision Flow

```
Request captured
    ↓
Proposed ──→ Rejected (with rationale)
    ↓
Validated (≥2 sources)
    ↓
Prioritized → In Progress → Shipped
```
